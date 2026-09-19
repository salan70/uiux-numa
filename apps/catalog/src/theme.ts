export type ThemeChoice = "light" | "dark" | "system";

export const THEME_KEY = "uiux-numa-catalog-theme";

export function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

export function readThemeChoice(): ThemeChoice {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("theme");
  if (isThemeChoice(fromQuery)) return fromQuery;
  const stored = localStorage.getItem(THEME_KEY);
  return isThemeChoice(stored) ? stored : "system";
}

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

export function applyTheme(choice: ThemeChoice): void {
  const resolved = resolveTheme(choice);
  document.documentElement.dataset.theme = resolved;
  document.documentElement.dataset.themeChoice = choice;
}

export function persistTheme(choice: ThemeChoice): void {
  localStorage.setItem(THEME_KEY, choice);
  applyTheme(choice);
}

export function shouldNoindex(): boolean {
  const host = window.location.hostname;
  if (host === "uiux.oda79.me") return false;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return true;
}
