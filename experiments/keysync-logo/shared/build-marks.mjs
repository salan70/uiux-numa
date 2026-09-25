// 第 1 世代の原本（variants/<id>/source/mark.svg）を書き出す。
// 骨格は uiux-numa-logo と同じ: viewBox 0 0 32 32、live area 4..28、線幅 3、丸い端点。
// 比喩の系統を 4 つ（キーキャップが揃う、文字 K、同期の矢印や円環、盤面の抽象化）に分け、各 2〜3 案を下書きで描く。
// 色は currentColor だけを使う。多色版の役割は part の id の末尾で示し、利用画面の CSS が塗る。
//   -accent   : 黄（Pop Toy の primary）。塗りの part だけに付ける
//   -accent-2 : 青（secondary）
//   -accent-3 : 赤橙（tertiary）
// 実行: node experiments/keysync-logo/shared/build-marks.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;
const r2 = (n) => Math.round(n * 100) / 100;

/** 角丸の長方形の輪郭（時計回り）。 */
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

/** 多角形の輪郭。 */
const poly = (points) => `M${points.map(([x, y]) => `${r2(x)} ${r2(y)}`).join(" L")} Z`;

/** 中心 c、半径 r の円弧の上の点。角度は度、0° が右、時計回りが正。 */
function at([cx, cy], r, deg) {
  const t = (deg * Math.PI) / 180;
  return [cx + r * Math.cos(t), cy + r * Math.sin(t)];
}

/** 時計回りの円弧と、終点に置く矢じり（塗りの三角）。 */
function arcArrow(c, r, from, to, head) {
  const [sx, sy] = at(c, r, from);
  const [ex, ey] = at(c, r, to);
  const large = to - from > 180 ? 1 : 0;
  const arc = `M${r2(sx)} ${r2(sy)} A${r} ${r} 0 ${large} 1 ${r2(ex)} ${r2(ey)}`;
  const t = (to * Math.PI) / 180;
  const tangent = [-Math.sin(t), Math.cos(t)];
  const normal = [Math.cos(t), Math.sin(t)];
  const tip = [ex + tangent[0] * head, ey + tangent[1] * head];
  const a = [ex + normal[0] * head, ey + normal[1] * head];
  const b = [ex - normal[0] * head, ey - normal[1] * head];
  return { arc, head: poly([tip, a, b]) };
}

/** part の定義。fill は塗り（evenodd で穴を抜ける）、stroke は線。 */
const fill = (d, extra = "") => ({ kind: "fill", d, extra });
const stroke = (d) => ({ kind: "stroke", d });

// 文字 K の輪郭。縦画 4、斜画は 45° で太さ 5/√2 ≈ 3.54。
// 斜画の外縁は x+y=33 と x−y=1、内縁は x+y=28 と x−y=−4 に載る。
const letterK = poly([
  [10, 9],
  [14, 9],
  [14, 14],
  [19, 9],
  [24, 9],
  [17, 16],
  [24, 23],
  [19, 23],
  [14, 18],
  [14, 23],
  [10, 23],
]);

const ringCap = (() => {
  const c = [16, 16];
  const top = arcArrow(c, 10.5, 190, 318, 3);
  const bottom = arcArrow(c, 10.5, 10, 138, 3);
  return { top, bottom };
})();

