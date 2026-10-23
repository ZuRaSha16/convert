export const themeStorageKey = "convert-theme";
export const themeMediaQuery = "(prefers-color-scheme: dark)";

export const themes = [
  { id: "dark", label: "Dark", labelKa: "მუქი", color: "#111b2c" },
  { id: "light", label: "Light", labelKa: "ღია", color: "#f5efdf" },
] as const;

export type Theme = (typeof themes)[number]["id"];

const legacyThemes: Record<string, Theme> = { navy: "dark", cream: "light", green: "dark" };

export function isTheme(value: unknown): value is Theme {
  return themes.some((theme) => theme.id === value);
}

export function resolveTheme(value: unknown): Theme | undefined {
  if (isTheme(value)) return value;
  if (typeof value === "string" && isTheme(legacyThemes[value])) return legacyThemes[value];
}

// Restore the saved mode before paint, including preferences from the old picker.
export const themeInitializationScript = `(() => {
  const themes = ${JSON.stringify(themes)};
  const legacyThemes = ${JSON.stringify(legacyThemes)};
  let saved;
  try { saved = localStorage.getItem(${JSON.stringify(themeStorageKey)}); } catch {}
  const preferred = themes.find(theme => theme.id === saved || theme.id === legacyThemes[saved]);
  const selected = preferred || themes.find(theme =>
    theme.id === (window.matchMedia(${JSON.stringify(themeMediaQuery)}).matches ? 'dark' : 'light'));
  if (preferred && saved !== preferred.id) {
    try { localStorage.setItem(${JSON.stringify(themeStorageKey)}, preferred.id); } catch {}
  }
  document.documentElement.dataset.theme = selected.id;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.content = selected.color;
})();`;
