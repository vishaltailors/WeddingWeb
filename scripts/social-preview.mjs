import { getWedding } from "../src/wedding.js";
import { createTranslator, normalizeLanguage } from "../src/i18n.js";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

const width = 1200;
const height = 630;
const marker =
  /<!-- social-preview:start -->[\s\S]*?<!-- social-preview:end -->/;

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function getSiteOrigin(env) {
  const host =
    env.SITE_URL || env.VERCEL_PROJECT_PRODUCTION_URL || env.VERCEL_URL;
  if (!host && env.VERCEL) {
    throw new Error(
      "Set SITE_URL to the public wedding website URL in Vercel.",
    );
  }
  return new URL(
    host
      ? /^https?:\/\//.test(host)
        ? host
        : `https://${host}`
      : "http://localhost:5173",
  ).origin;
}

export function renderMetadata(html, side, origin, imagePath, options = {}) {
  const language = normalizeLanguage(options.language);
  const t = createTranslator(language);
  const wedding = getWedding(side, language);
  const invitation = options.invitation;
  const title = invitation
    ? `${invitation.name} | ${wedding.title}`
    : `${wedding.title} | ${t("A Beautiful Beginning")}`;
  const description = invitation
    ? [
        `${invitation.name}, ${t("You’re invited")}! ${wedding.coupleNames}.`,
        invitation.message,
        ...wedding.events.map((event) => `${event.name}: ${event.date}, ${event.time}`),
        `${wedding.dateLabel} | ${wedding.venue}, ${wedding.city}.`,
      ].filter(Boolean).join(" ")
    : `With hearts full of love, ${wedding.coupleNames} invite you to celebrate their wedding on ${wedding.dateLabel} at ${wedding.venue}, ${wedding.city}.`;
  const pageUrl = new URL(`/?side=${wedding.side}`, origin);
  if (invitation && options.token) pageUrl.searchParams.set("invite", options.token);
  if (language !== "en") pageUrl.searchParams.set("lang", language);
  const url = pageUrl.href;
  const image = new URL(imagePath, origin).href;
  const alt = invitation
    ? `${invitation.name} - ${wedding.title} - ${wedding.events.map((event) => `${event.name}: ${event.date}, ${event.time}`).join("; ")}`
    : `${wedding.title} - ${wedding.dateLabel}, ${wedding.city}`;
  const meta = (attribute, key, value) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    meta("name", "description", description),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", "A Beautiful Beginning"),
    meta("property", "og:locale", language === "gu" ? "gu_IN" : "en_IN"),
    meta("property", "og:title", title),
    meta("property", "og:description", description),
    meta("property", "og:url", url),
    meta("property", "og:image", image),
    meta("property", "og:image:type", "image/jpeg"),
    meta("property", "og:image:width", width),
    meta("property", "og:image:height", height),
    meta("property", "og:image:alt", alt),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", title),
    meta("name", "twitter:description", description),
    meta("name", "twitter:image", image),
    meta("name", "twitter:image:alt", alt),
    ...(options.personal ? [meta("name", "robots", "noindex, nofollow, noarchive")] : []),
  ];
  return html.replace(
    marker,
    `<!-- social-preview:start -->\n    ${tags.join("\n    ")}\n    <!-- social-preview:end -->`,
  );
}

function wrapCardText(value, maxCharacters, maxLines = 2) {
  const words = String(value).replace(/\s+/g, " ").trim().split(" ");
  const lines = [""];
  for (const word of words) {
    const index = lines.length - 1;
    if (lines[index] && `${lines[index]} ${word}`.length > maxCharacters) {
      lines.push(word);
    } else {
      lines[index] = `${lines[index]} ${word}`.trim();
    }
  }
  return lines.slice(0, maxLines).map((line, index) => {
    const clipped = line.length > maxCharacters || (index === maxLines - 1 && lines.length > maxLines);
    return clipped ? `${line.slice(0, maxCharacters - 3)}...` : line;
  });
}

