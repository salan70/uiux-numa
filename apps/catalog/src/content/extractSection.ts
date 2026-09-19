export function extractSection(body: string, heading: string): string {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start === -1) throw new Error(`見出し ${heading} がない`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^## /.test(line));
  const section = (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
  return section;
}

export function extractOptionalSection(body: string, heading: string): string {
  try {
    return extractSection(body, heading);
  } catch {
    return "";
  }
}

export function excerpt(text: string, max = 280): string {
  const compact = text.replace(/\s+/g, " ").trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max).trimEnd()}…`;
}

export function extractExperimentSlugs(text: string): string[] {
  const slugs = new Set<string>();
  const pattern = /experiments\/([a-z0-9-]+)/g;
  for (const match of text.matchAll(pattern)) slugs.add(match[1]);
  return [...slugs];
}

export function extractRepoPaths(text: string): string[] {
  const paths = new Set<string>();
  const pattern = /`((?:skills|docs|experiments|tokens)\/[^`\s]+)`/g;
  for (const match of text.matchAll(pattern)) paths.add(match[1]);
  return [...paths];
}

export function parseSkillMaturity(readme: string, name: string): string {
  const pattern = new RegExp(
    String.raw`\|\s*` + "`" + name + "`" + String.raw`\s*\|\s*` + "`([^`]+)`" + String.raw`\s*\|`,
  );
  const row = readme.match(pattern);
  if (!row) throw new Error(`skills/README.md に ${name} の成熟度がない`);
  return row[1];
}

export function parseVariantIds(body: string): string[] {
  const variants: string[] = [];
  const table = extractOptionalSection(body, "Variants");
  for (const line of table.split("\n")) {
    const match = line.match(/^\|\s*`([a-z0-9-]+)`\s*\|/);
    if (match) variants.push(match[1]);
  }
  return variants;
}
