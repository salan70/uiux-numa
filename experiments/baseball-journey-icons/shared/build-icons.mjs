// 原本（variants/pixel-12/source/*.svg）を、12 × 12 の升目の文字列から書き出す。
// 升目の文字列が正本で、Flutter の design system（baseball_player_journey の pixel_icons.dart）へ同じ文字列を写す。
// `#` が塗る升、`.` が空ける升。横に続く升を 1 本の長方形にまとめ、currentColor の単色で塗る。
// 実行: node experiments/baseball-journey-icons/shared/build-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;

/** asset の名前、読み上げの名前、升目。 */
export const icons = [
  {
    name: "check",
    title: "選択中",
    rows: [
      "............",
      "............",
      "..........##",
      ".........###",
      "........###.",
      "##.....###..",
      "###...###...",
      ".###.###....",
      "..#####.....",
      "...###......",
      "....#.......",
      "............",
    ],
  },
  {
    name: "minus",
    title: "減らす",
    rows: [
      "............",
      "............",
      "............",
      "............",
      "............",
      ".##########.",
      ".##########.",
      "............",
      "............",
      "............",
      "............",
      "............",
    ],
  },
  {
    name: "plus",
    title: "増やす",
    rows: [
      "............",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".##########.",
      ".##########.",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      ".....##.....",
      "............",
    ],
  },
  {
    name: "backspace",
    title: "1 字消す",
    rows: [
      "............",
      "............",
      "...#########",
      "..##########",
      ".####.##.###",
      "######..####",
      "######..####",
      ".####.##.###",
      "..##########",
      "...#########",
      "............",
      "............",
    ],
  },
  {
    name: "ball",
    title: "白球",
    rows: [
      "............",
      "....####....",
      "..##....##..",
      ".#.#....#.#.",
      ".#..#..#..#.",
      ".#..#..#..#.",
      ".#..#..#..#.",
      ".#..#..#..#.",
      ".#.#....#.#.",
      "..##....##..",
      "....####....",
      "............",
    ],
  },
];

/** 横に続く升を長方形の path にする。 */
export function runs(rows) {
  const parts = [];
  rows.forEach((row, y) => {
    for (let x = 0; x < row.length; ) {
      if (row[x] !== "#") {
        x++;
        continue;
      }
      let w = 0;
      while (row[x + w] === "#") w++;
      parts.push(`M${x} ${y}h${w}v1h${-w}z`);
      x += w;
    }
  });
  return parts.join("");
}

function svg({ name, title, rows }) {
  if (rows.length !== 12 || rows.some((r) => r.length !== 12)) {
    throw new Error(`${name}: 升目は 12 × 12 にする`);
  }
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" role="img" shape-rendering="crispEdges">`,
    `  <title>${title}</title>`,
    `  <path id="part-${name}-pixels" d="${runs(rows)}" fill="currentColor"/>`,
    `</svg>`,
    "",
  ].join("\n");
}

const out = `${here}variants/pixel-12/source/`;
mkdirSync(out, { recursive: true });
for (const icon of icons) writeFileSync(`${out}${icon.name}.svg`, svg(icon));