export function renderPersonalCardSvg(side, invitation) {
  const wedding = getWedding(side);
  const guestLines = wrapCardText(invitation.name, 28);
  const messageLines = wrapCardText(
    invitation.message || "Your presence would make our celebration complete.",
    45,
    3,
  );
  const text = (x, y, value, size, color = "#49372e", family = "sans-serif") =>
    `<text x="${x}" y="${y}" font-family="${family}" font-size="${size}" fill="${color}">${escapeHtml(value)}</text>`;
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#fbf8f1"/>
    <rect x="24" y="24" width="1152" height="582" rx="8" fill="none" stroke="#b7965c"/>
    <path d="M590 65V565" stroke="#b7965c" stroke-opacity=".5"/>
    ${text(68, 98, "CORDIALLY INVITING", 16, "#967442")}
    ${guestLines.map((line, index) => text(68, 158 + index * 43, line, 36, "#49372e", "serif")).join("")}
    ${text(68, 280, wedding.firstName, 56, "#49372e", "serif")}
    ${text(68, 320, "weds", 22, "#967442", "serif")}
    ${text(68, 383, wedding.secondName, 56, "#49372e", "serif")}
    ${messageLines.map((line, index) => text(68, 432 + index * 25, line, 18, "#77675b")).join("")}
    ${text(68, 545, wedding.dateLabel, 22)}
    ${text(68, 577, `${wedding.venue} - ${wedding.city}`, 18, "#77675b")}
    ${text(630, 98, "THE CELEBRATIONS", 16, "#967442")}
    ${wedding.events.map((event, index) => {
      const y = 153 + index * 86;
      return `${text(630, y, event.name, 25, "#49372e", "serif")}
        ${text(630, y + 31, `${event.date} | ${event.time}`, 20, "#77675b")}
        <path d="M630 ${y + 49}H1130" stroke="#b7965c" stroke-opacity=".25"/>`;
    }).join("")}
  </svg>`;
}

export async function renderCard(side, invitation) {
  if (invitation) {
    return sharp(Buffer.from(renderPersonalCardSvg(side, invitation)))
      .jpeg({ quality: 90 }).toBuffer();
  }
  const wedding = getWedding(side);
  const overlay = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#fbf8f1"/>
    <g transform="translate(918 315)" fill="none" stroke="#b7965c" stroke-width="2">
      <circle r="182" stroke-opacity=".35"/>
      <circle r="162" stroke-opacity=".55"/>
      <path d="M0 96C-75 15-50-65 0-115C50-65 75 15 0 96ZM0 96C-120 90-145 5-127-58C-43-45 5 30 0 96ZM0 96C120 90 145 5 127-58C43-45-5 30 0 96ZM0 96C-120 144-180 63-178 15C-95-9-25 35 0 96ZM0 96C120 144 180 63 178 15C95-9 25 35 0 96ZM-78 126H78"/>
      <text y="231" text-anchor="middle" font-family="serif" font-size="26" font-style="italic" fill="#967442" stroke="none">Seven steps. One forever.</text>
    </g>
    <rect x="24" y="24" width="1152" height="582" rx="8" fill="none" stroke="#b7965c" stroke-opacity=".65"/>
    <g text-anchor="middle">
      <text x="366" y="119" font-family="sans-serif" font-size="17" letter-spacing="5" fill="#967442">A BEAUTIFUL BEGINNING</text>
      <path d="M276 153H456" stroke="#b7965c"/>
      <text x="366" y="253" font-family="serif" font-size="82" fill="#49372e">${escapeHtml(wedding.firstName)}</text>
      <text x="366" y="302" font-family="serif" font-size="25" font-style="italic" fill="#967442">weds</text>
      <text x="366" y="393" font-family="serif" font-size="82" fill="#49372e">${escapeHtml(wedding.secondName)}</text>
      <path d="M276 433H456" stroke="#b7965c"/>
      <text x="366" y="484" font-family="sans-serif" font-size="22" fill="#49372e">${escapeHtml(wedding.dateLabel)}</text>
      <text x="366" y="523" font-family="sans-serif" font-size="17" fill="#77675b">${escapeHtml(wedding.venue)} - ${escapeHtml(wedding.city)}</text>
    </g>
  </svg>`;
  return sharp(Buffer.from(overlay)).jpeg({ quality: 90 }).toBuffer();
}

export function socialPreviewPlugin(env = process.env) {
  const origin = getSiteOrigin(env);
  const cards = {};
  return {
    name: "wedding-social-preview",
    enforce: "post",
    async buildStart() {
      for (const side of ["groom", "bride"]) {
        const source = await renderCard(side);
        const hash = createHash("sha256")
          .update(source)
          .digest("hex")
          .slice(0, 12);
        cards[side] = { source, path: `/og-${side}-${hash}.jpg` };
      }
    },
    configureServer(server) {
      installPersonalMiddleware(server, env, async (side) => {
        const html = await readFile(join(server.config.root, "index.html"), "utf8");
        return server.transformIndexHtml(`/?side=${side}`, html);
      });
      server.middlewares.use((req, res, next) => {
        const card = Object.values(cards).find(
          ({ path }) => path === req.url?.split("?")[0],
        );
        if (!card) return next();
        res.setHeader("Content-Type", "image/jpeg");
        res.end(card.source);
      });
    },
    configurePreviewServer(server) {
      installPersonalMiddleware(server, env, (side) =>
        readFile(join(server.config.root, server.config.build.outDir, side === "bride" ? "bride.html" : "index.html"), "utf8"));
      server.middlewares.use((req, _res, next) => {
        const url = new URL(req.url, origin);
        if (url.pathname === "/" && url.searchParams.get("side") === "bride") {
          req.url = `/bride.html${url.search}`;
        }
        next();
      });
    },
    transformIndexHtml: {
      order: "pre",
      handler(html, context) {
        const side = getWedding(
          new URL(context.originalUrl || "/", origin).searchParams.get("side"),
        ).side;
        return renderMetadata(html, side, origin, cards[side].path);
      },
    },
    generateBundle(_options, bundle) {
      const html = bundle["index.html"].source;
      this.emitFile({
        type: "asset",
        fileName: "bride.html",
        source: renderMetadata(html, "bride", origin, cards.bride.path),
      });
      for (const { path, source } of Object.values(cards)) {
        this.emitFile({ type: "asset", fileName: path.slice(1), source });
      }
    },
  };
}

function installPersonalMiddleware(server, env, readTemplate) {
  server.middlewares.use(async (req, res, next) => {
    const url = new URL(req.url, "http://localhost");
    const isImage = url.pathname === "/api/invitation-image";
    const isPage = url.pathname === "/" && url.searchParams.has("invite");
    if (!isImage && !isPage) return next();
    try {
      const { handlePersonalImage, handlePersonalPreview } = await import("./personal-preview.mjs");
      const handler = isImage ? handlePersonalImage : handlePersonalPreview;
      await handler(req, res, {
        env: { ...server.config.env, ...env },
        readTemplate,
      });
    } catch (error) {
      next(error);
    }
  });
}
