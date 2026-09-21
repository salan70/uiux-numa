export type Seed = { name: string; hex: string };
export type Scheme = {
  id: string;
  label: string;
  primary: Seed;
  secondary: Seed;
  tertiary: Seed;
};
export type Palette = Record<string, string>;
export type Mode = "light" | "dark";

export const schemes: Scheme[] = [
  {
    id: "wasabi",
    label: "わさび",
    primary: { name: "萌黄", hex: "#aacf53" },
    secondary: { name: "梅紫", hex: "#aa4c8f" },
    tertiary: { name: "藍色", hex: "#165e83" },
  },
  {
    id: "yuzu",
    label: "ゆず",
    primary: { name: "鬱金色", hex: "#fabf14" },
    secondary: { name: "千歳緑", hex: "#316745" },
    tertiary: { name: "菖蒲色", hex: "#674196" },
  },
  {
    id: "azuki",
    label: "あずき",
    primary: { name: "小豆色", hex: "#96514d" },
    secondary: { name: "萌葱色", hex: "#006e54" },
    tertiary: { name: "黄金", hex: "#e6b422" },
  },
  {
    id: "aizome",
    label: "あいぞめ",
    primary: { name: "藍色", hex: "#165e83" },
    secondary: { name: "琥珀色", hex: "#bf783a" },
    tertiary: { name: "梅紫", hex: "#aa4c8f" },
  },
  {
    id: "sumi",
    label: "すみ",
    primary: { name: "蝋色", hex: "#2b2b2b" },
    secondary: { name: "深緋", hex: "#c9171e" },
    tertiary: { name: "黄金", hex: "#e6b422" },
  },
  {
    id: "fuji",
    label: "ふじ",
    primary: { name: "藤紫", hex: "#a59aca" },
    secondary: { name: "萌黄", hex: "#aacf53" },
    tertiary: { name: "朱色", hex: "#eb6101" },
  },
  {
    id: "ume",
    label: "うめ",
    primary: { name: "梅紫", hex: "#aa4c8f" },
    secondary: { name: "萌葱色", hex: "#006e54" },
    tertiary: { name: "新橋色", hex: "#59b9c6" },
  },
  {
    id: "shinbashi",
    label: "しんばし",
    primary: { name: "新橋色", hex: "#59b9c6" },
    secondary: { name: "東雲色", hex: "#f19072" },
    tertiary: { name: "菖蒲色", hex: "#674196" },
  },
  {
    id: "kingyo",
    label: "きんぎょ",
    primary: { name: "鮮やかな朱色", hex: "#ff7600" },
    secondary: { name: "藍色", hex: "#165e83" },
    tertiary: { name: "萌黄", hex: "#aacf53" },
  },
  {
    id: "tsukiyo",
    label: "つきよ",
    primary: { name: "紺青", hex: "#192f60" },
    secondary: { name: "黄金", hex: "#e6b422" },
    tertiary: { name: "萌葱色", hex: "#006e54" },
  },
];

const families = ["primary", "secondary", "tertiary"] as const;
const inkDark = "#120d09";
const inkLight = "#fffdf9";

export function makePalette(scheme: Scheme, mode: Mode): Palette {
  const isDark = mode === "dark";
  const primarySeed = rgbToHsl(scheme.primary.hex);
  const p = primarySeed.s < 0.08 ? 0 : primarySeed.h;
  const neutralS = primarySeed.s < 0.08 ? 0.025 : 0.055;
  const neutral = (light: number, sat = neutralS, hue = p) => hslToHex(hue, sat, light);
  const palette: Palette = {
    background: neutral(isDark ? 0.105 : 0.975),
    surface: neutral(isDark ? 0.15 : 0.995),
    "on-surface": neutral(isDark ? 0.94 : 0.12, 0),
    "surface-container": neutral(isDark ? 0.2 : 0.94),
    "surface-variant": neutral(isDark ? 0.27 : 0.88, isDark ? 0.1 : 0.07),
    "on-surface-variant": neutral(isDark ? 0.79 : 0.3, 0),
    outline: neutral(isDark ? 0.58 : 0.46, isDark ? 0.08 : 0),
  };

  for (const family of families) {
    const seed = scheme[family];
    const hsl = rgbToHsl(seed.hex);
    const saturation = hsl.s < 0.08 ? 0 : Math.min(0.96, Math.max(0.68, hsl.s + 0.12));
    const brandHue = hsl.s < 0.08 ? 0 : hsl.h;
    const mainColor = seed.hex;
    const mainInk = inkFor(mainColor, [inkDark, inkLight]);
    const containerInk = isDark ? inkLight : inkDark;
    const container = toneAgainstSurfaces(
      brandHue,
      saturation * 0.82,
      isDark ? 0.3 : 0.9,
      [containerInk],
      4.5,
    );
    palette[family] = mainColor;
    palette[`on-${family}`] = mainInk;
    palette[`${family}-container`] = container;
    palette[`on-${family}-container`] = containerInk;
  }
  const primaryHsl = rgbToHsl(scheme.primary.hex);
  const primaryHue = primaryHsl.s < 0.08 ? 0 : primaryHsl.h;
  const primarySaturation =
    primaryHsl.s < 0.08 ? 0 : Math.min(0.96, Math.max(0.68, primaryHsl.s + 0.12));
  const surfaces = [
    palette.background,
    palette.surface,
    palette["surface-container"],
    palette["surface-variant"],
  ];
  palette.focus = toneAgainstSurfaces(
    primaryHue,
    primarySaturation,
    isDark ? 0.72 : 0.32,
    surfaces,
    3,
  );
  // primary は on-primary との 4.5:1 しか保証しない。面の上に置く文字と色付き罫線には足りない。
  // 色相と彩度は primary のまま、4 つの面すべてに 4.5:1 を満たす明度へ寄せる。
  palette["primary-text"] = toneAgainstSurfaces(
    primaryHue,
    primarySaturation,
    isDark ? 0.78 : 0.3,
    surfaces,
    4.5,
  );

  const status = statusColors(scheme, [palette.surface, palette["surface-variant"]], isDark);
  Object.assign(palette, status);

  const failures = paletteContrastFailures(palette);
  if (failures.length > 0) {
    throw new Error(`${scheme.id}/${mode}: コントラスト条件を満たさない: ${failures.join(", ")}`);
  }
  return palette;
}

