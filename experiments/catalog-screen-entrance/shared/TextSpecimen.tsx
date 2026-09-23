import { useState, type CSSProperties } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import "./text-specimen.css";

/** 見出しを分ける単位。variant ごとに動かす単位が違う。 */
export type SplitUnit = "line" | "word" | "char";

// 見出しは欧文、リードは和文にする。Catalog の見出しは欧文、本文は和文で組むので、両方の字面で動きを確かめる。
// 見出しは 2 行に固定する。行の単位で動かす案があり、折り返し位置が幅で変わると比べられない。
const HEADING_LINES = ["Design in", "motion."];
const LEAD = "画面が表示されるとき、見出しから順に立ち上がる。";

/**
 * 画面表示の動きをテキストで見せる標本。
 * 見出しを variant の単位で分けて span にし、各 span に通し番号 --i を渡す。
 * 遅延の計算と動きの中身は variant の CSS だけが持ち、3 案で文言と操作を揃える。
 */
export function TextSpecimen({ variantClass, unit }: { variantClass: string; unit: SplitUnit }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useCatalogColors(root);
  // 再生の回数。key に使い、押すたびに見出しを新しい要素として描き直して animation を最初から流す。
  const [play, setPlay] = useState(0);

  let index = 0;
  const next = () => index++;

  return (
    <main ref={(node) => setRoot(node)} className={`text-specimen ${variantClass}`}>
      <div className="text-specimen__stage" key={play}>
        <p className="text-specimen__eyebrow">MOTION / ENTRANCE</p>
        {/* 分けた span を読み上げると 1 文字ずつ区切られるので、全文を aria-label に持たせて中身は隠す。 */}
        <h1 className="text-specimen__heading" aria-label={HEADING_LINES.join(" ")}>
          {HEADING_LINES.map((line) => (
            <span className="text-specimen__line" key={line} aria-hidden="true">
              {unit === "line" ? (
                <span className="text-specimen__unit" style={{ "--i": next() } as CSSProperties}>
                  {line}
                </span>
              ) : (
                splitLine(line, unit).map((part, partIndex) =>
                  part === " " ? (
                    " "
                  ) : (
                    <span
                      className="text-specimen__unit"
                      key={`${part}-${partIndex}`}
                      style={{ "--i": next() } as CSSProperties}
                    >
                      {part}
                    </span>
                  ),
                )
              )}
            </span>
          ))}
        </h1>
        {/* リードは見出しが出そろってから出す。遅延は variant が見出しの長さから決める。 */}
        <p className="text-specimen__lead" style={{ "--count": index } as CSSProperties}>
          {LEAD}
        </p>
      </div>

      <button type="button" className="text-specimen__replay" onClick={() => setPlay((n) => n + 1)}>
        もう一度再生
      </button>
    </main>
  );
}

/** 語は空白を残して分ける。空白を span に入れると、行頭と行末で幅が崩れる。 */
function splitLine(line: string, unit: "word" | "char"): string[] {
  if (unit === "word") return line.split(/( )/).filter((part) => part !== "");
  return [...line];
}
