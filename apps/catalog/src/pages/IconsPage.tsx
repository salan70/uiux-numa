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
      </div>
      <ul className="record-list">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link href={`/foundations/icons/${experiment.slug}`}>{experiment.title}</Link>
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
