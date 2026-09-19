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
        <p className="lede">ロゴと章扉イラストの SVG を variant ごとに見る。</p>
      </div>
      <SvgGrid groups={groups} />
    </>
  );
}
