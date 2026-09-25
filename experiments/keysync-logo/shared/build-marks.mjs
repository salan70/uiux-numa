// 採用した tilt-confetti の原本（variants/tilt-confetti/source/mark.svg）を書き出す。
// 骨格は uiux-numa-logo と同じ: viewBox 0 0 32 32、live area 4..28。
// 経緯: 第 1 世代（比喩 4 系統 10 案）から board-pop、第 2 世代（1 軸ずつの派生 7 案）から pop-tilt と pop-confetti、
// 第 3 世代（2 案の合成と K と S の 3 案）から tilt-confetti を、利用者が選んだ（2026-09-25）。
// 削除した案の仮説と軸は README の「削除した variant」、形は previews/compare-*.html にある。
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
const key = (x, y, w = K, h = K, r = R) => rr(x, y, w, h, r);

const space = key(10, ROW[2], 10, K);

// 浮いたキーの姿勢。-15° 傾ける。
// 傾けた 4 角の外接は ±2.73。中心を (18, 6.75) に下げ、上端を 4.02 に収める。
const TILT = ' transform="rotate(-15 18 6.75)"';
const tiltedPop = fill(key(16, 4.75), TILT);

// 盤面のキーを 3 色と墨に散らす。浮いたキーの黄と重ならないよう、盤面には青と赤橙と墨だけを使う。
const confetti = {
  keys: fill([key(COL[1], ROW[0]), key(COL[0], ROW[1]), key(COL[3], ROW[1]), space].join(" ")),
  "blue-accent-2": fill([key(COL[0], ROW[0]), key(COL[2], ROW[1]), key(COL[3], ROW[2])].join(" ")),
  "coral-accent-3": fill([key(COL[3], ROW[0]), key(COL[1], ROW[1]), key(COL[0], ROW[2])].join(" ")),
};

const MARKS = {
  // 盤面から 1 個のキーだけが傾いて浮く。盤面のキーは 3 色と墨に散らす。
  "tilt-confetti": {
    ...confetti,
    "pop-accent": tiltedPop,
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
