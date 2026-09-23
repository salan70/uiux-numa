import { topicForExperiment, type TopicId } from "./topics";
import {
  parseExperimentFrontmatter,
  parseTokenAssetMeta,
  type AssetMeta,
  type ExperimentFrontmatter,
  type ExperimentStatus,
} from "./parseFrontmatter";
import { collectSchemes, schemeFiles, type ColorScheme } from "./schemes";
import { collectSvgs, svgFiles, type SvgVariant } from "./svgs";
import { collectTokens, type CatalogToken } from "./tokens";

const experimentReadmes = import.meta.glob<string>("../../../../experiments/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const tokenFiles = import.meta.glob<unknown>("../../../../tokens/**/*.tokens.json", {
  import: "default",
  eager: true,
});

const variantModules = import.meta.glob("../../../../experiments/*/variants/*/index.tsx");

export type LiveVariant = {
  experiment: string;
  variant: string;
  previewPath: string;
};

export type VariantStatus = "adopted" | "rejected" | "exploring";

/**
 * 判断を終えていない status。docs/experiment-format.md の status 表の手順 1〜4 に当たる。
 * abandoned は進行中ではないので含めない。
 */
const IN_PROGRESS_STATUSES: ExperimentStatus[] = ["draft", "implementing", "evaluating"];

export function isInProgress(status: ExperimentStatus): boolean {
  return IN_PROGRESS_STATUSES.includes(status);
}

export type ExperimentVariant = {
  id: string;
  status: VariantStatus;
  /** README の Variants 表の「仮説」列。表に行が無い variant は空にする。 */
  hypothesis: string;
  /** README の Variants 表の「変えた軸」列。 */
  axis: string;
};

export type ExperimentRecord = {
  slug: string;
  title: string;
  status: ExperimentStatus;
  role: AssetMeta["role"];
  maturity: AssetMeta["maturity"];
  created: string;
  updated: string;
  adopted: string[];
  domains: string[];
  sources: string[];
  platforms: string[];
  topic: TopicId | null;
  /** README の Problem 節の先頭文。見出し下のリードに使う。 */
  lead: string;
  repoPath: string;
  variantIds: string[];
  variants: ExperimentVariant[];
  liveVariants: LiveVariant[];
};

export type TokenAsset = AssetMeta & {
  sourcePath: string;
};

/** token の正本ファイル 1 つ分。画面はこの単位で表にする。 */
export type TokenFamily = {
  id: string;
  label: string;
  sourcePath: string;
  /** $extensions を持たない正本もあるので null を許す。 */
  role: AssetMeta["role"] | null;
  maturity: AssetMeta["maturity"] | null;
  tokens: CatalogToken[];
};

export type CatalogData = {
  tokens: CatalogToken[];
  tokenAssets: TokenAsset[];
  tokenFamilies: TokenFamily[];
  schemes: ColorScheme[];
  experiments: ExperimentRecord[];
  svgs: SvgVariant[];
  liveVariants: LiveVariant[];
};

const FAMILY_LABELS: Record<string, string> = {
  typography: "文字",
  space: "余白",
  radius: "角丸",
  border: "線",
  size: "寸法",
  motion: "動き",
};

function loadCatalog(): CatalogData {
  const liveVariants = collectLiveVariants();
  const tokens = Object.entries(tokenFiles).flatMap(
    ([key, json]) => collectTokens(json, toTokenRepoPath(key)).tokens,
  );
  const tokenAssets = Object.entries(tokenFiles).flatMap(([key, json]) => {
    const sourcePath = toTokenRepoPath(key);
    const meta = readTokenAssetMeta(json, sourcePath);
    return meta ? [{ sourcePath, ...meta }] : [];
  });
  const experiments = collectExperiments(liveVariants);
  const schemes = collectSchemes(schemeFiles);
  const svgs = collectSvgs(svgFiles);

  const tokenFamilies = collectTokenFamilies(tokens, tokenAssets);

  return { tokens, tokenAssets, tokenFamilies, schemes, experiments, svgs, liveVariants };
}

