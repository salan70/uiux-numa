import type { ComponentType, ReactNode } from "react";

type CardLinkProps = { href: string; className?: string; children: ReactNode };

export type CardProps = {
  /** 遷移先。無いカードは題名を文字のままにし、押しても移動しない。 */
  href?: string;
  title: string;
  description?: string;
  /** 種別や日付などの補足。題名の上に出すが、読み上げは題名を先にする。 */
  meta?: ReactNode;
  /** 16:9 の見本。飾りとして描き、読み上げもフォーカスもさせない。無ければ要約を枠の中に置く。 */
  cover?: ReactNode;
  /** 題名のリンクを描く部品。SPA の遷移を使う画面は自前のリンクを渡す。無ければ素の <a> にする。 */
  linkAs?: ComponentType<CardLinkProps>;
};

function PlainLink({ href, className, children }: CardLinkProps) {
  return (
    <a className={className} href={href}>
      {children}
    </a>
  );
}

/**
 * 一覧カード。面は持たず、16:9 の枠と、その下の 3 行分の文字で高さを固定する。
 * 遷移先があるときは題名だけをリンクにし、リンクの ::after をカード全面へ広げる。
 * 読み上げは題名を先にするため、DOM では文字を枠より前に置き、見た目だけ枠を上へ出す。
 */
export function Card({
  href,
  title,
  description,
  meta,
  cover,
  linkAs: LinkAs = PlainLink,
}: CardProps) {
  return (
    <article className={cover ? "card" : "card card--text"}>
      <div className="card__text">
        <h3 className="card__title">
          {href ? (
            <LinkAs className="card__link" href={href}>
              {title}
            </LinkAs>
          ) : (
            title
          )}
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
