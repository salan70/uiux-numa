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
        <p className="lede">
          コンポーネントの各バリアントを、表示幅を切り替えながら実画面で確認する。
        </p>
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
