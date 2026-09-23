import { readFile, writeFile } from "node:fs/promises";
import process from "node:process";

// 1 つの値を 1 つの CSS 変数へ出す家族。個数は正本の README と揃える。
const FAMILIES = [
  { id: "space", count: 12, types: ["dimension"] },
  { id: "radius", count: 8, types: ["dimension"] },
  { id: "border", count: 2, types: ["dimension"] },
  { id: "size", count: 7, types: ["dimension"] },
  { id: "motion", count: 11, types: ["duration", "cubicBezier"] },
];
const checkOnly = process.argv.includes("--check");

for (const family of FAMILIES) await build(family);

async function build({ id, count, types }) {
  const sourceUrl = new URL(`../tokens/${id}/${id}.tokens.json`, import.meta.url);
  const outputUrl = new URL(`../tokens/${id}/${id}.css`, import.meta.url);

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

  if (tokens.size !== count)
    throw new Error(`${id} token は ${count} 個に固定する: ${tokens.size} 個`);

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

  function assertDuration(name, value) {
    if (
      !value ||
      typeof value !== "object" ||
      typeof value.value !== "number" ||
      value.unit !== "ms"
    ) {
      throw new Error(`${name}: duration は数値と ms を持つ必要がある`);
    }
  }

  function assertCubicBezier(name, value) {
    if (!Array.isArray(value) || value.length !== 4 || value.some((n) => typeof n !== "number")) {
      throw new Error(`${name}: cubicBezier は 4 個の数値を持つ必要がある`);
    }
  }

  const ASSERTS = {
    dimension: assertDimension,
    duration: assertDuration,
    cubicBezier: assertCubicBezier,
  };

  for (const [name, token] of tokens) {
    if (!types.includes(token.type))
      throw new Error(`${name}: ${id} は ${types.join(" か ")} にする`);
    ASSERTS[token.type](name, resolveValue(token.value, [name]));
  }

  function cssValue(type, value) {
    if (type === "cubicBezier") return `cubic-bezier(${value.join(", ")})`;
    return `${value.value}${value.unit}`;
  }

  function cssName(name) {
    return `--${name.replaceAll(".", "-")}`;
  }

  const lines = [];
  for (const [name, token] of tokens) {
    const value = resolveValue(token.value, [name]);
    lines.push(`  ${cssName(name)}: ${cssValue(token.type, value)};`);
  }

  const output = `/* ${id}.tokens.json から生成する。直接編集しない。 */
:root {
${lines.join("\n")}
}
`;

  if (checkOnly) {
    const current = await readFile(outputUrl, "utf8").catch(() => "");
    if (current !== output) {
      console.error(`${id}.css が正本と一致しない。just tokens-build を実行する`);
      process.exitCode = 1;
    }
  } else {
    await writeFile(outputUrl, output);
    console.log(`generated tokens/${id}/${id}.css`);
  }
}
