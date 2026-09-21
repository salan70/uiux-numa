import type { ReactNode } from "react";

export type CardProps = {
  href: string;
  title: string;
  description?: string;
  /** 種別や日付などの補足。題名の上に出すが、読み上げは題名を先にする。 */
  meta?: ReactNode;
  /** 16:9 の見本。飾りとして描き、読み上げもフォーカスもさせない。無ければ要約を枠の中に置く。 */
  cover?: ReactNode;
};

/**
 * 全体を押せる一覧カード。面は持たず、16:9 の枠と、その下の 3 行分の文字で高さを固定する。
 * 押す先は題名のリンクだけにし、リンクの ::after をカード全面へ広げる。
 * 読み上げは題名を先にするため、DOM では文字を枠より前に置き、見た目だけ枠を上へ出す。
 */
export function Card({ href, title, description, meta, cover }: CardProps) {
  return (
    <article className={cover ? "card" : "card card--text"}>
      <div className="card__text">
        <h3 className="card__title">
          <a className="card__link" href={href}>
            {title}
          </a>
        </h3>
        {meta ? <p className="card__meta">{meta}</p> : null}
        {cover && description ? <p className="card__description">{description}</p> : null}
      </div>
      {cover ? (
        <div className="card__frame" aria-hidden="true" inert>
          <div className="card__cover">{cover}</div>
        </div>
      ) : (
        <div className="card__frame">
          <div className="card__cover">
            <p className="card__excerpt">{description}</p>
          </div>
        </div>
      )}
    </article>
  );
}