const MARKS = {
  // 系統 1: キーキャップが揃う
  // 同じ刻印（左上の縦の刻み）を持つ 2 個のキーキャップを並べる。
  // round 1: 刻印を下寄せの横棒（ホームポジションの突起）にすると、2 個の目と口の顔に読めたので、左上の縦の刻みへ移した。
  // round 2〜3: 刻みを移しても左右対称では目に読めた。幅を 9 と 12 に変えて対称を崩したが、目の読みは残った（未解決）。
  "caps-pair": {
    left: fill(`${rr(4, 10, 9, 12, 3)} ${rr(6.5, 12.5, 2, 4, 1)}`),
    "right-accent-2": fill(`${rr(16, 10, 12, 12, 3)} ${rr(18.5, 12.5, 2, 4, 1)}`),
  },
  // 2×2 のキーキャップのうち 3 個が揃い、1 個だけ輪郭で残る（これから揃える 1 個）。
  "caps-grid": {
    "a-accent": fill(rr(4, 4, 10, 10, 3)),
    "b-accent-2": fill(rr(18, 4, 10, 10, 3)),
    "c-accent-3": fill(rr(4, 18, 10, 10, 3)),
    d: stroke(rr(19.5, 19.5, 7, 7, 2)),
  },
  // 奥のキーキャップ（輪郭）に手前のキーキャップ（塗り）を重ねる。重なりは隙間 2 で切る。
  "caps-stack": {
    "back-accent-2": stroke(
      "M18.5 9.5 V9 A3.5 3.5 0 0 0 15 5.5 H9 A3.5 3.5 0 0 0 5.5 9 V15 A3.5 3.5 0 0 0 9 18.5 H9.5",
    ),
    "front-accent": fill(rr(13, 13, 15, 15, 4.5)),
  },

  // 系統 2: 文字 K を核にする
  // キーキャップの天面に K を抜く。
  "k-cap": {
    "cap-accent": fill(`${rr(4, 4, 24, 24, 7)} ${letterK}`),
  },
  // K の 2 本の斜画を、外へ出る矢印と内へ入る矢印にする。
  "k-sync": {
    stem: stroke("M9 6 V26"),
    "out-accent-2": stroke("M12 15 L22 5"),
    "out-head-accent-2": stroke("M16 5 H22 V11"),
    "in-accent-3": stroke("M25 26 L15 16"),
    "in-head-accent-3": stroke("M15 22 V16 H21"),
  },
  // K をキーキャップの組で組む。縦画は縦長のキー、斜画は 45° に傾けた 2 個のキー。
  "k-keys": {
    "stem-accent": fill(rr(5, 4, 7, 24, 2.5)),
    "upper-accent-2": fill(rr(15, 7, 10, 6, 2), ' transform="rotate(-45 20 10)"'),
    "lower-accent-3": fill(rr(16, 20, 10, 6, 2), ' transform="rotate(45 21 23)"'),
  },

  // 系統 3: 同期の矢印や円環
  // 中央のキーキャップを、2 本の円弧の矢印が巡る。
  "ring-cap": {
    "cap-accent": fill(rr(11, 11, 10, 10, 3)),
    "top-accent-2": stroke(ringCap.top.arc),
    "top-head-accent-2": fill(ringCap.top.head),
    "bottom-accent-3": stroke(ringCap.bottom.arc),
    "bottom-head-accent-3": fill(ringCap.bottom.head),
  },
  // 対角に置いた 2 個のキーキャップを、180° 回転の関係にある 2 本の矢印で結ぶ。
  "swap-caps": {
    "a-accent": fill(rr(4, 4, 10, 10, 3)),
    "b-accent-2": fill(rr(18, 18, 10, 10, 3)),
    "to-b-accent-3": stroke("M17 9 H19 A4 4 0 0 1 23 13 V13.5"),
    "to-b-head-accent-3": fill(
      poly([
        [23, 17],
        [20, 13.5],
        [26, 13.5],
      ]),
    ),
    "to-a": stroke("M15 23 H13 A4 4 0 0 1 9 19 V18.5"),
    "to-a-head": fill(
      poly([
        [9, 15],
        [12, 18.5],
        [6, 18.5],
      ]),
    ),
  },

  // 系統 4: キーボードの盤面を抽象化する
  // 3 段の盤面から 1 個のキーだけが浮き上がり、元の位置が空く（割り当てを変えたキー）。
  "board-pop": {
    keys: fill(
      [
        rr(5, 10, 4, 4, 1.25),
        rr(11, 10, 4, 4, 1.25),
        rr(23, 10, 4, 4, 1.25),
        rr(5, 16, 4, 4, 1.25),
        rr(11, 16, 4, 4, 1.25),
        rr(17, 16, 4, 4, 1.25),
        rr(23, 16, 4, 4, 1.25),
        rr(5, 22, 4, 4, 1.25),
        rr(23, 22, 4, 4, 1.25),
      ].join(" "),
    ),
    "space-accent-2": fill(rr(11, 22, 10, 4, 1.25)),
    "pop-accent": fill(rr(17, 3, 4, 4, 1.25)),
  },
  // 2 台の盤面（上下の 1 段）を、同じ列の 1 本の縦長キーが貫く（同じ割り当てを共有する）。
  "board-link": {
    "top-accent": fill(
      [rr(4, 5, 4.5, 5.5, 1.5), rr(10.5, 5, 4.5, 5.5, 1.5), rr(23.5, 5, 4.5, 5.5, 1.5)].join(" "),
    ),
    "bottom-accent-2": fill(
      [
        rr(4, 21.5, 4.5, 5.5, 1.5),
        rr(10.5, 21.5, 4.5, 5.5, 1.5),
        rr(23.5, 21.5, 4.5, 5.5, 1.5),
      ].join(" "),
    ),
    "shared-accent-3": fill(rr(17, 5, 4.5, 22, 2.25)),
  },
};

for (const [id, parts] of Object.entries(MARKS)) {
  const body = Object.entries(parts)
    .map(([role, part]) =>
      part.kind === "fill"
        ? `  <path id="part-mark-${role}" fill="currentColor" fill-rule="evenodd" d="${part.d}"${part.extra}/>`
        : `  <path id="part-mark-${role}" fill="none" stroke="currentColor" d="${part.d}"/>`,
    )
    .join("\n");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" role="img" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">`,
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
