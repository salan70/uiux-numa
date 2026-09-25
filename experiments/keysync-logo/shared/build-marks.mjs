// 原本（variants/<id>/source/mark.svg）を書き出す。
// 骨格は uiux-numa-logo と同じ: viewBox 0 0 32 32、live area 4..28、丸い端点。
// 第 2 世代は、利用者が第 1 世代から選んだ board-pop（盤面から 1 個のキーだけが浮く）を骨格に、1 軸ずつ変えた派生を作った。
// 第 3 世代は、利用者が第 2 世代から選んだ pop-tilt と pop-confetti を合わせ、K と S を読ませる 3 案を足す。
// 削除した案の仮説と軸は README の「削除した variant」にある。
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

// 浮いたキーの姿勢。-15° 傾ける（第 2 世代の pop-tilt）。
// 傾けた 4 角の外接は ±2.73。中心を (18, 6.75) に下げ、上端を 4.02 に収める。
const TILT = ' transform="rotate(-15 18 6.75)"';
const tiltedPop = fill(key(16, 4.75), TILT);

// 盤面のキーを 3 色と墨に散らす配り方（第 2 世代の pop-confetti）。
const confetti = {
  keys: fill([key(COL[1], ROW[0]), key(COL[0], ROW[1]), key(COL[3], ROW[1]), space].join(" ")),
  "blue-accent-2": fill([key(COL[0], ROW[0]), key(COL[2], ROW[1]), key(COL[3], ROW[2])].join(" ")),
  "coral-accent-3": fill([key(COL[3], ROW[0]), key(COL[1], ROW[1]), key(COL[0], ROW[2])].join(" ")),
};

/** 文字 K の輪郭。第 1 世代の k-cap と同じ作図（縦画 4、斜画 45°、14 角）を、左上 (x, y)、一辺 size へ縮める。 */
function letterK(x, y, size) {
  const s = size / 14;
  const pts = [
    [0, 0],
    [4, 0],
    [4, 5],
    [9, 0],
    [14, 0],
    [7, 7],
    [14, 14],
    [9, 14],
    [4, 9],
    [4, 14],
    [0, 14],
  ];
  return `M${pts.map(([px, py]) => `${r2(x + px * s)} ${r2(y + py * s)}`).join(" L")} Z`;
}

const MARKS = {
  // 第 2 世代から残した 2 案。利用者が「いい感じ」とした（2026-09-25）。
  "pop-tilt": {
    keys: fill(baseKeys.join(" ")),
    "space-accent-2": fill(space),
    "pop-accent": tiltedPop,
  },
  "pop-confetti": {
    ...confetti,
    "pop-accent": fill(key(POP.x, POP.y)),
  },

  // 第 3 世代の基準。pop-tilt の姿勢と pop-confetti の色を合わせる。
  "tilt-confetti": {
    ...confetti,
    "pop-accent": tiltedPop,
  },

  // 軸: 色を置く位置。2 段目をホーム段とみなし、4 列を左手の薬指と中指、右手の中指と薬指に当てる。
  // QWERTY で S は左手の薬指、K は右手の中指なので、1 列目を S、3 列目を K として色を変える。ほかは墨。
  "ks-home": {
    keys: fill(
      [
        key(COL[0], ROW[0]),
        key(COL[1], ROW[0]),
        key(COL[3], ROW[0]),
        key(COL[1], ROW[1]),
        key(COL[3], ROW[1]),
        key(COL[0], ROW[2]),
        space,
        key(COL[3], ROW[2]),
      ].join(" "),
    ),
    "s-accent-2": fill(key(COL[0], ROW[1])),
    "k-accent-3": fill(key(COL[2], ROW[1])),
    "pop-accent": tiltedPop,
  },

  // 軸: 盤面の並び。キーを 3×3 に置き、6 個で K の字を組む。上の腕のキーだけが傾いて浮く。
  // キーは 6 角、角丸 2、ピッチ 8。列 x = 4, 12, 20、段 y = 6, 14, 22（外縁 4..26 × 6..28）。
  // 浮いたキーの外接は ±3.67（3 × (cos15° + sin15°)）。中心 (24, 7.75) で上端 4.08、右端 27.67。
  "k-grid": {
    keys: fill([rr(4, 6, 6, 6, 2), rr(4, 14, 6, 6, 2), rr(4, 22, 6, 6, 2)].join(" ")),
    "mid-accent-2": fill(rr(12, 14, 6, 6, 2)),
    "leg-accent-3": fill(rr(20, 22, 6, 6, 2)),
    "pop-accent": fill(rr(21, 4.75, 6, 6, 2), ' transform="rotate(-15 24 7.75)"'),
  },

  // 軸: 浮いたキーの刻印。浮いたキーを 8 角に大きくし、K を抜く。盤面は 2 段に減らして場所を空ける。
  // 盤面の段は y = 18, 24（外縁 18..28）。浮いたキーは中心 (18, 9)、外接 ±4.9（4 × (cos15° + sin15°)）で 4.1..13.9。
  // K は一辺 4.5（字画 1.29、64px で 2.6px）。16px では刻印が潰れる。
  "k-legend": {
    keys: fill([key(COL[1], 18), key(COL[3], 18), key(10, 24, 10, K)].join(" ")),
    "blue-accent-2": fill([key(COL[0], 18), key(COL[3], 24)].join(" ")),
    "coral-accent-3": fill(key(COL[0], 24)),
    "pop-accent": fill(
      `${rr(14, 5, 8, 8, 2.5)} ${letterK(15.75, 6.75, 4.5)}`,
      ' transform="rotate(-15 18 9)"',
    ),
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
