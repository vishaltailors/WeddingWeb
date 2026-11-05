import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import sharp from "sharp";
import { escapeHtml, getSiteOrigin, renderMetadata } from "./social-preview.mjs";

test("site URL prefers the configured domain and normalizes Vercel hosts", () => {
  assert.equal(getSiteOrigin({ SITE_URL: "https://wedding.example/path", VERCEL_URL: "preview.vercel.app" }), "https://wedding.example");
  assert.equal(getSiteOrigin({ VERCEL_PROJECT_PRODUCTION_URL: "wedding.vercel.app" }), "https://wedding.vercel.app");
  assert.equal(getSiteOrigin({ VERCEL_URL: "preview.vercel.app" }), "https://preview.vercel.app");
  assert.equal(getSiteOrigin({}), "http://localhost:5173");
  assert.throws(() => getSiteOrigin({ VERCEL: "1" }), /SITE_URL/);
});

test("metadata matches the selected side and invalid sides default to groom", () => {
  const template = "<!-- social-preview:start --><!-- social-preview:end -->";
  for (const side of ["bride", "groom", undefined, "invalid"]) {
    const normalized = side === "bride" ? "bride" : "groom";
    const html = renderMetadata(template, side, "https://wedding.example", `/og-${normalized}.jpg`);
    assert.match(html, normalized === "bride" ? /Krishi Weds Vishal/ : /Vishal Weds Krishi/);
    assert.ok(html.includes(`content="https://wedding.example/?side=${normalized}"`));
    assert.ok(html.includes(`content="https://wedding.example/og-${normalized}.jpg"`));
    assert.equal((html.match(/property="og:image"/g) || []).length, 1);
    assert.match(html, /summary_large_image/);
  }
  assert.equal(escapeHtml(`<&"'>`), "&lt;&amp;&quot;&#39;&gt;");
});

test("production HTML references distinct, valid social cards and shared app assets", async () => {
  const pages = await Promise.all(["index.html", "bride.html"].map((path) =>
    readFile(new URL(`../dist/${path}`, import.meta.url), "utf8")));
  const images = [];
  for (const html of pages) {
    const image = new URL(html.match(/property="og:image" content="([^"]+)"/)[1]);
    images.push(image.pathname);
    const metadata = await sharp(new URL(`../dist${image.pathname}`, import.meta.url).pathname).metadata();
    assert.equal(metadata.width, 1200);
    assert.equal(metadata.height, 630);
    assert.equal(metadata.format, "jpeg");
  }
  assert.notEqual(images[0], images[1]);
  assert.equal(pages[0].match(/src="([^"]+\.js)"/)[1], pages[1].match(/src="([^"]+\.js)"/)[1]);
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url)));
  assert.equal(config.rewrites, undefined);
  assert.deepEqual(config.routes[0].has, [{ type: "query", key: "side", value: "bride" }]);
  assert.equal(config.routes[0].dest, "/bride.html");
  assert.equal(config.routes[1].dest, "/index.html");
  assert.equal(config.routes[2].dest, "/index.html");
  assert.deepEqual(config.routes[3], { handle: "filesystem" });
});

test("side routing runs before static-file lookup and leaves assets untouched", async () => {
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url)));
  const resolve = (path) => {
    const url = new URL(path, "https://wedding.example");
    for (const route of config.routes) {
      if (route.handle === "filesystem") return url.pathname;
      if (!new RegExp(route.src).test(url.pathname)) continue;
      if (route.has?.some(({ key, value }) => url.searchParams.get(key) !== value)) continue;
      return route.dest;
    }
  };
  assert.equal(resolve("/?side=bride"), "/bride.html");
  assert.equal(resolve("/?preview=2&side=bride"), "/bride.html");
  assert.equal(resolve("/?side=groom"), "/index.html");
  assert.equal(resolve("/?side=invalid"), "/index.html");
  assert.equal(resolve("/"), "/index.html");
  assert.equal(resolve("/admin"), "/index.html");
  assert.equal(resolve("/admin/"), "/index.html");
  assert.equal(resolve("/assets/app.js?side=bride"), "/assets/app.js");
  assert.equal(resolve("/og-bride.jpg"), "/og-bride.jpg");
});
