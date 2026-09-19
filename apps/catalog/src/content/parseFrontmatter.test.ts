import { describe, expect, it } from "vitest";
import { parseExperimentFrontmatter, parseFrontmatter } from "./parseFrontmatter";

const experimentSource = `---
title: 入力フォームの inline validation
status: decided
created: 2026-09-13
updated: 2026-09-17
platforms:
  - web
domains:
  - ux-writing
  - forms-input-ux
adopted:
  - on-submit
---

## Problem

課題
`;

describe("parseFrontmatter", () => {
  it("YAML と本文を分ける", () => {
    const parsed = parseFrontmatter(experimentSource);
    expect(parsed.data.title).toBe("入力フォームの inline validation");
    expect(parsed.data.platforms).toEqual(["web"]);
    expect(parsed.body).toContain("## Problem");
  });

  it("frontmatter が無いと失敗する", () => {
    expect(() => parseFrontmatter("本文だけ")).toThrow("YAML frontmatter がない");
  });

  it("解釈できない行で失敗する", () => {
    expect(() => parseFrontmatter("---\n???: x\n---\n")).toThrow("解釈できない");
  });
});

describe("parseExperimentFrontmatter", () => {
  it("必須項目を読む", () => {
    const data = parseExperimentFrontmatter(experimentSource, "experiments/form/README.md");
    expect(data.status).toBe("decided");
    expect(data.domains).toEqual(["ux-writing", "forms-input-ux"]);
    expect(data.adopted).toEqual(["on-submit"]);
  });

  it("adopted が空配列でも読む", () => {
    const source = experimentSource.replace("adopted:\n  - on-submit", "adopted: []");
    const data = parseExperimentFrontmatter(source, "experiments/form/README.md");
    expect(data.adopted).toEqual([]);
  });

  it("adopted がないと失敗する", () => {
    const source = experimentSource.replace("adopted:\n  - on-submit\n", "");
    expect(() => parseExperimentFrontmatter(source, "x.md")).toThrow(
      "adopted は文字列のリストにする",
    );
  });

  it("不正な status で失敗する", () => {
    const source = experimentSource.replace("decided", "done");
    expect(() => parseExperimentFrontmatter(source, "x.md")).toThrow("status が不正");
  });

  it("日付形式が違うと失敗する", () => {
    const source = experimentSource.replace("2026-09-13", "09/13/2026");
    expect(() => parseExperimentFrontmatter(source, "x.md")).toThrow("YYYY-MM-DD");
  });
});
