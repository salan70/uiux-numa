import type { ThemeChoice } from "../theme";

/**
 * 三つ巴。配色を選ぶボタンの面に置く。
 * 3 領域には選択中の配色の primary、secondary、tertiary を当てる。
 * 形の正本は experiments/catalog-theme-icons/variants/tomoe-classic/dist/scheme.svg。
 * 座標の導出は同 Experiment の README にある。
 */
export function SchemeIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        className="part-scheme-primary"
        d="M12 3.75a8.25 8.25 0 0 1 7.145 12.375A4.125 4.125 0 0 1 12 12a4.125 4.125 0 0 0 0-8.25Z"
      />
      <path
        className="part-scheme-secondary"
        d="M19.145 16.125a8.25 8.25 0 0 1-14.29 0A4.125 4.125 0 0 1 12 12a4.125 4.125 0 0 0 7.145 4.125Z"
      />
      <path
        className="part-scheme-tertiary"
        d="M4.855 16.125A8.25 8.25 0 0 1 12 3.75 4.125 4.125 0 0 1 12 12a4.125 4.125 0 0 0-7.145 4.125Z"
      />
    </svg>
  );
}

/**
 * 明暗の 3 状態。端末に従うは半分だけ塗った円、ライトは日、ダークは月。
 * 形の正本は experiments/catalog-theme-icons/variants/tomoe-classic/dist/appearance-*.svg。
 * 座標の導出は同 Experiment の README にある。
 */
export function AppearanceIcon({ value }: { value: ThemeChoice }) {
  const common = {
    className: "icon",
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    focusable: "false" as const,
  };
  if (value === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 3.75v1.5m0 13.5v1.5M3.75 12h1.5m13.5 0h1.5M6.17 6.17l1.06 1.06m9.54 9.54 1.06 1.06m0-11.66-1.06 1.06m-9.54 9.54-1.06 1.06" />
      </svg>
    );
  }
  if (value === "dark") {
    return (
      <svg {...common}>
        <path d="M15.75 3.75a8.25 8.25 0 1 0 0 16.5 6 6 0 1 1 0-16.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" />
    </svg>
  );
}

/**
 * 詳細を開く印。
 * 線幅、端点、live area を 1 値に固定する規則は docs/principles/icon-set-consistency-by-few-parameters.md に従う。
 * 24 の viewBox、線幅 1.5、端点は丸、live area の余白は 3。
 * 形の正本は experiments/catalog-ui-icons/variants/round-soft/dist/detail.svg。座標の導出は同 Experiment の README にある。
 */
export function DetailIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5h0" />
      <path d="M12 11.25v5.25" />
    </svg>
  );
}

/**
 * ナビの開閉の印。
 * 枠の中を左の桁と版面に分けた形で、サイドバーの並びそのものを表す。
 * 開閉で形を変えない。状態は左の桁の塗りだけで示し、押し先の寸法を動かさない。
 * 規則は DetailIcon と同じ（24 の viewBox、線幅 1.5、端点は丸、live area の余白は 3）。
 */
export function SidebarIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3.75" y="6.75" width="16.5" height="10.5" rx="2.25" />
      <path d="M9.75 6.75v10.5" />
    </svg>
  );
}

/**
 * 前後へ送る印。文字の矢印は書体の字面で下へ寄るため、Button の icon 枠の中心に置けない。
 * 規則は DetailIcon と同じ（24 の viewBox、線幅 1.5、端点は丸、live area の余白は 3）。
 * 幹は y=11.25 に置く。箱の中心 12 では 16px で線が半ピクセルにまたがり、頭より薄く出る。
 */
export function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        d={direction === "next" ? "M3.75 11.25h16.5m-6-6 6 6-6 6" : "M20.25 11.25H3.75m6-6-6 6 6 6"}
      />
    </svg>
  );
}
