import { SvgGrid } from "../components/SvgGrid";
import { catalog } from "../content/collect";

export function IconsPage() {
  const experiments = new Set(
    catalog.experiments
      .filter((experiment) => experiment.category === "icons")
      .map((experiment) => experiment.slug),
  );
  const groups = catalog.svgs.filter((group) => experiments.has(group.experiment));

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Icons</p>
        <h1>アイコン</h1>
        <p className="lede">アイコンセットごとに、全バリアントの SVG を並べて比較する。</p>
      </div>
      <SvgGrid groups={groups} />
    </>
  );
}
