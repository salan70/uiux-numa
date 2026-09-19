import { ExperimentPage } from "../components/ExperimentPage";
import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import { NotFoundPage } from "./NotFoundPage";

export function IconsPage() {
  const experiments = catalog.experiments.filter((item) => item.category === "icons");
  return (
    <>
      <div className="page-intro">
        <h1>アイコン</h1>
        <p className="lede">アイコンの案を、用途の大きさで見比べる。</p>
      </div>
      <ul className="record-list">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link href={`/foundations/icons/${experiment.slug}`}>{experiment.title}</Link>
            <span className="meta">
              {" "}
              更新日 <time dateTime={experiment.updated}>{experiment.updated}</time>
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function IconDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "icons" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="svg" />;
}
