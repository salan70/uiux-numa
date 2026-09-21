// 配色カードの帯を組み立てる純関数。
// 新しい色は作らない。正本の配色が持つ値だけを並べ替え、束ね、名を付ける。
// 例外は codeInk だけで、secondary の明度だけを動かす。
import {
  contrastRatioFromCss,
  hexFromCssColor,
  parseCssColor,
  passesWcag,
  relativeLuminance,
} from "./contrast";
import type { ColorScheme, SchemeColor } from "./schemes";

export type Mode = "light" | "dark";

/**
 * カードの帯に出す役割と、その並び。配色ごとに性格が出る役割だけを出す。
 * 3 系統の基準色が配色の名前そのものなので、まずこれを並べる。
 * 残りは container と、面の上に置く文字と focus。面と状態色はカードでは出さない。
 */
export const CARD_ROLES = [
  "primary",
  "secondary",
  "tertiary",
  "primary-container",
  "primary-text",
  "focus",
];

/**
 * 大きな帯は 2 段にして、カードより多くの役割を出す。
 * 上段は 3 系統、下段は面と線と状態色。カードで外した役割もここで見られる。
 * on- の役割は帯にしない。対になる帯の文字色として見せる。
 */
export const HERO_ROWS: string[][] = [
  [
    "primary",
    "primary-container",
    "secondary",
    "secondary-container",
    "tertiary",
    "tertiary-container",
    "primary-text",
  ],
  [
    "background",
    "surface",
    "surface-container",
    "surface-variant",
    "outline",
    "focus",
    "success",
    "warning",
    "error",
  ],
];

// primary と background だけ幅を 2 倍にする。配色の性格を決める色なので、大きさでも他と区別する。
const HERO_WEIGHT: Record<string, number> = { primary: 2, background: 2 };

export function heroWeight(band: Band): number {
  return Math.max(...band.roles.map((role) => HERO_WEIGHT[role] ?? 1));
}

/** 表示するカラーコードは # に統一する。oklch のまま出すと、配色ごとに記法が混ざって読み比べられない。 */
export function hexOf(value: string): string {
  try {
    return hexFromCssColor(value);
  } catch {
    return value;
  }
}

/**
 * 和名コメントが無い色に当てる名。
 * 役割名をそのまま出すと、帯が指しているものが色ではなく役割になる。
 * 語彙は増やさず、無彩は白から黒までの 8 段、有彩は色相の基本名に濃淡を 1 つ付けるだけにする。
 */
const NEUTRAL_NAMES: Array<{ min: number; name: string }> = [
  { min: 0.97, name: "白" },
  { min: 0.925, name: "白練" },
  { min: 0.8, name: "白鼠" },
  { min: 0.63, name: "銀鼠" },
  { min: 0.46, name: "鼠" },
  { min: 0.29, name: "灰" },
  { min: 0.13, name: "墨" },
  { min: 0, name: "黒" },
];

const HUE_NAMES: Array<{ max: number; name: string }> = [
  { max: 14, name: "赤" },
  { max: 45, name: "橙" },
  { max: 70, name: "黄" },
  { max: 95, name: "黄緑" },
  { max: 155, name: "緑" },
  { max: 195, name: "青緑" },
  { max: 235, name: "青" },
  { max: 258, name: "藍" },
  { max: 310, name: "紫" },
  { max: 345, name: "桃" },
  { max: 360, name: "赤" },
];

export function derivedName(value: string): string {
  let hue = 0;
  let saturation = 0;
  let lightness = 0;
  try {
    [hue, saturation, lightness] = toHsl(parseCssColor(value));
  } catch {
    return value;
  }
  if (saturation < 0.08) {
    return NEUTRAL_NAMES.find((step) => lightness >= step.min)?.name ?? "黒";
  }
  const name = HUE_NAMES.find((step) => hue < step.max)?.name ?? "赤";
  if (lightness >= 0.8) return `淡${name}`;
  if (lightness <= 0.22) return `深${name}`;
  return name;
}

/** 色相、彩度、明度。色名を決めるためだけに使う。 */
function toHsl({ r, g, b }: { r: number; g: number; b: number }): [number, number, number] {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const span = max - min;
  if (span === 0) return [0, 0, lightness];
  const saturation = span / (1 - Math.abs(2 * lightness - 1));
  const hue =
    max === red
      ? 60 * (((green - blue) / span) % 6)
      : max === green
        ? 60 * ((blue - red) / span + 2)
        : 60 * ((red - green) / span + 4);
  return [(hue + 360) % 360, saturation, lightness];
}

/** 帯に出す色の名。正本の行末コメントがあればそれを使い、無ければ値から決める。 */
export function colorLabel(color: SchemeColor): string {
  return color.name === color.role ? derivedName(color.value) : color.name;
}

export function colorOf(scheme: ColorScheme, mode: Mode, role: string): SchemeColor | undefined {
  return scheme[mode].find((item) => item.role === role);
}

/**
 * 配色の名に当てる文字色。
 * その配色の色を使い、地（background）に対して読めない値だけ順に次の候補へ落とす。
 * 新しい色は作らない。候補がどれも足りなければ、比が最大の候補を使う。
 */
