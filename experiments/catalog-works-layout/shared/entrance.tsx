import { useEffect, useRef, useState, type CSSProperties } from "react";
import "../../catalog-screen-entrance/shared/text-specimen.css";
import "../../catalog-screen-entrance/variants/line-mask/variant.css";
import "../../catalog-screen-entrance/variants/blur-focus/variant.css";
import "../../catalog-screen-entrance/variants/char-stagger/variant.css";
import "./entrance.css";

/**
 * Motion の見本を iframe を使わずに本文へ直接描く。
 * 動きの中身は catalog-screen-entrance の各 variant の CSS をそのまま読み、ここは文字の分け方だけを持つ。
 * 分け方と class 名は同 Experiment の TextSpecimen と揃える（.text-specimen__line / __unit / __lead）。
 */

export type Unit = "line" | "word" | "char";

/** 型の値。catalog-screen-entrance の README の「値と根拠」の表から写す。文字の分け方とセルの 1 行に使う。 */
export type PatternSpec = {
  unit: Unit;
  duration: number;
  step: number;
};

export const PATTERN_SPECS: Record<string, PatternSpec> = {
  "line-mask": {
    unit: "line",
    duration: 800,
    step: 100,
  },
  "blur-focus": {
    unit: "word",
    duration: 900,
    step: 80,
  },
  "char-stagger": {
    unit: "char",
    duration: 600,
    step: 30,
  },
};

export const UNIT_LABEL: Record<Unit, string> = {
  line: "行ごと",
  word: "語ごと",
  char: "1 文字ずつ",
};

/** 見本の見出し。Catalog にある複数語の見出しを使い、語と文字の単位でも分かれて見えるようにする。 */
export const SAMPLE_LINES = ["States &", "Feedback"];
export const SAMPLE_LEAD = "画面が表示されるとき、見出しから順に立ち上がる。";

/** 見出しを単位で分ける。語は空白を残す。空白を span に入れると、行頭と行末で幅が崩れる。 */
export function splitUnits(lines: string[], unit: Unit): string[][] {
  return lines.map((line) => {
    if (unit === "line") return [line];
    if (unit === "word") return line.split(/( )/).filter((part) => part !== "");
    return [...line];
  });
}

/**
 * 見本 1 つ。playKey が変わるたびに要素を作り直し、animation を最初から流す。
 * 見本は飾りなので読み上げさせない。何の見本かは周りの見出しと操作の名前が伝える。
 */
export function EntranceText({
  pattern,
  playKey,
  lines = SAMPLE_LINES,
  lead = SAMPLE_LEAD,
  className,
}: {
  pattern: string;
  playKey: number;
  lines?: string[];
  lead?: string | null;
  className?: string;
}) {
  const spec = PATTERN_SPECS[pattern];
  let index = 0;
  return (
    <div
      className={["es", `entrance-${pattern}`, className].filter(Boolean).join(" ")}
      aria-hidden="true"
      key={playKey}
    >
      <p className="es__heading">
        {splitUnits(lines, spec.unit).map((parts, row) => (
          <span className="text-specimen__line" key={row}>
            {parts.map((part, position) =>
              part === " " ? (
                " "
              ) : (
                <span
                  className="text-specimen__unit"
                  key={`${part}-${position}`}
                  style={{ "--i": index++ } as CSSProperties}
                >
                  {part}
                </span>
              ),
            )}
          </span>
        ))}
      </p>
      {lead && (
        <p className="text-specimen__lead es__lead" style={{ "--count": index } as CSSProperties}>
          {lead}
        </p>
      )}
    </div>
  );
}

/**
 * 画面に入ったときに 1 回だけ再生させる。
 * 読み込み時に再生すると、下にある見本はスクロールして届く前に終わっている。
 */
export function usePlayOnView<T extends Element>(): [(node: T | null) => void, number, () => void] {
  const [playKey, setPlayKey] = useState(0);
  const [node, setNode] = useState<T | null>(null);
  const seen = useRef(false);
  useEffect(() => {
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (seen.current || !entries.some((entry) => entry.isIntersecting)) return;
        seen.current = true;
        setPlayKey((n) => n + 1);
        observer.disconnect();
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [node]);
  return [setNode, playKey, () => setPlayKey((n) => n + 1)];
}

/** 型の値。区切りの記号は使わず、並べる側が間隔で区切る（利用者の 2026-09-25 の判断）。 */
export function specParts(spec: PatternSpec): string[] {
  return [UNIT_LABEL[spec.unit], `${spec.duration}ms`, `間隔 ${spec.step}ms`];
}
