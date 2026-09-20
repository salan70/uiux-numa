// 案の中の画面切替。
// 実行基盤（platforms/web/src/App.tsx）が hash `#<slug>/<id>` を variant の選択に使うため、
// 画面の状態は query に持つ。再読込で画面が消えず、1 画面ずつ撮影できる。
// 公開実装は 2026-09-20 に apps/catalog へ移した（docs/decisions/2026-09-20-catalog-topic-first.md）。
// ここは Experiment を再実行するための写しであり、公開面は参照しない。
import { useCallback, useEffect, useState } from "react";

export const SCREENS = ["top", "list", "detail", "sheet", "guide"] as const;
export type Screen = (typeof SCREENS)[number];

export type ScreenState = {
  screen: Screen;
  /** 詳細で開く Experiment の slug。 */
  item: string | null;
  /** 詳細で開く variant の id。 */
  variant: string | null;
  /** 一覧の絞り込み。 */
  filter: string | null;
};

export type ScreenApi = ScreenState & {
  go: (next: Partial<ScreenState>) => void;
  hrefFor: (next: Partial<ScreenState>) => string;
};

export function useScreen(initial: Screen = "top"): ScreenApi {
  const [state, setState] = useState<ScreenState>(() => read(initial));

  useEffect(() => {
    const onPop = () => setState(read(initial));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [initial]);

  const hrefFor = useCallback(
    (next: Partial<ScreenState>) => buildHref({ ...state, ...next }),
    [state],
  );

  const go = useCallback(
    (next: Partial<ScreenState>) => {
      const merged = { ...state, ...next };
      window.history.pushState(null, "", buildHref(merged));
      setState(merged);
      // 画面が変わったら本文の先頭へ focus を移す。
      // 移さないと、リンクを押した位置に focus が残り、次の Tab がどこへ行くか読めない。
      window.requestAnimationFrame(() => {
        const heading = document.querySelector<HTMLElement>("[data-screen-heading]");
        heading?.focus();
        window.scrollTo(0, 0);
        document.querySelector(".ed-root")?.scrollTo(0, 0);
      });
    },
    [state],
  );

  return { ...state, go, hrefFor };
}

function read(fallback: Screen): ScreenState {
  const params = new URLSearchParams(window.location.search);
  const screen = params.get("screen");
  return {
    screen: isScreen(screen) ? screen : fallback,
    item: params.get("item"),
    variant: params.get("variant"),
    filter: params.get("filter"),
  };
}

function buildHref(state: ScreenState): string {
  const params = new URLSearchParams(window.location.search);
  params.set("screen", state.screen);
  setOrDelete(params, "item", state.item);
  setOrDelete(params, "variant", state.variant);
  setOrDelete(params, "filter", state.filter);
  // hash は実行基盤が variant の選択に使う。触らずそのまま残す。
  return `${window.location.pathname}?${params.toString()}${window.location.hash}`;
}

function setOrDelete(params: URLSearchParams, key: string, value: string | null): void {
  if (value) params.set(key, value);
  else params.delete(key);
}

function isScreen(value: string | null): value is Screen {
  return value != null && (SCREENS as readonly string[]).includes(value);
}
