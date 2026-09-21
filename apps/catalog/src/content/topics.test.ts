import { describe, expect, it } from "vitest";
import { matchRoute } from "../router";
import { ALL_GUIDELINES } from "./guidelines";
import { catalog, worksInTopic } from "./collect";
import { isCurrentPath, topicForExperiment, topicHref, TOPICS, workHref } from "./topics";

describe("topicForExperiment", () => {
  it("domain の並び順で最初に当たった topic を採る", () => {
    expect(topicForExperiment(["color", "typography"])).toBe("colors");
    expect(topicForExperiment(["typography", "color"])).toBe("typography");
  });

  it("どの domain にも当たらなければ null を返す", () => {
    expect(topicForExperiment(["not-a-domain"])).toBeNull();
    expect(topicForExperiment([])).toBeNull();
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

  it("掲載する成果物のリンク先 URL はすべてルートに存在する", () => {
    for (const work of catalog.experiments) {
      if (!work.topic) continue;
      expect(matchRoute(workHref(work.topic, work.slug)).name).not.toBe("notfound");
    }
  });

  it("Components の成果物はトピック本文へ直接つなぐ", () => {
    expect(workHref("components", "button")).toBe("/components");
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
    expect(isCurrentPath(topicHref("icons"), "/foundations/icons/class-tech-icons")).toBe(true);
    expect(isCurrentPath(topicHref("icons"), "/components")).toBe(false);
  });
});
