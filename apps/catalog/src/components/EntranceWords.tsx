import type { CSSProperties } from "react";

/** Catalog の見出しに使う型。Motion 画面は、この値で「Catalog の見出し」の印を付ける。 */
export const ENTRANCE_VARIANT = { experiment: "catalog-screen-entrance", variant: "blur-focus" };

/**
 * 画面の見出しの文字。語ごとに span へ分け、catalog.css の entrance 系の動きで順に焦点を合わせて出す。
 * 採用した型は experiments/catalog-screen-entrance の blur-focus である。
 * 語は空白で分ける。和文の題名は空白の無い一続きが 1 語になり、長い題名でも待たせない。
 * 分けた span を読み上げると語ごとに区切られるので、全文を見えない span で読ませ、分けた側は隠す。
 */
export function EntranceWords({ text }: { text: string }) {
  const words = text.split(/( )/).filter((part) => part !== "");
  let index = 0;
  return (
    <>
      <span className="entrance-words__label">{text}</span>
      <span aria-hidden="true">
        {words.map((word, position) =>
          word === " " ? (
            " "
          ) : (
            <span
              className="entrance-words__word"
              key={`${word}-${position}`}
              style={{ "--i": index++ } as CSSProperties}
            >
              {word}
            </span>
          ),
        )}
      </span>
    </>
  );
}
