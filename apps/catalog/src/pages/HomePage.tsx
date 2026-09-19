import { Link } from "../components/Link";
import { SchemeSpecimen } from "../components/SchemeSpecimen";
import { categoryHref, categoryLabel } from "../content/category";
import { catalog } from "../content/collect";

export function HomePage() {
  const recent = [...catalog.experiments]
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug))
    .slice(0, 5);

  return (
    <>
      <div className="page-intro">
        <h1>UI/UX 沼</h1>
        <p className="lede">採用した見た目と操作を、紙の上で確かめる見本帳である。</p>
      </div>
      <section aria-labelledby="paper-heading">
        <h2 id="paper-heading">いまの紙</h2>
        <p className="lede">配色とテーマはヘッダーで切り替える。サイト全体が同じ紙になる。</p>
        <SchemeSpecimen />
      </section>
      <section aria-labelledby="principles-heading">
        <h2 id="principles-heading">原則</h2>
        <ul className="record-list">
          {catalog.principles.map((principle) => (
            <li key={principle.slug}>
              <Link href={`/principles/${principle.slug}`}>{principle.title}</Link>
              <span className="meta"> {principle.status}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="foundations-heading">
        <h2 id="foundations-heading">土台と部品</h2>
        <ul className="record-list">
          <li>
            <Link href={categoryHref("colors")}>{categoryLabel("colors")}</Link>
            <span className="meta"> 採用した配色</span>
          </li>
          <li>
            <Link href={categoryHref("typography")}>{categoryLabel("typography")}</Link>
            <span className="meta"> 文字の役割</span>
          </li>
          <li>
            <Link href={categoryHref("icons")}>{categoryLabel("icons")}</Link>
            <span className="meta"> 技術アイコンと機能アイコン</span>
          </li>
          <li>
            <Link href={categoryHref("graphics")}>{categoryLabel("graphics")}</Link>
            <span className="meta"> ロゴと章扉</span>
          </li>
          <li>
            <Link href={categoryHref("components")}>{categoryLabel("components")}</Link>
            <span className="meta"> フォームの検証</span>
          </li>
        </ul>
      </section>
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading">最近の更新</h2>
        <ul className="record-list">
          {recent.map((experiment) => (
            <li key={experiment.slug}>
              <Link href={detailHref(experiment.category, experiment.slug)}>
                {experiment.title}
              </Link>
              <span className="meta">
                {" "}
                更新日 <time dateTime={experiment.updated}>{experiment.updated}</time>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}

function detailHref(category: string, slug: string): string {
  if (category === "colors") return categoryHref("colors");
  if (category === "typography") return categoryHref("typography");
  if (category === "icons") return `/foundations/icons/${slug}`;
  if (category === "graphics") return `/foundations/graphics/${slug}`;
  return `/components/${slug}`;
}
