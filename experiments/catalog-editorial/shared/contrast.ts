// コントラスト比の計算。正本は apps/catalog/src/content/contrast.ts で、ここは必要な関数だけを写す。
// 8bit に丸めた sRGB から WCAG 2 の式で計算する（experiments/color-schemes/README.md の方針と同じ）。

export type Rgb = { r: number; g: number; b: number };

export function parseCssColor(value: string): Rgb {
  const trimmed = value.trim();
  const hex = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (hex) return parseHex(hex[1]);
  const oklch = trimmed.match(
    /^oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+(-?[0-9.]+)(?:\s*\/\s*[0-9.%]+)?\s*\)$/i,
  );
  if (oklch) return oklchToSrgb8(Number(oklch[1]), Number(oklch[2]), Number(oklch[3]));
  throw new Error(`未対応の色表記: ${value}`);
}

/** 表示用の hex。oklch も 8bit に丸めた sRGB へ寄せる。 */
export function hexFromCssColor(value: string): string {
  return rgbToHex(parseCssColor(value));
}

export function relativeLuminance(rgb: Rgb): number {
  const channel = (value: number) => {
    const c = value / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(rgb.r) + 0.7152 * channel(rgb.g) + 0.0722 * channel(rgb.b);
}

export function contrastRatio(foreground: string, background: string): number {
  const a = relativeLuminance(parseCssColor(foreground));
  const b = relativeLuminance(parseCssColor(background));
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

export function formatRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

export function passes(ratio: number, minimum: 4.5 | 3): boolean {
  return ratio + Number.EPSILON >= minimum;
}

function rgbToHex(rgb: Rgb): string {
  const channel = (value: number) =>
    Math.round(Math.min(255, Math.max(0, value)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(rgb.r)}${channel(rgb.g)}${channel(rgb.b)}`;
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

function oklchToSrgb8(L: number, C: number, H: number): Rgb {
  const hue = (H * Math.PI) / 180;
  const a = C * Math.cos(hue);
  const b = C * Math.sin(hue);
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return {
    r: linearToSrgb8(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    g: linearToSrgb8(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    b: linearToSrgb8(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  };
}

function linearToSrgb8(channel: number): number {
  const clamped = Math.min(1, Math.max(0, channel));
  const encoded = clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055;
  return Math.round(encoded * 255);
}
