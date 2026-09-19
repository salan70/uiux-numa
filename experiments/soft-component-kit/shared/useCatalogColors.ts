import { useEffect } from "react";

// 正本は apps/catalog/src/theme.ts の COLORS_KEY。experiments から apps へ import しない。
const COLORS_KEY = "uiux-numa-catalog-colors";

type StoredColors = {
  theme?: string;
  colors?: Record<string, string>;
};

export function useCatalogColors(target: HTMLElement | null): void {
  useEffect(() => {
    if (!target) return;

    const applied = new Set<string>();

    function apply(): void {
      if (!target) return;
      const raw = window.localStorage.getItem(COLORS_KEY);
      if (!raw) {
        clear();
        return;
      }
      try {
        const parsed = JSON.parse(raw) as StoredColors;
        const next = parsed.colors;
        if (!next || typeof next !== "object") {
          clear();
          return;
        }
        for (const name of applied) {
          if (!(name in next)) target.style.removeProperty(name);
        }
        applied.clear();
        for (const [name, value] of Object.entries(next)) {
          if (typeof value !== "string") continue;
          target.style.setProperty(name, value);
          applied.add(name);
        }
        if (parsed.theme === "light" || parsed.theme === "dark") {
          target.style.colorScheme = parsed.theme;
        }
      } catch {
        clear();
      }
    }

    function clear(): void {
      if (!target) return;
      for (const name of applied) target.style.removeProperty(name);
      applied.clear();
      target.style.removeProperty("color-scheme");
    }

    function applyFromEvent(): void {
      apply();
    }

    apply();
    window.addEventListener("storage", applyFromEvent);
    // 正本は apps/catalog/src/theme.ts の PREFERENCE_EVENT。同一タブの iframe では storage が飛ばない。
    const parentWindow = window.parent;
    if (parentWindow !== window) {
      parentWindow.addEventListener("catalog-preferences-change", applyFromEvent);
    }
    return () => {
      window.removeEventListener("storage", applyFromEvent);
      if (parentWindow !== window) {
        parentWindow.removeEventListener("catalog-preferences-change", applyFromEvent);
      }
      clear();
    };
  }, [target]);
}
