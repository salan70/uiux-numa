import type { ThemeChoice } from "../theme";

/**
 * 勾玉。配色を選ぶボタンの面に置く。
 * 形は太玉（頭）から尾へ細る曲がり玉で、頭に穴を 1 つ開ける。
 * 面は選択中の配色の accent を当てる。何色を着ているかを、名前ではなく色そのもので示す。
 */
export function MagatamaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="var(--cat-accent)"
        d="M12 2.5a9.5 9.5 0 0 1 0 19 4.75 4.75 0 0 1 0-9.5 4.75 4.75 0 0 0 0-9.5Z"
      />
      <circle cx="11.2" cy="16.6" r="1.7" fill="var(--cat-surface)" />
    </svg>
  );
}

/** 明暗の 3 状態。端末に従うは半分だけ塗った円、ライトは日、ダークは月。 */
export function AppearanceIcon({ value }: { value: ThemeChoice }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    focusable: "false" as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (value === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 3v2.25M12 18.75V21M3 12h2.25M18.75 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
      </svg>
    );
  }
  if (value === "dark") {
    return (
      <svg {...common}>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" stroke="none" />
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
