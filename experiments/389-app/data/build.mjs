// .389 の成績データ（salan70/389-app 42d79695 の tools/npb_data_scraper/seasons/end2025）から、試作の出題と候補を shared/data.g.dart に書く。
// 出題は全選手を入れ、クイズ設定の条件（球団、通算の試合、安打、本塁打の下限）で試作の中で絞る。候補には全選手の名前を入れる。
// 使い方: node experiments/389-app/data/build.mjs <389-app のパス>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const src = join(process.argv[2] ?? "../389-app", "tools/npb_data_scraper/seasons/end2025");
const out = new URL("../shared/data.g.dart", import.meta.url).pathname;

const parse = (file) => {
  const [head, ...lines] = readFileSync(join(src, file), "utf8").trim().split("\n");
  const keys = head.split(",");
  return lines.map((line) => {
    const cells = line
      .match(/("[^"]*"|[^,]*)(,|$)/g)
      .map((c) => c.replace(/,$/, "").replace(/^"|"$/g, ""));
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
};

const hitters = parse("hitters.csv");
const stats = parse("hitting_stats.csv");
// 製品のクイズ設定で選べる成績の全部（StatsType のうち、データにある 23 列）。
const columns = [
  "球団",
  "試合",
  "打席",
  "打数",
  "得点",
  "安打",
  "二塁打",
  "三塁打",
  "本塁打",
  "塁打",
  "打点",
  "盗塁",
  "盗塁死",
  "犠打",
  "犠飛",
  "四球",
  "死球",
  "三振",
  "併殺打",
  "打率",
  "出塁率",
  "長打率",
  "OPS",
];
const rates = new Set(["打率", "出塁率", "長打率", "OPS"]);
const rate = (v) => {
  const t = Number(v).toFixed(3);
  return t.startsWith("0") ? t.slice(1) : t;
};
const cell = (k, v) => (rates.has(k) ? rate(v) : v);

const players = [];
for (const h of hitters) {
  const rows = stats.filter((s) => s.playerId === h.id);
  const total = rows.find((r) => r.年度 === "通算");
  if (!total) continue;
  // 製品の出題と同じく、通算の行を最後の 1 行として含める。
  const years = rows.sort((a, b) => +a.表示順 - +b.表示順);
  players.push({ id: h.id.slice(0, 8), name: h.name, team: h.team, years });
}
players.sort((a, b) => a.name.localeCompare(b.name, "ja"));

const q = (s) => `'${s.replace(/'/g, "\\'")}'`;
const body = players
  .map(
    (p) =>
      `  QuizPlayer(${q(p.id)}, ${q(p.name)}, ${q(p.team)}, [\n${p.years
        .map((y) => `    [${q(y.年度)}, ${columns.map((k) => q(cell(k, y[k]))).join(", ")}],`)
        .join("\n")}\n  ]),`,
  )
  .join("\n");

writeFileSync(
  out,
  `// data/build.mjs の生成物。直接編集しない。
// 出典: salan70/389-app 42d79695 tools/npb_data_scraper/seasons/end2025（2025 年シーズン終了時）。
part of 'data.dart';

const statColumns = <String>[${columns.map(q).join(", ")}];

const quizPlayers = <QuizPlayer>[
${body}
];

const allHitterNames = <String>[${hitters.map((h) => q(h.name)).join(", ")}];
`,
);
console.log(`${players.length} 人の出題と ${hitters.length} 人の候補を ${out} に書いた`);
