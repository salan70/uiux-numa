// Catalog の Icons と Motion に載る成果物を、組み方の比較に使う最小の形で写す。
// 題名と variant は各 README から写す。
// 並びは Catalog の worksInTopic と同じ「更新日の新しい順、同日は slug 順」にする。
// 日付は画面に出さない。利用者が 2026-09-24 に、日付の情報は一切いらないと判断した。

export type IconWork = {
  slug: string;
  title: string;
  /** 採用した variant。未判断なら空にし、切替には variants の全件を出す。 */
  adopted: string[];
  variants: string[];
};

export type MotionPattern = {
  id: string;
  hypothesis: string;
  axis: string;
};

export type MotionWork = {
  slug: string;
  title: string;
  patterns: MotionPattern[];
  /** Catalog 自身の見出しで使っている型。 */
  usedInCatalog: string;
};

export const ICON_WORKS: IconWork[] = [
  {
    slug: "cornix-ui-icons",
    title: "Cornix Bonsai の機能アイコン",
    adopted: ["keycap-squircle", "keycap-dish-fill"],
    variants: ["keycap-dish-fill", "keycap-squircle"],
  },
  {
    slug: "catalog-theme-icons",
    title: "Catalog の配色 / 明暗アイコン",
    adopted: ["tomoe-classic"],
    variants: ["tomoe-classic"],
  },
  {
    slug: "catalog-ui-icons",
    title: "Catalog の UI アイコン",
    adopted: ["round-soft"],
    variants: ["round-soft"],
  },
  {
    slug: "class-tech-icons",
    title: "授業資料で使う技術アイコン",
    adopted: ["line-round"],
    variants: ["line-round"],
  },
  {
    slug: "hako-feature-icons",
    title: "Hako の機能アイコン",
    adopted: [],
    variants: [
      "current-feather",
      "no-skill",
      "with-skill",
      "crisp-square",
      "soft-solid",
      "hako-frame",
      "principle-applied",
    ],
  },
];

export const MOTION_WORKS: MotionWork[] = [
  {
    slug: "catalog-screen-entrance",
    title: "Catalog の画面表示の動き",
    usedInCatalog: "blur-focus",
    patterns: [
      {
        id: "line-mask",
        hypothesis: "行を窓にして下からせり上げると、編集誌のように締まって見える",
        axis: "行ごとに窓からせり上がる。800ms、行の間隔 100ms",
      },
      {
        id: "blur-focus",
        hypothesis: "語ごとにぼかしから焦点を合わせると、柔らかく上質に見える",
        axis: "語ごとにぼかしから焦点が合う。900ms、語の間隔 80ms",
      },
      {
        id: "char-stagger",
        hypothesis: "1 文字ずつ波のように立ち上げると、最も動きが分かり、華やかに見える",
        axis: "1 文字ずつ波で立ち上がる。600ms、文字の間隔 30ms",
      },
    ],
  },
];

const svgFiles = import.meta.glob<string>("../../*/variants/*/dist/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

export type SvgAsset = { name: string; source: string };

/** variant が持つ配布用の SVG。Catalog の svgsFor と同じく、ファイル名の順に並べる。 */
export function svgsFor(slug: string, variant: string): SvgAsset[] {
  const prefix = `../../${slug}/variants/${variant}/dist/`;
  return Object.entries(svgFiles)
    .filter(([path]) => path.startsWith(prefix))
    .map(([path, source]) => ({ name: path.slice(prefix.length, -".svg".length), source }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** 既定で見せる variant。採用があればその先頭、無ければ最初の 1 つ（Catalog の defaultVariant と同じ）。 */
export function defaultVariant(work: IconWork): string {
  return work.adopted[0] ?? work.variants[0];
}

/** 詳細の行き先。runner の中では、その成果物の variant を単体で開く。 */
export function detailHref(slug: string, variant: string): string {
  return `#${slug}/${variant}`;
}
