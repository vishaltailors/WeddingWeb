import { normalizeLanguage } from "../src/i18n.js";
import { normalizeInviteToken } from "../src/invitation-token.js";
import { normalizeSide } from "../src/wedding.js";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { getSiteOrigin, renderCard, renderMetadata, renderPersonalCardSvg } from "./social-preview.mjs";

export async function resolvePreviewInvitation(token, side, env, fetcher = fetch) {
  if (!normalizeInviteToken(token)) return null;
  const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
  const key = env.SUPABASE_ANON_KEY || env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const response = await fetcher(`${url.replace(/\/$/, "")}/rest/v1/rpc/resolve_invitation`, {
      method: "POST",
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        invitation_token: token,
        invitation_side: normalizeSide(side),
      }),
      signal: AbortSignal.timeout(4000),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const invitation = Array.isArray(data) ? data[0] : data;
    return invitation?.side === normalizeSide(side) &&
      typeof invitation.name === "string" && invitation.name.trim()
      ? { name: invitation.name, message: typeof invitation.message === "string" ? invitation.message : "" }
      : null;
  } catch {
    // Resolver outages must not prevent the invitation itself from loading.
    return null;
  }
}

export function personalImagePath(side, token, invitation) {
  const version = createHash("sha256")
    .update(renderPersonalCardSvg(side, invitation))
    .digest("hex").slice(0, 12);
  const params = new URLSearchParams({ side, invite: token, v: version });
  return `/api/invitation-image?${params}`;
}

function setPrivateHeaders(res) {
  // Every request rechecks active status; never share one guest's response with another.
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Referrer-Policy", "no-referrer");
}

export async function handlePersonalPreview(req, res, options = {}) {
  const env = options.env || process.env;
  const origin = getSiteOrigin(env);
  const url = new URL(req.url, origin);
  const side = normalizeSide(url.searchParams.get("side"));
  const token = normalizeInviteToken(url.searchParams.get("invite"));
  const language = normalizeLanguage(url.searchParams.get("lang") ?? url.searchParams.get("language"));
  const invitation = await resolvePreviewInvitation(token, side, env, options.fetcher);
  const html = options.readTemplate
    ? await options.readTemplate(side)
    : await readFile(join(process.cwd(), "dist", side === "bride" ? "bride.html" : "index.html"), "utf8");
  const fallbackImage = html.match(/property="og:image" content="([^"]+)"/)?.[1];
  const imagePath = invitation
    ? personalImagePath(side, token, invitation)
    : fallbackImage;
  if (!imagePath) throw new Error("The built invitation template is missing its social image.");
  const page = renderMetadata(html, side, origin, imagePath, {
    invitation, token, language, personal: true,
  });
  setPrivateHeaders(res);
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.statusCode = 200;
  res.end(page);
}

export async function handlePersonalImage(req, res, options = {}) {
  const env = options.env || process.env;
  const url = new URL(req.url, getSiteOrigin(env));
  const side = normalizeSide(url.searchParams.get("side"));
  const token = normalizeInviteToken(url.searchParams.get("invite"));
  const invitation = await resolvePreviewInvitation(token, side, env, options.fetcher);
  const image = await renderCard(side, invitation);
  setPrivateHeaders(res);
  res.setHeader("Content-Type", "image/jpeg");
  res.statusCode = 200;
  res.end(image);
}
