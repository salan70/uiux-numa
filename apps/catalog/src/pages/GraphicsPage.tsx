import { ExperimentPage } from "../components/ExperimentPage";
import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import { NotFoundPage } from "./NotFoundPage";

export function GraphicsPage() {
  const experiments = catalog.experiments.filter((item) => item.category === "graphics");
  return (
    <>
      <div className="page-intro">
        <h1>図</h1>
        <p className="lede">ロゴと章扉の案を見比べる。</p>
      </div>
      <ul className="record-list">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link href={`/foundations/graphics/${experiment.slug}`}>{experiment.title}</Link>
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

export function GraphicDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "graphics" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="svg" />;
}
