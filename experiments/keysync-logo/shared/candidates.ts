// 第 1 世代の候補。系統と一言の説明を持つ。一覧面が読む。
import type { Candidate } from "./Overview";

const files = import.meta.glob<string>("../variants/*/dist/mark.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const svgOf = (id: string) => files[`../variants/${id}/dist/mark.svg`] ?? "";

const list: Omit<Candidate, "svg">[] = [
  { id: "caps-pair", family: "キーキャップが揃う", note: "幅の違う 2 個に同じ刻印" },
  { id: "caps-grid", family: "キーキャップが揃う", note: "3 個が揃い、1 個が輪郭で残る" },
  { id: "caps-stack", family: "キーキャップが揃う", note: "奥の輪郭に手前の面を重ねる" },
  { id: "k-cap", family: "文字 K を核にする", note: "キーキャップの天面に K を抜く" },
  { id: "k-sync", family: "文字 K を核にする", note: "K の斜画を出る矢印と入る矢印に" },
  { id: "k-keys", family: "文字 K を核にする", note: "縦長のキーと傾けた 2 個のキーで K" },
  { id: "ring-cap", family: "同期の矢印や円環", note: "中央のキーを 2 本の円弧が巡る" },
  { id: "swap-caps", family: "同期の矢印や円環", note: "対角の 2 個を往復の矢印で結ぶ" },
  { id: "board-pop", family: "盤面の抽象化", note: "1 個のキーが浮き、元の位置が空く" },
  { id: "board-link", family: "盤面の抽象化", note: "2 台の段を 1 本の縦長キーが貫く" },
];

export const candidates: Candidate[] = list.map((c) => ({ ...c, svg: svgOf(c.id) }));
