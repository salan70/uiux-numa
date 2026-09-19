import { describe, expect, it } from "vitest";
import redirects from "../public/_redirects?raw";
import { matchRoute, OLD_PATH_REDIRECTS } from "./router";

describe("matchRoute", () => {
  it("静的ルートを返す", () => {
    expect(matchRoute("/")).toEqual({ name: "home" });
    expect(matchRoute("/getting-started")).toEqual({ name: "getting-started" });
    expect(matchRoute("/principles")).toEqual({ name: "principles" });
    expect(matchRoute("/foundations/colors")).toEqual({ name: "colors" });
    expect(matchRoute("/foundations/typography")).toEqual({ name: "typography" });
    expect(matchRoute("/foundations/icons")).toEqual({ name: "icons" });
    expect(matchRoute("/foundations/graphics")).toEqual({ name: "graphics" });
    expect(matchRoute("/components")).toEqual({ name: "components" });
    expect(matchRoute("/status")).toEqual({ name: "status" });
    expect(matchRoute("/resources")).toEqual({ name: "resources" });
  });

  it("動的セグメントを返す", () => {
    expect(matchRoute("/principles/icon-set-consistency-by-few-parameters")).toEqual({
      name: "principle",
      slug: "icon-set-consistency-by-few-parameters",
    });
    expect(matchRoute("/foundations/colors/sumi")).toEqual({ name: "color", scheme: "sumi" });
    expect(matchRoute("/foundations/icons/class-tech-icons")).toEqual({
      name: "icon",
      experiment: "class-tech-icons",
    });
    expect(matchRoute("/foundations/graphics/class-doc-logo")).toEqual({
      name: "graphic",
      experiment: "class-doc-logo",
    });
    expect(matchRoute("/components/form-inline-validation")).toEqual({
      name: "component",
      experiment: "form-inline-validation",
    });
  });

  it("旧 URL を新 URL へ送る", () => {
    expect(OLD_PATH_REDIRECTS["/colors"]).toBe("/foundations/colors");
    expect(matchRoute("/colors")).toEqual({ name: "redirect", to: "/foundations/colors" });
    expect(matchRoute("/typography")).toEqual({ name: "redirect", to: "/foundations/typography" });
    expect(matchRoute("/icons")).toEqual({ name: "redirect", to: "/foundations/icons" });
    expect(matchRoute("/graphics")).toEqual({ name: "redirect", to: "/foundations/graphics" });
  });

  it("末尾スラッシュを正規化する", () => {
    expect(matchRoute("/status/")).toEqual({ name: "status" });
  });

  it("_redirects に旧 URL の 301 がある", () => {
    const source = redirects;
    expect(source).toMatch(/\/colors\s+\/foundations\/colors\s+301/);
    expect(source).toMatch(/\/typography\s+\/foundations\/typography\s+301/);
    expect(source).toMatch(/\/icons\s+\/foundations\/icons\s+301/);
    expect(source).toMatch(/\/graphics\s+\/foundations\/graphics\s+301/);
  });
});
