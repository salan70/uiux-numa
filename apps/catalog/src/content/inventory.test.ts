import { describe, expect, it } from "vitest";
import { catalog } from "./collect";

describe("catalog inventory", () => {
  it("token、配色、SVG、Experiment を欠落なく集める", () => {
    expect(catalog.tokens).toHaveLength(16);
    expect(catalog.tokens.filter((token) => token.kind === "primitive")).toHaveLength(10);
    expect(catalog.tokens.filter((token) => token.kind === "semantic")).toHaveLength(6);
    expect(catalog.schemes).toHaveLength(14);
    expect(catalog.svgs.flatMap((group) => group.assets)).toHaveLength(69);
    expect(
      catalog.svgs.flatMap((group) => group.assets).every((asset) => asset.source.includes("<svg")),
    ).toBe(true);
    expect(catalog.experiments).toHaveLength(7);
    expect(catalog.liveVariants).toHaveLength(41);
  });

  it("Experiment を種別へ割り当てる", () => {
    expect(slugs("colors")).toEqual(["color-schemes"]);
    expect(slugs("typography")).toEqual(["product-ui-typography"]);
    expect(slugs("icons")).toEqual(["class-tech-icons", "hako-feature-icons"]);
    expect(slugs("graphics")).toEqual(["class-chapter-illustration", "class-doc-logo"]);
    expect(slugs("components")).toEqual(["form-inline-validation"]);
  });

  it("live variant の id が重複しない", () => {
    for (const experiment of catalog.experiments) {
      expect(new Set(experiment.variantIds).size).toBe(experiment.variantIds.length);
      expect(experiment.variantIds.length).toBeGreaterThan(0);
    }
  });
});

function slugs(category: string): string[] {
  return catalog.experiments
    .filter((experiment) => experiment.category === category)
    .map((experiment) => experiment.slug);
}
