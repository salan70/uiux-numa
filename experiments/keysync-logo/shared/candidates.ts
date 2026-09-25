// 一覧面に並べる候補。第 3 世代は pop-tilt と pop-confetti を合わせた基準と、K と S を読ませる 3 案を置く。
import type { Candidate } from "./Overview";

const files = import.meta.glob<string>("../variants/*/dist/mark.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const svgOf = (id: string) => files[`../variants/${id}/dist/mark.svg`] ?? "";

const list: Omit<Candidate, "svg">[] = [
  { id: "pop-tilt", family: "第 2 世代から残した案", note: "浮いたキーを -15° 傾ける" },
  { id: "pop-confetti", family: "第 2 世代から残した案", note: "盤面のキーを 3 色と墨に散らす" },
  { id: "tilt-confetti", family: "基準", note: "pop-tilt の姿勢と pop-confetti の色を合わせる" },
  {
    id: "ks-home",
    family: "K と S",
    note: "ホーム段の S と K の位置だけ色を変える（多色版だけで差が出る）",
  },
  { id: "k-grid", family: "K と S", note: "3×3 の 6 個で K を組み、上の腕が浮く" },
  { id: "k-legend", family: "K と S", note: "浮いたキーを大きくして K を刻む" },
];

export const candidates: Candidate[] = list.map((c) => ({ ...c, svg: svgOf(c.id) }));
