export type Role = "foundation" | "module" | "reference";
export type Maturity = "experimental" | "candidate" | "stable" | "deprecated";
export type Screen = "home" | "list" | "detail";

export type Specimen = {
  id: string;
  title: string;
  kind: string;
  role: Role;
  maturity: Maturity;
  platforms: string[];
  source: string;
  summary: string;
};

export const SPECIMENS: readonly Specimen[] = [
  {
    id: "typography",
    title: "日本語 UI の Typography",
    kind: "文字",
    role: "foundation",
    maturity: "candidate",
    platforms: ["web"],
    source: "product-ui-typography",
    summary: "本文 16px を基準にした 6 役割。複数プロダクトの土台候補。",
  },
  {
    id: "validation",
    title: "送信時の inline validation",
    kind: "部品",
    role: "module",
    maturity: "candidate",
    platforms: ["web"],
    source: "form-inline-validation",
    summary: "送信後に要約と対処法を出す。用途が合うときだけ選ぶ。",
  },
  {
    id: "logo",
    title: "授業資料のシンボル",
    kind: "図",
    role: "reference",
    maturity: "experimental",
    platforms: ["web"],
    source: "class-doc-logo",
    summary: "特定サイトのマーク探索。コピーせず構図の比較に使う。",
  },
];

export function specimenById(id: string): Specimen | undefined {
  return SPECIMENS.find((item) => item.id === id);
}
