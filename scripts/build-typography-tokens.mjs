import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const sourceUrl = new URL("../tokens/typography/typography.tokens.json", import.meta.url);
const outputUrl = new URL("../tokens/typography/typography.css", import.meta.url);
const checkOnly = process.argv.includes("--check");
const requiredTypographyFields = [
  "fontFamily",
  "fontSize",
  "fontWeight",
  "letterSpacing",
  "lineHeight",
];

const source = JSON.parse(await readFile(sourceUrl, "utf8"));
const tokens = new Map();

function collect(value, path = [], inheritedType) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const type = value.$type ?? inheritedType;
  if (Object.hasOwn(value, "$value")) {
    const name = path.join(".");
    if (!type) throw new Error(`${name}: $type がない`);
    if (!value.$description) throw new Error(`${name}: $description がない`);
    tokens.set(name, { type, value: value.$value });
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    if (!key.startsWith("$")) collect(child, [...path, key], type);
  }
}

collect(source);

const primitiveCount = [...tokens.values()].filter((token) => token.type !== "typography").length;
const semanticCount = [...tokens.values()].filter((token) => token.type === "typography").length;
if (primitiveCount !== 10) throw new Error(`primitive は 10 個に固定する: ${primitiveCount} 個`);
if (semanticCount !== 6) throw new Error(`semantic token は 6 個に固定する: ${semanticCount} 個`);

function resolveReference(value, stack = []) {
  if (typeof value !== "string") return value;
  const match = value.match(/^\{([^{}]+)\}$/);
  if (!match) return value;
  const name = match[1];
  if (stack.includes(name)) throw new Error(`循環参照: ${[...stack, name].join(" -> ")}`);
  const token = tokens.get(name);
  if (!token) throw new Error(`未定義の参照: ${name}`);
  return resolveValue(token.value, [...stack, name]);
}

function resolveValue(value, stack = []) {
  const referenced = resolveReference(value, stack);
  if (referenced !== value) return referenced;
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, stack));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveValue(child, stack)]),
    );
  }
  return value;
}

function assertDimension(name, value) {
  if (
    !value ||
    typeof value !== "object" ||
    typeof value.value !== "number" ||
    !["px", "rem"].includes(value.unit)
  ) {
    throw new Error(`${name}: dimension は数値と px/rem を持つ必要がある`);
  }
}

function validate(name, token) {
  const value = resolveValue(token.value, [name]);
  if (token.type === "dimension") assertDimension(name, value);
  if (token.type === "number" && typeof value !== "number") {
    throw new Error(`${name}: number ではない`);
  }
  if (token.type === "fontWeight" && ![400, 700].includes(value)) {
    throw new Error(`${name}: LINE Seed JP では 400 または 700 だけを使う`);
  }
  if (token.type === "fontFamily") {
    if (
      !Array.isArray(value) ||
      value.length === 0 ||
      value.some((item) => typeof item !== "string")
    ) {
      throw new Error(`${name}: fontFamily は空でない文字列配列にする`);
    }
  }
  if (token.type === "typography") {
    const fields = Object.keys(value).sort();
    if (fields.join(",") !== [...requiredTypographyFields].sort().join(",")) {
      throw new Error(`${name}: typography の 5 項目が揃っていない`);
    }
    assertDimension(`${name}.fontSize`, value.fontSize);
    assertDimension(`${name}.letterSpacing`, value.letterSpacing);
    if (![400, 700].includes(value.fontWeight)) throw new Error(`${name}: 未対応の weight`);
    if (typeof value.lineHeight !== "number")
      throw new Error(`${name}: lineHeight は number にする`);
  }
}

for (const [name, token] of tokens) validate(name, token);

function cssName(name) {
  return `--${name.replaceAll(".", "-")}`;
}

function formatFamily(value) {
  const generic = new Set(["serif", "sans-serif", "monospace", "system-ui"]);
  return value.map((name) => (generic.has(name) ? name : JSON.stringify(name))).join(", ");
}

function formatValue(type, value) {
  if (type === "fontFamily") return formatFamily(value);
  if (type === "dimension") return `${value.value}${value.unit}`;
  if (type === "fontWeight" || type === "number") return String(value);
  throw new Error(`CSS へ直接出力できない型: ${type}`);
}

const primitiveLines = [];
const semanticLines = [];
for (const [name, token] of tokens) {
  const value = resolveValue(token.value, [name]);
  if (token.type !== "typography") {
    primitiveLines.push(`  ${cssName(name)}: ${formatValue(token.type, value)};`);
    continue;
  }
  semanticLines.push(`  ${cssName(`${name}.font-family`)}: ${formatFamily(value.fontFamily)};`);
  semanticLines.push(
    `  ${cssName(`${name}.font-size`)}: ${formatValue("dimension", value.fontSize)};`,
  );
  semanticLines.push(`  ${cssName(`${name}.font-weight`)}: ${value.fontWeight};`);
  semanticLines.push(
    `  ${cssName(`${name}.letter-spacing`)}: ${formatValue("dimension", value.letterSpacing)};`,
  );
  semanticLines.push(`  ${cssName(`${name}.line-height`)}: ${value.lineHeight};`);
}

const output = `/* typography.tokens.json から生成する。直接編集しない。 */
:root {
${primitiveLines.join("\n")}

${semanticLines.join("\n")}
}
`;

if (checkOnly) {
  const current = await readFile(outputUrl, "utf8").catch(() => "");
  if (current !== output) {
    console.error("typography.css が正本と一致しない。just tokens-build を実行する");
    process.exitCode = 1;
  }
} else {
  await writeFile(outputUrl, output);
  console.log("generated tokens/typography/typography.css");
}
