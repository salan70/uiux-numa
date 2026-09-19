import { describe, expect, it } from "vitest";
import { collectTokens, cssName, formatTokenValue } from "./tokens";

const source = {
  font: {
    size: {
      $type: "dimension",
      md: {
        $value: { value: 1, unit: "rem" },
        $description: "本文サイズ",
      },
    },
  },
  typography: {
    $type: "typography",
    body: {
      $value: {
        fontFamily: ["LINE Seed JP", "sans-serif"],
        fontSize: "{font.size.md}",
        fontWeight: 400,
        letterSpacing: { value: 0, unit: "px" },
        lineHeight: 1.75,
      },
      $description: "本文",
    },
  },
};

describe("collectTokens", () => {
  it("primitive と semantic を分け、参照を解決する", () => {
    const { tokens, byName } = collectTokens(source, "tokens/demo.tokens.json");
    expect(tokens).toHaveLength(2);
    expect(byName.get("font.size.md")?.kind).toBe("primitive");
    expect(byName.get("typography.body")?.kind).toBe("semantic");
    expect(byName.get("typography.body")?.references).toEqual(["font.size.md"]);
    expect(
      (byName.get("typography.body")?.resolvedValue as { fontSize: { value: number } }).fontSize
        .value,
    ).toBe(1);
  });

  it("未定義の参照で失敗する", () => {
    expect(() =>
      collectTokens(
        {
          typography: {
            $type: "typography",
            body: {
              $value: { fontSize: "{font.missing}" },
              $description: "欠落",
            },
          },
        },
        "x.json",
      ),
    ).toThrow("未定義の参照");
  });
});

describe("cssName", () => {
  it("JSON path を CSS 変数名にする", () => {
    expect(cssName("font.size.md")).toBe("--font-size-md");
  });
});

describe("formatTokenValue", () => {
  it("未対応 type は JSON を返す", () => {
    expect(formatTokenValue("color", { hex: "#111" })).toBe('{"hex":"#111"}');
  });
});
