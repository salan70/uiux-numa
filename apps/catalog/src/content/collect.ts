import { categoryForDomains, type CatalogCategory } from "./category";
import { toRepoPath } from "./github";
import {
  parseExperimentFrontmatter,
  parseFrontmatter,
  parsePrincipleFrontmatter,
  type ExperimentFrontmatter,
  type ExperimentStatus,
  type PrincipleStatus,
} from "./parseFrontmatter";
import { collectSchemes, schemeFiles, type ColorScheme } from "./schemes";
import { collectSvgs, svgFiles, type SvgVariant } from "./svgs";
import { collectTokens, type CatalogToken } from "./tokens";

const experimentReadmes = import.meta.glob<string>("../../../../experiments/*/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const principleFiles = import.meta.glob<string>("../../../../docs/principles/*.md", {
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

export type ExperimentVariant = {
  id: string;
  status: VariantStatus;
};

export type ExperimentRecord = {
  slug: string;
  title: string;
  status: ExperimentStatus;
  created: string;
  updated: string;
  adopted: string[];
  domains: string[];
  category: CatalogCategory;
  variantIds: string[];
  variants: ExperimentVariant[];
  liveVariants: LiveVariant[];
  body: string;
};

export type PrincipleRecord = {
  slug: string;
  title: string;
  status: PrincipleStatus;
  created: string;
  updated: string;
  body: string;
  repoPath: string;
};

export type CatalogData = {
  tokens: CatalogToken[];
  schemes: ColorScheme[];
  experiments: ExperimentRecord[];
  principles: PrincipleRecord[];
  svgs: SvgVariant[];
  liveVariants: LiveVariant[];
};

function loadCatalog(): CatalogData {
  const liveVariants = collectLiveVariants();
  const tokens = Object.entries(tokenFiles).flatMap(
    ([key, json]) => collectTokens(json, toRepoPath(key)).tokens,
  );
  const experiments = collectExperiments(liveVariants);
  const principles = collectPrinciples();
  const schemes = collectSchemes(schemeFiles);
  const svgs = collectSvgs(svgFiles);

  return { tokens, schemes, experiments, principles, svgs, liveVariants };
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
    const { body } = parseFrontmatter(source);
    const actual = (byExperiment.get(slug) ?? []).map((item) => item.variant).sort();
    const listed = parseVariantIds(source);

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
      created: frontmatter.created,
      updated: frontmatter.updated,
      adopted: frontmatter.adopted,
      domains: frontmatter.domains,
      category: categoryForDomains(frontmatter.domains),
      variantIds: actual,
      variants: actual.map((id) => ({
        id,
        status: variantStatus(frontmatter, id),
      })),
      liveVariants: live,
      body,
    });
  }

  for (const experiment of byExperiment.keys()) {
    if (!records.some((item) => item.slug === experiment)) {
      throw new Error(`experiments/${experiment}/ に README.md がない`);
    }
  }

  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function collectPrinciples(): PrincipleRecord[] {
  const records: PrincipleRecord[] = [];
  for (const [key, source] of Object.entries(principleFiles)) {
    const match = key.match(/docs\/principles\/([^/]+)\.md$/);
    if (!match) throw new Error(`原則パスが不正: ${key}`);
    const slug = match[1];
    if (slug === "README") continue;
    const repoPath = toRepoPath(key);
    const frontmatter = parsePrincipleFrontmatter(source, repoPath);
    const { body } = parseFrontmatter(source);
    records.push({
      slug,
      title: frontmatter.title,
      status: frontmatter.status,
      created: frontmatter.created,
      updated: frontmatter.updated,
      body,
      repoPath,
    });
  }
  return records.sort((a, b) => a.slug.localeCompare(b.slug));
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

function parseVariantIds(source: string): string[] {
  const start = source.indexOf("## Variants");
  if (start === -1) throw new Error("README に Variants がない");
  const end = source.indexOf("\n## ", start + 1);
  const section = source.slice(start, end === -1 ? source.length : end);
  return [...section.matchAll(/^\|\s*`([a-z0-9-]+)`\s*\|/gm)].map((match) => match[1]);
}

export const catalog = loadCatalog();
