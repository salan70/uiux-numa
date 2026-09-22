// docs/guidelines/*.md の読み込みと検証。
// 依存を足さず、決めた書式だけを読む小さな解析器。
// 知らない節や欠けた項目は throw して build を落とす。
import React from "react";
import { repoBlobUrl } from "./github";
import { parseFrontmatter } from "./parseFrontmatter";

export type Status = "draft" | "adopted";

export type LinkItem = {
  text: string;
  url: string;
};

export type Applies = "foundation" | "module";

// コアは思想。見出しと短い本文だけを持ち、並び順が優先順位を表す。
export type Principle = {
  title: string;
  body: string;
};

export type Rule = {
  title: string;
  applies: Applies;
  cores: string[];
  rationale: string;
  good: string;
  bad: string;
  exception: string | null;
  experiment: LinkItem | null;
  source: LinkItem | null;
};

export type Guideline = {
  slug: string;
  title: string;
  summary: string;
  status: Status;
  axes: string[];
  purpose: string;
  // コアは思想、Tips は具体的な場面の規則。
  core: Principle[];
  tips: Rule[];
};

// docs/evaluation/axes.md の 17 軸。
const VALID_AXES = [
  "visual hierarchy",
  "information density",
  "discoverability",
  "information architecture",
  "interaction clarity",
  "writing clarity",
  "motion appropriateness",
  "feedback quality",
  "consistency",
  "accessibility",
  "platform fit",
  "delight",
  "perceived performance",
  "localization robustness",
  "implementation cost",
  "maintainability",
  "brand fit",
] as const;

const KNOWN_SECTIONS = ["目的", "コア", "Tips"] as const;

const VALID_APPLIES: readonly Applies[] = ["foundation", "module"];

const guidelineFiles = import.meta.glob<string>("../../../../docs/guidelines/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const GUIDELINE_ORDER: readonly string[] = [
  "ux-writing",
  "japanese-notation",
  "information-architecture",
  "design-four-principles",
  "accessibility",
  "states-and-feedback",
  "color",
];

export function loadGuidelines(): Guideline[] {
  const list: Guideline[] = [];

  for (const [path, content] of Object.entries(guidelineFiles)) {
    const filename = path.split("/").pop() ?? "";
    if (filename === "README.md") continue;
    const slug = filename.replace(/\.md$/, "");
    list.push(parseGuideline(slug, content));
  }

  return list.sort((a, b) => {
    const ia = GUIDELINE_ORDER.indexOf(a.slug);
    const ib = GUIDELINE_ORDER.indexOf(b.slug);
    if (ia !== -1 && ib !== -1) return ia - ib;
    if (ia !== -1) return -1;
    if (ib !== -1) return 1;
    return a.slug.localeCompare(b.slug);
  });
}

// 起動・ビルド時に検証を走らせる。不整合があれば即座に throw して build を落とす。
export const ALL_GUIDELINES: Guideline[] = loadGuidelines();

