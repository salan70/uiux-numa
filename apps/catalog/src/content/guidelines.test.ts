import { describe, expect, it } from "vitest";
import { FIGURE_COMPONENTS } from "../components/figures";
import {
  ALL_GUIDELINES,
  GUIDELINE_ORDER,
  parseGuideline,
  resolveHref,
  VALID_FIGURE_KEYS,
} from "./guidelines";

const FRONT = [
  "---",
  "title: Test",
  "summary: 検証用の文書。",
  "status: draft",
  "axes:",
  "  - accessibility",
  "created: 2026-09-20",
  "updated: 2026-09-20",
  "---",
  "",
].join("\n");

const BODY = [
  "## 目的",
  "",
  "目指す状態を書く。",
  "",
  "## コア",
  "",
  "### 配置を動かさない",
  "",
  "状態の変化で周囲の要素を動かさない。",
  "",
  "## Tips",
  "",
  "### 寸法を変えない",
  "",
  "意図と根拠: 周囲が揺れるため。",
  "",
  "- 適用: foundation",
  "- コア: 配置を動かさない",
  "- 良い例: 色だけで示す。",
  "- 悪い例: 太字にする。",
  "",
].join("\n");

function doc(body = BODY, front = FRONT): string {
  return front + body;
}

describe("parseGuideline（新書式）", () => {
  it("目的、コア、Tips を読む", () => {
    const guideline = parseGuideline("test", doc());
    expect(guideline.title).toBe("Test");
    expect(guideline.purpose).toBe("目指す状態を書く。");
    expect(guideline.core).toEqual([
      { title: "配置を動かさない", body: "状態の変化で周囲の要素を動かさない。" },
    ]);
    expect(guideline.tips[0].applies).toBe("foundation");
    expect(guideline.tips[0].cores).toEqual(["配置を動かさない"]);
    expect(guideline.scope).toBeNull();
    expect(guideline.checklist).toEqual([]);
  });

  it("frontmatter が欠けていれば落とす", () => {
    expect(() => parseGuideline("test", doc(BODY, "---\nsummary: x\n---\n"))).toThrow(/title/);
    const noAxes = ["---", "title: Test", "summary: x", "status: draft", "---", ""].join("\n");
    expect(() => parseGuideline("test", doc(BODY, noAxes))).toThrow(/axes/);
  });

  it("未知の評価軸で落とす", () => {
    const front = FRONT.replace("  - accessibility", "  - not-an-axis");
    expect(() => parseGuideline("test", doc(BODY, front))).toThrow(/unknown evaluation axis/);
  });

  it("未知の節で落とす", () => {
    expect(() => parseGuideline("test", doc(`${BODY}\n## 出典\n\n- x\n`))).toThrow(
      /unknown section/,
    );
  });

  it("コアに箇条書きがあれば落とす", () => {
    const body = BODY.replace(
      "状態の変化で周囲の要素を動かさない。",
      "状態の変化で周囲の要素を動かさない。\n\n- 良い例: だめ。",
    );
    expect(() => parseGuideline("test", doc(body))).toThrow(/must not have list items/);
  });

  it("Tips の適用とコアを必須にする", () => {
    expect(() => parseGuideline("test", doc(BODY.replace("- 適用: foundation\n", "")))).toThrow(
      /missing '- 適用'/,
    );
    expect(() =>
      parseGuideline("test", doc(BODY.replace("- コア: 配置を動かさない\n", ""))),
    ).toThrow(/missing '- コア'/);
  });

  it("不正な適用の値で落とす", () => {
    expect(() => parseGuideline("test", doc(BODY.replace("foundation", "reference")))).toThrow(
      /unknown 適用/,
    );
  });

  it("存在しないコアを指したら落とす", () => {
    expect(() =>
      parseGuideline("test", doc(BODY.replace("- コア: 配置を動かさない", "- コア: 無い"))),
    ).toThrow(/unknown core/);
  });

  it("良い例と悪い例を必須にする", () => {
    expect(() =>
      parseGuideline("test", doc(BODY.replace("- 良い例: 色だけで示す。\n", ""))),
    ).toThrow(/missing '- 良い例'/);
  });

  it("未知の図版キーで落とす", () => {
    const body = BODY.replace(
      "- 悪い例: 太字にする。",
      "- 悪い例: 太字にする。\n- 図: not-a-figure",
    );
    expect(() => parseGuideline("test", doc(body))).toThrow(/unknown figure key/);
  });
});

describe("resolveHref", () => {
  it("外部リンクはそのまま返す", () => {
    expect(resolveHref("https://www.w3.org/")).toBe("https://www.w3.org/");
  });

  it("文書内の相対パスをリポジトリの該当ファイルへ送る", () => {
    expect(resolveHref("../../docs/principles/x.md")).toBe(
      "https://github.com/salan70/uiux-numa/blob/main/docs/principles/x.md",
    );
    expect(resolveHref("../../experiments/form-inline-validation/README.md")).toBe(
      "https://github.com/salan70/uiux-numa/blob/main/experiments/form-inline-validation/README.md",
    );
  });
});

describe("ALL_GUIDELINES", () => {
  it("README を除いた 6 文書を指定の順で読む", () => {
    expect(ALL_GUIDELINES.map((item) => item.slug)).toEqual([...GUIDELINE_ORDER]);
  });

  it("どの文書もコアと Tips を持つ", () => {
    for (const guideline of ALL_GUIDELINES) {
      expect(guideline.core.length).toBeGreaterThan(0);
      expect(guideline.tips.length).toBeGreaterThan(0);
    }
  });

  it("新書式の文書は Tips に適用と関連するコアを持つ", () => {
    const states = ALL_GUIDELINES.find((item) => item.slug === "states-and-feedback");
    if (!states) throw new Error("states-and-feedback がない");
    expect(states.scope).toBeNull();
    for (const tip of states.tips) {
      expect(tip.applies).not.toBeNull();
      expect(tip.cores.length).toBeGreaterThan(0);
      for (const core of tip.cores) {
        expect(states.core.some((item) => item.title === core)).toBe(true);
      }
    }
  });

  it("未移行の文書は旧書式のまま読める", () => {
    const color = ALL_GUIDELINES.find((item) => item.slug === "color");
    if (!color) throw new Error("color がない");
    expect(color.scope).not.toBeNull();
    expect(color.checklist.length).toBeGreaterThan(0);
    expect(color.tips[0].applies).toBeNull();
  });
});

describe("図版", () => {
  it("正本のキーがすべて描ける", () => {
    for (const key of VALID_FIGURE_KEYS) {
      expect(FIGURE_COMPONENTS[key]).toBeTypeOf("function");
    }
    expect(Object.keys(FIGURE_COMPONENTS).sort()).toEqual([...VALID_FIGURE_KEYS].sort());
  });

  it("文書が指す図版のキーは正本にある", () => {
    for (const guideline of ALL_GUIDELINES) {
      for (const tip of guideline.tips) {
        if (tip.figureKey) expect(FIGURE_COMPONENTS[tip.figureKey]).toBeTypeOf("function");
      }
    }
  });
});
