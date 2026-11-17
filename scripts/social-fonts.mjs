import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { create } from "fontkit";

const directory = join(process.cwd(), "scripts", "fonts");
const files = [
  "NotoSans-Regular.ttf",
  "NotoSerif-Regular.ttf",
  "NotoSansGujarati-Regular.ttf",
  "NotoSansDevanagari-Regular.ttf",
];

// Font changes must invalidate image URLs, just like guest and schedule edits.
export const socialFontVersion = files.reduce(
  (hash, file) => hash.update(readFileSync(join(directory, file))),
  createHash("sha256"),
).digest("hex").slice(0, 12);

export const socialFonts = {
  sans: "Noto Sans, Noto Sans Gujarati, Noto Sans Devanagari",
  serif: "Noto Serif, Noto Sans Gujarati, Noto Sans Devanagari",
};

const fonts = Object.fromEntries(
  ["sans", "serif", "gujarati", "devanagari"].map((key, index) => [
    key, create(readFileSync(join(directory, files[index]))),
  ]),
);
const segmenter = new Intl.Segmenter("en", { granularity: "grapheme" });

function decodeText(value) {
  return value.replace(/&(amp|lt|gt|quot|#39);/g, (_, entity) =>
    ({ amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'" })[entity]);
}

/** Shapes whole script runs, preserving Gujarati and Devanagari joined letters. */
export function shapeSocialText(text, serif = false) {
  const runs = [];
  for (const { segment } of segmenter.segment(text)) {
    const key = /[\u0a80-\u0aff]/.test(segment) ? "gujarati"
      : /[\u0900-\u097f]/.test(segment) ? "devanagari"
      : serif ? "serif" : "sans";
    if (runs.at(-1)?.key === key) runs.at(-1).text += segment;
    else runs.push({ key, text: segment });
  }
  return runs.map(({ key, text: run }) => ({
    font: fonts[key],
    layout: fonts[key].layout(run),
  }));
}

/** Rasterizers receive only paths, so no host font lookup is needed. */
export function outlineSocialText(svg) {
  return svg.replace(/<text\b([^>]*)>([\s\S]*?)<\/text>/g, (_, attributes, encoded) => {
    const attr = (name, fallback) =>
      attributes.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? fallback;
    const size = Number(attr("font-size", 16));
    const spacing = Number(attr("letter-spacing", 0));
    const runs = shapeSocialText(decodeText(encoded), attr("font-family", "").includes("Noto Serif"));
    const totalWidth = runs.reduce((width, { font, layout }) =>
      width + layout.positions.reduce((advance, position) =>
        advance + position.xAdvance * size / font.unitsPerEm + spacing, 0), 0);
    const anchor = attr("text-anchor", "start");
    let x = Number(attr("x", 0)) - (anchor === "middle" ? totalWidth / 2 : anchor === "end" ? totalWidth : 0);
    const y = Number(attr("y", 0));
    const paths = [];
    for (const { font, layout } of runs) {
      const scale = size / font.unitsPerEm;
      layout.glyphs.forEach((glyph, index) => {
        const position = layout.positions[index];
        const path = glyph.path.toSVG();
        if (path) {
          paths.push(`<path d="${path}" transform="translate(${x + position.xOffset * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})"/>`);
        }
        x += position.xAdvance * scale + spacing;
      });
    }
    return `<g fill="${attr("fill", "#49372e")}" stroke="${attr("stroke", "none")}">${paths.join("")}</g>`;
  });
}
