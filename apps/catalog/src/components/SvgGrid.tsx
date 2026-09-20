import { svgsFor } from "../content/collect";

/** 配布用の SVG をそのまま並べる。大きさの切替は置かず、格子の中で実寸に近い形で見せる。 */
export function SvgGrid({ experiment, variant }: { experiment: string; variant: string }) {
  const assets = svgsFor(experiment, variant);
  if (assets.length === 0) return <p className="empty">この variant に配布用の SVG がない。</p>;
  return (
    <ul className="svg-grid">
      {assets.map((asset) => (
        <li className="svg-cell" key={asset.name}>
          <span className="svg-cell__art" dangerouslySetInnerHTML={{ __html: asset.source }} />
          <span className="svg-cell__name">{asset.name}</span>
        </li>
      ))}
    </ul>
  );
}
