// ぷろやきう選手ものがたり（ですてにい版）のアプリアイコンの原本を書き出す。
// 比喩は選手の顔のドット絵（利用者が選んだ、2026-10-20）。
// 升目と色の正本は baseball_player_journey の packages/shared/lib/face/player_face.dart。
// 変える軸は「地」（day: primary の黄、night: 夜の球場の緑）と「大きさ」（bust: 1 升 52、fill: 1 升 64）の 2 つ。
// 実行: node experiments/destiny-app-icon/shared/build-icons.mjs
import { mkdirSync, writeFileSync } from "node:fs";

const here = new URL("../", import.meta.url).pathname;

// k: 輪郭、c: 帽子、b: つば、w: 帽子の印、s: 肌、e: 目、p: 頬、m: 口、u: ユニフォーム、n: 胸の番号、h: 髪。
const base = [
  "................",
  ".....kkkkkk.....",
  "....kcccccck....",
  "...kcccwwccck...",
  "...kcccccccck...",
  "...kbbbbbbbbbbk.",
  "...kssssssssk...",
  "...ksesssessk...",
  "...kpssssspsk...",
  "...ksssmmsssk...",
  "....kssssssk....",
  "......kssk......",
  "...kkuuuuuukk...",
  "..kuuuunnuuuuk..",
  ".kuuuuunnuuuuuk.",
  ".kuuuuunnuuuuuk.",
];

// 顔は HairStyle.sideburns、髪は黒、肌は 2 番目。もみあげで帽子と顔の境を締める。
function sprite() {
  const rows = base.map((r) => r.split(""));
  for (const [y, x] of [
    [6, 4],
    [7, 4],
    [6, 11],
    [7, 11],
  ])
    rows[y][x] = "h";
  return rows.map((r) => r.join(""));
}

const ink = "#120D09";
const paper = "#FFFDF9";
const lerp = (a, b, t) => {
  const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [x, y] = [p(a), p(b)];
  return "#" + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, "0")).join("").toUpperCase();
};

function palette(team) {
  return {
    k: ink,
    c: team,
    b: lerp(team, ink, 0.45),
    w: team === "#FAC400" ? ink : paper,
    s: "#F5CFA8",
    h: "#231A14",
    e: ink,
    p: "#F39A82",
    m: "#B5452E",
    u: paper,
    n: team,
  };
}

const grounds = {
  // §15.1 の primary。地に影の帯を敷かず、平らに塗る。
  day: { team: "#4078E0", field: "#FAC400", stripe: null },
  // §15.1 の夜の球場。芝の刈り目を 2 升ごとの帯で敷く。
  night: { team: "#FAC400", field: "#0F2A1C", stripe: "#133523" },
};

// bust は胸像の外縁（列 1..14、行 1..15）を 14 × 52 = 728 にして左右に 148 ずつ空け、下端を辺に付ける。
// fill は 1 升 64 で、16 升がちょうど 1024 に収まる。上 1 行は空で、胸は辺で切れる。
const sizes = {
  bust: { cell: 52, x0: 148 - 52, y0: 1024 - 16 * 52 },
  fill: { cell: 64, x0: 0, y0: 0 },
};

