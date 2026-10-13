// 実績バッジとショップ絵の原本（variants/pixel-16/source/*.svg）と、比較ページ用の升目（previews/badge-grids.js）を書き出す。
// 正本は shared/grids/<asset>.txt の 16 × 16 の升目の文字列で、Flutter の design system の PixelArt へ同じ文字列と色の表を写す。
// 1 字が 1 升で、`.` は透明。色の字は COLORS の表で引き、色ごとに part-<asset>-<role> の path にまとめる。
// 台、数の札、未獲得の灰色は利用画面が持つ。原本は絵柄だけにする（数の扱いは A 案：README の round 6）。
// 実行: node experiments/baseball-journey-badges/shared/build-badges.mjs
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;

/** 升目の字 → [role, 色]。色はアプリのテーマ（baseball-journey-app/shared/theme.dart）に、素材の茶、灰、肌を足した 9 色。 */
export const COLORS = {
  k: ["ink", "#1F1F1F"],
  w: ["white", "#FEFEFE"],
  y: ["yellow", "#FAC400"],
  r: ["coral", "#F37252"],
  b: ["blue", "#4078E0"],
  g: ["green", "#2E9E5B"],
  t: ["brown", "#C27A3A"],
  s: ["gray", "#9AA19D"],
  n: ["skin", "#F5CFA8"],
};

/** asset の名前、種類、読み上げの名前。実績との対応は previews/catalog.html の表にある。 */
export const assets = [
  ["hit", "badge", "安打"],
  ["home-run", "badge", "本塁打"],
  ["steal", "badge", "盗塁"],
  ["rbi", "badge", "打点"],
  ["avg", "badge", "打率"],
  ["triple-crown", "badge", "三冠王"],
  ["mvp", "badge", "MVP"],
  ["golden-glove", "badge", "ゴールデングラブ"],
  ["all-star", "badge", "オールスター"],
  ["rookie", "badge", "新人王"],
  ["calendar", "badge", "現役年数"],
  ["bird", "badge", "渡り鳥"],
  ["bars", "badge", "能力"],
  ["sprout", "badge", "伸び盛り"],
  ["hall-of-fame", "badge", "殿堂入り"],
  ["diamond", "badge", "守備位置"],
  ["fan", "badge", "大型扇風機"],
  ["chest", "badge", "宝の持ち腐れ"],
  ["ops", "badge", "OPS"],
  ["best-nine", "badge", "ベストナイン"],
  ["pennant", "badge", "優勝"],
  ["horseshoe", "badge", "無事是名馬"],
  ["tower", "badge", "出場試合"],
  ["stairs", "badge", "二軍から頂点"],
  ["scoreboard", "badge", "通算スコア"],
  ["tape", "badge", "記録破り"],
  ["books", "badge", "記録の山"],
  ["bars3", "badge", "複数の能力"],
  ["tree", "badge", "大器晩成"],
  ["radar", "badge", "総合力"],
  ["radar-full", "badge", "全能力"],
  ["resume", "badge", "三つの経歴"],
  ["wind", "badge", "疾風"],
  ["fang", "badge", "怪物新人"],
  ["no-k", "badge", "三振しない"],
  ["cake", "badge", "45 歳"],
  ["power", "shop", "パワー"],
  ["winged-spike", "shop", "スピード"],
  ["catch", "shop", "捕球"],
  ["flame-heart", "shop", "メンタル"],
  ["contact", "shop", "コンタクト"],
  ["eye", "shop", "選球眼"],
  ["swing", "shop", "打撃技術"],
  ["slide", "shop", "盗塁技術"],
  ["route", "shop", "走塁技術"],
  ["pin", "shop", "ポジショニング"],
  ["range", "shop", "守備範囲"],
  ["arm", "shop", "肩力"],
  ["target", "shop", "送球"],
  ["protector", "shop", "ブロッキング"],
  ["frame", "shop", "フレーミング"],
  ["mask", "shop", "リード"],
  ["shield", "shop", "ケガ耐性"],
  ["first-aid", "shop", "回復"],
].map(([name, kind, title]) => ({
  name,
  kind,
  title,
  rows: readFileSync(`${here}shared/grids/${name}.txt`, "utf8").trimEnd().split("\n"),
}));

/** 字 c の升を、横に続く分ずつ長方形の path にする。 */
export function runs(rows, c) {
  const parts = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      if (row[x] !== c) {
        x++;
        continue;
      }
      let w = 0;
      while (row[x + w] === c) w++;
      parts.push(`M${x} ${y}h${w}v1h${-w}z`);
      x += w;
    }
  });
  return parts.join("");
}

function check({ name, rows }) {
  if (rows.length !== 16 || rows.some((r) => r.length !== 16))
    throw new Error(`${name}: 升目は 16 × 16 にする`);
  const bad = [...new Set(rows.join(""))].filter((c) => c !== "." && !COLORS[c]);
  if (bad.length) throw new Error(`${name}: 色の表にない字 ${bad.join(" ")}`);
}

function svg(asset) {
  check(asset);
  const used = Object.keys(COLORS).filter((c) => asset.rows.some((r) => r.includes(c)));
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" role="img" shape-rendering="crispEdges">`,
    `  <title>${asset.title}</title>`,
    ...used.map(
      (c) =>
        `  <path id="part-${asset.name}-${COLORS[c][0]}" d="${runs(asset.rows, c)}" fill="${COLORS[c][1]}"/>`,
    ),
    `</svg>`,
    "",
  ].join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const out = `${here}variants/pixel-16/source/`;
  mkdirSync(out, { recursive: true });
  for (const a of assets) writeFileSync(`${out}${a.name}.svg`, svg(a));

  // 比較ページ（previews/*.html）は同じ升目から描く。
  const grids = Object.fromEntries(assets.map((a) => [a.name, a.rows]));
  const colors = Object.fromEntries(Object.entries(COLORS).map(([c, [, hex]]) => [c, hex]));
  writeFileSync(
    `${here}previews/badge-grids.js`,
    `// shared/build-badges.mjs が書き出す。手で直さない。\nconst BADGE_GRIDS=${JSON.stringify(grids)};\nconst BADGE_COLORS=${JSON.stringify(colors)};\n`,
  );
}
