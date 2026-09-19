import { describe, expect, it } from "vitest";
import { catalog } from "./collect";

describe("catalog inventory", () => {
  it("token、Experiment、preview、variant、原則、Skill を欠落なく集める", () => {
    expect(catalog.tokens).toHaveLength(16);
    expect(catalog.tokens.filter((token) => token.kind === "primitive")).toHaveLength(10);
    expect(catalog.tokens.filter((token) => token.kind === "semantic")).toHaveLength(6);
    expect(catalog.experiments).toHaveLength(7);
    expect(catalog.previews).toHaveLength(108);
    expect(catalog.liveVariants).toHaveLength(41);
    expect(catalog.principles).toHaveLength(2);
    expect(catalog.skills).toHaveLength(1);
    expect(catalog.skills[0].name).toBe("crafting-svg");
  });

  it("各 Experiment の live variant と preview が紐づく", () => {
    for (const experiment of catalog.experiments) {
      expect(experiment.liveVariants.length).toBeGreaterThan(0);
      expect(experiment.problem.length).toBeGreaterThan(0);
      for (const preview of experiment.previews) {
        if (preview.kind === "variant") {
          expect(experiment.variantIds).toContain(preview.variant);
        }
      }
    }
  });
});
