import { describe, expect, it } from "vitest";
import { categoryForDomains, categoryForExperiment, categoryHref } from "./category";

describe("categoryForDomains", () => {
  it("domains の先頭から最初に一致する種別を返す", () => {
    expect(categoryForDomains(["ux-writing", "forms-input-ux"])).toBe("components");
    expect(categoryForDomains(["illustration-svg", "visual-design"])).toBe("graphics");
  });

  it("動きの domain を種別に割り当てる", () => {
    expect(categoryForDomains(["animation-motion", "forms-input-ux"])).toBe("motion");
  });

  it("未対応の domains は種別なしにする", () => {
    expect(categoryForDomains(["information-architecture"])).toBeNull();
  });

  it("catalog-redesign は公開種別にしない", () => {
    expect(categoryForExperiment("catalog-redesign", ["animation-motion"])).toBeNull();
  });
});

describe("categoryHref", () => {
  it("公開種別の URL を返す", () => {
    expect(categoryHref("colors")).toBe("/foundations/colors");
    expect(categoryHref("components")).toBe("/components");
    expect(categoryHref("motion")).toBe("/motion");
  });
});
