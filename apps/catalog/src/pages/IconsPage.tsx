import { Link } from "../components/Link";
import { SvgGrid } from "../components/SvgGrid";
import { catalog } from "../content/collect";
import { NotFoundPage } from "./NotFoundPage";

export function IconsPage() {
  const experiments = catalog.experiments.filter((item) => item.category === "icons");
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Foundations</p>
        <h1>Icons</h1>
        <p className="lede">アイコンの Experiment ごとに SVG を比較する。</p>
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
  const groups = catalog.svgs.filter((group) => group.experiment === slug);
  return (
    <>
      <div className="page-intro">
        <p className="crumb">
          <Link href="/foundations/icons">Icons</Link>
        </p>
        <h1>{experiment.title}</h1>
        <p className="meta">
          更新日 <time dateTime={experiment.updated}>{experiment.updated}</time>
        </p>
      </div>
      <SvgGrid groups={groups} />
    </>
  );
}
