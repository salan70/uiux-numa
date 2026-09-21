export type SchemeColor = {
  role: string;
  cssName: string;
  value: string;
  name: string;
};

export type ColorScheme = {
  id: string;
  label: string;
  sourcePath: string;
  light: SchemeColor[];
  dark: SchemeColor[];
};

const rawSchemeFiles = import.meta.glob<string>(
  "../../../../experiments/color-schemes-material/variants/*/scheme.css",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

export const schemeFiles: Record<string, string> = rawSchemeFiles;

const COLOR_ROLE_COUNT = 24;

export function parseSchemeCss(source: string, sourcePath: string): ColorScheme {
  const idMatch = sourcePath.match(/variants\/([^/]+)\/scheme\.css$/);
  if (!idMatch) throw new Error(`配色のパスが不正: ${sourcePath}`);
  const id = idMatch[1];
  const selector = `:root:has(.cs-${id})`;
  const lightStart = source.indexOf(selector);
  if (lightStart === -1)
    throw new Error(
      `${sourcePath}: ${selector} light の配色ブロックがない length=${source.length}`,
    );
  const lightBlock = readBlock(source, lightStart, sourcePath);
  const darkMediaStart = source.indexOf("@media (prefers-color-scheme: dark)");
  if (darkMediaStart === -1) throw new Error(`${sourcePath}: dark の配色ブロックがない`);
  const darkStart = source.indexOf(selector, darkMediaStart);
  if (darkStart === -1) throw new Error(`${sourcePath}: dark の配色ブロックがない`);
  const darkBlock = readBlock(source, darkStart, sourcePath);

  const light = parseColorBlock(lightBlock, sourcePath, "light");
  const dark = parseColorBlock(darkBlock, sourcePath, "dark");
  if (light.length !== COLOR_ROLE_COUNT || dark.length !== COLOR_ROLE_COUNT) {
    throw new Error(`${sourcePath}: color role は light / dark とも ${COLOR_ROLE_COUNT} 件にする`);
  }

  const labelMatch = source.match(/variant\s+`?([a-z0-9-]+)`?（([^）]+)）/);
  return {
    id,
    label: labelMatch?.[2] ?? id,
    sourcePath,
    light,
    dark,
  };
}

export function collectSchemes(files: Record<string, string>): ColorScheme[] {
  return Object.entries(files)
    .map(([sourcePath, source]) => parseSchemeCss(source, toRepoPath(sourcePath)))
    .sort((a, b) => a.id.localeCompare(b.id));
}

function parseColorBlock(block: string, sourcePath: string, mode: string): SchemeColor[] {
  const colors: SchemeColor[] = [];
  for (const line of block.split(/\r?\n/)) {
    if (!line.includes("--color-")) continue;
    const match = line.match(/^\s*(--color-[a-z0-9-]+):\s*([^;]+);(?:\s*\/\*\s*(.*?)\s*\*\/)?\s*$/);
    if (!match) throw new Error(`${sourcePath}: ${mode} の color role 行が不正: ${line.trim()}`);
    const cssName = match[1];
    colors.push({
      role: cssName.slice("--color-".length),
      cssName,
      value: match[2].trim(),
      name: match[3]?.trim() || cssName.slice("--color-".length),
    });
  }
  const roles = new Set(colors.map((item) => item.role));
  if (roles.size !== colors.length)
    throw new Error(`${sourcePath}: ${mode} に重複した color role がある`);
  return colors;
}

function readBlock(source: string, selectorStart: number, sourcePath: string): string {
  const open = source.indexOf("{", selectorStart);
  if (open === -1) throw new Error(`${sourcePath}: 配色ブロックの開始がない`);
  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    if (source[index] === "{") depth += 1;
    if (source[index] === "}") depth -= 1;
    if (depth === 0) return source.slice(open + 1, index);
  }
  throw new Error(`${sourcePath}: 配色ブロックが閉じていない`);
}

function toRepoPath(globKey: string): string {
  const match = globKey.match(/\/(experiments\/color-schemes-material\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}

export const schemes = collectSchemes(schemeFiles);
