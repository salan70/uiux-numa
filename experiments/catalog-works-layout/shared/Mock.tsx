import { useState, type ReactNode } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import "../../button/shared/button.css";
import "./mock.css";

/**
 * Works の 2 画面（Icons と Motion）を縦に並べる枠。
 * サイドバーは描かない。比べるのは版面の中の組み方だけで、ナビは案で変わらない。
 */
export function Mock({
  variantClass,
  label,
  children,
}: {
  variantClass: string;
  label: string;
  children: ReactNode;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useCatalogColors(root);
  return (
    <main ref={(node) => setRoot(node)} className={`wl ${variantClass}`}>
      <header className="wl__header">
        <p className="wl__eyebrow">CATALOG / WORKS</p>
        <h1 className="wl__heading">{label}</h1>
      </header>
      {children}
    </main>
  );
}

/** 1 画面分。題字は Catalog のトピックの題字（.index .section-title）の寸法を写す。 */
export function Screen({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="wl-screen" aria-labelledby={`wl-${id}`}>
      <h2 className="wl-screen__title" id={`wl-${id}`}>
        {title}
      </h2>
      {children}
    </section>
  );
}

/** SVG を土台の文字色で描く。Catalog の SvgGrid と同じく、配布用の SVG をそのまま入れる。 */
export function Svg({ source, className }: { source: string; className?: string }) {
  return <span className={className} dangerouslySetInnerHTML={{ __html: source }} />;
}

/** 詳細の印。Catalog の DetailIcon と同じ形。 */
export function DetailIcon() {
  return (
    <svg className="wl-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 7.5h0" />
      <path d="M12 11.25v5.25" />
    </svg>
  );
}

/** variant の切替。候補が 1 つなら出さない。 */
export function VariantPills({
  label,
  variants,
  adopted,
  current,
  onSelect,
}: {
  label: string;
  variants: string[];
  adopted: string[];
  current: string;
  onSelect: (id: string) => void;
}) {
  if (variants.length < 2) return null;
  return (
    <ul className="wl-pills" aria-label={label}>
      {variants.map((id) => (
        <li key={id}>
          <button
            type="button"
            className="wl-pill"
            aria-pressed={id === current}
            onClick={() => onSelect(id)}
          >
            {id}
            {adopted.includes(id) && <span className="wl-pill__mark">採用</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** 成果物 1 件の見出し。題名と、Colors のカードと同じ ⓘ だけを置く。日付と成熟度は出さない。 */
export function WorkHead({ title, href }: { title: string; href: string }) {
  return (
    <div className="wl-work-head">
      <h3 className="wl-work-head__title">{title}</h3>
      <a className="wl-more" href={href} aria-label={`${title} の詳細`}>
        <DetailIcon />
      </a>
    </div>
  );
}
