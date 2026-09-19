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

export type ExperimentFrontmatter = {
  title: string;
  status: ExperimentStatus;
  created: string;
  updated: string;
  platforms: string[];
  domains: string[];
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
  return {
    title: requireString(data, "title", path),
    status,
    created: requireDate(data, "created", path),
    updated: requireDate(data, "updated", path),
    platforms: requireStringList(data, "platforms", path),
    domains: requireStringList(data, "domains", path),
    adopted: requireStringListAllowEmpty(data, "adopted", path),
  };
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
