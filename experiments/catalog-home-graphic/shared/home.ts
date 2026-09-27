import { schemes } from "../../color-schemes-material/shared/palettes";

// Catalog のトップに載る内容を、案の比較に使う最小の形で写す。
// topic の題名と lead は apps/catalog/src/content/topics.ts、件数は各 Experiment の frontmatter から数えた 2026-09-27 の値である。
// Catalog へ組み込むときは collect.ts の実データに差し替える。
// href は runner の中の行き先である。runner には topic の画面が無いので、topic を代表する成果物の variant へ向ける。
// Tokens は Experiment を持たないので、この Experiment 自身へ向ける。

export type HomeTopic = {
  id: "colors" | "typography" | "tokens" | "components" | "icons" | "motion";
  label: string;
  lead: string;
  count: string;
  href: string;
};

export const HOME_TOPICS: HomeTopic[] = [
  {
    id: "colors",
    label: "Colors",
    lead: "役割ごとに決めた色の組。",
    count: "1 件",
    href: "#color-schemes-material/sumi",
  },
  {
    id: "typography",
    label: "Typography",
    lead: "書体と文字の役割。",
    count: "1 件",
    href: "#product-ui-typography/line-seed-minimal",
  },
  {
    id: "tokens",
    label: "Tokens",
    lead: "正本の値そのもの。",
    count: "56 token",
    href: "#catalog-home-graphic/kinetic-type",
  },
  {
    id: "components",
    label: "Components",
    lead: "画面を組む部品。",
    count: "2 件",
    href: "#button/pill-action",
  },
  {
    id: "icons",
    label: "Icons",
    lead: "画面で使う記号の組。",
    count: "5 件",
    href: "#catalog-ui-icons/round-soft",
  },
  {
    id: "motion",
    label: "Motion",
    lead: "画面と部品の動き。",
    count: "2 件",
    href: "#catalog-showreel/ink-ripple",
  },
];

/** 採用済み配色の primary。成果物そのものの色で、飾りの色ではない。 */
export const SCHEME_SWATCHES = schemes.map((scheme) => ({
  id: scheme.id,
  label: scheme.label,
  name: scheme.primary.name,
  primary: scheme.primary.hex,
  secondary: scheme.secondary.hex,
  tertiary: scheme.tertiary.hex,
}));

// 採用済みアイコンの配布用 SVG。判断待ちの hako-feature-icons は載せない（Catalog のトップの帯と同じ規則）。
const iconModules = import.meta.glob<string>(
  [
    "../../catalog-ui-icons/variants/round-soft/dist/*.svg",
    "../../class-tech-icons/variants/line-round/dist/*.svg",
    "../../cornix-ui-icons/variants/keycap-squircle/dist/*.svg",
    "../../catalog-theme-icons/variants/tomoe-classic/dist/*.svg",
  ],
  { query: "?raw", import: "default", eager: true },
);

export const ICON_SVGS: { name: string; svg: string }[] = Object.entries(iconModules)
  .map(([path, svg]) => ({
    name: path
      .split("/")
      .pop()!
      .replace(/\.svg$/, ""),
    svg,
  }))
  .sort((a, b) => a.name.localeCompare(b.name));
