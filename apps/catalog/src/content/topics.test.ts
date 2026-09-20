import { describe, expect, it } from "vitest";
import { matchRoute } from "../router";
import { ALL_GUIDELINES } from "./guidelines";
import { catalog, worksInTopic } from "./collect";
import { isCurrentPath, topicForExperiment, topicHref, TOPICS, workHref } from "./topics";

describe("topicForExperiment", () => {
  it("domain の並び順で最初に当たった topic を採る", () => {
    expect(topicForExperiment("x", ["color", "typography"])).toBe("colors");
    expect(topicForExperiment("x", ["typography", "color"])).toBe("typography");
  });

  it("公開面から外した domain は topic を持たない", () => {
    expect(topicForExperiment("x", ["logo-brand-identity"])).toBeNull();
    expect(topicForExperiment("x", ["illustration-svg"])).toBeNull();
    expect(topicForExperiment("x", ["animation-motion"])).toBeNull();
    // 別の domain も持つ成果物が、次の domain へ流れて無関係な topic に入らないこと。
    expect(topicForExperiment("x", ["logo-brand-identity", "iconography"])).toBeNull();
  });

  it("Catalog 自身を比べる Experiment は出さない", () => {
    expect(topicForExperiment("catalog-editorial", ["color"])).toBeNull();
    expect(topicForExperiment("catalog-redesign", ["color"])).toBeNull();
  });

  it("どの domain にも当たらなければ null を返す", () => {
    expect(topicForExperiment("x", ["not-a-domain"])).toBeNull();
    expect(topicForExperiment("x", [])).toBeNull();
  });
});

describe("ナビのリンク先", () => {
  it("トピックの URL はすべてルートに存在する", () => {
    for (const topic of TOPICS) {
      expect(matchRoute(topic.href).name).not.toBe("notfound");
    }
  });

  it("方針の URL はすべてルートに存在する", () => {
    for (const guideline of ALL_GUIDELINES) {
      expect(matchRoute(`/guidelines/${guideline.slug}`)).toEqual({
        name: "guideline",
        slug: guideline.slug,
      });
    }
  });

  it("掲載する成果物の詳細 URL はすべてルートに存在する", () => {
    for (const work of catalog.experiments) {
      if (!work.topic) continue;
      expect(matchRoute(workHref(work.topic, work.slug)).name).not.toBe("notfound");
    }
  });

  it("tokens のトピックは成果物を持たない", () => {
    expect(worksInTopic("tokens")).toEqual([]);
  });
});

describe("isCurrentPath", () => {
  it("トップは完全一致のときだけ現在地にする", () => {
    expect(isCurrentPath("/", "/")).toBe(true);
    expect(isCurrentPath("/", "/components")).toBe(false);
  });

  it("詳細を開いていてもトピックを現在地にする", () => {
    expect(isCurrentPath(topicHref("components"), "/components/soft-component-kit")).toBe(true);
    expect(isCurrentPath(topicHref("icons"), "/components")).toBe(false);
  });
});
