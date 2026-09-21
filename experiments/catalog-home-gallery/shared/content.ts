// ギャラリーに並べる素材を、リポジトリの正本から読む。
// apps/catalog の解析器は import しない。Experiment と公開面の間に依存を作らないためである。
// ここで読むのは、タイルの見た目に要る最小の値だけにする。

const schemeFiles = import.meta.glob<string>("../../color-schemes-material/variants/*/scheme.css", {
  query: "?raw",
  import: "default",
  eager: true,
});

const iconFiles = import.meta.glob<string>(
  "../../class-tech-icons/variants/line-round/dist/*.svg",
  {
    query: "?raw",
    import: "default",
    eager: true,
  },
);

const guidelineFiles = import.meta.glob<string>("../../../docs/guidelines/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export type SchemeRoles = {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  secondary: string;
  tertiary: string;
  surface: string;
  onSurface: string;
};

export type Scheme = {
  id: string;
  /** 配色の読み。variant の見出しコメントから取る。 */
  kana: string;
  /** primary の伝統色名。 */
  primaryName: string;
  light: SchemeRoles;
  dark: SchemeRoles;
};

export type Icon = {
  name: string;
  /** SVG の <title>。タイルの題名に使う。 */
  title: string;
  svg: string;
};

export type GuidelineExcerpt = {
  slug: string;
  title: string;
  summary: string;
};

// 採用順を並びの先頭にする。README の adopted の順と揃える。
const SCHEME_ORDER = [
  "wasabi",
  "yuzu",
  "azuki",
  "aizome",
  "sumi",
  "fuji",
  "ume",
  "shinbashi",
  "kingyo",
  "tsukiyo",
];

function readRoles(
  block: string,
  path: string,
): { roles: SchemeRoles; names: Map<string, string> } {
  const values = new Map<string, string>();
  const names = new Map<string, string>();
  for (const match of block.matchAll(
    /--color-([a-z-]+):\s*(#[0-9a-f]{3,8});(?:\s*\/\*\s*(.+?)\s*\*\/)?/gi,
  )) {
    values.set(match[1], match[2]);
    if (match[3]) names.set(match[1], match[3]);
  }
  const pick = (role: string) => {
    const value = values.get(role);
    if (!value) throw new Error(`配色に ${role} が無い: ${path}`);
    return value;
  };
  return {
    roles: {
      primary: pick("primary"),
      onPrimary: pick("on-primary"),
      primaryContainer: pick("primary-container"),
      secondary: pick("secondary"),
      tertiary: pick("tertiary"),
      surface: pick("surface"),
      onSurface: pick("on-surface"),
    },
    names,
  };
}

function parseScheme(path: string, source: string): Scheme {
  const header = source.match(/variant `([a-z0-9-]+)`（(.+?)）/);
  if (!header) throw new Error(`配色の見出しが読めない: ${path}`);
  const [lightBlock, darkBlock] = source.split("@media");
  if (!darkBlock) throw new Error(`配色に dark の節が無い: ${path}`);
  const light = readRoles(lightBlock, path);
  const dark = readRoles(darkBlock, path);
  return {
    id: header[1],
    kana: header[2],
    primaryName: light.names.get("primary") ?? "",
    light: light.roles,
    dark: dark.roles,
  };
}

export const SCHEMES: Scheme[] = Object.entries(schemeFiles)
  .map(([path, source]) => parseScheme(path, source))
  .sort((a, b) => SCHEME_ORDER.indexOf(a.id) - SCHEME_ORDER.indexOf(b.id));

export const ICONS: Icon[] = Object.entries(iconFiles)
  .map(([path, svg]) => {
    const name = path.match(/([^/]+)\.svg$/)?.[1] ?? path;
    const title = svg.match(/<title>(.+?)<\/title>/)?.[1] ?? name;
    return { name, title, svg };
  })
  .sort((a, b) => a.name.localeCompare(b.name));

export const GUIDELINES: GuidelineExcerpt[] = Object.entries(guidelineFiles)
  .filter(([path]) => !path.endsWith("/README.md"))
  .map(([path, source]) => {
    const slug = path.match(/([^/]+)\.md$/)?.[1] ?? path;
    const title = source.match(/^title:\s*(.+)$/m)?.[1];
    const summary = source.match(/^summary:\s*(.+)$/m)?.[1];
    if (!title || !summary) throw new Error(`方針の title か summary が無い: ${path}`);
    return { slug, title, summary };
  })
  .sort((a, b) => a.slug.localeCompare(b.slug));
