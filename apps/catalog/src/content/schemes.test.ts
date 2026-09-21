import { describe, expect, it } from "vitest";
import { CONTRAST_PAIRS, contrastRatioFromCss, parseCssColor, passesWcag } from "./contrast";
import { parseSchemeCss, schemeFiles, schemes } from "./schemes";

/** 面と、面の上に置く文字。配色をまたいでも彩度を抑え、成果物より前に出さない。 */
const QUIET_ROLES = [
  "background",
  "surface",
  "on-surface",
  "surface-container",
  "surface-variant",
  "on-surface-variant",
  "outline",
];

/** 彩度の上限。palettes.ts は面の彩度を 0.1 までに抑える。実測の最大は surface-variant のダーク。 */
const QUIET_SATURATION = 0.12;

function saturationOf(value: string): number {
  const { r, g, b } = parseCssColor(value);
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const lightness = (max + min) / 2;
  const span = max - min;
  if (span === 0) return 0;
  return span / (1 - Math.abs(2 * lightness - 1));
}

describe("schemes", () => {
  it("10 配色を light / dark の 24 role として読む", () => {
    expect(schemes).toHaveLength(10);
    for (const scheme of schemes) {
      expect(scheme.light).toHaveLength(24);
      expect(scheme.dark).toHaveLength(24);
      expect(scheme.light.every((color) => color.name.length > 0)).toBe(true);
      expect(scheme.dark.every((color) => color.name.length > 0)).toBe(true);
    }
  });

  it("role が欠けたら失敗する", () => {
    const [sourcePath, source] = Object.entries(schemeFiles)[0];
    const missing = source.replace(/^\s+--color-background:.*\r?\n/m, "");
    expect(() => parseSchemeCss(missing, sourcePath)).toThrow("24 件");
  });

  /**
   * 旧配色は面と本文を全 scheme で同じ無彩色にしていた。
   * 新配色はテーマの色相へわずかに寄せるので、同値ではなく彩度の上限で見る。
   * 判断は docs/decisions/2026-09-20-catalog-material-color-roles.md に残す。
   */
  it("全 scheme の面、線、本文の彩度を抑える", () => {
    for (const scheme of schemes) {
      for (const mode of ["light", "dark"] as const) {
        const colors = new Map(scheme[mode].map((color) => [color.role, color.value]));
        for (const role of QUIET_ROLES) {
          const value = colors.get(role);
          expect(value, `${scheme.id}/${mode}/${role}`).toBeDefined();
          expect(
            saturationOf(value!),
            `${scheme.id}/${mode}/${role} = ${value}`,
          ).toBeLessThanOrEqual(QUIET_SATURATION);
        }
      }
    }
  });

  it("全 scheme の Light / Dark がコントラスト目標を満たす", () => {
    const failures: string[] = [];
    for (const scheme of schemes) {
      for (const mode of ["light", "dark"] as const) {
        const colors = new Map(scheme[mode].map((color) => [color.role, color.value]));
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