export function schemeInk(
  scheme: ColorScheme,
  mode: Mode,
  roles: string[],
  minimum: 4.5 | 3,
): string | undefined {
  const paper =
    colorOf(scheme, mode, "background")?.value ?? (mode === "dark" ? "#000000" : "#ffffff");
  let best = "";
  let bestRatio = -1;
  for (const role of roles) {
    const value = colorOf(scheme, mode, role)?.value;
    if (!value) continue;
    let ratio = 0;
    try {
      ratio = contrastRatioFromCss(value, paper);
    } catch {
      continue;
    }
    if (passesWcag(ratio, minimum)) return value;
    if (ratio > bestRatio) {
      best = value;
      bestRatio = ratio;
    }
  }
  return best || undefined;
}

/** 名は主色。20px の太字なので 3:1 を満たせばよい。 */
export function labelInk(scheme: ColorScheme, mode: Mode): string | undefined {
  return schemeInk(scheme, mode, ["primary", "primary-text", "on-surface"], 3);
}

/**
 * id は secondary で書く。12px なので地に 4.5:1 を求める。
 * secondary のままでは半数の配色で足りない（ふじの萌黄は明るい地に 1.68:1）。
 * 足りなければ、色相と彩度は secondary のまま、4.5:1 を満たす最も近い明度へ寄せる。
 * 正本の primary-text と同じ作り方で、secondary には対応する役割が無いのでここで作る。
 */
export function codeInk(scheme: ColorScheme, mode: Mode): string | undefined {
  const secondary = colorOf(scheme, mode, "secondary")?.value;
  const paper = colorOf(scheme, mode, "background")?.value;
  if (!secondary || !paper) return schemeInk(scheme, mode, ["on-surface-variant"], 4.5);
  let hue = 0;
  let saturation = 0;
  let lightness = 0;
  try {
    [hue, saturation, lightness] = toHsl(parseCssColor(secondary));
    if (passesWcag(contrastRatioFromCss(secondary, paper), 4.5)) return secondary;
  } catch {
    return schemeInk(scheme, mode, ["on-surface-variant"], 4.5);
  }
  let best: string | undefined;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (let step = 0; step <= 100; step += 1) {
    const candidate = fromHsl(hue, saturation, step / 100);
    const distance = Math.abs(step / 100 - lightness);
    if (distance < bestDistance && passesWcag(contrastRatioFromCss(candidate, paper), 4.5)) {
      best = candidate;
      bestDistance = distance;
    }
  }
  return best ?? schemeInk(scheme, mode, ["on-surface-variant"], 4.5);
}

function fromHsl(hue: number, saturation: number, lightness: number): string {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
  const x = chroma * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lightness - chroma / 2;
  const [r, g, b] =
    hue < 60
      ? [chroma, x, 0]
      : hue < 120
        ? [x, chroma, 0]
        : hue < 180
          ? [0, chroma, x]
          : hue < 240
            ? [0, x, chroma]
            : hue < 300
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

/** 帯の上に置く文字の色。新しい色を作らず、その帯の明るさで黒か白を選ぶ。 */
export function inkOn(value: string): string {
  try {
    return relativeLuminance(parseCssColor(value)) > 0.45 ? "#0c0c0c" : "#ffffff";
  } catch {
    return "#0c0c0c";
  }
}

/** 面の役割と、その上に置く文字の役割。正本の配色が組として保証する対だけを持つ。 */
const ON_ROLE: Record<string, string> = {
  primary: "on-primary",
  "primary-container": "on-primary-container",
  secondary: "on-secondary",
  "secondary-container": "on-secondary-container",
  tertiary: "on-tertiary",
  "tertiary-container": "on-tertiary-container",
  background: "on-surface",
  surface: "on-surface",
  "surface-container": "on-surface",
  "surface-variant": "on-surface-variant",
};

/** 帯の文字色。対になる on- の役割があればその色を使い、無ければ inkOn に任せる。 */
export function bandInk(scheme: ColorScheme, mode: Mode, band: Band): string {
  for (const role of band.roles) {
    const on = ON_ROLE[role] && colorOf(scheme, mode, ON_ROLE[role]);
    if (on) return on.value;
  }
  return inkOn(band.value);
}

/** 帯 1 本。同じ値の役割はここでまとまる。 */
export type Band = { value: string; name: string; roles: string[] };

/**
 * 同じ値の役割は 1 本にまとめ、役割名をスラッシュで並べる。
 * sumi のように primary と primary-container が近い配色でも、同じ値なら 1 本にまとまる。
 * まとめれば色の面は重複せず、その配色が 1 色を複数の役に当てていることも読める。
 */
export function mergeRoles(scheme: ColorScheme, mode: Mode, roles: string[]): Band[] {
  const out: Band[] = [];
  const byValue = new Map<string, Band>();
  for (const role of roles) {
    const color = colorOf(scheme, mode, role);
    if (!color) continue;
    const found = byValue.get(color.value);
    if (found) {
      found.roles.push(role);
      continue;
    }
    const band: Band = { value: color.value, name: colorLabel(color), roles: [role] };
    byValue.set(color.value, band);
    out.push(band);
  }
  return out;
}

export function cardColors(scheme: ColorScheme, mode: Mode): Band[] {
  return mergeRoles(scheme, mode, CARD_ROLES);
}

/** 画面へ当てる CSS 変数。配色の役割名をそのまま custom property にする。 */
export function schemeVars(scheme: ColorScheme, mode: Mode): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const color of scheme[mode]) vars[color.cssName] = color.value;
  return vars;
}