function svg(groundId, sizeId) {
  const g = grounds[groundId];
  const { cell, x0, y0 } = sizes[sizeId];
  const colors = palette(g.team);
  const parts = new Map();
  const add = (key, d) => parts.set(key, (parts.get(key) ?? "") + d);
  // 同じ色の横の続きを 1 本の矩形にまとめる。
  sprite().forEach((row, y) => {
    let x = 0;
    while (x < 16) {
      const ch = row[x];
      let end = x + 1;
      while (end < 16 && row[end] === ch) end++;
      if (ch !== ".") add(colors[ch], `M${x0 + x * cell} ${y0 + y * cell}h${(end - x) * cell}v${cell}h${-(end - x) * cell}z`);
      x = end;
    }
  });
  let stripes = "";
  if (g.stripe) {
    const band = 128;
    let d = "";
    for (let y = band; y < 1024; y += band * 2) d += `M0 ${y}h1024v${band}h-1024z`;
    stripes = `\n  <path id="part-icon-stripe" fill="${g.stripe}" d="${d}"/>`;
  }
  const body = [...parts].map(([fill, d], i) => `  <path id="part-icon-px-${i}" fill="${fill}" d="${d}"/>`).join("\n");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" role="img">
  <title>ぷろやきう選手ものがたり</title>
  <path id="part-icon-field" fill="${g.field}" d="M0 0h1024v1024h-1024z"/>${stripes}
${body}
</svg>
`;
}

const variants = [];
for (const groundId of Object.keys(grounds)) {
  for (const sizeId of Object.keys(sizes)) {
    const id = `${groundId}-${sizeId}`;
    const dir = `${here}variants/${id}/source`;
    mkdirSync(dir, { recursive: true });
    const text = svg(groundId, sizeId);
    writeFileSync(`${dir}/icon.svg`, text);
    variants.push({ id, uri: `data:image/svg+xml;base64,${Buffer.from(text).toString("base64")}` });
  }
}

// 比較ページ。同じ SVG を何度も並べるので、id の重複を避けて data URI の img にする。
// iOS の角丸は 1024 で半径 229（約 22.4%）の近似。
const others = ["#FF6B5B", "#34C759", "#5AC8FA", "#AF52DE", "#FF9500", "#8E8E93", "#007AFF"];
const tile = (v, px) => `<img class="ic" src="${v.uri}" width="${px}" height="${px}" alt="">`;
const home = (v, wall, label) => {
  const apps = Array.from({ length: 16 }, (_, i) =>
    i === 5
      ? `<div class="app">${tile(v, 60)}<span>ぷろやきう選…</span></div>`
      : `<div class="app"><div class="ic dummy" style="background:${others[i % others.length]}"></div><span>App</span></div>`,
  ).join("");
  return `<div class="phone" style="background:${wall}" aria-label="${label}">${apps}</div>`;
};
const rows = variants
  .map(
    (v) => `<section><h2>${v.id}</h2><div class="sizes">${[180, 120, 87, 60, 40, 29]
      .map((px) => `<figure>${tile(v, px)}<figcaption>${px}</figcaption></figure>`)
      .join("")}</div><div class="homes">${home(v, "linear-gradient(160deg,#9ec5f0,#f3d9e8)", "明るい壁紙")}${home(
      v,
      "linear-gradient(160deg,#1b1f2a,#3a2f4a)",
      "暗い壁紙",
    )}</div></section>`,
  )
  .join("\n");
writeFileSync(
  `${here}previews/compare.html`,
  `<!doctype html><html lang="ja"><meta charset="utf-8"><title>ですてにい版のアプリアイコン 4 案</title>
<style>
body{font-family:system-ui,sans-serif;margin:0}
h1{font-size:20px}h2{font-size:16px;margin:24px 0 8px}
.ic{border-radius:22.4%;display:block;image-rendering:pixelated}
.sizes{display:flex;gap:20px;align-items:flex-end}
figure{margin:0;text-align:center}figcaption{font-size:11px;opacity:.7;margin-top:4px}
.homes{display:flex;gap:16px;margin-top:12px}
.phone{display:grid;grid-template-columns:repeat(4,60px);gap:22px 20px;padding:24px 20px;border-radius:28px}
.app{display:flex;flex-direction:column;align-items:center;gap:4px}
.app span{font-size:10px;color:#fff;text-shadow:0 1px 2px #0008;white-space:nowrap}
.dummy{width:60px;height:60px}
</style>
<h1>ですてにい版のアプリアイコン 4 案（地: day / night、大きさ: bust / fill）</h1>
${rows}
</html>
`,
);
