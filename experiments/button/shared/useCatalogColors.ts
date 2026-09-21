import { useEffect } from "react";

const COLORS_KEY = "uiux-numa-catalog-colors-v2";

type StoredColors = {
  colors?: Record<string, string>;
  theme?: string;
};

export function useCatalogColors(target: HTMLElement | null): void {
  useEffect(() => {
    if (!target) return;
    const element = target;
    const applied = new Set<string>();

    function clear() {
      for (const name of applied) element.style.removeProperty(name);
      applied.clear();
      delete element.dataset.theme;
      element.style.removeProperty("color-scheme");
    }

    function apply() {
      const raw = window.localStorage.getItem(COLORS_KEY);
      if (!raw) {
        clear();
        return;
      }
      try {
        const parsed = JSON.parse(raw) as StoredColors;
        if (!parsed.colors || typeof parsed.colors !== "object") {
          clear();
          return;
        }
        for (const name of applied) {
          if (!(name in parsed.colors)) element.style.removeProperty(name);
        }
        applied.clear();
        for (const [name, value] of Object.entries(parsed.colors)) {
          if (typeof value !== "string") continue;
          element.style.setProperty(name, value);
          applied.add(name);
        }
        if (parsed.theme === "light" || parsed.theme === "dark") {
          element.dataset.theme = parsed.theme;
          element.style.colorScheme = parsed.theme;
        }
      } catch {
        clear();
      }
    }

    apply();
    const parentWindow = window.parent;
    window.addEventListener("storage", apply);
    if (parentWindow !== window) {
      parentWindow.addEventListener("catalog-preferences-change", apply);
    }
    return () => {
      window.removeEventListener("storage", apply);
      if (parentWindow !== window) {
        parentWindow.removeEventListener("catalog-preferences-change", apply);
      }
      clear();
    };
  }, [target]);
}