/**
 * 状態色の基準の色相（OKLCH）。error は sRGB の赤の色相 29° の近く、success は緑、warning は琥珀に置く。
 * 配色へ寄せても隣の状態色へ届かないよう、3 色を 50° 以上離す。
 */
const STATUS_HUES = { success: 150, warning: 80, error: 27 } as const;

/**
 * 基準の色相を配色へ寄せる上限。
 * Material Color Utilities の harmonize は差の半分、最大 15° を回す。
 * ここは 10° にし、寄せた後も error と warning の間に 30° 以上を残す。
 */
const STATUS_HUE_SHIFT = 10;

/**
 * 状態色を配色から決める。値を固定せず、次の 3 つを配色の基準色から計算する。
 *
 * - 色相: 基準の色相を、配色の主な色相へ差の半分だけ回す（上限 STATUS_HUE_SHIFT）。
 *   主な色相は primary、無彩なら secondary、tertiary の順で最初の有彩色にする。
 * - 明度: 3 色を同じ OKLCH L に揃え、1 色だけ明るく目立つことを防ぐ。
 *   L は 3 色すべてが面に 4.5:1 を満たす範囲で、面から最も遠くない値にする。
 * - 彩度: 基準色 3 色の相対彩度（その明度と色相で sRGB が出せる最大彩度に対する比）の平均を掛ける。
 *   鮮やかな配色では状態色も鮮やかに、落ち着いた配色では落ち着く。
 */
function statusColors(scheme: Scheme, surfaces: string[], isDark: boolean): Palette {
  const seeds = families.map((family) => toOklch(scheme[family].hex));
  const key = seeds.find((seed) => seed.c >= 0.03) ?? seeds[0];
  const vividness =
    seeds.reduce((sum, seed) => sum + seed.c / maxChroma(seed.l, seed.h), 0) / seeds.length;
  const hues = Object.entries(STATUS_HUES).map(([name, base]) => {
    const difference = ((key.h - base + 540) % 360) - 180;
    const shift = Math.sign(difference) * Math.min(Math.abs(difference) / 2, STATUS_HUE_SHIFT);
    return { name, hue: base + shift };
  });
  const colorsAt = (lightness: number) =>
    hues.map(({ name, hue }) => ({
      name,
      hex: fromOklch(lightness, maxChroma(lightness, hue) * vividness, hue),
    }));
  const passes = (lightness: number) =>
    colorsAt(lightness).every(({ hex }) =>
      surfaces.every((surface) => contrastRatio(hex, surface) >= 4.5),
    );

  // ライトは明るい側から、ダークは暗い側から探し、最初に全色が通る L を採る。
  // 面に最も近い L ほど、同じ色相で sRGB が出せる彩度が大きい。
  for (let step = 0; step <= 1000; step += 1) {
    const lightness = isDark ? step / 1000 : 1 - step / 1000;
    if (passes(lightness))
      return Object.fromEntries(colorsAt(lightness).map(({ name, hex }) => [name, hex]));
  }
  throw new Error(`${scheme.id}: 状態色が面に 4.5:1 を満たさない`);
}

