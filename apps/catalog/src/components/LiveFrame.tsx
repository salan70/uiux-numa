import type { ExperimentRecord } from "../content/collect";
import { defaultVariant, previewPathFor } from "./work";

type Props = {
  work: ExperimentRecord;
  variant?: string;
  tall?: boolean;
};

/** live 標本。variant は preview の第 2 エントリで隔離して描く。 */
export function LiveFrame({ work, variant, tall }: Props) {
  const id = variant ?? defaultVariant(work);
  const src = previewPathFor(work, id);
  if (!src) return <p className="empty">この variant は描けない。</p>;
  const className = ["live", tall && "live--tall", work.slug === "button" && "live--button"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={className}>
      <iframe className="live__frame" src={src} title={`${work.title} の ${id}`} loading="lazy" />
      {/* 日付は出さない。利用者が 2026-09-25 に、詳細ページからも外すことを求めた。 */}
      <p className="live__caption">
        <span className="live__id">{id}</span>
      </p>
    </div>
  );
}
