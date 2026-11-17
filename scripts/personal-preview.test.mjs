import assert from "node:assert/strict";
import test from "node:test";
import sharp from "sharp";
import { getWedding } from "../src/wedding.js";
import { handlePersonalImage, handlePersonalPreview, personalImagePath, resolvePreviewInvitation } from "./personal-preview.mjs";
import { renderCard, renderMetadata, renderPersonalCardSvg } from "./social-preview.mjs";

const token = "a".repeat(64);
const env = {
  SITE_URL: "https://wedding.example",
  VITE_SUPABASE_URL: "https://database.example",
  VITE_SUPABASE_ANON_KEY: "public-test-key",
};
const invitation = { name: "Asha & Family", message: "Celebrate with us!", side: "bride" };
const fetcher = async () => ({ ok: true, json: async () => [invitation] });
const template = "<html><head><!-- social-preview:start --><!-- social-preview:end --></head><body><div id='root'></div><script src='/assets/app.js'></script></body></html>";
const readTemplate = async (side) => renderMetadata(template, side, env.SITE_URL, `/og-${side}.jpg`);
function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, end(body) { this.body = body; } };
}

test("resolver only sends validated tokens and uses the side-scoped anonymous RPC", async () => {
  let calls = 0;
  const resolver = async (url, options) => {
    calls++;
    assert.equal(url, "https://database.example/rest/v1/rpc/resolve_invitation");
    assert.deepEqual(JSON.parse(options.body), { invitation_token: token, invitation_side: "bride" });
    assert.equal(options.headers.apikey, "public-test-key");
    return fetcher();
  };
  assert.equal(await resolvePreviewInvitation("invalid", "bride", env, resolver), null);
  assert.equal(calls, 0);
  assert.deepEqual(await resolvePreviewInvitation(token, "bride", env, resolver), {
    name: invitation.name, message: invitation.message,
  });
  assert.equal(calls, 1);
  assert.equal(await resolvePreviewInvitation(token, "groom", env, fetcher), null);
  assert.equal(await resolvePreviewInvitation(token, "bride", {}, resolver), null);
});

test("inactive, deleted, malformed and unavailable invitations fall back without throwing", async () => {
  for (const failure of [
    async () => ({ ok: true, json: async () => [] }),
    async () => ({ ok: false }),
    async () => { throw new Error("offline"); },
    async () => ({ ok: true, json: async () => ({ name: 42, side: "bride" }) }),
  ]) {
    assert.equal(await resolvePreviewInvitation(token, "bride", env, failure), null);
    const res = response();
    await handlePersonalPreview({ url: `/?side=bride&invite=${token}` }, res, { env, fetcher: failure, readTemplate });
    assert.match(res.body, /Krishi Weds Vishal/);
    assert.match(res.body, /https:\/\/wedding.example\/og-bride.jpg/);
    assert.doesNotMatch(res.body, /Asha/);
  }
});

test("personal HTML includes name, message, correct schedule and unique OG URL before JS", async () => {
  const res = response();
  await handlePersonalPreview({ url: `/?side=bride&invite=${token}` }, res, { env, fetcher, readTemplate });
  assert.equal(res.statusCode, 200);
  assert.match(res.body, /Asha &amp; Family \| Krishi Weds Vishal/);
  assert.match(res.body, /Celebrate with us!/);
  for (const event of getWedding("bride").events) {
    assert.ok(res.body.includes(`${event.name.replaceAll("&", "&amp;")}: ${event.date}, ${event.time}`));
  }
  assert.doesNotMatch(res.body, /The Baraat Begins/);
  assert.match(res.body, /og:url" content="https:\/\/wedding.example\/\?side=bride&amp;invite=/);
  assert.match(res.body, /og:image" content="https:\/\/wedding.example\/api\/invitation-image\?/);
  assert.match(res.body, /assets\/app.js/);
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal(res.headers["X-Robots-Tag"], "noindex, nofollow, noarchive");
});

test("metadata safely escapes guest content and respects Gujarati links", () => {
  const html = renderMetadata(template, "groom", env.SITE_URL, "/image.jpg", {
    invitation: { name: '<script>alert("name")</script>', message: '"><img src=x>' },
    token, language: "gu", personal: true,
  });
  assert.doesNotMatch(html, /<script>alert|<img src=x>/);
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /og:locale" content="gu_IN"/);
  assert.match(html, /&amp;lang=gu/);
  assert.match(html, /noindex, nofollow, noarchive/);
});

test("personal cards include side-specific events and safely fit long guest copy", async () => {
  for (const side of ["groom", "bride"]) {
    const svg = renderPersonalCardSvg(side, invitation);
    assert.match(svg, /Asha &amp; Family/);
    for (const event of getWedding(side).events) {
      assert.ok(svg.includes(event.name.replaceAll("&", "&amp;")));
      assert.ok(svg.includes(`${event.date} | ${event.time}`));
    }
    const card = await renderCard(side, invitation);
    const metadata = await sharp(card).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.format, "jpeg");
  }
  const svg = renderPersonalCardSvg("groom", { name: "W".repeat(300), message: "hello ".repeat(500) });
  assert.match(svg, /\.\.\./);
  assert.doesNotMatch(svg, /W{28}/);
});

test("image URLs change when guest details change and image requests recheck active status", async () => {
  assert.notEqual(
    personalImagePath("bride", token, invitation),
    personalImagePath("bride", token, { ...invitation, message: "Updated message" }),
  );
  const res = response();
  await handlePersonalImage({ url: personalImagePath("bride", token, invitation) }, res, { env, fetcher });
  assert.equal(res.headers["Content-Type"], "image/jpeg");
  assert.equal(res.headers["Cache-Control"], "private, no-store");
  assert.equal((await sharp(res.body).metadata()).width, 1200);
  const fallback = response();
  await handlePersonalImage({ url: personalImagePath("bride", token, invitation) }, fallback, {
    env, fetcher: async () => ({ ok: true, json: async () => [] }),
  });
  assert.deepEqual(fallback.body, await renderCard("bride"));
});
