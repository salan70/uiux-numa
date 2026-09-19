import { describe, expect, it } from "vitest";
import { categoryForDomains, categoryHref } from "./category";

describe("categoryForDomains", () => {
  it("domains の先頭から最初に一致する種別を返す", () => {
    expect(categoryForDomains(["ux-writing", "forms-input-ux"])).toBe("components");
    expect(categoryForDomains(["illustration-svg", "visual-design"])).toBe("graphics");
  });

  it("未対応の domains で失敗する", () => {
    expect(() => categoryForDomains(["motion"])).toThrow("対応する Catalog の種別がない");
  });
});

describe("categoryHref", () => {
  it("土台の URL を返す", () => {
    expect(categoryHref("colors")).toBe("/foundations/colors");
    expect(categoryHref("components")).toBe("/components");
  });
});
