import { cornix, type PickerCell } from "../../shared/fixture";
import { isHoldModifier, splitTapHold, type PickTarget } from "../../shared/model";

type Props = {
  /** 編集対象が無いと picker 全体を無効にする。 */
  enabled: boolean;
  isMac: boolean;
  pickTarget: PickTarget;
  current?: string;
  names: Record<string, string>;
  onPick: (keycode: string) => void;
};

/** 選ばれた keycode を生のまま返す。適用先での組み立ては呼び出し側が行う（本体の KeycodePicker と同じ責務）。 */
export function Picker({ enabled, isMac, pickTarget, current, names, onPick }: Props) {
  const { rows, extraRow, groupOffsets, totalUnits } = cornix.picker;
  const active = current
    ? pickTarget === "hold"
      ? splitTapHold(current).hold
      : splitTapHold(current).tap
    : undefined;
  const pct = (u: number) => `${(u / totalUnits) * 100}%`;

  const cell = (c: PickerCell, left: number, key: string) => {
    if (c.kind !== "key") return null;
    const holdBlocked = pickTarget === "hold" && !isHoldModifier(c.keycode);
    const macBlocked = isMac && !c.macSupported;
    const disabled = !enabled || holdBlocked || macBlocked;
    const label = names[c.keycode] ?? c.label.primary;
    const reason = macBlocked
      ? "Karabiner で表現できない"
      : holdBlocked
        ? "Hold に選べるのは modifier だけ"
        : "";
    return (
      <button
        key={key}
        type="button"
        className={`bd-pk is-${c.class}${active === c.keycode ? " is-current" : ""}`}
        style={{ left: pct(left), width: `calc(${pct(c.u)} - 3px)` }}
        disabled={disabled}
        title={reason ? `${c.keycode}（${reason}）` : c.keycode}
        aria-label={`${label}（${c.keycode}）${reason ? `、${reason}` : ""}`}
        onClick={() => onPick(c.keycode)}
      >
        {label}
        {c.label.role ? <small>{c.label.role}</small> : null}
      </button>
    );
  };

  const group = (cells: PickerCell[], offset: number, prefix: string) => {
    let u = offset;
    return cells.map((c, i) => {
      const node = cell(c, u, `${prefix}-${i}`);
      u += c.u;
      return node;
    });
  };

  return (
    <div className="bd-picker" aria-disabled={!enabled}>
      {rows.map((row, r) => (
        <div className="bd-pk-row" key={r}>
          {group(row.main, groupOffsets.main, `m${r}`)}
          {group(row.nav, groupOffsets.nav, `n${r}`)}
          {group(row.numpad, groupOffsets.numpad, `p${r}`)}
        </div>
      ))}
      <div className="bd-pk-row is-extra">{group(extraRow, 0, "x")}</div>
    </div>
  );
}
