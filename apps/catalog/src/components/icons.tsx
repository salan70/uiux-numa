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
 * 24 の viewBox、線幅 1.5、端点は丸、live area の余白は 2。
 */
export function DetailIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.25" />
      <circle cx="12" cy="7.75" r="0.75" className="icon__dot" />
    </svg>
  );
}

/**
 * ナビの開閉の印。
 * 枠の中を左の桁と版面に分けた形で、サイドバーの並びそのものを表す。
 * 開閉で形を変えない。状態は左の桁の塗りだけで示し、押し先の寸法を動かさない。
 * 規則は DetailIcon と同じ（24 の viewBox、線幅 1.5、端点は丸、live area の余白は 2）。
 */
export function SidebarIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="M9.5 5v14" />
    </svg>
  );
}

/**
 * 前後へ送る印。文字の矢印は書体の字面で下へ寄るため、Button の icon 枠の中心に置けない。
 * 規則は DetailIcon と同じ（24 の viewBox、線幅 1.5、端点は丸、live area の余白は 2）。
 */
export function ArrowIcon({ direction }: { direction: "prev" | "next" }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={direction === "next" ? "M4 12h16m-6-6 6 6-6 6" : "M20 12H4m6-6-6 6 6 6"} />
    </svg>
  );
}
