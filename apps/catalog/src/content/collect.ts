import {
  extractExperimentSlugs,
  extractOptionalSection,
  extractRepoPaths,
  extractSection,
  excerpt,
  parseSkillMaturity,
  parseVariantIds,
} from "./extractSection";
import { githubBlobUrl, toRepoPath } from "./github";
import {
  parseExperimentFrontmatter,
  parseFrontmatter,
  parsePrincipleFrontmatter,
  parseSkillFrontmatter,
  type ExperimentFrontmatter,
  type PrincipleFrontmatter,
  type SkillFrontmatter,
} from "./parseFrontmatter";
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

const skillFiles = import.meta.glob<string>("../../../../skills/*/SKILL.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const skillsIndexFiles = import.meta.glob<string>("../../../../skills/README.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const tokenFiles = import.meta.glob<unknown>("../../../../tokens/**/*.tokens.json", {
  import: "default",
  eager: true,
});

const previewFiles = import.meta.glob<string>(
  "../../../../experiments/*/previews/*.{png,jpg,webp}",
  {
    import: "default",
    eager: true,
  },
);

const variantModules = import.meta.glob("../../../../experiments/*/variants/*/index.tsx");

const knownRepoFiles = {
  ...experimentReadmes,
  ...principleFiles,
  ...skillFiles,
  ...skillsIndexFiles,
  ...import.meta.glob("../../../../skills/*/references/*.md", { query: "?raw", eager: true }),
  ...import.meta.glob("../../../../docs/principles/README.md", { query: "?raw", eager: true }),
};

export type PreviewItem = {
  experiment: string;
  fileName: string;
  src: string;
  kind: "compare" | "variant";
  variant?: string;
  state: string;
  alt: string;
};

export type LiveVariant = {
  experiment: string;
  variant: string;
  previewPath: string;
};

export type ExperimentRecord = ExperimentFrontmatter & {
  slug: string;
  repoPath: string;
  problem: string;
  decision: string;
  problemExcerpt: string;
  decisionExcerpt: string;
  variantIds: string[];
  previews: PreviewItem[];
  liveVariants: LiveVariant[];
};

export type PrincipleRecord = PrincipleFrontmatter & {
  slug: string;
  repoPath: string;
  hypothesis: string;
  decision: string;
  sourceExperiments: string[];
};

export type SkillRecord = SkillFrontmatter & {
  repoPath: string;
  maturity: string;
  relatedPaths: { path: string; url: string }[];
};

export type CatalogData = {
  tokens: CatalogToken[];
  experiments: ExperimentRecord[];
  principles: PrincipleRecord[];
  skills: SkillRecord[];
  previews: PreviewItem[];
  liveVariants: LiveVariant[];
};

function loadCatalog(): CatalogData {
  const liveVariants = Object.keys(variantModules).map((key) => {
    const match = key.match(/experiments\/([^/]+)\/variants\/([^/]+)\/index\.tsx$/);
    if (!match) throw new Error(`variant パスが不正: ${key}`);
    return {
      experiment: match[1],
      variant: match[2],
      previewPath: `/preview/${match[1]}/${match[2]}`,
    };
  });

  const tokens: CatalogToken[] = [];
  for (const [key, json] of Object.entries(tokenFiles)) {
    const sourcePath = toRepoPath(key);
    tokens.push(...collectTokens(json, sourcePath).tokens);
  }

  const experiments = collectExperiments(liveVariants);
  const principles = collectPrinciples(new Set(experiments.map((item) => item.slug)));
  const skills = collectSkills();
  const previews = experiments.flatMap((item) => item.previews);

  return { tokens, experiments, principles, skills, previews, liveVariants };
}

function collectExperiments(liveVariants: LiveVariant[]): ExperimentRecord[] {
  const byExperiment = new Map<string, LiveVariant[]>();
  for (const variant of liveVariants) {
    const list = byExperiment.get(variant.experiment) ?? [];
    list.push(variant);
    byExperiment.set(variant.experiment, list);
  }

  const records: ExperimentRecord[] = [];
  for (const [key, source] of Object.entries(experimentReadmes)) {
    const slugMatch = key.match(/experiments\/([^/]+)\/README\.md$/);
    if (!slugMatch) throw new Error(`Experiment パスが不正: ${key}`);
    const slug = slugMatch[1];
    const repoPath = toRepoPath(key);
    const frontmatter = parseExperimentFrontmatter(source, repoPath);
    const { body } = parseFrontmatter(source);
    const problem = extractSection(body, "Problem");
    const decision = extractOptionalSection(body, "Decision") || "未定";
    const listedIds = parseVariantIds(body);
    const actual = (byExperiment.get(slug) ?? []).map((item) => item.variant).sort();
    for (const id of listedIds) {
      if (!actual.includes(id)) {
        throw new Error(`${repoPath}: variant ${id} の index.tsx がない`);
      }
    }
    if (actual.length === 0) throw new Error(`${repoPath}: live variant がない`);

    const previews = collectPreviews(slug, actual);
    records.push({
      ...frontmatter,
      slug,
      repoPath,
      problem,
      decision,
      problemExcerpt: excerpt(problem),
      decisionExcerpt: excerpt(decision),
      variantIds: actual,
      previews,
      liveVariants: (byExperiment.get(slug) ?? []).sort((a, b) =>
        a.variant.localeCompare(b.variant),
      ),
    });
  }

  for (const slug of byExperiment.keys()) {
    if (!records.some((item) => item.slug === slug)) {
      throw new Error(`experiments/${slug}/ に README.md がない`);
    }
  }

  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function collectPreviews(experiment: string, variantIds: string[]): PreviewItem[] {
  const items: PreviewItem[] = [];
  const sortedIds = [...variantIds].sort((a, b) => b.length - a.length);

  for (const [key, src] of Object.entries(previewFiles)) {
    const match = key.match(/experiments\/([^/]+)\/previews\/([^/]+)$/);
    if (!match || match[1] !== experiment) continue;
    const fileName = match[2];
    const base = fileName.replace(/\.(png|jpg|webp)$/, "");
    if (base.startsWith("compare-")) {
      const state = base.slice("compare-".length);
      items.push({
        experiment,
        fileName,
        src,
        kind: "compare",
        state,
        alt: `${experiment} の比較画像（${state}）`,
      });
      continue;
    }

    const variant = sortedIds.find((id) => base === id || base.startsWith(`${id}-`));
    if (!variant)
      throw new Error(`experiments/${experiment}/previews/${fileName}: 対応する variant がない`);
    const state = base === variant ? "default" : base.slice(variant.length + 1);
    items.push({
      experiment,
      fileName,
      src,
      kind: "variant",
      variant,
      state,
      alt: `${experiment} の ${variant}（${state}）`,
    });
  }

  return items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "compare" ? -1 : 1;
    return a.fileName.localeCompare(b.fileName);
  });
}

