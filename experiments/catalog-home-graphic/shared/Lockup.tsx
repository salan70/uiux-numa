import type { CSSProperties } from "react";

// マークと wordmark の字画。形の正本は experiments/uiux-numa-logo/variants/nu-dot/dist/mark.svg と
// experiments/uiux-numa-wordmark/variants/caps-period/dist/wordmark.svg で、apps/catalog/src/components/icons.tsx と同じ値である。
export const MARK_LETTER = "M6 28V14a4 4 0 0 1 8 0v8a6 6 0 0 0 12 0V8";
export const MARK_DOT = { cx: 26, cy: 2.5, r: 2.5 };

export const WORDMARK_LETTERS = [
  "M4 4v16a8 8 0 0 0 16 0V4",
  "M29 4v24",
  "m36.5 30 12-28",
  "M56 4v16a8 8 0 0 0 16 0V4",
  "m80 4 16 24m0-24L80 28",
  "M113.5 28V5.5a1.5 1.5 0 0 1 2.862-.629l10.276 22.258a1.5 1.5 0 0 0 2.862-.629V4",
  "M138.5 4v16a8 8 0 0 0 16 0V4",
  "M163.5 28V5.5a1.5 1.5 0 0 1 2.912-.507l4.676 13.014a1.5 1.5 0 0 0 2.824 0l4.676-13.014a1.5 1.5 0 0 1 2.912.507V28",
  "m189.5 28 8.595-23.025a1.5 1.5 0 0 1 2.81 0L209.5 28m-16.64-9h13.28",
];
export const WORDMARK_DOT = { cx: 216.5, cy: 27.5, r: 2.5 };

/**
 * マークと wordmark を 1 枚の SVG に並べた lockup。座標は高さ 32 で、マークの幅 32、間隔 9.6（高さの 0.3）、wordmark 221。
 * 字画は pathLength 1 にし、線を引く動きを長さに依らず 0..1 で書けるようにする。動きは各 variant の CSS が決める。
 * 名前は見えない文字列が担うので、SVG は読み上げに出さない。
 */
export function Lockup({ className }: { className?: string }) {
  const offset = 32 + 9.6;
  return (
    <svg
      className={className}
      viewBox={`-3 -3 ${offset + 221 + 6} 38`}
      aria-hidden="true"
      focusable="false"
    >
      <g className="lk-mark">
        <path
          className="lk-stroke"
          pathLength={1}
          d={MARK_LETTER}
          style={{ "--i": 0 } as CSSProperties}
        />
        <circle className="lk-dot lk-dot--mark" {...MARK_DOT} />
      </g>
      <g className="lk-word" transform={`translate(${offset} 0)`}>
        {WORDMARK_LETTERS.map((d, index) => (
          <path
            key={d}
            className="lk-stroke"
            pathLength={1}
            d={d}
            style={{ "--i": index + 1 } as CSSProperties}
          />
        ))}
        <circle className="lk-dot lk-dot--period" {...WORDMARK_DOT} />
      </g>
    </svg>
  );
}
