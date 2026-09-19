import { categoryForDomains, type CatalogCategory } from "./category";
import { parseExperimentFrontmatter } from "./parseFrontmatter";
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

export type ExperimentRecord = {
  slug: string;
  domains: string[];
  category: CatalogCategory;
  variantIds: string[];
  liveVariants: LiveVariant[];
};

export type CatalogData = {
  tokens: CatalogToken[];
  schemes: ColorScheme[];
  experiments: ExperimentRecord[];
  svgs: SvgVariant[];
  liveVariants: LiveVariant[];
};

function loadCatalog(): CatalogData {
  const liveVariants = collectLiveVariants();
  const tokens = Object.entries(tokenFiles).flatMap(
    ([key, json]) => collectTokens(json, toRepoPath(key)).tokens,
  );
  const experiments = collectExperiments(liveVariants);
  const schemes = collectSchemes(schemeFiles);
  const svgs = collectSvgs(svgFiles);

  return { tokens, schemes, experiments, svgs, liveVariants };
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
    const repoPath = toRepoPath(key);
    const frontmatter = parseExperimentFrontmatter(source, repoPath);
    const actual = (byExperiment.get(slug) ?? []).map((item) => item.variant).sort();
    const listed = parseVariantIds(source);

    if (actual.length === 0) throw new Error(`${repoPath}: live variant がない`);
    for (const id of listed) {
      if (!actual.includes(id)) {
        throw new Error(`${repoPath}: variant ${id} の index.tsx がない`);
      }
    }

    const variants = (byExperiment.get(slug) ?? []).sort((a, b) =>
      a.variant.localeCompare(b.variant),
    );
    records.push({
      slug,
      domains: frontmatter.domains,
      category: categoryForDomains(frontmatter.domains),
      variantIds: actual,
      liveVariants: variants,
    });
  }

  for (const experiment of byExperiment.keys()) {
    if (!records.some((item) => item.slug === experiment)) {
      throw new Error(`experiments/${experiment}/ に README.md がない`);
    }
  }

  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function parseVariantIds(source: string): string[] {
  const start = source.indexOf("## Variants");
  if (start === -1) throw new Error("README に Variants がない");
  const end = source.indexOf("\n## ", start + 1);
  const section = source.slice(start, end === -1 ? source.length : end);
  return [...section.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((match) => match[1]);
}

function toRepoPath(globKey: string): string {
  const match = globKey.match(/\/((?:experiments|tokens)\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}

export const catalog = loadCatalog();
