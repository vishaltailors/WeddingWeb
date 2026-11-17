import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { outlineSocialText, shapeSocialText, socialFontVersion } from "./social-fonts.mjs";
import { renderPersonalCardSvg } from "./social-preview.mjs";

test("preview fonts are valid bundled TrueType files and included in both Vercel functions", async () => {
  for (const name of ["NotoSans", "NotoSerif", "NotoSansGujarati", "NotoSansDevanagari"]) {
    const font = await readFile(join(process.cwd(), "scripts", "fonts", `${name}-Regular.ttf`));
    assert.equal(font.readUInt32BE(0), 0x00010000);
    assert.ok(font.length > 10000);
    const license = await readFile(join(process.cwd(), "scripts", "fonts", `${name}-OFL.txt`), "utf8");
    assert.match(license, /SIL OPEN FONT LICENSE/);
  }
  const config = JSON.parse(await readFile(new URL("../vercel.json", import.meta.url)));
  for (const endpoint of ["api/invitation.mjs", "api/invitation-image.mjs"]) {
    assert.match(config.functions[endpoint].includeFiles, /scripts\/fonts\/\*\*/);
  }
  const svg = renderPersonalCardSvg("groom", { name: "Guest", message: "" });
  assert.ok(svg.includes(socialFontVersion));
  assert.match(svg, /font-family="Noto Serif, Noto Sans Gujarati, Noto Sans Devanagari"/);
  assert.match(svg, /font-family="Noto Sans, Noto Sans Gujarati, Noto Sans Devanagari"/);
  const outlined = outlineSocialText(svg);
  assert.doesNotMatch(outlined, /<text\b/);
  assert.match(outlined, /<path d="M/);
});

test("English, Gujarati and Hindi script runs resolve to real shaped glyphs", () => {
  for (const text of ["Moksha and family", "\u0aae\u0acb\u0a95\u0acd\u0ab7\u0abe \u0a85\u0aa8\u0ac7 \u0aaa\u0ab0\u0abf\u0ab5\u0abe\u0ab0", "\u0936\u0941\u092d \u0935\u093f\u0935\u093e\u0939"]) {
    const runs = shapeSocialText(text, true);
    assert.ok(runs.length > 0);
    assert.ok(runs.every(({ layout }) => layout.glyphs.every((glyph) => glyph.id !== 0)));
  }
  const sans = shapeSocialText("Vishal");
  const serif = shapeSocialText("Vishal", true);
  assert.equal(sans[0].font.familyName, "Noto Sans");
  assert.equal(serif[0].font.familyName, "Noto Serif");
});

test("cold renderer draws distinct Latin and Gujarati glyphs without system fonts", () => {
  const result = execFileSync(process.execPath, ["--input-type=module", "-e", `
    import { renderCard } from "./scripts/social-preview.mjs";
    import sharp from "sharp";
    import { createHash } from "node:crypto";
    const samples = {};
    for (const name of ["IIII", "WWWW", "\\u0a95\\u0a95\\u0a95\\u0a95", "\\u0aae\\u0aae\\u0aae\\u0aae"]) {
      const card = await renderCard("groom", {name, message: ""});
      const pixels = await sharp(card)
        .extract({left: 68, top: 118, width: 490, height: 82})
        .greyscale().raw().toBuffer();
      let right = 0;
      for (let i = 0; i < pixels.length; i++) {
        if (pixels[i] < 150) right = Math.max(right, i % 490);
      }
      samples[name] = {right, hash: createHash("sha256").update(pixels).digest("hex")};
    }
    console.log(JSON.stringify({config: process.env.FONTCONFIG_FILE, samples}));
  `], {
    cwd: process.cwd(),
    env: {
      ...process.env,
      FONTCONFIG_FILE: "/nonexistent/fontconfig.conf",
      FONTCONFIG_PATH: "/nonexistent/fonts",
    },
    encoding: "utf8",
  });
  const { config, samples } = JSON.parse(result);
  assert.equal(config, "/nonexistent/fontconfig.conf", "outline rendering must not need or modify host Fontconfig");
  assert.ok(samples.WWWW.right > samples.IIII.right * 1.5, "Latin letters must not all render as identical boxes");
  const gujarati = Object.values(samples).slice(2);
  assert.notEqual(gujarati[0].hash, gujarati[1].hash);
  assert.ok(gujarati.every(({ right }) => right > 40));
});
