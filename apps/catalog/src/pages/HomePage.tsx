import { Link } from "../components/Link";
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
        <p className="lede">
          AI エージェントで UI/UX
          とプロダクト体験を反復的に探索する。成果を個人開発へ再利用できる形に育てる。
        </p>
        <p>Catalog は採用した成果物を正として示す。却下案は比較資料として残す。</p>
      </div>
      <section aria-labelledby="principles-heading">
        <h2 id="principles-heading">原則</h2>
        <p>原則候補は Experiment から抽出し、採否は人間が決める。</p>
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
        <h2 id="foundations-heading">Foundations と Components</h2>
        <ul className="home-cards">
          <li>
            <Link href={categoryHref("colors")}>{categoryLabel("colors")}</Link>
            <p>採用した配色と Role。</p>
          </li>
          <li>
            <Link href={categoryHref("typography")}>{categoryLabel("typography")}</Link>
            <p>semantic と primitive の token 表。</p>
          </li>
          <li>
            <Link href={categoryHref("icons")}>{categoryLabel("icons")}</Link>
            <p>技術アイコンと機能アイコン。</p>
          </li>
          <li>
            <Link href={categoryHref("graphics")}>{categoryLabel("graphics")}</Link>
            <p>ロゴと章扉イラスト。</p>
          </li>
          <li>
            <Link href={categoryHref("components")}>{categoryLabel("components")}</Link>
            <p>フォームの inline validation。</p>
          </li>
        </ul>
      </section>
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading">最近更新した成果物</h2>
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
