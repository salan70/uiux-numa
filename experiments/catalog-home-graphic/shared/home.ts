import { schemes } from "../../color-schemes-material/shared/palettes";

// runner で dot-field を描くための topic。題名は apps/catalog/src/content/topics.ts から写した。
// Catalog のトップは topics.ts の TOPICS を直接渡す。
// href は runner の中の行き先である。runner には topic の画面が無いので、topic を代表する成果物の variant へ向ける。
// Tokens は Experiment を持たないので、この Experiment 自身へ向ける。

export type TopicId = "colors" | "typography" | "tokens" | "components" | "icons" | "motion";

export type HomeTopic = { id: TopicId; label: string; href: string };

export const HOME_TOPICS: HomeTopic[] = [
  { id: "colors", label: "Colors", href: "#color-schemes-material/sumi" },
  { id: "typography", label: "Typography", href: "#product-ui-typography/line-seed-minimal" },
  { id: "tokens", label: "Tokens", href: "#catalog-home-graphic/dot-field" },
  { id: "components", label: "Components", href: "#button/pill-action" },
  { id: "icons", label: "Icons", href: "#class-tech-icons/line-round" },
  { id: "motion", label: "Motion", href: "#catalog-screen-entrance/blur-focus" },
];

/** 採用済み配色の primary。Colors の tile の点の色で、成果物そのものの色である。 */
export const SCHEME_PRIMARIES: string[] = schemes.map((scheme) => scheme.primary.hex);

// Icons の tile に描く、採用済みアイコンの配布用 SVG。
const iconModules = import.meta.glob<string>(
  "../../class-tech-icons/variants/line-round/dist/*.svg",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export const ICON_SVGS: { name: string; svg: string }[] = Object.entries(iconModules).map(
  ([path, svg]) => ({
    name: path
      .split("/")
      .pop()!
      .replace(/\.svg$/, ""),
    svg,
  }),
);
