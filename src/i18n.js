import { gu } from "./translations-gu.js";
import { createContext, useContext } from "react";

export function normalizeLanguage(value) {
  if (typeof value !== "string") return "en";
  return ["gu", "gu-in", "gujarati"].includes(value.toLowerCase())
    ? "gu"
    : "en";
}

export function languageFromSearch(search) {
  const params = new URLSearchParams(search);
  return normalizeLanguage(params.get("lang") ?? params.get("language"));
}

export function createTranslator(language) {
  return (text, values = {}) => {
    const translated = language === "gu" ? (gu[text] ?? text) : text;
    return translated.replace(
      /\{\{(\w+)\}\}/g,
      (match, key) => values[key] ?? match,
    );
  };
}

export function formatDigits(value, language) {
  return language === "gu"
    ? String(value).replace(/[0-9]/g, (digit) => "૦૧૨૩૪૫૬૭૮૯"[digit])
    : String(value);
}

export const LanguageContext = createContext({
  language: "en",
  locale: "en-GB",
  t: createTranslator("en"),
});

export function useLanguage() {
  return useContext(LanguageContext);
}
