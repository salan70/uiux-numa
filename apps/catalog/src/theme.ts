import { adoptedSchemes } from "./content/collect";
import { schemes } from "./content/schemes";

export type ThemeChoice = "light" | "dark" | "system";
export type SchemeChoice = string;

export const THEME_KEY = "uiux-numa-catalog-theme";
export const SCHEME_KEY = "uiux-numa-catalog-scheme";
export const COLORS_KEY = "uiux-numa-catalog-colors-v2";
export const DEFAULT_SCHEME = "sumi";
export const PREFERENCE_EVENT = "catalog-preferences-change";

export function isThemeChoice(value: string | null): value is ThemeChoice {
  return value === "light" || value === "dark" || value === "system";
}

// 選べるのは採用した配色だけ。保存済みや query の未採用 id は既定へ落とす。
export function isSchemeChoice(value: string | null): value is SchemeChoice {
  return value !== null && adoptedSchemes().some((scheme) => scheme.id === value);
}

export function readThemeChoice(): ThemeChoice {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("theme");
  if (isThemeChoice(fromQuery)) return fromQuery;
  const stored = localStorage.getItem(THEME_KEY);
  return isThemeChoice(stored) ? stored : "system";
}

export function readSchemeChoice(): SchemeChoice {
  const params = new URLSearchParams(window.location.search);
  const fromQuery = params.get("scheme");
  if (isSchemeChoice(fromQuery)) return fromQuery;
  const stored = localStorage.getItem(SCHEME_KEY);
  return isSchemeChoice(stored) ? stored : DEFAULT_SCHEME;
}

export function resolveTheme(choice: ThemeChoice): "light" | "dark" {
  if (choice === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return choice;
}

export function applyPreferences(themeChoice: ThemeChoice, schemeChoice: SchemeChoice): void {
  const resolvedTheme = resolveTheme(themeChoice);
  const scheme =
    schemes.find((item) => item.id === schemeChoice) ??
    schemes.find((item) => item.id === DEFAULT_SCHEME);
  if (!scheme) throw new Error(`既定の配色がない: ${DEFAULT_SCHEME}`);

  const root = document.documentElement;
  root.dataset.theme = resolvedTheme;
  root.dataset.themeChoice = themeChoice;
  root.dataset.scheme = scheme.id;

  const colors = resolvedTheme === "dark" ? scheme.dark : scheme.light;
  const knownRoles = new Set(
    schemes.flatMap((item) => [...item.light, ...item.dark]).map((color) => color.cssName),
  );
  for (const role of knownRoles) root.style.removeProperty(role);
  const applied: Record<string, string> = {};
  for (const color of colors) {
    root.style.setProperty(color.cssName, color.value);
    applied[color.cssName] = color.value;
  }

  localStorage.setItem(
    COLORS_KEY,
    JSON.stringify({
      theme: resolvedTheme,
      themeChoice,
      scheme: scheme.id,
      colors: applied,
    }),
  );

  window.dispatchEvent(
    new CustomEvent(PREFERENCE_EVENT, { detail: { themeChoice, scheme: scheme.id } }),
  );
}

export function applyTheme(choice: ThemeChoice): void {
  applyPreferences(choice, readSchemeChoice());
}

export function applyScheme(choice: SchemeChoice): void {
  applyPreferences(readThemeChoice(), choice);
}

export function persistTheme(choice: ThemeChoice): void {
  localStorage.setItem(THEME_KEY, choice);
  applyTheme(choice);
}

export function persistScheme(choice: SchemeChoice): void {
  localStorage.setItem(SCHEME_KEY, choice);
  applyScheme(choice);
}

export function shouldNoindex(): boolean {
  const host = window.location.hostname;
  if (host === "uiux.oda79.me") return false;
  if (host === "localhost" || host === "127.0.0.1") return false;
  return true;
}
