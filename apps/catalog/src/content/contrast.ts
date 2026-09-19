export type Rgb = { r: number; g: number; b: number };

export type ContrastPair = {
  foreground: string;
  background: string;
  minimum: 4.5 | 3;
};

export const ROLE_GROUPS = [
  {
    id: "text",
    label: "Text",
    roles: ["text", "text-muted", "on-accent", "accent-strong", "success", "warning", "danger"],
  },
  {
    id: "background",
    label: "Background",
    roles: [
      "bg",
      "bg-subtle",
      "surface",
      "accent-subtle",
      "success-subtle",
      "warning-subtle",
      "danger-subtle",
    ],
  },
  {
    id: "border",
    label: "Border",
    roles: ["border", "border-strong", "focus"],
  },
  {
    id: "accent",
    label: "Accent",
    roles: ["accent", "accent-hover"],
  },
] as const;

export const ROLE_CONTRAST: Record<string, { against: string; minimum: 4.5 | 3 } | undefined> = {
  text: { against: "bg", minimum: 4.5 },
  "text-muted": { against: "bg", minimum: 4.5 },
  "on-accent": { against: "accent", minimum: 4.5 },
  "accent-strong": { against: "bg", minimum: 4.5 },
  success: { against: "success-subtle", minimum: 4.5 },
  warning: { against: "warning-subtle", minimum: 4.5 },
  danger: { against: "danger-subtle", minimum: 4.5 },
  "border-strong": { against: "bg", minimum: 3 },
  focus: { against: "bg", minimum: 3 },
};

export const CONTRAST_PAIRS: ContrastPair[] = [
  { foreground: "text", background: "bg", minimum: 4.5 },
  { foreground: "text", background: "bg-subtle", minimum: 4.5 },
  { foreground: "text", background: "surface", minimum: 4.5 },
  { foreground: "text-muted", background: "bg", minimum: 4.5 },
  { foreground: "text-muted", background: "bg-subtle", minimum: 4.5 },
  { foreground: "text-muted", background: "surface", minimum: 4.5 },
  { foreground: "on-accent", background: "accent", minimum: 4.5 },
  { foreground: "on-accent", background: "accent-hover", minimum: 4.5 },
  { foreground: "accent-strong", background: "bg", minimum: 4.5 },
  { foreground: "accent-strong", background: "bg-subtle", minimum: 4.5 },
  { foreground: "accent-strong", background: "surface", minimum: 4.5 },
  { foreground: "accent-strong", background: "accent-subtle", minimum: 4.5 },
  { foreground: "focus", background: "bg", minimum: 3 },
  { foreground: "focus", background: "bg-subtle", minimum: 3 },
  { foreground: "focus", background: "surface", minimum: 3 },
  { foreground: "border-strong", background: "bg", minimum: 3 },
  { foreground: "border-strong", background: "bg-subtle", minimum: 3 },
  { foreground: "border-strong", background: "surface", minimum: 3 },
  { foreground: "success", background: "success-subtle", minimum: 4.5 },
  { foreground: "success", background: "surface", minimum: 4.5 },
  { foreground: "success", background: "bg", minimum: 4.5 },
  { foreground: "warning", background: "warning-subtle", minimum: 4.5 },
  { foreground: "warning", background: "surface", minimum: 4.5 },
  { foreground: "danger", background: "danger-subtle", minimum: 4.5 },
  { foreground: "danger", background: "surface", minimum: 4.5 },
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
