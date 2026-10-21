import { getWedding } from "../src/wedding.js";
import { createHash } from "node:crypto";
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

export function renderMetadata(html, side, origin, imagePath) {
  const wedding = getWedding(side);
  const title = `${wedding.title} | A Beautiful Beginning`;
  const description = `With hearts full of love, ${wedding.coupleNames} invite you to celebrate their wedding on ${wedding.dateLabel} at ${wedding.venue}, ${wedding.city}.`;
  const url = new URL(`/?side=${wedding.side}`, origin).href;
  const image = new URL(imagePath, origin).href;
  const alt = `${wedding.title} - ${wedding.dateLabel}, ${wedding.city}`;
  const meta = (attribute, key, value) =>
    `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    meta("name", "description", description),
    meta("property", "og:type", "website"),
    meta("property", "og:site_name", "A Beautiful Beginning"),
    meta("property", "og:locale", "en_IN"),
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
  ];
  return html.replace(
    marker,
    `<!-- social-preview:start -->\n    ${tags.join("\n    ")}\n    <!-- social-preview:end -->`,
  );
}

async function renderCard(side) {
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
