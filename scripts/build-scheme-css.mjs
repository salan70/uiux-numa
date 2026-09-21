// experiments/color-schemes-material/shared/palettes.ts から variant ごとの scheme.css を生成する。
// 派生色は HSL 演算とコントラスト探索で決まるため、値を Git に残さないと差分が読めない。
// Catalog は生成した CSS を読む。正本は palettes.ts のままにする。
import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";
import { makePalette, schemes } from "../experiments/color-schemes-material/shared/palettes.ts";

const checkOnly = process.argv.includes("--check");

// 出力する役割と並び。shared/ColorShowcase.tsx のグループ分けに揃える。
const ROLE_ORDER = [
  "primary",
  "on-primary",
  "primary-text",
  "primary-container",
  "on-primary-container",
  "secondary",
  "on-secondary",
  "secondary-container",
  "on-secondary-container",
  "tertiary",
  "on-tertiary",
  "tertiary-container",
  "on-tertiary-container",
  "background",
  "surface",
  "on-surface",
  "surface-container",
  "surface-variant",
  "on-surface-variant",
  "outline",
  "focus",
  "success",
  "warning",
  "error",
];

// 役割の区切り。読むときに系統の切れ目が分かるようにする。
const GROUP_STARTS = new Set(["secondary", "tertiary", "background", "success"]);

function block(scheme, mode, indent) {
  const palette = makePalette(scheme, mode);
  const missing = ROLE_ORDER.filter((role) => !palette[role]);
  if (missing.length > 0)
    throw new Error(`${scheme.id}/${mode}: 役割がない: ${missing.join(", ")}`);
  const extra = Object.keys(palette).filter((role) => !ROLE_ORDER.includes(role));
  if (extra.length > 0) throw new Error(`${scheme.id}/${mode}: 未知の役割: ${extra.join(", ")}`);

  // 行末の和名は基準色だけに付ける。派生色は演算結果なので、伝統色の名前を騙らない。
  const seedNames = {
    primary: scheme.primary.name,
    secondary: scheme.secondary.name,
    tertiary: scheme.tertiary.name,
  };

  const lines = [];
  for (const role of ROLE_ORDER) {
    if (GROUP_STARTS.has(role) && lines.length > 0) lines.push("");
    const name = seedNames[role];
    lines.push(`${indent}--color-${role}: ${palette[role]};${name ? ` /* ${name} */` : ""}`);
  }
  return lines.join("\n");
}

function render(scheme) {
  const selector = `:root:has(.cs-${scheme.id})`;
  return `/*
 * variant \`${scheme.id}\`（${scheme.label}）の配色。
 * shared/palettes.ts からの生成物。直接編集しない。
 * 値を変えるときは palettes.ts を直し、just schemes-build を実行する。
 */

${selector} {
${block(scheme, "light", "  ")}
}

@media (prefers-color-scheme: dark) {
  ${selector} {
${block(scheme, "dark", "    ")}
  }
}
`;
}

let stale = [];
for (const scheme of schemes) {
  const outputUrl = new URL(
    `../experiments/color-schemes-material/variants/${scheme.id}/scheme.css`,
    import.meta.url,
  );
  const output = render(scheme);
  if (checkOnly) {
    const current = await readFile(outputUrl, "utf8").catch(() => "");
    if (current !== output) stale.push(scheme.id);
    continue;
  }
  await writeFile(outputUrl, output);
}

if (checkOnly) {
  if (stale.length > 0) {
    console.error(`scheme.css が palettes.ts と一致しない: ${stale.join(", ")}`);
    console.error("just schemes-build を実行する");
    process.exitCode = 1;
  }
} else {
  console.log(`generated ${schemes.length} scheme.css`);
}
