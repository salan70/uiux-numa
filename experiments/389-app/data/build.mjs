// .389 の成績データ（salan70/389-app 42d79695 の tools/npb_data_scraper/seasons/end2025）から、試作の出題と候補を shared/data.g.dart に書く。
// 出題は製品の既定の条件（通算 300 試合、300 安打、50 本塁打）を満たす選手に絞り、候補には全選手の名前を入れる。
// 使い方: node experiments/389-app/data/build.mjs <389-app のパス>
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const src = join(process.argv[2] ?? "../389-app", "tools/npb_data_scraper/seasons/end2025");
const out = new URL("../shared/data.g.dart", import.meta.url).pathname;

const parse = (file) => {
  const [head, ...lines] = readFileSync(join(src, file), "utf8").trim().split("\n");
  const keys = head.split(",");
  return lines.map((line) => {
    const cells = line.match(/("[^"]*"|[^,]*)(,|$)/g).map((c) => c.replace(/,$/, "").replace(/^"|"$/g, ""));
    return Object.fromEntries(keys.map((k, i) => [k, cells[i]]));
  });
};

const hitters = parse("hitters.csv");
const stats = parse("hitting_stats.csv");
const columns = ["球団", "試合", "安打", "本塁打", "打点", "盗塁", "打率", "OPS"];
const rate = (v) => Number(v).toFixed(3).replace(/^0/, "");
const cell = (k, v) => (k === "打率" || k === "OPS" ? rate(v) : v);

const players = [];
for (const h of hitters) {
  const rows = stats.filter((s) => s.playerId === h.id);
  const total = rows.find((r) => r.年度 === "通算");
  if (!total || +total.試合 < 300 || +total.安打 < 300 || +total.本塁打 < 50) continue;
  const years = rows.filter((r) => r.年度 !== "通算").sort((a, b) => +a.表示順 - +b.表示順);
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