function collectTokenFamilies(tokens: CatalogToken[], assets: TokenAsset[]): TokenFamily[] {
  const families = new Map<string, TokenFamily>();
  for (const token of tokens) {
    const match = token.sourcePath.match(/^tokens\/([^/]+)\//);
    if (!match) throw new Error(`token の正本パスが不正: ${token.sourcePath}`);
    const id = match[1];
    const found = families.get(id);
    if (found) {
      found.tokens.push(token);
      continue;
    }
    const asset = assets.find((item) => item.sourcePath === token.sourcePath);
    families.set(id, {
      id,
      label: FAMILY_LABELS[id] ?? id,
      sourcePath: token.sourcePath,
      role: asset?.role ?? null,
      maturity: asset?.maturity ?? null,
      tokens: [token],
    });
  }
  return [...families.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function readTokenAssetMeta(json: unknown, sourcePath: string): AssetMeta | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const extensions = (json as { $extensions?: { "uiux-numa"?: unknown } }).$extensions;
  if (!extensions || extensions["uiux-numa"] == null) return null;
  return parseTokenAssetMeta(json, sourcePath);
}

function toTokenRepoPath(globKey: string): string {
  const match = globKey.match(/\/((?:tokens)\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}

function collectLiveVariants(): LiveVariant[] {
  return Object.keys(variantModules)
    .map((key) => {
      const match = key.match(/experiments\/([^/]+)\/variants\/([^/]+)\/index\.tsx$/);
      if (!match) throw new Error(`variant パスが不正: ${key}`);
      return {
        experiment: match[1],
        variant: match[2],
        previewPath: `/preview/${match[1]}/${match[2]}`,
      };
    })
    .sort((a, b) => `${a.experiment}/${a.variant}`.localeCompare(`${b.experiment}/${b.variant}`));
}

function collectExperiments(liveVariants: LiveVariant[]): ExperimentRecord[] {
  const byExperiment = new Map<string, LiveVariant[]>();
  for (const variant of liveVariants) {
    const variants = byExperiment.get(variant.experiment) ?? [];
    variants.push(variant);
    byExperiment.set(variant.experiment, variants);
  }

  const records: ExperimentRecord[] = [];
  for (const [key, source] of Object.entries(experimentReadmes)) {
    const match = key.match(/experiments\/([^/]+)\/README\.md$/);
    if (!match) throw new Error(`Experiment パスが不正: ${key}`);
    const slug = match[1];
    const repoPath = toExperimentRepoPath(key);
    const frontmatter = parseExperimentFrontmatter(source, repoPath);
    const actual = (byExperiment.get(slug) ?? []).map((item) => item.variant).sort();
    const rows = parseVariantRows(source);
    const listed = rows.map((row) => row.id);

    if (actual.length === 0) throw new Error(`${repoPath}: live variant がない`);
    for (const id of listed) {
      if (!actual.includes(id)) {
        throw new Error(`${repoPath}: variant ${id} の index.tsx がない`);
      }
    }
    assertAdoptedIds(frontmatter.adopted, listed, repoPath);

    const live = (byExperiment.get(slug) ?? []).sort((a, b) => a.variant.localeCompare(b.variant));
    records.push({
      slug,
      title: frontmatter.title,
      status: frontmatter.status,
      role: frontmatter.role,
      maturity: frontmatter.maturity,
      created: frontmatter.created,
      updated: frontmatter.updated,
      adopted: frontmatter.adopted,
      domains: frontmatter.domains,
      sources: frontmatter.sources,
      platforms: frontmatter.platforms,
      topic: topicForExperiment(frontmatter.domains),
      lead: leadSentence(source),
      repoPath,
      variantIds: actual,
      // 並びは README の Variants 表の順にする。表の順は作者が意図した読み順（例: 落ち着いた案から華やかな案へ）である。
      // Variants 節には同じ id が複数の表に出る README があるので、重複を除く。
      variants: [...new Set([...listed.filter((id) => actual.includes(id)), ...actual])].map(
        (id) => {
          // 最初の表（id、仮説、変えた軸、実装の表）の行を採る。
          const row = rows.find((item) => item.id === id);
          return {
            id,
            status: variantStatus(frontmatter, id),
            hypothesis: row?.hypothesis ?? "",
            axis: row?.axis ?? "",
          };
        },
      ),
      liveVariants: live,
    });
  }

  for (const experiment of byExperiment.keys()) {
    if (!records.some((item) => item.slug === experiment)) {
      throw new Error(`experiments/${experiment}/ に README.md がない`);
    }
  }

  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function toExperimentRepoPath(globKey: string): string {
  const match = globKey.match(/\/((?:experiments)\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}

export function assertAdoptedIds(adopted: string[], listed: string[], path: string): void {
  for (const id of adopted) {
    if (!listed.includes(id)) {
      throw new Error(`${path}: adopted の ${id} が Variants 表にない`);
    }
  }
}

function variantStatus(frontmatter: ExperimentFrontmatter, id: string): VariantStatus {
  if (frontmatter.status !== "decided") return "exploring";
  return frontmatter.adopted.includes(id) ? "adopted" : "rejected";
}

/**
 * README の Variants 表の行。列は docs/experiment-format.md の順（id、仮説、変えた軸、実装）で読む。
 * 説明の正本を README の 1 か所に保ち、Catalog の画面に同じ文を二重に書かない。
 */
function parseVariantRows(source: string): { id: string; hypothesis: string; axis: string }[] {
  const start = source.indexOf("## Variants");
  if (start === -1) throw new Error("README に Variants がない");
  const end = source.indexOf("\n## ", start + 1);
  const section = source.slice(start, end === -1 ? source.length : end);
  return [...section.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|([^|]*)\|([^|]*)\|/gm)].map((match) => ({
    id: match[1],
    hypothesis: match[2].trim(),
    axis: match[3].trim(),
  }));
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

export const catalog = loadCatalog();

/**
 * 却下した配色は公開面に出さない。
 * 使える配色だけを並べたほうが、選ぶ面として迷いがない。
 * 却下した案は experiments/color-schemes-material の記録に残っている。
 */
export function adoptedSchemes(): ColorScheme[] {
  const adopted =
    catalog.experiments.find((item) => item.slug === "color-schemes-material")?.adopted ?? [];
  if (adopted.length === 0) return catalog.schemes;
  return catalog.schemes.filter((item) => adopted.includes(item.id));
}

/** トピックに入る成果物。更新の新しい順に並べる。 */
export function worksInTopic(topic: TopicId): ExperimentRecord[] {
  return catalog.experiments
    .filter((item) => item.topic === topic)
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug));
}

/** variant が持つ配布用の SVG。 */
export function svgsFor(experiment: string, variant: string) {
  return (
    catalog.svgs.find((item) => item.experiment === experiment && item.variant === variant)
      ?.assets ?? []
  );
}
