/* ---------- ドット絵の描画：badge-grids.js（shared/build-badges.mjs が書き出す升目）から描く ---------- */
const P = BADGE_COLORS;
const LOCK = {
  k: "#A3AAA6",
  w: "#F6F7F7",
  y: "#D6DBD8",
  r: "#D6DBD8",
  b: "#D6DBD8",
  g: "#D6DBD8",
  t: "#D6DBD8",
  s: "#D6DBD8",
  n: "#D6DBD8",
};
/* ページ内の短い名前 → asset の名前 */
const KEY = {
  hit: "hit",
  hr: "home-run",
  steal: "steal",
  crown: "mvp",
  glove: "golden-glove",
  hall: "hall-of-fame",
  ticket: "gacha-ticket",
  coin: "coin",
  up: "power-up",
  care: "care",
  aid: "training",
  pack: "pack",
};
function pixSvg(key, px, locked) {
  const rows = BADGE_GRIDS[KEY[key] || key],
    pal = locked ? LOCK : P;
  let out = "";
  if (!rows) return `<svg width="${px}" height="${px}" aria-hidden="true"></svg>`;
  rows.forEach((row, y) => {
    let x = 0;
    while (x < 16) {
      const c = row[x];
      if (c === ".") {
        x++;
        continue;
      }
      let e = x;
      while (e < 16 && row[e] === c) e++;
      out += `<rect x="${x}" y="${y}" width="${e - x}" height="1" fill="${pal[c]}"/>`;
      x = e;
    }
  });
  return `<svg width="${px}" height="${px}" viewBox="0 0 16 16" shape-rendering="crispEdges" aria-hidden="true">${out}</svg>`;
}
