import { ExperimentPage } from "../components/ExperimentPage";
import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import { NotFoundPage } from "./NotFoundPage";

export function ComponentsPage() {
  const experiments = catalog.experiments.filter((item) => item.category === "components");
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Components</p>
        <h1>コンポーネント</h1>
        <p className="lede">コンポーネントの Experiment ごとに live デモを確認する。</p>
      </div>
      <ul className="record-list">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <Link href={`/components/${experiment.slug}`}>{experiment.title}</Link>
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

export function ComponentDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "components" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="live" />;
}
