export type YamlValue = string | number | boolean | string[];

export type FrontmatterData = Record<string, YamlValue>;

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const EXPERIMENT_STATUSES = [
  "draft",
  "implementing",
  "evaluating",
  "decided",
  "extracted",
  "abandoned",
] as const;

export type ExperimentStatus = (typeof EXPERIMENT_STATUSES)[number];

export const ASSET_ROLES = ["foundation", "module", "reference"] as const;
export const ASSET_MATURITIES = ["experimental", "candidate", "stable", "deprecated"] as const;

export type AssetRole = (typeof ASSET_ROLES)[number];
export type AssetMaturity = (typeof ASSET_MATURITIES)[number];

export type AssetMeta = {
  role: AssetRole;
  maturity: AssetMaturity;
  platforms: string[];
  sources: string[];
};

export type ExperimentFrontmatter = {
  title: string;
  status: ExperimentStatus;
  role: AssetRole;
  maturity: AssetMaturity;
  created: string;
  updated: string;
  platforms: string[];
  domains: string[];
  sources: string[];
  adopted: string[];
};

export function splitFrontmatter(source: string): { raw: string; body: string } {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) throw new Error("YAML frontmatter がない");
  return { raw: match[1], body: match[2] };
}

export function parseYamlBlock(raw: string): FrontmatterData {
  const data: FrontmatterData = {};
  let currentKey: string | null = null;
  let currentList: string[] | null = null;

  for (const line of raw.split(/\r?\n/)) {
    if (line.trim() === "") continue;

    const listItem = line.match(/^(\s+)-\s+(.*)$/);
    if (listItem) {
      if (!currentKey || currentList === null) {
        throw new Error(`リストの親がない: ${line}`);
      }
      currentList.push(unquote(listItem[2]));
      continue;
    }

    const pair = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!pair) throw new Error(`解釈できない frontmatter 行: ${line}`);

    currentKey = pair[1];
    const rest = pair[2].trim();
    if (rest === "" || rest === "[]") {
      currentList = [];
      data[currentKey] = currentList;
      continue;
    }

    currentList = null;
    data[currentKey] = parseScalar(rest);
  }

  return data;
}

export function parseFrontmatter(source: string): { data: FrontmatterData; body: string } {
  const { raw, body } = splitFrontmatter(source);
  return { data: parseYamlBlock(raw), body };
}

export function requireString(data: FrontmatterData, key: string, path: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${path}: ${key} は空でない文字列にする`);
  }
  return value;
}

export function requireDate(data: FrontmatterData, key: string, path: string): string {
  const value = requireString(data, key, path);
  if (!DATE.test(value)) throw new Error(`${path}: ${key} は YYYY-MM-DD にする`);
  return value;
}

export function requireStringList(data: FrontmatterData, key: string, path: string): string[] {
  const value = requireStringListAllowEmpty(data, key, path);
  if (value.length === 0) {
    throw new Error(`${path}: ${key} は空でない文字列のリストにする`);
  }
  return value;
}

export function requireStringListAllowEmpty(
  data: FrontmatterData,
  key: string,
  path: string,
): string[] {
  const value = data[key];
  if (
    !Array.isArray(value) ||
    value.some((item) => typeof item !== "string" || item.trim() === "")
  ) {
    throw new Error(`${path}: ${key} は文字列のリストにする`);
  }
  return value;
}

export function parseExperimentFrontmatter(source: string, path: string): ExperimentFrontmatter {
  const { data } = parseFrontmatter(source);
  const status = requireString(data, "status", path);
  if (!isExperimentStatus(status)) {
    throw new Error(`${path}: status が不正: ${status}`);
  }
  const meta = parseAssetMeta(data, path);
  return {
    title: requireString(data, "title", path),
    status,
    role: meta.role,
    maturity: meta.maturity,
    created: requireDate(data, "created", path),
    updated: requireDate(data, "updated", path),
    platforms: meta.platforms,
    domains: requireStringList(data, "domains", path),
    sources: meta.sources,
    adopted: requireStringListAllowEmpty(data, "adopted", path),
  };
}

export function parseAssetMeta(data: FrontmatterData, path: string): AssetMeta {
  const role = requireString(data, "role", path);
  if (!isAssetRole(role)) throw new Error(`${path}: role が不正: ${role}`);
  const maturity = requireString(data, "maturity", path);
  if (!isAssetMaturity(maturity)) throw new Error(`${path}: maturity が不正: ${maturity}`);
  return {
    role,
    maturity,
    platforms: requireStringList(data, "platforms", path),
    sources: requireStringListAllowEmpty(data, "sources", path),
  };
}

export function parseTokenAssetMeta(json: unknown, path: string): AssetMeta {
  if (!json || typeof json !== "object" || Array.isArray(json)) {
    throw new Error(`${path}: token JSON がオブジェクトではない`);
  }
  const extensions = (json as { $extensions?: unknown }).$extensions;
  if (!extensions || typeof extensions !== "object" || Array.isArray(extensions)) {
    throw new Error(`${path}: $extensions.uiux-numa がない`);
  }
  const raw = (extensions as { "uiux-numa"?: unknown })["uiux-numa"];
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error(`${path}: $extensions.uiux-numa がない`);
  }
  const record = raw as Record<string, unknown>;
  const data: FrontmatterData = {};
  for (const key of ["role", "maturity"] as const) {
    const value = record[key];
    if (typeof value !== "string") throw new Error(`${path}: ${key} は空でない文字列にする`);
    data[key] = value;
  }
  for (const key of ["platforms", "sources"] as const) {
    const value = record[key];
    if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) {
      throw new Error(`${path}: ${key} は文字列のリストにする`);
    }
    data[key] = value;
  }
  return parseAssetMeta(data, path);
}

function parseScalar(raw: string): string | number | boolean {
  if (raw === "true") return true;
  if (raw === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw);
  return unquote(raw);
}

function unquote(raw: string): string {
  if ((raw.startsWith('"') && raw.endsWith('"')) || (raw.startsWith("'") && raw.endsWith("'"))) {
    return raw.slice(1, -1);
  }
  return raw;
}

function isExperimentStatus(value: string): value is ExperimentStatus {
  return (EXPERIMENT_STATUSES as readonly string[]).includes(value);
}

function isAssetRole(value: string): value is AssetRole {
  return (ASSET_ROLES as readonly string[]).includes(value);
}

function isAssetMaturity(value: string): value is AssetMaturity {
  return (ASSET_MATURITIES as readonly string[]).includes(value);
}
