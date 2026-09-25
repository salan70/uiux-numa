import type { ExperimentRecord } from "../content/collect";

/**
 * variant を切り替える丸い切替。トピックの画面の中で完結させる。
 * 輪郭は Button の secondary と同じ丸にし、選択は文字色の塗りで示す（catalog-works-layout の quiet-sections）。
 */
export function VariantChips({
  work,
  current,
  onSelect,
}: {
  work: ExperimentRecord;
  current: string;
  onSelect: (id: string) => void;
}) {
  if (work.variantIds.length < 2) return null;
  return (
    <ul className="pills" aria-label={`${work.title} の variant`}>
      {work.variantIds.map((id) => (
        <li key={id}>
          <button
            type="button"
            className="pill"
            aria-pressed={id === current}
            onClick={() => onSelect(id)}
          >
            {id}
            {work.adopted.includes(id) && <span className="pill__mark">採用</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
