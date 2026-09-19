import { describe, expect, it } from "vitest";
import { parseSchemeCss, schemeFiles, schemes } from "./schemes";

describe("schemes", () => {
  it("14 配色を light / dark の 19 role として読む", () => {
    expect(schemes).toHaveLength(14);
    for (const scheme of schemes) {
      expect(scheme.light).toHaveLength(19);
      expect(scheme.dark).toHaveLength(19);
      expect(scheme.light.every((color) => color.name.length > 0)).toBe(true);
      expect(scheme.dark.every((color) => color.name.length > 0)).toBe(true);
    }
  });

  it("role が欠けたら失敗する", () => {
    const [sourcePath, source] = Object.entries(schemeFiles)[0];
    const missing = source.replace(/^\s+--color-bg:.*\r?\n/m, "");
    expect(() => parseSchemeCss(missing, sourcePath)).toThrow("19 件");
  });
});
