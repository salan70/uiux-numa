import { Link } from "../components/Link";
import { catalog } from "../content/collect";

export function StatusPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">情報</p>
        <h1>ステータス</h1>
        <p className="lede">成果物の採否と更新日を一覧する。</p>
      </div>
      <ul className="record-list">
        {catalog.experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link href={detailHref(experiment.category, experiment.slug)}>{experiment.title}</Link>
            <span className="meta">
              {" "}
              {experiment.status} / 更新日{" "}
              <time dateTime={experiment.updated}>{experiment.updated}</time>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

function detailHref(category: string, slug: string): string {
  if (category === "colors") return `/foundations/colors`;
  if (category === "typography") return `/foundations/typography`;
  if (category === "icons") return `/foundations/icons/${slug}`;
  if (category === "graphics") return `/foundations/graphics/${slug}`;
  return `/components/${slug}`;
}
