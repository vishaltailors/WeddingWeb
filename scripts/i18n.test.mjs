import {
  createTranslator,
  formatDigits,
  languageFromSearch,
  normalizeLanguage,
} from "../src/i18n.js";
import { gu } from "../src/translations-gu.js";
import { getWedding, weddingSides } from "../src/wedding.js";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("language query accepts Gujarati aliases and defaults to English", () => {
  for (const value of ["gu", "GU", "gu-IN", "gujarati"]) {
    assert.equal(normalizeLanguage(value), "gu");
  }
  for (const value of [undefined, null, 123, "en", "fr", ""]) {
    assert.equal(normalizeLanguage(value), "en");
  }
  assert.equal(languageFromSearch("?side=bride&lang=gu"), "gu");
  assert.equal(languageFromSearch("?language=gujarati"), "gu");
  assert.equal(languageFromSearch("?lang=en&language=gu"), "en");
  assert.equal(languageFromSearch("?lang=unsupported"), "en");
  assert.equal(languageFromSearch(""), "en");
});

test("translation interpolates values without translating personal content", () => {
  const t = createTranslator("gu");
  assert.equal(t("Our story"), gu["Our story"]);
  assert.equal(t("Unknown copy"), "Unknown copy");
  assert.equal(
    t("Join us for our wedding on {{date}}.", { date: "૧૨ ડિસેમ્બર" }),
    gu["Join us for our wedding on {{date}}."].replace("{{date}}", "૧૨ ડિસેમ્બર"),
  );
  assert.equal(createTranslator("en")("Our story"), "Our story");
  assert.equal(formatDigits("12 · 12 · 2026", "gu"), "૧૨ · ૧૨ · ૨૦૨૬");
  assert.equal(formatDigits("09", "en"), "09");
});

test("both wedding sides are fully translated without changing schedules or URLs", () => {
  for (const side of ["groom", "bride"]) {
    const english = getWedding(side);
    const gujarati = getWedding(side, "gu");
    const source = weddingSides[side];
    assert.equal(english.firstName, source.firstName);
    assert.equal(gujarati.firstName, gu[source.firstName]);
    assert.equal(gujarati.date, english.date);
    assert.equal(gujarati.endDate, english.endDate);
    assert.equal(gujarati.mapsUrl, english.mapsUrl);
    assert.equal(gujarati.slug, english.slug);
    assert.equal(gujarati.events.length, english.events.length);
    for (const key of [
      "firstName",
      "secondName",
      "dateLabel",
      "venue",
      "location",
      "area",
      "city",
      "region",
    ]) {
      assert.ok(
        gu[source[key]],
        `Missing Gujarati wedding field: ${source[key]}`,
      );
    }
    source.events.forEach((event, index) => {
      for (const key of [
        "name",
        "subtitle",
        "date",
        "time",
        "description",
        "dress",
      ]) {
        assert.ok(
          gu[event[key]],
          `Missing Gujarati event field: ${event[key]}`,
        );
        assert.equal(gujarati.events[index][key], gu[event[key]]);
      }
      assert.equal(gujarati.events[index].icon, event.icon);
      assert.equal(gujarati.events[index].tone, event.tone);
    });
  }
});

test("name initials stay English in both languages and retain side ordering", () => {
  for (const language of ["en", "gu"]) {
    const groom = getWedding("groom", language);
    const bride = getWedding("bride", language);
    assert.equal(groom.firstInitial, "V");
    assert.equal(groom.secondInitial, "K");
    assert.equal(bride.firstInitial, "K");
    assert.equal(bride.secondInitial, "V");
  }
});

test("guest UI translation literals all have Gujarati entries", async () => {
  const paths = [
    "src/routes/index.jsx",
    "src/invitation-cover.jsx",
    "src/theme-menu.jsx",
    "src/music-player.jsx",
  ];
  for (const path of paths) {
    const source = await readFile(
      new URL(`../${path}`, import.meta.url),
      "utf8",
    );
    for (const match of source.matchAll(/\bt\("((?:[^"\\]|\\.)*)"/g)) {
      const key = JSON.parse(`"${match[1]}"`);
      assert.ok(gu[key], `Missing Gujarati UI entry in ${path}: ${key}`);
    }
  }
});

test("Hindi lyrics are unchanged and never passed through translation", async () => {
  const source = await readFile(
    new URL("../src/music-player.jsx", import.meta.url),
    "utf8",
  );
  const lyrics = [
    ...source.matchAll(/\{ time: [\d.]+, text: "([^"]+)" \}/g),
  ].map((match) => match[1]);
  assert.equal(lyrics.length, 32);
  const t = createTranslator("gu");
  for (const lyric of lyrics) {
    assert.equal(gu[lyric], undefined);
    assert.equal(t(lyric), lyric);
  }
  assert.ok(source.includes("{currentLyric.text}"));
  assert.ok(source.includes("{line.text}"));
  assert.ok(source.includes('lang="hi"'));
});
