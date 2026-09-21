import { describe, expect, it } from "vitest";
import redirects from "../public/_redirects?raw";
import { matchRoute, OLD_PATH_REDIRECTS, resolvePath } from "./router";

describe("matchRoute", () => {
  it("静的ルートを返す", () => {
    expect(matchRoute("/")).toEqual({ name: "home" });
    expect(matchRoute("/foundations/colors")).toEqual({ name: "colors" });
    expect(matchRoute("/foundations/typography")).toEqual({ name: "typography" });
    expect(matchRoute("/foundations/tokens")).toEqual({ name: "tokens" });
    expect(matchRoute("/foundations/icons")).toEqual({ name: "icons" });
    expect(matchRoute("/components")).toEqual({ name: "components" });
    expect(matchRoute("/guidelines")).toEqual({ name: "guideline", slug: null });
  });

  it("動的セグメントを返す", () => {
    expect(matchRoute("/foundations/colors/sumi")).toEqual({ name: "color", scheme: "sumi" });
    expect(matchRoute("/foundations/icons/class-tech-icons")).toEqual({
      name: "icon",
      experiment: "class-tech-icons",
    });
    expect(matchRoute("/foundations/typography/product-ui-typography")).toEqual({
      name: "typographyDetail",
      experiment: "product-ui-typography",
    });
    expect(matchRoute("/guidelines/states-and-feedback")).toEqual({
      name: "guideline",
      slug: "states-and-feedback",
    });
  });

  it("削除した URL は notfound を返す", () => {
    expect(matchRoute("/getting-started")).toEqual({ name: "notfound" });
    expect(matchRoute("/principles")).toEqual({ name: "notfound" });
    expect(matchRoute("/principles/icon-set-consistency-by-few-parameters")).toEqual({
      name: "notfound",
    });
    expect(matchRoute("/status")).toEqual({ name: "notfound" });
    expect(matchRoute("/resources")).toEqual({ name: "notfound" });
    expect(matchRoute("/motion")).toEqual({ name: "notfound" });
    expect(matchRoute("/motion/registration-completion-feedback")).toEqual({ name: "notfound" });
    expect(matchRoute("/graphics")).toEqual({ name: "notfound" });
    expect(matchRoute("/foundations/graphics")).toEqual({ name: "notfound" });
    expect(matchRoute("/foundations/graphics/class-doc-logo")).toEqual({ name: "notfound" });
    expect(matchRoute("/foundations/graphics/class-chapter-illustration")).toEqual({
      name: "notfound",
    });
    expect(matchRoute("/components/button")).toEqual({ name: "notfound" });
    expect(matchRoute("/components/form-inline-validation")).toEqual({ name: "notfound" });
    expect(matchRoute("/components/soft-component-kit")).toEqual({ name: "notfound" });
  });

  it("旧 URL を新 URL へ送る", () => {
    expect(OLD_PATH_REDIRECTS["/colors"]).toBe("/foundations/colors");
    expect(resolvePath("/colors")).toBe("/foundations/colors");
    expect(resolvePath("/colors/")).toBe("/foundations/colors");
    expect(matchRoute("/colors")).toEqual({ name: "redirect", to: "/foundations/colors" });
    expect(matchRoute("/typography")).toEqual({ name: "redirect", to: "/foundations/typography" });
    expect(matchRoute("/icons")).toEqual({ name: "redirect", to: "/foundations/icons" });
    expect(OLD_PATH_REDIRECTS["/graphics"]).toBeUndefined();
  });

  it("末尾スラッシュを正規化する", () => {
    expect(matchRoute("/components/")).toEqual({ name: "components" });
  });

  it("_redirects に旧 URL の 301 がある", () => {
    const source = redirects;
    expect(source).toMatch(/\/colors\s+\/foundations\/colors\s+301/);
    expect(source).toMatch(/\/typography\s+\/foundations\/typography\s+301/);
    expect(source).toMatch(/\/icons\s+\/foundations\/icons\s+301/);
    // graphics は公開面から外した。404 へ 301 で送らない。
    expect(source).not.toMatch(/^\/graphics\s/m);
  });
});
