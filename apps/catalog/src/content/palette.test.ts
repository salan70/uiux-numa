import { describe, expect, it } from "vitest";
import {
  cardColors,
  colorLabel,
  derivedName,
  heroWeight,
  hexOf,
  inkOn,
  labelInk,
  mergeRoles,
  schemeVars,
} from "./palette";
import { schemes } from "./schemes";

const aizome = schemes.find((item) => item.id === "aizome");
const sumi = schemes.find((item) => item.id === "sumi");

describe("derivedName", () => {
  it("彩度の低い色は白から黒までの 8 段に落とす", () => {
    expect(derivedName("#ffffff")).toBe("白");
    expect(derivedName("#f2f2f2")).toBe("白練");
    expect(derivedName("#cccccc")).toBe("白鼠");
    expect(derivedName("#a8a8a8")).toBe("銀鼠");
    expect(derivedName("#808080")).toBe("鼠");
    expect(derivedName("#555555")).toBe("灰");
    expect(derivedName("#222222")).toBe("墨");
    expect(derivedName("#000000")).toBe("黒");
  });

  it("彩度のある色は色相の基本名にする", () => {
    expect(derivedName("#ff0000")).toBe("赤");
    expect(derivedName("#00ff00")).toBe("緑");
    expect(derivedName("#0000ff")).toBe("藍");
  });

  it("明るい色と暗い色には濃淡を 1 つ付ける", () => {
    expect(derivedName("#ffcccc")).toBe("淡赤");
    expect(derivedName("#330000")).toBe("深赤");
  });

  it("読めない値はそのまま返す", () => {
    expect(derivedName("not-a-color")).toBe("not-a-color");
  });
});

describe("colorLabel", () => {
  it("正本の行末コメントがあればそれを使う", () => {
    expect(
      colorLabel({ role: "accent", cssName: "--color-accent", value: "#165e83", name: "藍" }),
    ).toBe("藍");
  });

  it("名が役割名のままなら値から決める", () => {
    expect(
      colorLabel({ role: "accent", cssName: "--color-accent", value: "#ffffff", name: "accent" }),
    ).toBe("白");
  });
});

describe("inkOn", () => {
  it("明るい帯には黒、暗い帯には白を置く", () => {
    expect(inkOn("#ffffff")).toBe("#0c0c0c");
    expect(inkOn("#000000")).toBe("#ffffff");
  });

  it("読めない値でも落とさない", () => {
    expect(inkOn("not-a-color")).toBe("#0c0c0c");
  });
});

describe("hexOf", () => {
  it("表記を # に統一する", () => {
    expect(hexOf("#fff")).toBe("#ffffff");
    expect(hexOf("not-a-color")).toBe("not-a-color");
  });
});

describe("mergeRoles", () => {
  it("同じ値の役割を 1 本の帯にまとめる", () => {
    if (!aizome) throw new Error("aizome がない");
    const bands = mergeRoles(aizome, "light", ["accent", "accent-strong", "focus"]);
    const values = bands.map((band) => band.value);
    expect(new Set(values).size).toBe(values.length);
    const merged = bands.find((band) => band.roles.length > 1);
    expect(merged?.roles.length).toBeGreaterThan(1);
  });

  it("役割は渡した順に並ぶ", () => {
    if (!sumi) throw new Error("sumi がない");
    const bands = mergeRoles(sumi, "light", ["text", "bg"]);
    expect(bands[0].roles[0]).toBe("text");
  });

  it("存在しない役割は飛ばす", () => {
    if (!sumi) throw new Error("sumi がない");
    expect(mergeRoles(sumi, "light", ["not-a-role"])).toEqual([]);
  });
});

describe("cardColors", () => {
  it("すべての配色で 1 本以上 6 本以下になる", () => {
    for (const scheme of schemes) {
      for (const mode of ["light", "dark"] as const) {
        const bands = cardColors(scheme, mode);
        expect(bands.length).toBeGreaterThan(0);
        expect(bands.length).toBeLessThanOrEqual(6);
      }
    }
  });
});

describe("heroWeight", () => {
  it("accent、text、bg だけ幅を 2 倍にする", () => {
    expect(heroWeight({ value: "#000", name: "黒", roles: ["accent"] })).toBe(2);
    expect(heroWeight({ value: "#000", name: "黒", roles: ["border"] })).toBe(1);
    expect(heroWeight({ value: "#000", name: "黒", roles: ["border", "bg"] })).toBe(2);
  });
});

describe("labelInk", () => {
  it("どの配色でも地に対して読める値を返す", () => {
    for (const scheme of schemes) {
      expect(labelInk(scheme, "light")).toBeTruthy();
      expect(labelInk(scheme, "dark")).toBeTruthy();
    }
  });
});

describe("schemeVars", () => {
  it("役割名をそのまま custom property にする", () => {
    if (!sumi) throw new Error("sumi がない");
    const vars = schemeVars(sumi, "light");
    expect(Object.keys(vars)).toHaveLength(sumi.light.length);
    expect(vars["--color-bg"]).toBe(sumi.light.find((item) => item.role === "bg")?.value);
  });
});
