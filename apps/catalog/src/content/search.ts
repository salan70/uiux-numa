import MiniSearch from "minisearch";
import { categoryHref } from "./category";
import { catalog, type CatalogData, type ExperimentRecord } from "./collect";

export type SearchDoc = {
  id: string;
  title: string;
  path: string;
  keywords: string;
};

export function collectSearchDocs(data: CatalogData): SearchDoc[] {
  const docs: SearchDoc[] = [
    { id: "page:home", title: "トップ", path: "/", keywords: "UI/UX 沼" },
    {
      id: "page:getting-started",
      title: "はじめに",
      path: "/getting-started",
      keywords: "目的 構成 使い方",
    },
    { id: "page:principles", title: "原則", path: "/principles", keywords: "docs/principles" },
    { id: "page:colors", title: "配色", path: "/foundations/colors", keywords: "Colors 配色" },
    {
      id: "page:typography",
      title: "文字",
      path: "/foundations/typography",
      keywords: "Typography token 文字",
    },
    { id: "page:icons", title: "アイコン", path: "/foundations/icons", keywords: "Icons SVG" },
    {
      id: "page:graphics",
      title: "図",
      path: "/foundations/graphics",
      keywords: "Graphics ロゴ イラスト",
    },
    {
      id: "page:components",
      title: "部品",
      path: "/components",
      keywords: "Components コンポーネント",
    },
    { id: "page:status", title: "ステータス", path: "/status", keywords: "採用 却下 検討中" },
    { id: "page:resources", title: "リソース", path: "/resources", keywords: "GitHub ライセンス" },
  ];

  for (const token of data.tokens) {
    const path = token.name.startsWith("space.") ? "/resources" : "/foundations/typography";
    docs.push({
      id: `token:${token.name}`,
      title: token.name,
      path,
      keywords: `${token.description} ${token.cssNames.join(" ")}`,
    });
  }

  for (const scheme of data.schemes) {
    const names = [...scheme.light, ...scheme.dark].map((color) => color.name).join(" ");
    docs.push({
      id: `scheme:${scheme.id}`,
      title: scheme.label,
      path: `/foundations/colors/${scheme.id}`,
      keywords: `${scheme.id} ${names}`,
    });
  }

  for (const experiment of data.experiments) {
    docs.push({
      id: `experiment:${experiment.slug}`,
      title: experiment.title,
      path: experimentPath(experiment),
      keywords: experiment.variantIds.join(" "),
    });
    for (const variant of experiment.variantIds) {
      docs.push({
        id: `variant:${experiment.slug}/${variant}`,
        title: variant,
        path: experimentPath(experiment),
        keywords: `${experiment.title} ${experiment.slug}`,
      });
    }
  }

  for (const principle of data.principles) {
    const headings = [...principle.body.matchAll(/^##\s+(.+)$/gm)].map((match) => match[1]);
    docs.push({
      id: `principle:${principle.slug}`,
      title: principle.title,
      path: `/principles/${principle.slug}`,
      keywords: headings.join(" "),
    });
  }

  return docs;
}

export function createSearchIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: ["title", "keywords"],
    storeFields: ["title", "path"],
    searchOptions: { prefix: true, fuzzy: 0.2 },
  });
  index.addAll(docs);
  return index;
}

function experimentPath(experiment: ExperimentRecord): string {
  if (experiment.category === "colors") return categoryHref("colors");
  if (experiment.category === "typography") return categoryHref("typography");
  if (experiment.category === "icons") return `/foundations/icons/${experiment.slug}`;
  if (experiment.category === "graphics") return `/foundations/graphics/${experiment.slug}`;
  return `/components/${experiment.slug}`;
}

export const searchDocs = collectSearchDocs(catalog);
export const searchIndex = createSearchIndex(searchDocs);
