// 配色の実データ。正本は experiments/color-schemes/variants/<id>/scheme.css。
// 解析の正本は apps/catalog/src/content/schemes.ts にあり、ここはその要点だけを写す。
// apps/ へ import しない慣習は shared/data.ts の冒頭に書いた理由と同じ。
// 公開実装は 2026-09-20 に apps/catalog へ移した（docs/decisions/2026-09-20-catalog-topic-first.md）。
// ここは Experiment を再実行するための写しであり、公開面は参照しない。

export type SchemeColor = {
  role: string;
  value: string;
  /** 行末コメントの和名。無ければ role をそのまま使う。 */
  name: string;
};

export type Scheme = {
  id: string;
  /** README の「variant `id`（ラベル）」から取る日本語ラベル。 */
  label: string;
  light: SchemeColor[];
  dark: SchemeColor[];
};

const schemeFiles = import.meta.glob<string>("../../color-schemes/variants/*/scheme.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const schemes: Scheme[] = collectSchemes();

export function schemeById(id: string): Scheme | undefined {
  return schemes.find((item) => item.id === id);
}

/** 配色を CSS カスタムプロパティの組へ変換する。標本の囲いへ当てる。 */
export function schemeVars(scheme: Scheme, mode: "light" | "dark"): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of scheme[mode]) vars[`--color-${color.role}`] = color.value;
  return vars;
}

function collectSchemes(): Scheme[] {
  return Object.entries(schemeFiles)
    .flatMap(([key, source]) => {
      const match = key.match(/variants\/([^/]+)\/scheme\.css$/);
      if (!match) return [];
      const id = match[1];
      const selector = `:root:has(.cs-${id})`;
      const light = readRoles(source, source.indexOf(selector));
      const darkMedia = source.indexOf("@media (prefers-color-scheme: dark)");
      const dark = readRoles(source, darkMedia === -1 ? -1 : source.indexOf(selector, darkMedia));
      if (light.length === 0 || dark.length === 0) return [];
      return [{ id, label: parseLabel(source) ?? id, light, dark }];
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

function readRoles(source: string, selectorStart: number): SchemeColor[] {
  if (selectorStart === -1) return [];
  const open = source.indexOf("{", selectorStart);
  if (open === -1) return [];
  let depth = 0;
  let block = "";
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) {
      block = source.slice(open + 1, index);
      break;
    }
  }

  const colors: SchemeColor[] = [];
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^\s*--color-([a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?\s*$/);
    if (!match) continue;
    colors.push({ role: match[1], value: match[2].trim(), name: match[3]?.trim() || match[1] });
  }
  return colors;
}

/** ラベルは scheme.css 冒頭の「variant `id`（ラベル）」から取る。README ではない。 */
function parseLabel(source: string): string | undefined {
  return source.match(/variant\s+`?[a-z0-9-]+`?（([^）]+)）/)?.[1];
}
