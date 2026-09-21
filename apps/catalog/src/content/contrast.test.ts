import { describe, expect, it } from "vitest";
import {
  contrastRatio,
  contrastRatioFromCss,
  formatRatio,
  hexFromCssColor,
  parseCssColor,
  passesWcag,
  relativeLuminance,
  ROLE_GROUPS,
} from "./contrast";

describe("parseCssColor", () => {
  it("HEX を読む", () => {
    expect(parseCssColor("#2b2b2b")).toEqual({ r: 43, g: 43, b: 43 });
    expect(parseCssColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("oklch を sRGB に変換する", () => {
    const rgb = parseCssColor("oklch(0.19 0 0)");
    expect(rgb.r).toBeGreaterThanOrEqual(0);
    expect(rgb.r).toBeLessThan(50);
    expect(rgb.r).toBe(rgb.g);
    expect(rgb.g).toBe(rgb.b);
  });
});

describe("WCAG contrast", () => {
  it("白と黒は 21:1 である", () => {
    expect(contrastRatio({ r: 255, g: 255, b: 255 }, { r: 0, g: 0, b: 0 })).toBe(21);
  });

  it("相対輝度の式を使う", () => {
    expect(relativeLuminance({ r: 255, g: 255, b: 255 })).toBeCloseTo(1);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBeCloseTo(0);
  });

  it("sumi の本文と背景は 4.5:1 を満たす", () => {
    const ratio = contrastRatioFromCss("#2b2b2b", "#fbfaf5");
    expect(ratio).toBeGreaterThan(4.5);
    expect(passesWcag(ratio, 4.5)).toBe(true);
    expect(formatRatio(ratio)).toMatch(/^\d+\.\d{2}:1$/);
  });

  it("HEX へ正規化する", () => {
    expect(hexFromCssColor("#2b2b2b")).toBe("#2b2b2b");
    expect(hexFromCssColor("#fff")).toBe("#ffffff");
  });

  it("24 role を主色 / 副色 / 第三色 / 面・線 / 状態に分ける", () => {
    const roles = ROLE_GROUPS.flatMap((group) => group.roles);
    expect(roles).toHaveLength(24);
    expect(new Set(roles).size).toBe(24);
  });
});
