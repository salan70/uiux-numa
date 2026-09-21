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
    primary: { name: "朱色", hex: "#eb6101" },
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
const inkDark = "#201d1b";
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

  const semanticGroups = [
    { name: "success", hue: 148, sat: 0.82 },
    { name: "warning", hue: 48, sat: 0.96 },
    { name: "error", hue: 7, sat: 0.86 },
  ];
  for (const group of semanticGroups) {
    palette[group.name] = toneAgainstSurfaces(
      group.hue,
      group.sat,
      isDark ? 0.72 : 0.33,
      [palette.surface, palette["surface-variant"]],
      4.5,
    );
  }

  const failures = paletteContrastFailures(palette);
  if (failures.length > 0) {
    throw new Error(`${scheme.id}/${mode}: コントラスト条件を満たさない: ${failures.join(", ")}`);
  }
  return palette;
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