function collectPrinciples(experimentSlugs: Set<string>): PrincipleRecord[] {
  const records: PrincipleRecord[] = [];
  for (const [key, source] of Object.entries(principleFiles)) {
    if (key.endsWith("/README.md")) continue;
    const slugMatch = key.match(/docs\/principles\/([^/]+)\.md$/);
    if (!slugMatch) throw new Error(`原則パスが不正: ${key}`);
    const repoPath = toRepoPath(key);
    const frontmatter = parsePrincipleFrontmatter(source, repoPath);
    const { body } = parseFrontmatter(source);
    const hypothesis = extractSection(body, "仮説");
    const decision = extractSection(body, "判断");
    const examples = extractOptionalSection(body, "作例");
    const sourceExperiments = extractExperimentSlugs(`${examples}\n${hypothesis}`);
    for (const slug of sourceExperiments) {
      if (!experimentSlugs.has(slug)) {
        throw new Error(`${repoPath}: 参照先 Experiment がない: ${slug}`);
      }
    }
    records.push({
      ...frontmatter,
      slug: slugMatch[1],
      repoPath,
      hypothesis,
      decision,
      sourceExperiments,
    });
  }
  return records.sort((a, b) => a.slug.localeCompare(b.slug));
}

function collectSkills(): SkillRecord[] {
  const indexEntries = Object.entries(skillsIndexFiles);
  if (indexEntries.length !== 1) throw new Error("skills/README.md が 1 件ではない");
  const skillsReadme = indexEntries[0][1];
  const knownPaths = new Set(Object.keys(knownRepoFiles).map((key) => toRepoPath(key)));
  knownPaths.add("docs/principles/");

  const records: SkillRecord[] = [];
  for (const [key, source] of Object.entries(skillFiles)) {
    const repoPath = toRepoPath(key);
    const frontmatter = parseSkillFrontmatter(source, repoPath);
    const maturity = parseSkillMaturity(skillsReadme, frontmatter.name);
    const { body } = parseFrontmatter(source);
    const related = extractRepoPaths(extractOptionalSection(body, "参照資料"));
    for (const path of related) {
      if (path.endsWith("/")) {
        if (![...knownPaths].some((item) => item.startsWith(path) || path.startsWith(item))) {
          throw new Error(`${repoPath}: 参照先がない: ${path}`);
        }
        continue;
      }
      if (!knownPaths.has(path)) throw new Error(`${repoPath}: 参照先がない: ${path}`);
    }
    records.push({
      ...frontmatter,
      repoPath,
      maturity,
      relatedPaths: related.map((path) => ({
        path,
        url: path.endsWith("/")
          ? `https://github.com/salan70/uiux-numa/tree/main/${path.replace(/\/$/, "")}`
          : githubBlobUrl(path),
      })),
    });
  }
  return records.sort((a, b) => a.name.localeCompare(b.name));
}

export const catalog = loadCatalog();
