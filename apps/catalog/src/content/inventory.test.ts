import { describe, expect, it } from "vitest";
import { assertAdoptedIds, catalog } from "./collect";

describe("catalog inventory", () => {
  it("token、配色、SVG、Experiment を欠落なく集める", () => {
    expect(catalog.tokens).toHaveLength(56);
    expect(catalog.tokens.filter((token) => token.kind === "primitive")).toHaveLength(40);
    expect(catalog.tokens.filter((token) => token.kind === "semantic")).toHaveLength(16);
    expect(catalog.schemes).toHaveLength(10);
    expect(catalog.svgs.flatMap((group) => group.assets)).toHaveLength(38);
    expect(
      catalog.svgs.flatMap((group) => group.assets).every((asset) => asset.source.includes("<svg")),
    ).toBe(true);
    expect(catalog.experiments).toHaveLength(11);
    expect(catalog.liveVariants).toHaveLength(33);
    expect(catalog.tokenAssets).toEqual([
      {
        sourcePath: "tokens/border/border.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: [],
      },
      {
        sourcePath: "tokens/motion/motion.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: [],
      },
      {
        sourcePath: "tokens/radius/radius.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: [],
      },
      {
        sourcePath: "tokens/size/size.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: [],
      },
      {
        sourcePath: "tokens/space/space.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: [],
      },
      {
        sourcePath: "tokens/typography/typography.tokens.json",
        role: "foundation",
        maturity: "candidate",
        platforms: ["web"],
        sources: ["product-ui-typography"],
      },
    ]);
  });

  it("Experiment を topic へ割り当てる", () => {
    expect(slugs("colors")).toEqual(["color-schemes-material"]);
    expect(slugs("typography")).toEqual(["product-ui-typography"]);
    expect(slugs("icons")).toEqual([
      "catalog-theme-icons",
      "catalog-ui-icons",
      "class-tech-icons",
      "hako-feature-icons",
    ]);
    expect(slugs("components")).toEqual(["button", "card"]);
    expect(slugs("motion")).toEqual(["catalog-screen-entrance"]);
    // topic に当たらない Experiment は Catalog に載せず、削除もしない。
    // 掲載しないものを明示し、新しい Experiment が黙って消えることを防ぐ。
    expect(unlisted()).toEqual(["cornix-product-ui", "uiux-numa-logo"]);
  });

  it("token を正本のファイル単位で束ねる", () => {
    expect(catalog.tokenFamilies.map((family) => family.id)).toEqual([
      "border",
      "motion",
      "radius",
      "size",
      "space",
      "typography",
    ]);
    for (const family of catalog.tokenFamilies) {
      expect(family.tokens.length).toBeGreaterThan(0);
      expect(family.sourcePath).toMatch(/^tokens\/.+\.tokens\.json$/);
    }
    expect(catalog.tokenFamilies.flatMap((family) => family.tokens)).toHaveLength(
      catalog.tokens.length,
    );
  });

  it("実例 3 件の role を読む", () => {
    expect(catalog.experiments.find((item) => item.slug === "product-ui-typography")?.role).toBe(
      "foundation",
    );
    expect(catalog.experiments.find((item) => item.slug === "hako-feature-icons")?.role).toBe(
      "reference",
    );
    expect(catalog.tokenAssets.every((asset) => asset.role === "foundation")).toBe(true);
  });

  it("live variant の id が重複しない", () => {
    for (const experiment of catalog.experiments) {
      expect(new Set(experiment.variantIds).size).toBe(experiment.variantIds.length);
      expect(experiment.variantIds.length).toBeGreaterThan(0);
    }
  });

  it("adopted 件数と variant のステータスを検査する", () => {
    expect(ids("adopted")).toEqual([
      "button/pill-action",
      "card/zoom-cover",
      "catalog-screen-entrance/blur-focus",
      "catalog-screen-entrance/char-stagger",
      "catalog-screen-entrance/line-mask",
      "catalog-theme-icons/tomoe-classic",
      "catalog-ui-icons/round-soft",
      "class-tech-icons/line-round",
      "color-schemes-material/aizome",
      "color-schemes-material/azuki",
      "color-schemes-material/fuji",
      "color-schemes-material/kingyo",
      "color-schemes-material/shinbashi",
      "color-schemes-material/sumi",
      "color-schemes-material/tsukiyo",
      "color-schemes-material/ume",
      "color-schemes-material/wasabi",
      "color-schemes-material/yuzu",
      "product-ui-typography/line-seed-minimal",
      "uiux-numa-logo/nu-round",
    ]);
    // status が decided 以外の Experiment の variant はすべて exploring になる。
    expect(ids("exploring").every((id) => exploringSlugs().includes(id.split("/")[0]))).toBe(true);
    expect(ids("exploring")).toHaveLength(
      exploringSlugs().reduce(
        (total, slug) =>
          total + (catalog.experiments.find((item) => item.slug === slug)?.variantIds.length ?? 0),
        0,
      ),
    );
    expect(catalog.experiments.find((item) => item.slug === "hako-feature-icons")?.status).not.toBe(
      "decided",
    );
  });

  it("Variants 表の仮説と変えた軸を variant ごとに読む", () => {
    // Motion 画面は説明を README から読む。列の読み違いで説明が消えたり入れ替わったりしないことを確かめる。
    const motion = catalog.experiments.find((item) => item.slug === "catalog-screen-entrance");
    const blur = motion?.variants.find((variant) => variant.id === "blur-focus");
    expect(blur?.hypothesis).toBe("語ごとにぼかしから焦点を合わせると、柔らかく上質に見える");
    expect(blur?.axis).toBe("語ごとにぼかしから焦点が合う。900ms、語の間隔 80ms");
  });

  it("adopted に Variants 表にない ID があると失敗する", () => {
    expect(() =>
      assertAdoptedIds(["missing"], ["on-submit"], "experiments/form/README.md"),
    ).toThrow("adopted の missing が Variants 表にない");
  });
});

function slugs(topic: string): string[] {
  return catalog.experiments
    .filter((experiment) => experiment.topic === topic)
    .map((experiment) => experiment.slug);
}

function unlisted(): string[] {
  return catalog.experiments
    .filter((experiment) => experiment.topic === null)
    .map((experiment) => experiment.slug);
}

function exploringSlugs(): string[] {
  return catalog.experiments
    .filter((experiment) => experiment.status !== "decided")
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
