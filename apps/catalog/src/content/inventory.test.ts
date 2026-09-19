import { describe, expect, it } from "vitest";
import { assertAdoptedIds, catalog } from "./collect";

describe("catalog inventory", () => {
  it("token、配色、SVG、Experiment を欠落なく集める", () => {
    expect(catalog.tokens).toHaveLength(18);
    expect(catalog.tokens.filter((token) => token.kind === "primitive")).toHaveLength(12);
    expect(catalog.tokens.filter((token) => token.kind === "semantic")).toHaveLength(6);
    expect(catalog.schemes).toHaveLength(14);
    expect(catalog.svgs.flatMap((group) => group.assets)).toHaveLength(69);
    expect(
      catalog.svgs.flatMap((group) => group.assets).every((asset) => asset.source.includes("<svg")),
    ).toBe(true);
    expect(catalog.experiments).toHaveLength(8);
    expect(catalog.liveVariants).toHaveLength(45);
  });

  it("Experiment を種別へ割り当てる", () => {
    expect(slugs("colors")).toEqual(["color-schemes"]);
    expect(slugs("typography")).toEqual(["product-ui-typography"]);
    expect(slugs("icons")).toEqual(["class-tech-icons", "hako-feature-icons"]);
    expect(slugs("graphics")).toEqual(["class-chapter-illustration", "class-doc-logo"]);
    expect(slugs("components")).toEqual(["form-inline-validation", "soft-component-kit"]);
  });

  it("live variant の id が重複しない", () => {
    for (const experiment of catalog.experiments) {
      expect(new Set(experiment.variantIds).size).toBe(experiment.variantIds.length);
      expect(experiment.variantIds.length).toBeGreaterThan(0);
    }
  });

  it("adopted 件数と variant のステータスを検査する", () => {
    expect(ids("adopted")).toEqual([
      "class-tech-icons/line-round",
      "color-schemes/aizome",
      "color-schemes/azuki",
      "color-schemes/fuji",
      "color-schemes/kingyo",
      "color-schemes/shinbashi",
      "color-schemes/sumi",
      "color-schemes/tsukiyo",
      "color-schemes/ume",
      "color-schemes/wasabi",
      "color-schemes/yuzu",
      "form-inline-validation/on-submit",
      "product-ui-typography/line-seed-minimal",
    ]);
    expect(
      ids("exploring").every(
        (id) => id.startsWith("hako-feature-icons/") || id.startsWith("soft-component-kit/"),
      ),
    ).toBe(true);
    expect(ids("exploring")).toHaveLength(
      (catalog.experiments.find((item) => item.slug === "hako-feature-icons")?.variantIds.length ??
        0) +
        (catalog.experiments.find((item) => item.slug === "soft-component-kit")?.variantIds
          .length ?? 0),
    );
    expect(
      catalog.experiments
        .filter((item) => item.status === "decided" && item.adopted.length === 0)
        .map((item) => item.slug)
        .sort(),
    ).toEqual(["class-chapter-illustration", "class-doc-logo"]);
    expect(catalog.experiments.find((item) => item.slug === "hako-feature-icons")?.status).not.toBe(
      "decided",
    );
  });

  it("adopted に Variants 表にない ID があると失敗する", () => {
    expect(() =>
      assertAdoptedIds(["missing"], ["on-submit"], "experiments/form/README.md"),
    ).toThrow("adopted の missing が Variants 表にない");
  });
});

function slugs(category: string): string[] {
  return catalog.experiments
    .filter((experiment) => experiment.category === category)
    .map((experiment) => experiment.slug);
}

function ids(status: "adopted" | "rejected" | "exploring"): string[] {
  return catalog.experiments
    .flatMap((experiment) =>
      experiment.variants
        .filter((variant) => variant.status === status)
        .map((variant) => `${experiment.slug}/${variant.id}`),
    )
    .sort();
}
