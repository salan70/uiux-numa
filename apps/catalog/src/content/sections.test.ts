import { describe, expect, it } from "vitest";
import { extractOptionalSection, extractSection, renderMarkdown } from "./sections";

const body = `## Problem

課題の本文。

## Decision

採用する。

## アクセシビリティ

該当なし。
`;

describe("extractSection", () => {
  it("指定した節を取り出す", () => {
    expect(extractSection(body, "Problem")).toBe("課題の本文。");
    expect(extractSection(body, "Decision")).toBe("採用する。");
  });

  it("見出しが無いと失敗する", () => {
    expect(() => extractSection(body, "Learnings")).toThrow("見出し Learnings がない");
  });
});

describe("extractOptionalSection", () => {
  it("任意の節を空文字で返す", () => {
    expect(extractOptionalSection(body, "Learnings")).toBe("");
    expect(extractOptionalSection(body, "アクセシビリティ")).toBe("該当なし。");
  });
});

describe("renderMarkdown", () => {
  it("build 時に HTML 化する", () => {
    expect(renderMarkdown("**強調**")).toContain("<strong>強調</strong>");
    expect(renderMarkdown("")).toBe("");
  });
});
