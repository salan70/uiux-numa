// 原本（variants/<id>/source/mark.svg）を書き出す。
// 骨格は uiux-numa-logo と同じ: viewBox 0 0 32 32、live area 4..28、丸い端点。
// 第 2 世代は、利用者が第 1 世代から選んだ board-pop（盤面から 1 個のキーだけが浮く）を骨格に、1 軸ずつ変えた派生を作る。
// 第 1 世代のほかの 9 案は削除した。仮説と軸は README の「削除した variant」にある。
// 色は currentColor だけを使う。多色版の役割は part の id の末尾で示し、利用画面の CSS が塗る。
//   -accent   : 黄（Pop Toy の primary）。塗りの part だけに付ける
//   -accent-2 : 青（secondary）
//   -accent-3 : 赤橙（tertiary）
// 実行: node experiments/keysync-logo/shared/build-marks.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;
const r2 = (n) => Math.round(n * 100) / 100;

/** 角丸の長方形の輪郭（時計回り）。r が一辺の半分なら円になる。 */
function rr(x, y, w, h, r) {
  return [
    `M${r2(x + r)} ${r2(y)}`,
    `H${r2(x + w - r)}`,
    `A${r} ${r} 0 0 1 ${r2(x + w)} ${r2(y + r)}`,
    `V${r2(y + h - r)}`,
    `A${r} ${r} 0 0 1 ${r2(x + w - r)} ${r2(y + h)}`,
    `H${r2(x + r)}`,
    `A${r} ${r} 0 0 1 ${r2(x)} ${r2(y + h - r)}`,
    `V${r2(y + r)}`,
    `A${r} ${r} 0 0 1 ${r2(x + r)} ${r2(y)}`,
    "Z",
  ].join(" ");
}

/** part の定義。fill は塗り（evenodd で穴を抜ける）。 */
const fill = (d, extra = "") => ({ d, extra });

// 盤面の格子。キーは 4 角、隙間 2、ピッチ 6。列は x = 4, 10, 16, 22（外縁 4..26）。
// 段は y = 12, 18, 24（外縁 12..28）。浮いたキーは 1 段目の 3 列目から抜け、y = 4 に置く（外縁 4..8、元の位置との間は 4）。
// 座標をすべて偶数にし、16px（1/2 倍）で整数ピクセルに載せる（SVG-01）。横は中心が 15 になり、左へ 1 ずれる。
// 第 1 世代は列 5, 11, 17, 23、段 10, 16, 22、浮いたキー y = 3 で、live area の上を 1 越え、16px で滲んでいた（round 1 で直した）。
const K = 4;
const R = 1.25;
const COL = [4, 10, 16, 22];
const ROW = [12, 18, 24];
const POP = { x: 16, y: 4 };
const key = (x, y, w = K, h = K, r = R) => rr(x, y, w, h, r);

/** 基準の盤面（浮いたキーの元の位置と、3 段目の中央を空けた 8 個）。 */
const baseKeys = [
  key(COL[0], ROW[0]),
  key(COL[1], ROW[0]),
  key(COL[3], ROW[0]),
  key(COL[0], ROW[1]),
  key(COL[1], ROW[1]),
  key(COL[2], ROW[1]),
  key(COL[3], ROW[1]),
  key(COL[0], ROW[2]),
  key(COL[3], ROW[2]),
];
const space = key(10, ROW[2], 10, K);

