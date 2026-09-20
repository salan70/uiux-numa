import type { ExperimentRecord } from "../content/collect";

/** variant を切り替える帯。トピックの画面の中で完結させる。 */
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
    <ul className="variants variants--row">
      {work.variantIds.map((id) => (
        <li key={id}>
          <button
            type="button"
            className="variants__item"
            aria-pressed={id === current}
            onClick={() => onSelect(id)}
          >
            <span className="variants__id">{id}</span>
            {work.adopted.includes(id) && <span className="variants__mark">採用</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}
