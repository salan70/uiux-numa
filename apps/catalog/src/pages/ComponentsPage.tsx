import { LivePreview } from "../components/LivePreview";
import { catalog } from "../content/collect";

export function ComponentsPage() {
  const experiments = catalog.experiments.filter(
    (experiment) => experiment.category === "components",
  );

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Components</p>
        <h1>コンポーネント</h1>
        <p className="lede">Experiment ごとに live iframe を置き、variant と表示幅を切り替える。</p>
      </div>
      {experiments.map((experiment) => (
        <LivePreview
          key={experiment.slug}
          variants={experiment.liveVariants}
          title={experiment.slug}
        />
      ))}
    </>
  );
}
