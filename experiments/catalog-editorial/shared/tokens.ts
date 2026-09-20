// token の実データ。正本は tokens/**/*.tokens.json（DTCG 2025.10）。
// 解析の正本は apps/catalog/src/content/tokens.ts にあり、ここは表示に要る要点だけを写す。
// apps/ へ import しない慣習は shared/data.ts の冒頭に書いた理由と同じ。
// 公開実装は 2026-09-20 に apps/catalog へ移した（docs/decisions/2026-09-20-catalog-topic-first.md）。
// ここは Experiment を再実行するための写しであり、公開面は参照しない。

export type TokenKind = "primitive" | "semantic";

export type TokenValue = string | Record<string, string>;

export type Token = {
  /** DTCG のパス。`typography.body` のような形。 */
  path: string;
  /** Web で使う CSS カスタムプロパティ名。 */
  cssName: string;
  type: string;
  kind: TokenKind;
  value: TokenValue;
  description: string;
};

export type TokenFamily = {
  id: string;
  label: string;
  sourcePath: string;
  role: string;
  maturity: string;
  tokens: Token[];
};

const FAMILY_LABELS: Record<string, string> = {
  typography: "文字",
  space: "余白",
};

const tokenFiles = import.meta.glob<Record<string, unknown>>("../../../tokens/**/*.tokens.json", {
  import: "default",
  eager: true,
});

export const tokenFamilies: TokenFamily[] = collect();

export const tokens: Token[] = tokenFamilies.flatMap((family) => family.tokens);

function collect(): TokenFamily[] {
  const families: TokenFamily[] = [];
  for (const [key, json] of Object.entries(tokenFiles)) {
    const match = key.match(/\/tokens\/([^/]+)\/([^/]+)\.tokens\.json$/);
    if (!match) continue;
    const id = match[1];
    const meta = readMeta(json);
    const list: Token[] = [];
    walk(json, [], json, list);
    families.push({
      id,
      label: FAMILY_LABELS[id] ?? id,
      sourcePath: `tokens/${id}/${match[2]}.tokens.json`,
      role: meta.role,
      maturity: meta.maturity,
      tokens: list,
    });
  }
  return families.sort((a, b) => a.id.localeCompare(b.id));
}

function readMeta(json: Record<string, unknown>): { role: string; maturity: string } {
  const extensions = json["$extensions"] as Record<string, unknown> | undefined;
  const own = extensions?.["uiux-numa"] as Record<string, unknown> | undefined;
  return {
    role: typeof own?.["role"] === "string" ? own["role"] : "",
    maturity: typeof own?.["maturity"] === "string" ? own["maturity"] : "",
  };
}

function walk(node: unknown, path: string[], root: unknown, out: Token[]): void {
  if (!node || typeof node !== "object" || Array.isArray(node)) return;
  const record = node as Record<string, unknown>;
  if ("$value" in record) {
    const type = typeof record["$type"] === "string" ? record["$type"] : "";
    out.push({
      path: path.join("."),
      cssName: `--${path.join("-")}`,
      type,
      // 参照を持つ token を semantic として扱う。役割名で意味を与えている側である。
      kind: hasRef(record["$value"]) ? "semantic" : "primitive",
      value: resolve(record["$value"], root),
      description: typeof record["$description"] === "string" ? record["$description"] : "",
    });
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    if (key.startsWith("$")) continue;
    walk(child, [...path, key], root, out);
  }
}

function hasRef(value: unknown): boolean {
  if (typeof value === "string") return /^\{[^{}]+\}$/.test(value);
  if (value && typeof value === "object") return Object.values(value).some(hasRef);
  return false;
}

function resolve(value: unknown, root: unknown): TokenValue {
  if (typeof value === "string") return resolveString(value, root);
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const dimension = asDimension(value);
    if (dimension) return dimension;
    const out: Record<string, string> = {};
    for (const [key, item] of Object.entries(value)) {
      const resolved = resolve(item, root);
      out[key] = typeof resolved === "string" ? resolved : JSON.stringify(resolved);
    }
    return out;
  }
  return String(value);
}

/**
 * DTCG の dimension は {value, unit} で持つ。CSS に渡せる `1.5rem` の形へ戻す。
 * composite の中に入れ子で現れるので、ここで平らにしないと style へ当てられない。
 */
function asDimension(value: object): string | null {
  const record = value as Record<string, unknown>;
  if (!("value" in record) || !("unit" in record)) return null;
  const amount = record["value"];
  const unit = record["unit"];
  if (typeof unit !== "string") return null;
  if (typeof amount !== "string" && typeof amount !== "number") return null;
  return `${amount}${unit}`;
}

function resolveString(value: string, root: unknown): string {
  const match = value.match(/^\{([^{}]+)\}$/);
  if (!match) return value;
  let node: unknown = root;
  for (const key of match[1].split(".")) {
    if (!node || typeof node !== "object") return value;
    node = (node as Record<string, unknown>)[key];
  }
  if (node && typeof node === "object" && "$value" in (node as Record<string, unknown>)) {
    const inner = (node as Record<string, unknown>)["$value"];
    if (typeof inner === "string") return resolveString(inner, root);
    if (inner && typeof inner === "object") return asDimension(inner) ?? String(inner);
    return String(inner);
  }
  return value;
}
