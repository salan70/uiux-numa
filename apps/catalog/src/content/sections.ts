import { marked } from "marked";

marked.setOptions({ gfm: true, breaks: false });

export function extractSection(body: string, heading: string): string {
  const lines = body.split(/\r?\n/);
  const start = lines.findIndex((line) => line === `## ${heading}`);
  if (start === -1) throw new Error(`見出し ${heading} がない`);
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((line) => /^## /.test(line));
  return (end === -1 ? rest : rest.slice(0, end)).join("\n").trim();
}

export function extractOptionalSection(body: string, heading: string): string {
  try {
    return extractSection(body, heading);
  } catch {
    return "";
  }
}

export function renderMarkdown(source: string): string {
  if (source.trim() === "") return "";
  return marked.parse(source, { async: false }) as string;
}
