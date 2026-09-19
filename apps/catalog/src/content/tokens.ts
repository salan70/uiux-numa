export type TokenKind = "primitive" | "semantic";

export type CatalogToken = {
  name: string;
  jsonPath: string;
  type: string;
  kind: TokenKind;
  description: string;
  value: unknown;
  resolvedValue: unknown;
  references: string[];
  cssNames: string[];
  sourcePath: string;
};

const REFERENCE = /^\{([^{}]+)\}$/;

export function collectTokens(
  source: unknown,
  sourcePath: string,
): { tokens: CatalogToken[]; byName: Map<string, CatalogToken> } {
  const collected = new Map<string, { type: string; value: unknown; description: string }>();

  walk(source, [], undefined, (name, type, value, description) => {
    collected.set(name, { type, value, description });
  });

  const byName = new Map<string, CatalogToken>();
  for (const [name, token] of collected) {
    const references = collectReferences(token.value);
    for (const ref of references) {
      if (!collected.has(ref)) throw new Error(`${sourcePath}: 未定義の参照 ${ref}`);
    }
    const resolvedValue = resolveValue(token.value, collected, [name]);
    const kind: TokenKind = token.type === "typography" ? "semantic" : "primitive";
    byName.set(name, {
      name,
      jsonPath: name,
      type: token.type,
      kind,
      description: token.description,
      value: token.value,
      resolvedValue,
      references,
      cssNames: cssNamesFor(name, token.type, resolvedValue),
      sourcePath,
    });
  }

  return { tokens: [...byName.values()], byName };
}

export function formatTokenValue(type: string, value: unknown): string {
  if (type === "fontFamily" && Array.isArray(value)) return formatFamily(value);
  if (type === "dimension") return formatDimension(value);
  if (type === "fontWeight" || type === "number") return String(value);
  if (type === "typography" && value && typeof value === "object") {
    const fields = value as Record<string, unknown>;
    return [
      `fontFamily: ${formatTokenValue("fontFamily", fields.fontFamily)}`,
      `fontSize: ${formatTokenValue("dimension", fields.fontSize)}`,
      `fontWeight: ${fields.fontWeight}`,
      `letterSpacing: ${formatTokenValue("dimension", fields.letterSpacing)}`,
      `lineHeight: ${fields.lineHeight}`,
    ].join(" / ");
  }
  return JSON.stringify(value);
}

export function cssName(name: string): string {
  return `--${name.replaceAll(".", "-")}`;
}

function walk(
  value: unknown,
  path: string[],
  inheritedType: string | undefined,
  visit: (name: string, type: string, value: unknown, description: string) => void,
): void {
  if (!value || typeof value !== "object" || Array.isArray(value)) return;
  const record = value as Record<string, unknown>;
  const type = typeof record.$type === "string" ? record.$type : inheritedType;
  if (Object.hasOwn(record, "$value")) {
    const name = path.join(".");
    if (!type) throw new Error(`${name}: $type がない`);
    if (typeof record.$description !== "string" || record.$description.trim() === "") {
      throw new Error(`${name}: $description がない`);
    }
    visit(name, type, record.$value, record.$description);
    return;
  }
  for (const [key, child] of Object.entries(record)) {
    if (!key.startsWith("$")) walk(child, [...path, key], type, visit);
  }
}

function collectReferences(value: unknown): string[] {
  if (typeof value === "string") {
    const match = value.match(REFERENCE);
    return match ? [match[1]] : [];
  }
  if (Array.isArray(value)) return value.flatMap(collectReferences);
  if (value && typeof value === "object") {
    return Object.values(value).flatMap(collectReferences);
  }
  return [];
}

function resolveValue(
  value: unknown,
  tokens: Map<string, { type: string; value: unknown; description: string }>,
  stack: string[],
): unknown {
  if (typeof value === "string") {
    const match = value.match(REFERENCE);
    if (!match) return value;
    const name = match[1];
    if (stack.includes(name)) throw new Error(`循環参照: ${[...stack, name].join(" -> ")}`);
    const token = tokens.get(name);
    if (!token) throw new Error(`未定義の参照: ${name}`);
    return resolveValue(token.value, tokens, [...stack, name]);
  }
  if (Array.isArray(value)) return value.map((item) => resolveValue(item, tokens, stack));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, child]) => [key, resolveValue(child, tokens, stack)]),
    );
  }
  return value;
}

function cssNamesFor(name: string, type: string, resolved: unknown): string[] {
  if (type !== "typography" || !resolved || typeof resolved !== "object") return [cssName(name)];
  return [
    cssName(`${name}.font-family`),
    cssName(`${name}.font-size`),
    cssName(`${name}.font-weight`),
    cssName(`${name}.letter-spacing`),
    cssName(`${name}.line-height`),
  ];
}

function formatFamily(value: unknown[]): string {
  const generic = new Set(["serif", "sans-serif", "monospace", "system-ui"]);
  return value
    .map((item) => {
      const name = String(item);
      return generic.has(name) ? name : JSON.stringify(name);
    })
    .join(", ");
}

function formatDimension(value: unknown): string {
  if (!value || typeof value !== "object") return String(value);
  const record = value as { value?: unknown; unit?: unknown };
  if (typeof record.value === "number" && typeof record.unit === "string") {
    return `${record.value}${record.unit}`;
  }
  return JSON.stringify(value);
}
