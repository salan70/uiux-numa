import { describe, expect, it } from "vitest";
import {
  excerpt,
  extractExperimentSlugs,
  extractRepoPaths,
  extractSection,
  parseSkillMaturity,
  parseVariantIds,
} from "./extractSection";

const body = `## Problem

課題の一文。

詳細。

## Decision

採用する。

## Variants

| id | 仮説 |
| --- | --- |
| \`on-blur\` | 基準 |
| \`hybrid\` | 追加 |
`;

describe("extractSection", () => {
  it("見出しから次の見出しまでを取る", () => {
    expect(extractSection(body, "Problem")).toBe("課題の一文。\n\n詳細。");
    expect(extractSection(body, "Decision")).toBe("採用する。");
  });

  it("見出しが無いと失敗する", () => {
    expect(() => extractSection(body, "Target")).toThrow("見出し Target がない");
  });
});

describe("excerpt", () => {
  it("長い文を切り詰める", () => {
    expect(excerpt("a".repeat(300)).endsWith("…")).toBe(true);
  });
});

describe("extractExperimentSlugs", () => {
  it("experiments/slug を集める", () => {
    expect(
      extractExperimentSlugs("見る `experiments/class-tech-icons/` と experiments/class-doc-logo/"),
    ).toEqual(["class-tech-icons", "class-doc-logo"]);
  });
});

describe("extractRepoPaths", () => {
  it("バッククォートのリポジトリパスを集める", () => {
    expect(extractRepoPaths("- `skills/crafting-svg/references/icon.md`: 説明")).toEqual([
      "skills/crafting-svg/references/icon.md",
    ]);
  });
});

describe("parseSkillMaturity", () => {
  it("一覧表から成熟度を取る", () => {
    const readme = "| Skill | 成熟度 |\n| --- | --- |\n| `crafting-svg` | `experimental` | 用途 |";
    expect(parseSkillMaturity(readme, "crafting-svg")).toBe("experimental");
  });
});

describe("parseVariantIds", () => {
  it("Variants 表の id を取る", () => {
    expect(parseVariantIds(body)).toEqual(["on-blur", "hybrid"]);
  });
});
