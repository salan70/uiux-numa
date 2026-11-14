// 静的 Markdown が 1 文 1 行（AGENTS.md）で書かれているかを検査する。
// 使い方: node scripts/check-one-sentence-per-line.mjs <file.md>...
// 文末（「。」「？」「！」）の直後に本文が続く行を報告する。違反があれば終了コード 1。
//
// 検査しない場所:
// - frontmatter、コードブロック、インデントコード、HTML ブロック、表の行、見出し
// - インラインコード、リンク、山括弧（プレースホルダ）の中
// - 「」『』（）() の中。引用や補足の途中で切らない
// - docs/guidelines/ の箇条書き。Catalog の解析器（apps/catalog/src/content/guidelines.ts）が 1 項目 1 行を前提にする
import { readFileSync } from "node:fs";
import process from "node:process";

// 未対応のファイル。整形したらこの一覧から外す。
const pending = new Set([
  "experiments/baseball-journey-badges/README.md",
  "experiments/myrecipee-app/README.md",
]);

const open = new Map([
  ["「", "」"],
  ["『", "』"],
  ["（", "）"],
  ["(", ")"],
]);
const closers = new Set(["」", "』", "）", ")", "”", "’", "]"]);
const ends = new Set(["。", "？", "！"]);
const listMark = /^((?:[ \t]*>)*[ \t]*)((?:[-*+]|\d+[.)])[ \t]+(?:\[[ xX]\][ \t]+)?)?/;

/** 1 行の本文に、文末の直後で続く文があるか。 */
function hasSecondSentence(text) {
  let depth = 0;
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const rest = text.slice(i);
    if (c === "`") {
      const fence = /^`+/.exec(rest)[0];
      const end = text.indexOf(fence, i + fence.length);
      i = end < 0 ? i + fence.length : end + fence.length;
      continue;
    }
    const span =
      c === "["
        ? /^\[[^\]]*\]\([^)]*\)|^\[[^\]]*\]\[[^\]]*\]/.exec(rest)
        : c === "<"
          ? /^<[^>]*>/.exec(rest)
          : null;
    if (span) {
      i += span[0].length;
      continue;
    }
    if (open.has(c)) depth += 1;
    else if ([...open.values()].includes(c)) depth = Math.max(0, depth - 1);
    i += 1;
    if (!ends.has(c) || depth > 0) continue;
    while (i < text.length && ends.has(text[i])) i += 1;
    const next = text[i];
    if (next === undefined || closers.has(next)) continue;
    if (next === "*" || next === "~") {
      const runs =
        text
          .slice(0, i)
          .replace(/`[^`]*`/g, "")
          .match(new RegExp(`\\${next}+`, "g")) ?? [];
      if (runs.length % 2 === 1) continue;
    }
    if (/^[\s*~]*$/.test(text.slice(i))) continue;
    return true;
  }
  return false;
}

function check(file) {
  const exemptList = file.startsWith("docs/guidelines/");
  const lines = readFileSync(file, "utf8").split("\n");
  const found = [];
  let frontmatter = lines[0] === "---";
  let fence = null;
  let html = false;
  let inList = false;
  let prevBlank = true;
  lines.forEach((line, index) => {
    const stripped = line.trim();
    if (index === 0 && frontmatter) return;
    if (frontmatter) {
      if (stripped === "---") frontmatter = false;
      return;
    }
    const body = line.replace(/^(?:[ \t]*>)*[ \t]*/, "");
    if (fence) {
      if (new RegExp(`^${fence[0]}{${fence.length},}\\s*$`).test(body.trim())) fence = null;
      return;
    }
    const fenceStart = /^(?:(?:[-*+]|\d+[.)])[ \t]+)?(`{3,}|~{3,})/.exec(body);
    if (fenceStart) {
      fence = fenceStart[1];
      prevBlank = false;
      return;
    }
    if (stripped === "") {
      html = false;
      prevBlank = true;
      return;
    }
    if (html) return;
    if (
      /^ {0,3}<[A-Za-z!/]/.test(line) &&
      !/^ {0,3}<(a|b|i|em|strong|code|span|kbd)[ >]/.test(line)
    ) {
      html = true;
      prevBlank = false;
      return;
    }
    const [, prefix, mark] = listMark.exec(line);
    if (!prefix.trim() && !mark) {
      const indent = line.length - line.trimStart().length;
      if (indent === 0) inList = false;
      else if (indent >= 4 && !inList && prevBlank) {
        prevBlank = false;
        return;
      }
    }
    if (mark && !prefix.replace(/[>\s]/g, "")) inList = true;
    prevBlank = false;
    const content = line.slice(prefix.length + (mark?.length ?? 0)).trimStart();
    if (content.startsWith("|")) return;
    if (!mark && /^#{1,6}(\s|$)/.test(content)) return;
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(content)) return;
    if (exemptList && /^\s*[-*+]\s/.test(line)) return;
    if (hasSecondSentence(line.slice(prefix.length + (mark?.length ?? 0)))) found.push(index + 1);
  });
  return found;
}

let failed = 0;
for (const file of process.argv.slice(2)) {
  if (pending.has(file)) continue;
  for (const lineNumber of check(file)) {
    console.log(`${file}:${lineNumber}: 1 行に複数の文がある`);
    failed += 1;
  }
}
process.exit(failed > 0 ? 1 : 0);