const MARKS = {
  // 基準。第 1 世代の board-pop を live area に収めた版。
  "board-pop": {
    keys: fill(baseKeys.join(" ")),
    "space-accent-2": fill(space),
    "pop-accent": fill(key(POP.x, POP.y)),
  },

  // 軸: 浮いたキーの姿勢。-15° 傾け、跳ねた途中に見せる。
  // 傾けた 4 角の外接は ±2.73。中心を (18, 6.75) に下げ、上端を 4.02 に収める。
  "pop-tilt": {
    keys: fill(baseKeys.join(" ")),
    "space-accent-2": fill(space),
    "pop-accent": fill(key(16, 4.75), ' transform="rotate(-15 18 6.75)"'),
  },

  // 軸: 粒度。キーを 6 角、2 段に減らし、16px で 1 個ずつが 3px になるようにする。
  // 列は x = 4, 12, 20（外縁 4..26）。1 段目は y = 14、2 段目は幅 22 のスペースバー。浮いたキーは y = 4。
  "pop-bold": {
    keys: fill([rr(4, 14, 6, 6, 2), rr(20, 14, 6, 6, 2)].join(" ")),
    "space-accent-2": fill(rr(4, 22, 22, 6, 2)),
    "pop-accent": fill(rr(12, 4, 6, 6, 2)),
  },

  // 軸: 元の位置の示し方。空いた位置に、太さ 1.25 の輪郭を残す。
  "pop-ghost": {
    keys: fill(baseKeys.join(" ")),
    slot: fill(`${key(COL[2], ROW[0])} ${rr(17.25, 13.25, 1.5, 1.5, 0.5)}`),
    "space-accent-2": fill(space),
    "pop-accent": fill(key(POP.x, POP.y)),
  },

  // 軸: 段のずれ。2 段目を右へ 2 ずらし、実際のキーボードの千鳥に近づける。右端は 24..28 で live area に収まる。
  "pop-stagger": {
    keys: fill(
      [
        key(COL[0], ROW[0]),
        key(COL[1], ROW[0]),
        key(COL[3], ROW[0]),
        key(6, ROW[1]),
        key(12, ROW[1]),
        key(18, ROW[1]),
        key(24, ROW[1]),
        key(COL[0], ROW[2]),
        key(COL[3], ROW[2]),
      ].join(" "),
    ),
    "space-accent-2": fill(space),
    "pop-accent": fill(key(POP.x, POP.y)),
  },

  // 軸: キーの形。角丸を一辺の半分にして丸い粒にする（ペグボードのおもちゃ）。
  "pop-dots": {
    keys: fill(
      [
        [COL[0], ROW[0]],
        [COL[1], ROW[0]],
        [COL[3], ROW[0]],
        [COL[0], ROW[1]],
        [COL[1], ROW[1]],
        [COL[2], ROW[1]],
        [COL[3], ROW[1]],
        [COL[0], ROW[2]],
        [COL[3], ROW[2]],
      ]
        .map(([x, y]) => rr(x, y, K, K, K / 2))
        .join(" "),
    ),
    "space-accent-2": fill(rr(10, ROW[2], 10, K, K / 2)),
    "pop-accent": fill(rr(POP.x, POP.y, K, K, K / 2)),
  },

  // 軸: 動きの示し方。浮いたキーの左右に、幅 2 の短い線を隙間 2 で 1 本ずつ添える。
  "pop-motion": {
    keys: fill(baseKeys.join(" ")),
    "space-accent-2": fill(space),
    "pop-accent": fill(key(POP.x, POP.y)),
    "spark-accent-3": fill([rr(12, 4.5, 2, 3, 1), rr(22, 4.5, 2, 3, 1)].join(" ")),
  },

  // 軸: 色の配り方。形は基準と同じにし、盤面のキーを 3 色と墨に散らす（多色版だけで差が出る）。
  "pop-confetti": {
    keys: fill([key(COL[1], ROW[0]), key(COL[0], ROW[1]), key(COL[3], ROW[1]), space].join(" ")),
    "blue-accent-2": fill(
      [key(COL[0], ROW[0]), key(COL[2], ROW[1]), key(COL[3], ROW[2])].join(" "),
    ),
    "coral-accent-3": fill(
      [key(COL[3], ROW[0]), key(COL[1], ROW[1]), key(COL[0], ROW[2])].join(" "),
    ),
    "pop-accent": fill(key(POP.x, POP.y)),
  },
};

for (const [id, parts] of Object.entries(MARKS)) {
  const body = Object.entries(parts)
    .map(
      ([role, part]) =>
        `  <path id="part-mark-${role}" fill="currentColor" fill-rule="evenodd" d="${part.d}"${part.extra}/>`,
    )
    .join("\n");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img">`,
    `  <title>KeySync</title>`,
    body,
    `</svg>`,
    "",
  ].join("\n");
  const dir = `${here}variants/${id}/source`;
  mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/mark.svg`, svg);
}

console.log(Object.keys(MARKS).join("\n"));
