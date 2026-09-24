// SVG をそのまま inline で並べた比較ページ（HTML）を作る。ブラウザで拡大しても線がにじまない。
//
// 使い方: node --experimental-strip-types scripts/svg-compare.mjs <out.html> <sizes> <dir>... [--scheme <id>]
//   sizes  例: 16,20,24,64（実利用のサイズと、形を確かめる大きさ）
//   dir    例: experiments/foo/variants/a/dist（variant ごとの SVG の置き場。列になる）
//   scheme 例: pop-toy（color-schemes-material の配色。既定は wasabi）
//
// 行は asset（ファイル名）、列は variant × サイズ。ライトとダークを縦に並べる。
// 色は currentColor を文字色で継ぐ。多色の SVG の part-*-accent には、配色の primary-container を塗る。
// 利用画面での色の確認は、Experiment のモックで行う。このページは形と組の揃いを比べるためのもの。
import { readFileSync, readdirSync, writeFileSync } from "node:fs";
import { basename, dirname, resolve } from "node:path";
import { makePalette, schemes } from "../experiments/color-schemes-material/shared/palettes.ts";

const args = process.argv.slice(2);
const schemeIndex = args.indexOf("--scheme");
const schemeId = schemeIndex === -1 ? "wasabi" : args[schemeIndex + 1];
if (schemeIndex !== -1) args.splice(schemeIndex, 2);
const [out, sizesArg, ...dirs] = args;
if (!out || !sizesArg || dirs.length === 0) {
  console.error("usage: svg-compare.mjs <out.html> <sizes> <dir>... [--scheme <id>]");
  process.exit(2);
}
const scheme = schemes.find((item) => item.id === schemeId);
if (!scheme) {
  console.error(`error: 配色 ${schemeId} が無い（${schemes.map((item) => item.id).join(", ")}）`);
  process.exit(2);
}
const sizes = sizesArg.split(",").map(Number);

/** variant の名前。`variants/<id>/dist` なら `<id>`。 */
const variantName = (dir) => {
  const abs = resolve(dir);
  const leaf = basename(abs);
  return leaf === "dist" || leaf === "source" ? basename(dirname(abs)) : leaf;
};
const columns = dirs.map((dir) => ({
  name: variantName(dir),
  files: new Map(
    readdirSync(dir)
      .filter((file) => file.endsWith(".svg"))
      .map((file) => [file.replace(/\.svg$/, ""), readFileSync(`${dir}/${file}`, "utf8")]),
  ),
}));
const assets = [...new Set(columns.flatMap((column) => [...column.files.keys()]))];
const titleOf = (asset) => {
  for (const column of columns) {
    const match = column.files.get(asset)?.match(/<title>(.*?)<\/title>/);
    if (match) return match[1];
  }
  return asset;
};
// title は tooltip として出るので外す。名前は行の見出しが持つ。
const inline = (svg) => svg.replace(/<title>.*?<\/title>/, "");

const vars = (palette) =>
  `--ink:${palette["on-surface"]};--page:${palette.background};--muted:${palette["on-surface-variant"]};` +
  `--line:${palette["surface-variant"]};--accent:${palette["primary-container"]};`;

const table = (label, palette) => `
<section class="mode" style="${vars(palette)}">
  <h2>${label}</h2>
  <table>
    <thead>
      <tr><th></th>${columns.map((column) => `<th colspan="${sizes.length}"><code>${column.name}</code></th>`).join("")}</tr>
      <tr><th></th>${columns.map(() => sizes.map((size) => `<th>${size}</th>`).join("")).join("")}</tr>
    </thead>
    <tbody>
      ${assets
        .map(
          (asset) =>
            `<tr><th class="label">${titleOf(asset)}<br><code>${asset}</code></th>${columns
              .map((column) =>
                sizes
                  .map((size) => {
                    const svg = column.files.get(asset);
                    return `<td>${svg ? `<span class="icon" style="width:${size}px;height:${size}px">${inline(svg)}</span>` : "—"}</td>`;
                  })
                  .join(""),
              )
              .join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table>
</section>`;

const html = `<!doctype html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>SVG 比較</title>
<style>
body{margin:0;padding:24px 16px;font:14px/1.6 "Hiragino Sans",system-ui,sans-serif;background:#e9ecea;color:#1f1f1f}
h1{margin:0 0 4px;font-size:18px}
.lead{margin:0 0 16px;color:#4d4d4d}
.mode{margin-bottom:24px;padding:16px;overflow-x:auto;border-radius:14px;background:var(--page);color:var(--ink)}
.mode h2{margin:0 0 8px;font-size:15px}
table{border-collapse:collapse}
th,td{padding:6px 8px;text-align:center;vertical-align:middle}
thead th{color:var(--muted);font-size:12px;font-weight:400}
th.label{text-align:left;font-size:13px;white-space:nowrap}
th.label code{color:var(--muted);font-weight:400}
td:nth-child(${sizes.length}n+2){border-left:1px solid var(--line)}
.icon{display:inline-block;vertical-align:middle;color:var(--ink)}
.icon svg{display:block;width:100%;height:100%}
.icon [id$="-accent"]{fill:var(--accent);fill-opacity:1}
</style>
</head>
<body>
<h1>SVG 比較</h1>
<p class="lead">SVG をそのまま描いている。ブラウザで拡大しても線はにじまない。配色 <code>${scheme.id}</code>（${scheme.label}）。</p>
${table("ライト", makePalette(scheme, "light"))}
${table("ダーク", makePalette(scheme, "dark"))}
</body>
</html>
`;
writeFileSync(out, html);
console.log(`ok: ${resolve(out)}（${assets.length} asset × ${columns.length} 列）`);
