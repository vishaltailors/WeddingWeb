import { LanguageContext, createTranslator, languageFromSearch } from "../i18n";
import "../index.css";
import { Outlet, createRootRoute, useLocation } from "@tanstack/react-router";
import { useEffect, useMemo } from "react";

export const Route = createRootRoute({
  component: Root,
});

function Root() {
  const search = useLocation({ select: (location) => location.searchStr });
  const pathname = useLocation({ select: (location) => location.pathname });
  const language =
    pathname === "/admin" || pathname === "/admin/"
      ? "en"
      : languageFromSearch(search);
  const value = useMemo(
    () => ({
      language,
      locale: language === "gu" ? "gu-IN" : "en-GB",
      t: createTranslator(language),
    }),
    [language],
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={value}>
      <Outlet />
    </LanguageContext.Provider>
  );
}
