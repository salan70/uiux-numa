export type Rgb = { r: number; g: number; b: number };

export type ContrastPair = {
  foreground: string;
  background: string;
  minimum: 4.5 | 3;
};

/** 役割の意味で束ねる。全 24 役割がいずれかの群に入る。並びは experiments/color-schemes-material/shared/ColorShowcase.tsx に揃える。 */
export const ROLE_GROUPS = [
  {
    id: "primary",
    label: "主色",
    roles: ["primary", "on-primary", "primary-text", "primary-container", "on-primary-container"],
  },
  {
    id: "secondary",
    label: "副色",
    roles: ["secondary", "on-secondary", "secondary-container", "on-secondary-container"],
  },
  {
    id: "tertiary",
    label: "第三色",
    roles: ["tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container"],
  },
  {
    id: "surface",
    label: "面・線",
    roles: [
      "background",
      "surface",
      "on-surface",
      "surface-container",
      "surface-variant",
      "on-surface-variant",
      "outline",
      "focus",
    ],
  },
  { id: "status", label: "状態", roles: ["success", "warning", "error"] },
] as const;

/** 画面へ 1 行で出す代表の組み合わせ。規則の正本は palettes.ts:paletteContrastFailures()。 */
export const ROLE_CONTRAST: Record<string, { against: string; minimum: 4.5 | 3 } | undefined> = {
  "on-surface": { against: "surface", minimum: 4.5 },
  "on-surface-variant": { against: "surface-variant", minimum: 4.5 },
  "on-primary": { against: "primary", minimum: 4.5 },
  "on-secondary": { against: "secondary", minimum: 4.5 },
  "on-tertiary": { against: "tertiary", minimum: 4.5 },
  "on-primary-container": { against: "primary-container", minimum: 4.5 },
  "on-secondary-container": { against: "secondary-container", minimum: 4.5 },
  "on-tertiary-container": { against: "tertiary-container", minimum: 4.5 },
  "primary-text": { against: "background", minimum: 4.5 },
  success: { against: "surface", minimum: 4.5 },
  warning: { against: "surface", minimum: 4.5 },
  error: { against: "surface", minimum: 4.5 },
  outline: { against: "background", minimum: 3 },
  focus: { against: "background", minimum: 3 },
};

const SURFACES = ["background", "surface", "surface-container", "surface-variant"];
const FAMILIES = ["primary", "secondary", "tertiary"];

/**
 * 全 scheme が満たす組み合わせ。palettes.ts:paletteContrastFailures() と同じ規則を持つ。
 * 生成側は throw で止め、こちらは表示前に検査する。片方だけ直すと、Catalog が読めない値を描く。
 */
export const CONTRAST_PAIRS: ContrastPair[] = [
  ...FAMILIES.flatMap((family): ContrastPair[] => [
    { foreground: `on-${family}`, background: family, minimum: 4.5 },
    {
      foreground: `on-${family}-container`,
      background: `${family}-container`,
      minimum: 4.5,
    },
  ]),
  ...["background", "surface", "surface-container"].map(
    (surface): ContrastPair => ({ foreground: "on-surface", background: surface, minimum: 4.5 }),
  ),
  { foreground: "on-surface-variant", background: "surface-variant", minimum: 4.5 },
  ...SURFACES.flatMap((surface): ContrastPair[] => [
    { foreground: "outline", background: surface, minimum: 3 },
    { foreground: "focus", background: surface, minimum: 3 },
    { foreground: "primary-text", background: surface, minimum: 4.5 },
  ]),
  ...["success", "warning", "error"].flatMap((status): ContrastPair[] =>
    ["surface", "surface-variant"].map((surface) => ({
      foreground: status,
      background: surface,
      minimum: 4.5,
    })),
  ),
];

export function parseCssColor(value: string): Rgb {
  const trimmed = value.trim();
  const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) return parseHex(hex[1]);
  const oklch = trimmed.match(
    /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+(-?[0-9.]+)(?:\s*\/\s*[0-9.%]+)?\s*\)$/i,
  );
  if (oklch) {
    return oklchToSrgb8(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  }
  throw new Error(`未対応の色表記: ${value}`);
}

export function hexFromCssColor(value: string): string {
  const rgb = parseCssColor(value);
  return rgbToHex(rgb);
}

export function relativeLuminance(rgb: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(foreground: Rgb, background: Rgb): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  const lighter = Math.max(a, b);
  const darker = Math.min(a, b);
  return (lighter + 0.05) / (darker + 0.05);
}

export function contrastRatioFromCss(foreground: string, background: string): number {
  return contrastRatio(parseCssColor(foreground), parseCssColor(background));
}

export function passesWcag(ratio: number, minimum: 4.5 | 3): boolean {
  return ratio + Number.EPSILON >= minimum;
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

function parseHex(raw: string): Rgb {
  const hex =
    raw.length === 3
      ? raw
          .split("")
          .map((item) => item + item)
          .join("")
      : raw;
  return {
    r: Number.parseInt(hex.slice(0, 2), 16),
    g: Number.parseInt(hex.slice(2, 4), 16),
    b: Number.parseInt(hex.slice(4, 6), 16),
  };
}

function rgbToHex(rgb: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
}

function oklchToSrgb8(L: number, C: number, H: number): Rgb {
  const hue = (H * Math.PI) / 180;
  const a = C * Math.cos(hue);
  const b = C * Math.sin(hue);
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;
  const l = l_ ** 3;
  const m = m_ ** 3;
  const s = s_ ** 3;
  const rLin = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;
  return {
    r: linearToSrgb8(rLin),
    g: linearToSrgb8(gLin),
    b: linearToSrgb8(bLin),
  };
}

function linearToSrgb8(channel: number): number {
  const clamped = Math.min(1, Math.max(0, channel));
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}
