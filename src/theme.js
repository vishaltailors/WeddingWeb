const storageKey = "wedding-theme";

export function getStoredTheme() {
  try {
    const theme = localStorage.getItem(storageKey);
    if (theme === "light" || theme === "dark") return theme;
  } catch {
    // Use the system preference when storage is unavailable.
  }
  return "system";
}

export function applyTheme(theme) {
  const resolvedTheme =
    theme === "system"
      ? window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.documentElement.dataset.theme = resolvedTheme;
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", resolvedTheme === "dark" ? "#201c1b" : "#fbf8f1");
  return resolvedTheme;
}

export function storeTheme(theme) {
  try {
    localStorage.setItem(storageKey, theme);
  } catch {
    // The selected theme still works for the current visit.
  }
}
