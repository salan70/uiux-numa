// 一覧面に並べる候補。第 2 世代は board-pop を基準に、1 軸ずつ変えた派生を置く。
import type { Candidate } from "./Overview";

const files = import.meta.glob<string>("../variants/*/dist/mark.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const svgOf = (id: string) => files[`../variants/${id}/dist/mark.svg`] ?? "";

const list: Omit<Candidate, "svg">[] = [
  { id: "board-pop", family: "基準", note: "第 1 世代の案を偶数格子と live area に収めた版" },
  { id: "pop-tilt", family: "浮いたキー", note: "姿勢: -15° 傾けて跳ねた途中に" },
  { id: "pop-motion", family: "浮いたキー", note: "動き: 左右に短い線を添える" },
  { id: "pop-ghost", family: "元の位置", note: "空いた位置に細い輪郭を残す" },
  { id: "pop-bold", family: "盤面", note: "粒度: 大きいキー 2 個とスペースバー" },
  { id: "pop-stagger", family: "盤面", note: "段のずれ: 2 段目を右へ 2 ずらす" },
  { id: "pop-dots", family: "盤面", note: "キーの形: 丸い粒" },
  { id: "pop-confetti", family: "色", note: "盤面のキーを 3 色と墨に散らす" },
];

export const candidates: Candidate[] = list.map((c) => ({ ...c, svg: svgOf(c.id) }));
