// 方針の規則の実データ。正本は docs/guidelines/*.md。
// 解析の正本は apps/catalog/src/content/guidelines.ts にあり、ここは規則 1 件を描くのに要る分だけを読む。
// 目的は規則ブロックの構造を比べることなので、文書の frontmatter と コア の節は読まない。

export type Source = { text: string; url: string };

export type Rule = {
  title: string;
  /** 意図と根拠。なぜこの規則があるか。 */
  rationale: string;
  /** foundation か module。どのプロジェクトで守るかを表す。 */
  applies: string;
  /** 結び付くコアの題名。 */
  cores: string[];
  good: string;
  bad: string;
  exception: string | null;
  figureKey: string | null;
  source: Source | null;
};

const files = import.meta.glob<string>("../../../docs/guidelines/states-and-feedback.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

const raw = Object.values(files)[0] ?? "";

function field(lines: string[], label: string): string | null {
  const hit = lines.find((line) => line.startsWith(`- ${label}: `));
  return hit ? hit.slice(`- ${label}: `.length).trim() : null;
}

function link(value: string | null): Source | null {
  if (!value) return null;
  const match = value.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
  return match ? { text: match[1], url: match[2] } : { text: value, url: "" };
}

function parseRule(block: string): Rule {
  const lines = block.split("\n");
  const title = lines[0].trim();
  const rationale = (lines.find((line) => line.startsWith("意図と根拠: ")) ?? "").slice(7).trim();
  const cores = field(lines, "コア");
  return {
    title,
    rationale,
    applies: field(lines, "適用") ?? "",
    cores: cores ? cores.split("、").map((core) => core.trim()) : [],
    good: field(lines, "良い例") ?? "",
    bad: field(lines, "悪い例") ?? "",
    exception: field(lines, "例外"),
    figureKey: field(lines, "図"),
    source: link(field(lines, "出典")),
  };
}

/** States & Feedback の Tips。8 件あり、図版つき・出典つき・どちらも無しが混ざる。 */
export const RULES: Rule[] = (() => {
  const tips = raw.split("\n## ").find((section) => section.startsWith("Tips\n"));
  if (!tips) return [];
  return tips.split("\n### ").slice(1).map(parseRule);
})();

/** 行内の `コード` だけを組む。正本の Tips に出る行内記法はこれだけである。 */
export function inline(text: string): (string | { code: string })[] {
  return text.split(/`([^`]+)`/).map((part, idx) => (idx % 2 === 1 ? { code: part } : part));
}
