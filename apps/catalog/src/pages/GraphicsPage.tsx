import { SvgGrid } from "../components/SvgGrid";
import { catalog } from "../content/collect";

export function GraphicsPage() {
  const experiments = new Set(
    catalog.experiments
      .filter((experiment) => experiment.category === "graphics")
      .map((experiment) => experiment.slug),
  );
  const groups = catalog.svgs.filter((group) => experiments.has(group.experiment));

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Graphics</p>
        <h1>グラフィック</h1>
        <p className="lede">ロゴや章扉イラストの SVG をバリアントごとに並べて比較する。</p>
      </div>
      <SvgGrid groups={groups} />
    </>
  );
}