export function parseGuideline(slug: string, raw: string): Guideline {
  const { data: front } = parseFrontmatter(raw);

  const title = typeof front["title"] === "string" ? front["title"].trim() : "";
  if (!title) throw new Error(`[guidelines/${slug}] title is required in frontmatter`);

  const summary = typeof front["summary"] === "string" ? front["summary"].trim() : "";
  if (!summary) throw new Error(`[guidelines/${slug}] summary is required in frontmatter`);

  const statusRaw = front["status"];
  if (statusRaw !== "draft" && statusRaw !== "adopted") {
    throw new Error(`[guidelines/${slug}] status must be 'draft' or 'adopted', got '${statusRaw}'`);
  }
  const status: Status = statusRaw;

  const axes = Array.isArray(front["axes"])
    ? front["axes"].map((axis) => String(axis).trim()).filter(Boolean)
    : [];
  if (axes.length === 0) {
    throw new Error(`[guidelines/${slug}] axes must contain at least one evaluation axis`);
  }
  for (const axis of axes) {
    if (!(VALID_AXES as readonly string[]).includes(axis)) {
      throw new Error(`[guidelines/${slug}] unknown evaluation axis: '${axis}'`);
    }
  }

  // 本文の抽出（frontmatter 除去）
  const bodyMatch = raw.match(/^---\r?\n[\s\S]*?\r?\n---\r?\n([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1] : raw;

  // H2 節ごとの分割
  const sections = splitSections(body);

  // 未知の節の検査
  for (const name of Object.keys(sections)) {
    if (!(KNOWN_SECTIONS as readonly string[]).includes(name)) {
      throw new Error(`[guidelines/${slug}] unknown section: '## ${name}'`);
    }
  }

  // 必須節の検査
  for (const required of KNOWN_SECTIONS) {
    if (!(required in sections)) {
      throw new Error(`[guidelines/${slug}] missing required section: '## ${required}'`);
    }
  }

  const purpose = joinParagraphs(sections["目的"]);
  if (!purpose) throw new Error(`[guidelines/${slug}] '## 目的' must not be empty`);

  const core = parsePrinciples(slug, sections["コア"]);
  if (core.length === 0) {
    throw new Error(`[guidelines/${slug}] '## コア' must contain at least one item`);
  }

  const tips = parseRules(
    slug,
    sections["Tips"],
    core.map((item) => item.title),
  );
  if (tips.length === 0) {
    throw new Error(`[guidelines/${slug}] '## Tips' must contain at least one rule`);
  }

  return { slug, title, summary, status, axes, purpose, core, tips };
}

function splitSections(body: string): Record<string, string> {
  const sections: Record<string, string> = {};
  const lines = body.split(/\r?\n/);
  let currentSection: string | null = null;
  let currentLines: string[] = [];

  for (const line of lines) {
    const h2Match = line.match(/^##\s+(.+)$/);
    if (h2Match) {
      if (currentSection) {
        sections[currentSection] = currentLines.join("\n");
      }
      currentSection = h2Match[1].trim();
      currentLines = [];
    } else if (currentSection) {
      currentLines.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentLines.join("\n");
  }

  return sections;
}

/** 1 文 1 行の Markdown 段落を空白なしで結合する。空行は段落区切り。 */
function joinParagraphs(text: string): string {
  const paragraphs = text
    .split(/\r?\n\r?\n/)
    .map((p) =>
      p
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean)
        .join(""),
    )
    .filter(Boolean);
  return paragraphs.join("\n\n");
}

function splitItems(sectionBody: string): { title: string; lines: string[] }[] {
  const items: { title: string; lines: string[] }[] = [];
  for (const line of sectionBody.split(/\r?\n/)) {
    const h3Match = line.match(/^###\s+(.+)$/);
    if (h3Match) {
      items.push({ title: h3Match[1].trim(), lines: [] });
    } else if (items.length > 0) {
      items[items.length - 1].lines.push(line);
    }
  }
  return items;
}

function parsePrinciples(slug: string, sectionBody: string): Principle[] {
  return splitItems(sectionBody).map(({ title, lines }) => {
    // コアに箇条書きが混ざるのは、具体例を持ち込んだ印。Tips へ送らせる。
    const listLine = lines.find((line) => line.trim().startsWith("- "));
    if (listLine) {
      throw new Error(`[guidelines/${slug}] core '${title}' must not have list items`);
    }
    const body = joinParagraphs(lines.join("\n"));
    if (!body) throw new Error(`[guidelines/${slug}] core '${title}' must have a body`);
    return { title, body };
  });
}

function parseRules(slug: string, sectionBody: string, coreTitles: string[]): Rule[] {
  return splitItems(sectionBody).map(({ title, lines }) =>
    parseSingleRule(slug, title, lines, coreTitles),
  );
}

function parseSingleRule(slug: string, title: string, lines: string[], coreTitles: string[]): Rule {
  let rationaleLines: string[] = [];
  let readingRationale = false;

  let applies: Applies | null = null;
  const cores: string[] = [];
  let good: string | null = null;
  let bad: string | null = null;
  let exception: string | null = null;
  let experiment: LinkItem | null = null;
  let source: LinkItem | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const rationaleMatch = line.match(/^意図と根拠:\s*(.*)$/);
    if (rationaleMatch) {
      readingRationale = true;
      if (rationaleMatch[1]) rationaleLines.push(rationaleMatch[1].trim());
      continue;
    }

    if (line.startsWith("- ")) {
      readingRationale = false;
      const itemText = line.slice(2).trim();

      const appliesMatch = itemText.match(/^適用:\s*(.*)$/);
      if (appliesMatch) {
        const value = appliesMatch[1].trim();
        if (!(VALID_APPLIES as readonly string[]).includes(value)) {
          throw new Error(`[guidelines/${slug}] rule '${title}' has unknown 適用: '${value}'`);
        }
        applies = value as Applies;
        continue;
      }

      const coreMatch = itemText.match(/^コア:\s*(.*)$/);
      if (coreMatch) {
        const value = coreMatch[1].trim();
        if (!coreTitles.includes(value)) {
          throw new Error(
            `[guidelines/${slug}] rule '${title}' refers to unknown core: '${value}'`,
          );
        }
        cores.push(value);
        continue;
      }

      const goodMatch = itemText.match(/^良い例:\s*(.*)$/);
      if (goodMatch) {
        good = goodMatch[1].trim();
        continue;
      }

      const badMatch = itemText.match(/^悪い例:\s*(.*)$/);
      if (badMatch) {
        bad = badMatch[1].trim();
        continue;
      }

      const expMatch = itemText.match(/^例外:\s*(.*)$/);
      if (expMatch) {
        exception = expMatch[1].trim();
        continue;
      }

      const experimentMatch = itemText.match(/^実験:\s*(.*)$/);
      if (experimentMatch) {
        experiment = parseLinkItem(slug, title, "実験", experimentMatch[1].trim());
        continue;
      }

      const sourceMatch = itemText.match(/^出典:\s*(.*)$/);
      if (sourceMatch) {
        source = parseLinkItem(slug, title, "出典", sourceMatch[1].trim());
        continue;
      }

      throw new Error(`[guidelines/${slug}] rule '${title}' has unknown list item: '${line}'`);
    }

    if (readingRationale) {
      rationaleLines.push(line);
      continue;
    }

    throw new Error(`[guidelines/${slug}] rule '${title}' unexpected line: '${line}'`);
  }

  const rationale = rationaleLines.join("");
  if (!rationale) {
    throw new Error(`[guidelines/${slug}] rule '${title}' missing '意図と根拠'`);
  }
  if (!good) {
    throw new Error(`[guidelines/${slug}] rule '${title}' missing '- 良い例'`);
  }
  if (!bad) {
    throw new Error(`[guidelines/${slug}] rule '${title}' missing '- 悪い例'`);
  }
  if (!applies) {
    throw new Error(`[guidelines/${slug}] rule '${title}' missing '- 適用'`);
  }
  if (cores.length === 0) {
    throw new Error(`[guidelines/${slug}] rule '${title}' missing '- コア'`);
  }

  return {
    title,
    applies,
    cores,
    rationale,
    good,
    bad,
    exception,
    experiment,
    source,
  };
}

// 出どころは必ずリンクにする。href が空の <a> を画面に出さないため。
function parseLinkItem(slug: string, title: string, label: string, raw: string): LinkItem {
  const match = raw.match(/\[(.*?)\]\((.*?)\)/);
  if (!match || !match[2].trim()) {
    throw new Error(
      `[guidelines/${slug}] rule '${title}' の '${label}' must be a markdown link: '${raw}'`,
    );
  }
  return { text: match[1].trim(), url: match[2].trim() };
}

/**
 * 行内の記法（`code`、[text](url)、**強調**）を React 要素に変換する。
 */
export function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // トークンに分割
  // 1: `code`
  // 2: [text](url)
  // 3: **strong**
  const regex = /(`[^`]+`|\[[^\]]+\]\([^)]+\)|\*\*[^*]+\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (part.startsWith("`") && part.endsWith("`")) {
      return React.createElement(
        "code",
        { key: index, className: "guide-code" },
        part.slice(1, -1),
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const href = resolveHref(linkMatch[2]);
      return React.createElement(
        "a",
        {
          key: index,
          href,
          className: "guide-link",
          target: "_blank",
          rel: "noreferrer",
        },
        linkMatch[1],
      );
    }

    if (part.startsWith("**") && part.endsWith("**")) {
      return React.createElement(
        "strong",
        { key: index, className: "guide-strong" },
        part.slice(2, -2),
      );
    }

    return React.createElement(React.Fragment, { key: index }, part);
  });
}

/**
 * 文書の中の相対リンクを解決する。
 * 正本は docs/guidelines/ にあり、リンクは同じリポジトリ内の相対パスで書かれている。
 * 公開サイトの URL 構造とは合わないので、リポジトリの該当ファイルへ送る。
 */
export function resolveHref(href: string): string {
  if (/^https?:\/\//.test(href)) return href;
  return repoBlobUrl(normalizeDocsPath(href));
}

/** docs/guidelines/ からの相対パスをリポジトリルートからのパスにする。 */
function normalizeDocsPath(href: string): string {
  const segments = "docs/guidelines".split("/");
  for (const part of href.split("/")) {
    if (part === "." || part === "") continue;
    if (part === "..") {
      segments.pop();
      continue;
    }
    segments.push(part);
  }
  return segments.join("/");
}
