import { describe, expect, it } from "vitest";
import { CONTRAST_PAIRS, contrastRatioFromCss, passesWcag } from "./contrast";
import { parseSchemeCss, schemeFiles, schemes } from "./schemes";

const NEUTRAL_ROLES = [
  "bg",
  "bg-subtle",
  "surface",
  "border",
  "border-strong",
  "text",
  "text-muted",
];

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

  it("全 scheme の面、通常罫線、本文を共通の無彩色にする", () => {
    for (const mode of ["light", "dark"] as const) {
      const reference = new Map(schemes[0][mode].map((color) => [color.role, color.value]));
      for (const scheme of schemes) {
        const colors = new Map(scheme[mode].map((color) => [color.role, color.value]));
        for (const role of NEUTRAL_ROLES) {
          expect(colors.get(role), `${scheme.id}/${mode}/${role}`).toBe(reference.get(role));
          expect(colors.get(role), `${scheme.id}/${mode}/${role}`).toMatch(/^oklch\([^)]* 0 0\)$/);
        }
      }
    }
  });

  it("全 scheme の Light / Dark がコントラスト目標を満たす", () => {
    const failures: string[] = [];
    for (const scheme of schemes) {
      for (const mode of ["light", "dark"] as const) {
        const colors = new Map(scheme[mode].map((color) => [color.role, color.value]));
        if (!colors.has("accent-strong") && colors.has("accent-text")) {
          colors.set("accent-strong", colors.get("accent-text")!);
        }
        for (const pair of CONTRAST_PAIRS) {
          const foreground = colors.get(pair.foreground);
          const background = colors.get(pair.background);
          expect(foreground, `${scheme.id}/${mode}/${pair.foreground}`).toBeDefined();
          expect(background, `${scheme.id}/${mode}/${pair.background}`).toBeDefined();
          const ratio = contrastRatioFromCss(foreground!, background!);
          if (!passesWcag(ratio, pair.minimum)) {
            failures.push(
              `${scheme.id}/${mode}: ${pair.foreground} / ${pair.background} = ${ratio.toFixed(2)} < ${pair.minimum}:1`,
            );
          }
        }
      }
    }
    expect(failures).toEqual([]);
  });
});
