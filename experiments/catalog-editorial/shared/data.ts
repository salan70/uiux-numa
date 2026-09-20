// 4 案が共有する実データの読み取り。
// 正本は experiments/ 配下のファイルで、ここは写しを持たない。
// experiments から apps/ へ import しない（experiments/soft-component-kit/shared/useCatalogColors.ts と同じ慣習）。
// frontmatter と参照先の不整合検査は apps/catalog/src/content/collect.ts の責務であり、ここでは行わない。

export type Role = "foundation" | "module" | "reference";
export type Maturity = "experimental" | "candidate" | "stable" | "deprecated";

export type Work = {
  slug: string;
  title: string;
  status: string;
  role: Role;
  maturity: Maturity;
  created: string;
  updated: string;
  platforms: string[];
  domains: string[];
  adopted: string[];
  variantIds: string[];
  /** README の Problem 節の先頭文。見出し下のリードに使う。 */
  lead: string;
  kind: Kind;
  /** 代表 variant（adopted があればその先頭）の実行基盤 URL。 */
  previewPath: string;
  repoPath: string;
};

export type Kind = "色" | "文字" | "記号" | "図" | "部品" | "動き";

// 正本は apps/catalog/src/content/category.ts の CATEGORY_RULES。
// Catalog の IA を作り直す Experiment なので、種別の呼び名は案ごとに変えてよい。
// ここでは domain から 1 つの種別を決める規則だけを写す。
const KIND_RULES: ReadonlyArray<{ domain: string; kind: Kind }> = [
  { domain: "color", kind: "色" },
  { domain: "typography", kind: "文字" },
  { domain: "iconography", kind: "記号" },
  { domain: "logo-brand-identity", kind: "図" },
  { domain: "illustration-svg", kind: "図" },
  { domain: "animation-motion", kind: "動き" },
  { domain: "forms-input-ux", kind: "部品" },
];

export const KIND_ORDER: readonly Kind[] = ["色", "文字", "記号", "図", "部品", "動き"];

/** この Experiment 自身は掲載対象にしない。catalog-redesign も Catalog 側で非掲載にしている。 */
const HIDDEN_SLUGS = new Set(["catalog-editorial", "catalog-redesign"]);

const readmeFiles = import.meta.glob<string>("../../*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const variantModules = import.meta.glob("../../*/variants/*/index.tsx");

const svgFiles = import.meta.glob<string>("../../*/variants/*/dist/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const works: Work[] = collectWorks();

export function workBySlug(slug: string): Work | undefined {
  return works.find((item) => item.slug === slug);
}

export function worksByKind(kind: Kind): Work[] {
  return works.filter((item) => item.kind === kind);
}

/** 更新日の新しい順。号や年表の並びに使う。 */
export function worksByUpdated(): Work[] {
  return [...works].sort(
    (a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug),
  );
}

export type SvgAsset = {
  experiment: string;
  variant: string;
  name: string;
  source: string;
};

export const svgAssets: SvgAsset[] = Object.entries(svgFiles)
  .flatMap(([key, source]) => {
    const match = key.match(/\/([^/]+)\/variants\/([^/]+)\/dist\/([^/]+)\.svg$/);
    if (!match) return [];
    return [{ experiment: match[1], variant: match[2], name: match[3], source }];
  })
  .sort((a, b) =>
    `${a.experiment}/${a.variant}/${a.name}`.localeCompare(
      `${b.experiment}/${b.variant}/${b.name}`,
    ),
  );

export function svgsFor(experiment: string, variant: string): SvgAsset[] {
  return svgAssets.filter((item) => item.experiment === experiment && item.variant === variant);
}

/** 実行基盤で variant を描く URL。iframe の src と、標本へのリンクに使う。 */
export function runnerPath(experiment: string, variant: string): string {
  return `/?bare#${experiment}/${variant}`;
}

function collectWorks(): Work[] {
  const variantsByExperiment = new Map<string, string[]>();
  for (const key of Object.keys(variantModules)) {
    const match = key.match(/\/([^/]+)\/variants\/([^/]+)\/index\.tsx$/);
    if (!match) continue;
    const list = variantsByExperiment.get(match[1]) ?? [];
    list.push(match[2]);
    variantsByExperiment.set(match[1], list);
  }

  const records: Work[] = [];
  for (const [key, source] of Object.entries(readmeFiles)) {
    const match = key.match(/\/([^/]+)\/README\.md$/);
    if (!match) continue;
    const slug = match[1];
    if (HIDDEN_SLUGS.has(slug)) continue;

    const front = parseFrontmatter(source);
    const variantIds = (variantsByExperiment.get(slug) ?? []).sort();
    const adopted = list(front["adopted"]);
    const preview = adopted[0] ?? variantIds[0];
    if (!preview) continue;

    records.push({
      slug,
      title: text(front["title"]),
      status: text(front["status"]),
      role: text(front["role"]) as Role,
      maturity: text(front["maturity"]) as Maturity,
      created: text(front["created"]),
      updated: text(front["updated"]),
      platforms: list(front["platforms"]),
      domains: list(front["domains"]),
      adopted,
      variantIds,
      lead: leadSentence(source),
      kind: kindFor(list(front["domains"])),
      previewPath: runnerPath(slug, preview),
      repoPath: `experiments/${slug}`,
    });
  }
  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function kindFor(domains: string[]): Kind {
  for (const domain of domains) {
    const rule = KIND_RULES.find((item) => item.domain === domain);
    if (rule) return rule.kind;
  }
  return "部品";
}

/**
 * README の Problem 節の先頭文。
 * 1 文 1 行で書く規範（CLAUDE.md）があるため、最初の非空行をそのまま使う。
 */
function leadSentence(source: string): string {
  const start = source.indexOf("## Problem");
  if (start === -1) return "";
  const end = source.indexOf("\n## ", start + 1);
  const section = source.slice(start + "## Problem".length, end === -1 ? source.length : end);
  const line = section.split(/\r?\n/).find((item) => item.trim() !== "");
  return line?.trim() ?? "";
}

export type FrontmatterValue = string | string[];

export function parseFrontmatter(source: string): Record<string, FrontmatterValue> {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return {};
  const data: Record<string, FrontmatterValue> = {};
  let currentList: string[] | null = null;

  for (const line of match[1].split(/\r?\n/)) {
    if (line.trim() === "") continue;
    const item = line.match(/^\s+-\s+(.*)$/);
    if (item) {
      currentList?.push(unquote(item[1].trim()));
      continue;
    }
    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) continue;
    const rest = pair[2].trim();
    if (rest === "" || rest === "[]") {
      currentList = [];
      data[pair[1]] = currentList;
      continue;
    }
    currentList = null;
    data[pair[1]] = unquote(rest);
  }
  return data;
}

function unquote(raw: string): string {
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function text(value: FrontmatterValue | undefined): string {
  return typeof value === "string" ? value : "";
}

function list(value: FrontmatterValue | undefined): string[] {
  return Array.isArray(value) ? value : [];
}
