/**
 * 判断を終えていない印。詳細ページの h1 の中に置き、読み上げでも題字と一緒に聞こえるようにする。
 * 方針の題字では末尾、display 寸法の題字では直前に置く（理由は catalog.css）。
 */
export function WipMark() {
  return <span className="wip-mark">WIP</span>;
}
