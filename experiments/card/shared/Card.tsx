import type { ReactNode } from "react";

export type CardProps = {
  href: string;
  title: string;
  description?: string;
  /** 種別や日付などの補足。題名の上に出すが、読み上げは題名を先にする。 */
  meta?: ReactNode;
  /** 16:9 の見本。飾りとして描き、読み上げもフォーカスもさせない。無ければ文字を枠の中に置く。 */
  cover?: ReactNode;
};

/**
 * 全体を押せる一覧カード。面は持たず、枠はカバーだけが持つ。
 * 押す先は題名のリンクだけにし、リンクの ::after をカード全面へ広げる。
 * 本文を <a> で包まないので、読み上げはリンク名が題名だけになる。
 */
export function Card({ href, title, description, meta, cover }: CardProps) {
  const text = (
    <div className="card__text">
      <h3 className="card__title">
        <a className="card__link" href={href}>
          {title}
        </a>
      </h3>
      {meta ? <p className="card__meta">{meta}</p> : null}
      {description ? <p className="card__description">{description}</p> : null}
    </div>
  );

  return (
    <article className={cover ? "card" : "card card--text"}>
      {cover ? (
        <>
          <div className="card__frame" aria-hidden="true" inert>
            <div className="card__cover">{cover}</div>
          </div>
          {text}
        </>
      ) : (
        <div className="card__frame">{text}</div>
      )}
    </article>
  );
}
