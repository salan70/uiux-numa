import type { ReactNode } from "react";

export type CardProps = {
  href: string;
  title: string;
  description: string;
  /** 種別や日付などの補足。題名の上に出すが、読み上げは題名を先にする。 */
  meta?: ReactNode;
};

/**
 * 全体を押せる一覧カード。
 * 押す先は題名のリンクだけにし、リンクの ::after をカード全面へ広げる。
 * 本文を <a> で包まないので、読み上げはリンク名が題名だけになる。
 */
export function Card({ href, title, description, meta }: CardProps) {
  return (
    <article className="card">
      <h3 className="card__title">
        <a className="card__link" href={href}>
          {title}
        </a>
      </h3>
      {meta ? <p className="card__meta">{meta}</p> : null}
      <p className="card__description">{description}</p>
    </article>
  );
}
