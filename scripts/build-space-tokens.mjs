import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

const sourceUrl = new URL("../tokens/space/space.tokens.json", import.meta.url);
const outputUrl = new URL("../tokens/space/space.css", import.meta.url);
const checkOnly = process.argv.includes("--check");

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

if (tokens.size !== 2) throw new Error(`space token は 2 個に固定する: ${tokens.size} 個`);

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

for (const [name, token] of tokens) {
  if (token.type !== "dimension") throw new Error(`${name}: space は dimension にする`);
  assertDimension(name, resolveValue(token.value, [name]));
}

function cssName(name) {
  return `--${name.replaceAll(".", "-")}`;
}

const lines = [];
for (const [name, token] of tokens) {
  const value = resolveValue(token.value, [name]);
  lines.push(`  ${cssName(name)}: ${value.value}${value.unit};`);
}

const output = `/* space.tokens.json から生成する。直接編集しない。 */
:root {
${lines.join("\n")}
}
`;

if (checkOnly) {
  const current = await readFile(outputUrl, "utf8").catch(() => "");
  if (current !== output) {
    console.error("space.css が正本と一致しない。just tokens-build を実行する");
    process.exitCode = 1;
  }
} else {
  await writeFile(outputUrl, output);
  console.log("generated tokens/space/space.css");
}
