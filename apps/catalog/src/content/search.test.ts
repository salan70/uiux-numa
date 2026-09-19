import { describe, expect, it } from "vitest";
import { searchDocs, searchIndex } from "./search";

describe("catalog search", () => {
  it("ページ名、token 名、和名、variant ID、原則の見出しを索引する", () => {
    const ids = new Set(searchDocs.map((item) => item.id));
    expect(ids.has("page:colors")).toBe(true);
    expect(searchDocs.some((item) => item.title === "typography.body")).toBe(true);
    expect(searchDocs.some((item) => item.title.includes("すみ"))).toBe(true);
    expect(searchDocs.some((item) => item.id === "variant:form-inline-validation/on-submit")).toBe(
      true,
    );
    expect(searchDocs.some((item) => item.keywords.includes("仮説"))).toBe(true);
  });

  it("token 名で検索できる", () => {
    const hits = searchIndex.search("typography.body");
    expect(hits.some((item) => item.id === "token:typography.body")).toBe(true);
  });
});