export function paletteContrastFailures(palette: Palette): string[] {
  const failures: string[] = [];
  const check = (foreground: string, background: string, minimum: number, label: string) => {
    const ratio = contrastRatio(palette[foreground], palette[background]);
    if (ratio < minimum) failures.push(`${label} ${ratio.toFixed(2)}:1 < ${minimum}:1`);
  };
  for (const family of families) {
    check(`on-${family}`, family, 4.5, family);
    check(`on-${family}-container`, `${family}-container`, 4.5, `${family}-container`);
  }
  for (const surface of ["background", "surface", "surface-container"]) {
    check("on-surface", surface, 4.5, surface);
  }
  check("on-surface-variant", "surface-variant", 4.5, "surface-variant");
  for (const surface of ["background", "surface", "surface-container", "surface-variant"]) {
    check("outline", surface, 3, `outline/${surface}`);
    check("focus", surface, 3, `focus/${surface}`);
    check("primary-text", surface, 4.5, `primary-text/${surface}`);
  }
  for (const status of ["success", "warning", "error"]) {
    for (const surface of ["surface", "surface-variant"]) {
      check(status, surface, 4.5, `${status}/${surface}`);
    }
  }
  return failures;
}

export function contrastRatio(foreground: string, background: string): number {
  const luminance = (hex: string) => {
    const { r, g, b } = rgbToHsl(hex, true);
    return [r, g, b].reduce((sum, channel, index) => {
      const linear = channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      return sum + linear * [0.2126, 0.7152, 0.0722][index];
    }, 0);
  };
  const a = luminance(foreground);
  const b = luminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

function toneAgainstSurfaces(
  h: number,
  s: number,
  preferred: number,
  surfaces: string[],
  minimumContrast: number,
): string {
  let best = "#777777";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let step = 2; step <= 98; step += 1) {
    const lightness = step / 100;
    const candidate = hslToHex(h, s, lightness);
    const passes = surfaces.every(
      (surface) => contrastRatio(candidate, surface) >= minimumContrast,
    );
    const distance = Math.abs(lightness - preferred);
    if (passes && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best;
}

function inkFor(color: string, inks: string[]): string {
  return inks.reduce((best, ink) =>
    contrastRatio(ink, color) > contrastRatio(best, color) ? ink : best,
  );
}

function rgbToHsl(
  hex: string,
  normalized = false,
): { h: number; s: number; l: number; r: number; g: number; b: number } {
  const raw = hex.slice(1);
  let r = Number.parseInt(raw.slice(0, 2), 16) / 255;
  let g = Number.parseInt(raw.slice(2, 4), 16) / 255;
  let b = Number.parseInt(raw.slice(4, 6), 16) / 255;
  if (normalized) return { h: 0, s: 0, l: 0, r, g, b };
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;
  const l = (max + min) / 2;
  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === r) h = ((g - b) / delta) % 6;
    else if (max === g) h = (b - r) / delta + 2;
    else h = (r - g) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l, r, g, b };
}

function hslToHex(h: number, s: number, l: number): string {
  const chroma = (1 - Math.abs(2 * l - 1)) * s;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - chroma / 2;
  const [r, g, b] =
    h < 60
      ? [chroma, x, 0]
      : h < 120
        ? [x, chroma, 0]
        : h < 180
          ? [0, chroma, x]
          : h < 240
            ? [0, x, chroma]
            : h < 300
              ? [x, 0, chroma]
              : [chroma, 0, x];
  return `#${[r, g, b]
    .map((channel) =>
      Math.round((channel + m) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("")}`;
}

type Oklch = { l: number; c: number; h: number };

function toOklch(hex: string): Oklch {
  const { r, g, b } = rgbToHsl(hex, true);
  const [lr, lg, lb] = [r, g, b].map((channel) =>
    channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4,
  );
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return {
    l: lightness,
    c: Math.hypot(a, bAxis),
    h: ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360,
  };
}

/** OKLCH から線形 sRGB。範囲外の値もそのまま返し、色域の判定に使う。 */
function oklchToLinear(lightness: number, chroma: number, hue: number): number[] {
  const a = chroma * Math.cos((hue * Math.PI) / 180);
  const b = chroma * Math.sin((hue * Math.PI) / 180);
  const l = (lightness + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (lightness - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (lightness - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ];
}

/** その明度と色相で sRGB が出せる最大の彩度。二分探索で求める。 */
function maxChroma(lightness: number, hue: number): number {
  let low = 0;
  let high = 0.4;
  for (let index = 0; index < 30; index += 1) {
    const middle = (low + high) / 2;
    const inGamut = oklchToLinear(lightness, middle, hue).every(
      (channel) => channel >= -1e-6 && channel <= 1 + 1e-6,
    );
    if (inGamut) low = middle;
    else high = middle;
  }
  return low;
}

function fromOklch(lightness: number, chroma: number, hue: number): string {
  return `#${oklchToLinear(lightness, chroma, hue)
    .map((channel) => {
      const linear = Math.min(1, Math.max(0, channel));
      const encoded = linear <= 0.0031308 ? 12.92 * linear : 1.055 * linear ** (1 / 2.4) - 0.055;
      return Math.round(encoded * 255)
        .toString(16)
        .padStart(2, "0");
    })
    .join("")}`;
}
