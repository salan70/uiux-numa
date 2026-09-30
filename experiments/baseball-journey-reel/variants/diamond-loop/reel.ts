import {
  bezier,
  clamp01,
  hash,
  inCubic,
  inExpo,
  inOutCubic,
  inQuad,
  lerp,
  outBack,
  outCubic,
  outExpo,
  outQuad,
  prog,
  spring,
} from "../../../catalog-showreel/variants/ink-ripple/motion";
import { dotCells, dotWidth, PLAYER, type Palette } from "./sprites";

// Baseball Player Journey の 15 秒の縦型リールを、時刻 t から 1 フレームを描く純関数として書く。
// 座標は 1080×1920 の論理座標で、呼び出し側が縮尺を掛ける。
// 場面の時刻と値の根拠は README の Variants の後の表にある。

export const DURATION = 15;
export const FPS = 30;
export const WIDTH = 1080;
export const HEIGHT = 1920;

/** reduced motion で自動再生しないときに見せる 1 枚。題字、惹句、名鑑、次の選手の札が揃った時刻にする。 */
export const POSTER_TIME = 14.35;

const TAU = Math.PI * 2;

// 配色は color-schemes-material の pop-toy と、製品の電光掲示板の深緑。選択中の配色には追従させない。
const INK = "#120d09";
const PAPER = "#fffdf9";
const SHEET = "#fbf6ea";
const YELLOW = "#fac400";
const YELLOW_SOFT = "#faf1d1";
const BLUE = "#4078e0";
const BLUE_SOFT = "#d4e0f7";
const CORAL = "#f37252";
const CORAL_SOFT = "#fad9d1";
const GREEN = "#2e731d";
const GREY = "#9ea19f";
const FIELD = "#0f2a1c";
const FIELD_STRIPE = "#133523";
const BOARD_BG = "#06150d";
const LED_OFF = "#15321f";
const SEAM = "#d8412a";
const DIRT = "#5a3f28";

const jp = (size: number, weight = 700) =>
  `${weight} ${size}px "LINE Seed JP", "Hiragino Sans", sans-serif`;
const mono = (size: number) =>
  `500 ${size}px ui-monospace, "SF Mono", Menlo, "LINE Seed JP", monospace`;

type Ctx = CanvasRenderingContext2D;
type Rect = { x: number; y: number; w: number; h: number };

// 場面の境目と、HUD に出す動きの値と要件。見せている原則を画面の隅で自分で注記する。
const SCENES = [
  {
    at: 0,
    name: "PLAY BALL",
    spec: "anticipation 160ms · squash 1.45×0.62 · flash 3f",
    req: "コアループの起点",
  },
  {
    at: 1.5,
    name: "CREATE",
    spec: "stagger 28ms/row · outBack 1.3 · spring ζ0.5",
    req: "W-01 選手を作る · C-6 能力は 1〜99",
  },
  {
    at: 4.2,
    name: "MATCHDAY",
    spec: "beat 500ms · press 80ms · shadow 8→0px",
    req: "W-04〜06 打席を記録 · C-1 本塁打は 1〜4 打点",
  },
  {
    at: 8.0,
    name: "GROW",
    spec: "odometer 700ms · delta spring · inExpo 600ms",
    req: "W-03 今季の成績と進み · T-2 全 143 試合",
  },
  {
    at: 10.4,
    name: "SEASON",
    spec: "impact 130ms · shake 4f · stagger √i",
    req: "W-09〜11 順位、タイトル、引退",
  },
  {
    at: 12.6,
    name: "LEGACY",
    spec: "entrance cubic-bezier(.22,1,.36,1) 900ms",
    req: "W-12〜13 名鑑 · 次の選手へ",
  },
] as const;

// コアループの 4 相。HUD のダイヤモンドの塁と対応する。
const PHASES = ["CREATE", "PLAY", "GROW", "LEGACY"] as const;

const easeEntrance = bezier(0.22, 1, 0.36, 1);
const easeExpand = bezier(0.7, 0, 0.2, 1);

export function drawFrame(ctx: Ctx, time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  ctx.save();
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.fillStyle = FIELD;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.save();
  const [sx, sy] = shake(t);
  ctx.translate(sx, sy);
  drawPlayBall(ctx, t);
  drawCreate(ctx, t);
  drawMatchday(ctx, t);
  drawGrow(ctx, t);
  drawSeason(ctx, t);
  drawLegacy(ctx, t);
  ctx.restore();
  drawHud(ctx, t);
  ctx.restore();
}

/* ------------------------------------------------------------------ 描画の道具 */

const widthCache = new Map<string, number>();

/** フォントの読み込み後に呼ぶ。代替フォントで測った幅を捨てる。 */
export function resetMeasureCache() {
  widthCache.clear();
}

function measure(ctx: Ctx, text: string, font: string) {
  const key = `${font}|${text}`;
  let w = widthCache.get(key);
  if (w === undefined) {
    ctx.font = font;
    w = ctx.measureText(text).width;
    widthCache.set(key, w);
  }
  return w;
}

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2)));
}

function circle(ctx: Ctx, x: number, y: number, r: number) {
  if (r <= 0) return;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function rgb(hex: string) {
  const n = Number.parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function mix(a: string, b: string, p: number) {
  const A = rgb(a);
  const B = rgb(b);
  const q = clamp01(p);
  return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], q))).join(",")})`;
}

function text(
  ctx: Ctx,
  s: string,
  x: number,
  y: number,
  font: string,
  color: string,
  align: CanvasTextAlign = "left",
) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
  ctx.textAlign = "left";
}

type BoxStyle = { fill: string; r?: number; shadow?: number; line?: number; stroke?: string };

/** 製品の造形。太い輪郭と、ぼかさずにずらした影。グラデーションと艶は使わない（ui_ux_concepts の P-001）。 */
function box(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  { fill, r = 16, shadow = 10, line: lw = 5, stroke = INK }: BoxStyle,
) {
  if (w <= 0 || h <= 0) return;
  if (shadow > 0) {
    ctx.fillStyle = stroke;
    rrect(ctx, x + shadow, y + shadow, w, h, r);
    ctx.fill();
  }
  ctx.fillStyle = fill;
  rrect(ctx, x, y, w, h, r);
  ctx.fill();
  if (lw > 0) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    rrect(ctx, x + lw / 2, y + lw / 2, w - lw, h - lw, Math.max(0, r - lw / 2));
    ctx.stroke();
  }
}

/** 条件に合う最後の要素。実行基盤の lib が ES2022 なので findLast の代わりに使う。 */
function lastOf<T>(items: readonly T[], match: (item: T) => boolean): T | undefined {
  for (let i = items.length - 1; i >= 0; i--) if (match(items[i])) return items[i];
  return undefined;
}

/** 中心を基準に拡大縮小して描く。 */
function scaled(ctx: Ctx, cx: number, cy: number, sx: number, sy: number, draw: () => void) {
  if (sx <= 0.001 || sy <= 0.001) return;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(sx, sy);
  ctx.translate(-cx, -cy);
  draw();
  ctx.restore();
}

/**
 * 白球。縫い目を回して回転を見せ、dir の向きに潰しと伸びを掛ける。
 * 潰しと伸びは sx × sy をほぼ 1 に保ち、体積が保たれて見えるようにする。
 */
function drawBall(
  ctx: Ctx,
  x: number,
  y: number,
  r: number,
  spin = 0,
  sx = 1,
  sy = 1,
  dir = 0,
  alpha = 1,
) {
  if (r <= 0.5 || alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha *= alpha;
  ctx.translate(x, y);
  ctx.rotate(dir);
  ctx.scale(sx, sy);
  ctx.rotate(-dir);
  ctx.fillStyle = PAPER;
  circle(ctx, 0, 0, r);
  ctx.save();
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, TAU);
  ctx.clip();
  ctx.rotate(spin);
  ctx.strokeStyle = SEAM;
  ctx.lineWidth = Math.max(1.5, r * 0.07);
  for (const s of [-1, 1]) {
    const ox = s * r * 1.55;
    const rr = r * 1.08;
    ctx.beginPath();
    ctx.arc(ox, 0, rr, 0, TAU);
    ctx.stroke();
    // 縫い目の糸。弧に直交する短い線を並べる。
    for (let i = -4; i <= 4; i++) {
      const a = (s > 0 ? Math.PI : 0) + i * 0.16;
      const px = ox + Math.cos(a) * rr;
      const py = Math.sin(a) * rr;
      const nx = Math.cos(a) * r * 0.11;
      const ny = Math.sin(a) * r * 0.11;
      line(ctx, px - nx - ny * 0.6, py - ny + nx * 0.6, px + nx - ny * 0.6, py + ny + nx * 0.6);
    }
  }
  ctx.restore();
  ctx.strokeStyle = INK;
  ctx.lineWidth = Math.max(2, r * 0.08);
  ctx.beginPath();
  ctx.arc(0, 0, r - ctx.lineWidth / 2, 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ---------------------------------------------------------- ドット絵と電光文字 */

const SKINS = ["#f5cfa8", "#e8b48a", "#c98d62", "#a86d45"];
const TEAM_COLORS = [BLUE, CORAL, YELLOW, GREEN, INK];

function palette(team: string, skin: string): Palette {
  return {
    k: INK,
    c: team,
    b: mix(team, INK, 0.45),
    w: team === YELLOW ? INK : PAPER,
    s: skin,
    e: INK,
    p: "#f39a82",
    m: "#b5452e",
    u: PAPER,
    n: team,
  };
}

const HERO = palette(BLUE, SKINS[0]);

const spriteCache = new Map<string, HTMLCanvasElement>();

/** 16×16 の画素を 1 枚の canvas に焼いておく。時刻に依らない下ごしらえなので、純関数の性質は崩れない。 */
function spriteCanvas(p: Palette) {
  const key = Object.values(p).join("|");
  let canvas = spriteCache.get(key);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const g = canvas.getContext("2d");
    if (g)
      PLAYER.forEach((row, y) =>
        [...row].forEach((ch, x) => {
          const color = p[ch];
          if (!color) return;
          g.fillStyle = color;
          g.fillRect(x, y, 1, 1);
        }),
      );
    spriteCache.set(key, canvas);
  }
  return canvas;
}

function drawSprite(ctx: Ctx, p: Palette, x: number, y: number, px: number) {
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(spriteCanvas(p), x, y, 16 * px, 16 * px);
}

/** ドット文字を描く。lit は点ごとの点灯の強さ（0〜1）を返す。 */
function drawDots(
  ctx: Ctx,
  textValue: string,
  x: number,
  y: number,
  pitch: number,
  size: number,
  color: string,
  lit: (col: number, row: number) => number = () => 1,
) {
  ctx.fillStyle = color;
  const alpha = ctx.globalAlpha;
  for (const [c, r] of dotCells(textValue)) {
    const a = lit(c, r);
    if (a <= 0) continue;
    ctx.globalAlpha = alpha * a;
    ctx.fillRect(x + c * pitch, y + r * pitch, size, size);
  }
  ctx.globalAlpha = alpha;
}

// 球場の電光掲示板。冒頭の PLAY BALL と最後の題字が同じ掲示板を使い、ループの継ぎ目を隠す。
const BOARD: Rect = { x: 90, y: 180, w: 900, h: 470 };
const B_COLS = 56;
const B_ROWS = 27;
const B_PITCH = 15;
const B_DOT = 11;
const B_X0 = BOARD.x + (BOARD.w - ((B_COLS - 1) * B_PITCH + B_DOT)) / 2;
const B_Y0 = BOARD.y + (BOARD.h - ((B_ROWS - 1) * B_PITCH + B_DOT)) / 2;

type Cell = { c: number; r: number; line: number };

function boardCells(lines: [string, number][]): Cell[] {
  return lines.flatMap(([value, row], line) => {
    const off = Math.floor((B_COLS - dotWidth(value)) / 2);
    return dotCells(value).map(([c, r]) => ({ c: c + off, r: r + row, line }));
  });
}

const PLAY_CELLS = boardCells([["PLAY BALL", 10]]);
const TITLE_CELLS = boardCells([
  ["BASEBALL", 1],
  ["PLAYER", 10],
  ["JOURNEY", 19],
]);

function drawBoard(ctx: Ctx, oy: number, cells: Cell[], lit: (cell: Cell) => number) {
  box(ctx, BOARD.x, BOARD.y + oy, BOARD.w, BOARD.h, { fill: BOARD_BG, r: 22, shadow: 14, line: 8 });
  ctx.fillStyle = LED_OFF;
  ctx.beginPath();
  for (let r = 0; r < B_ROWS; r++)
    for (let c = 0; c < B_COLS; c++)
      ctx.rect(B_X0 + c * B_PITCH, B_Y0 + r * B_PITCH + oy, B_DOT, B_DOT);
  ctx.fill();
  ctx.fillStyle = YELLOW;
  for (const cell of cells) {
    const a = lit(cell);
    if (a <= 0) continue;
    const x = B_X0 + cell.c * B_PITCH;
    const y = B_Y0 + cell.r * B_PITCH + oy;
    // 点の周りに一回り大きい薄い面を置き、発光を段で表す。ぼかしは使わない。
    ctx.globalAlpha = 0.22 * a;
    ctx.fillRect(x - 4, y - 4, B_DOT + 8, B_DOT + 8);
    ctx.globalAlpha = a;
    ctx.fillRect(x, y, B_DOT, B_DOT);
  }
  ctx.globalAlpha = 1;
}

/** ドットの粒。初速と重力から位置を引く。乱数は hash で固定する。 */
function burst(
  ctx: Ctx,
  t: number,
  start: number,
  x: number,
  y: number,
  count: number,
  seed: number,
  {
    speed = 900,
    gravity = 1800,
    size = 16,
    life = 0.8,
    colors = [YELLOW, CORAL, BLUE, PAPER],
  } = {},
) {
  const e = t - start;
  if (e < 0 || e > life) return;
  const fade = 1 - e / life;
  for (let i = 0; i < count; i++) {
    const a = hash(seed + i * 3.1) * TAU;
    const v = speed * (0.45 + hash(seed + i * 7.7) * 0.75);
    // 空気抵抗の近似。速さは時間とともに落ちる。
    const d = (v * (1 - Math.exp(-3 * e))) / 3;
    const px = x + Math.cos(a) * d;
    const py = y + Math.sin(a) * d + 0.5 * gravity * e * e;
    const s = size * (0.6 + hash(seed + i * 1.3) * 0.7) * (0.4 + 0.6 * fade);
    ctx.save();
    ctx.globalAlpha = fade;
    ctx.translate(px, py);
    ctx.rotate(e * (hash(seed + i) - 0.5) * 14);
    ctx.fillStyle = colors[i % colors.length];
    ctx.fillRect(-s / 2, -s / 2, s, s);
    ctx.restore();
  }
}

/* ---------------------------------------------------------------- 画面の揺れ */

// 衝撃の印として 4 コマだけ揺らす。方向はコマ番号から hash で決める。
const IMPACTS = [
  { at: 0.89, amp: 12 },
  { at: 5.76, amp: 10 },
  { at: 10.73, amp: 16 },
  { at: 10.98, amp: 16 },
  { at: 11.23, amp: 24 },
];

function shake(t: number): [number, number] {
  for (const { at, amp } of IMPACTS) {
    const k = Math.floor((t - at) * FPS);
    if (t < at || k >= 4) continue;
    const a = hash(at * 100 + k) * TAU;
    const m = amp * (1 - k / 4);
    return [Math.cos(a) * m, Math.sin(a) * m];
  }
  return [0, 0];
}

/* ------------------------------------------------------------ 01 PLAY BALL 0.00–1.50 */

const MOUND = { x: 540, y: 905 };
const ZONE = { x: 560, y: 1250, w: 300, h: 380 };
const HOME = { x: 540, y: 1600 };
const LAND = { x: 540, y: 1000 };
const HIT = 0.89;
const BAT = { x: 150, y: 1560 };

/** 夜の球場。冒頭と LEGACY の終わりが同じ絵を描き、ループの継ぎ目にする。 */
function drawField(ctx: Ctx, marks: number) {
  ctx.fillStyle = FIELD;
  ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
  ctx.fillStyle = FIELD_STRIPE;
  ctx.beginPath();
  for (let i = -14; i < 10; i++) {
    const x0 = i * 180;
    ctx.moveTo(x0, -40);
    ctx.lineTo(x0 + 90, -40);
    ctx.lineTo(x0 + 90 + HEIGHT * 0.45, HEIGHT + 40);
    ctx.lineTo(x0 + HEIGHT * 0.45, HEIGHT + 40);
    ctx.closePath();
  }
  ctx.fill();
  if (marks <= 0) return;
  ctx.save();
  ctx.globalAlpha = marks * 0.35;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 6;
  line(ctx, HOME.x, HOME.y, -300, 760);
  line(ctx, HOME.x, HOME.y, WIDTH + 300, 760);
  ctx.globalAlpha = marks;
  ctx.fillStyle = DIRT;
  ctx.beginPath();
  ctx.ellipse(MOUND.x, MOUND.y + 12, 130, 28, 0, 0, TAU);
  ctx.fill();
  ctx.fillStyle = PAPER;
  ctx.fillRect(MOUND.x - 20, MOUND.y + 6, 40, 9);
  ctx.beginPath();
  ctx.moveTo(HOME.x - 64, HOME.y - 30);
  ctx.lineTo(HOME.x + 64, HOME.y - 30);
  ctx.lineTo(HOME.x + 64, HOME.y + 6);
  ctx.lineTo(HOME.x, HOME.y + 42);
  ctx.lineTo(HOME.x - 64, HOME.y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

type BallPose = {
  x: number;
  y: number;
  r: number;
  spin: number;
  sx: number;
  sy: number;
  dir: number;
};

/** 冒頭の白球。LEGACY の最後に投げ上げた球が落ちてきて、投手の位置で止まり、打者へ投げ込まれる。 */
function pitchPose(t: number): BallPose | null {
  const spin = t * 26;
  if (t < 0.42) {
    const p = prog(t, -0.1, 0.42);
    return {
      x: MOUND.x,
      y: lerp(-150, MOUND.y - 30, inQuad(p)),
      r: lerp(40, 16, prog(t, 0, 0.42)),
      spin,
      sx: 1,
      sy: 1,
      dir: 0,
    };
  }
  if (t < 0.64) {
    // 捕って構える。着地の潰れをばねで戻し、投げる前に少し上と奥へ引く（予備動作）。
    const land = 1 - spring(t - 0.42, 0.4, 5);
    const w = outCubic(prog(t, 0.48, 0.64));
    return {
      x: MOUND.x + 12 * w,
      y: MOUND.y - 30 - 46 * w,
      r: 16,
      spin: spin * 0.2,
      sx: 1 + 0.3 * land,
      sy: 1 - 0.3 * land,
      dir: 0,
    };
  }
  if (t < HIT) {
    // 透視。z を線形に縮め、半径と位置を 1/z で引く。
    const p = prog(t, 0.64, HIT);
    const z = lerp(10, 0.85, p);
    const s = (1 / z - 0.1) / (1 / 0.85 - 0.1);
    return {
      x: lerp(MOUND.x + 12, ZONE.x, s),
      y: lerp(MOUND.y - 76, ZONE.y, s),
      r: 160 / z,
      spin,
      sx: 1,
      sy: 1.06,
      dir: 0,
    };
  }
  if (t < 1.0) {
    // 打った瞬間。打球の向きに潰れる。
    return { x: ZONE.x, y: ZONE.y, r: 188, spin, sx: 0.62, sy: 1.45, dir: -0.62 };
  }
  if (t < 1.22) {
    const p = prog(t, 1.0, 1.22);
    return {
      x: lerp(ZONE.x, 1240, outQuad(p)),
      y: lerp(ZONE.y, -220, p),
      r: lerp(150, 34, outQuad(p)),
      spin,
      sx: 1.55,
      sy: 0.7,
      dir: -0.95,
    };
  }
  if (t < 1.5) {
    // 打球が戻ってきて、次の場面の札の上に落ちる。
    const p = prog(t, 1.22, 1.5);
    return {
      x: lerp(760, LAND.x, outQuad(p)),
      y: lerp(-120, LAND.y, inQuad(p)),
      r: lerp(26, 60, p),
      spin,
      sx: 0.86,
      sy: 1.18,
      dir: 0,
    };
  }
  return null;
}

function drawBat(ctx: Ctx, t: number) {
  if (t < 0.4 || t > 1.05) return;
  const appear = outCubic(prog(t, 0.4, 0.6));
  const cock = outCubic(prog(t, 0.6, 0.83));
  const swing = outCubic(prog(t, 0.83, 1.03));
  // 振る前に少し後ろへ引く（予備動作）。
  const a = lerp(lerp(-1.75, -1.95, cock), -0.1, swing);
  const fade = 1 - prog(t, 0.99, 1.05);
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.translate(BAT.x - (1 - appear) * 300, BAT.y + (1 - appear) * 300);
  // 残像。振り始めから今の角度までを 3 段の帯で塗る。グラデーションは使わない。
  if (swing > 0) {
    const from = lerp(-1.95, -0.1, Math.max(0, swing - 0.55));
    const bands: [number, number][] = [
      [0.25, 0.35],
      [0.5, 0.2],
      [0.9, 0.08],
    ];
    for (const [alpha, lag] of bands) {
      const start = Math.min(a, Math.max(from, a - lag * 6));
      ctx.globalAlpha = fade * alpha;
      ctx.fillStyle = YELLOW;
      ctx.beginPath();
      ctx.arc(0, 0, 590, start, a);
      ctx.arc(0, 0, 240, a, start, true);
      ctx.closePath();
      ctx.fill();
    }
    ctx.globalAlpha = fade;
  }
  ctx.rotate(a);
  box(ctx, 190, -26, 410, 52, { fill: PAPER, r: 26, shadow: 0, line: 7 });
  ctx.fillStyle = INK;
  ctx.fillRect(210, -18, 70, 36);
  ctx.restore();
}

function drawPlayBall(ctx: Ctx, t: number) {
  if (t >= 1.9) return;
  drawField(ctx, 1);
  drawBoard(ctx, 0, PLAY_CELLS, (cell) => (t >= 0.99 + cell.c * 0.0045 ? 1 : 0));

  // ストライクゾーン。投げ込まれる先を先に置き、打つ瞬間の予期を作る。
  const zone = outCubic(prog(t, 0.2, 0.5)) * (1 - prog(t, 0.88, 0.95));
  if (zone > 0) {
    ctx.save();
    ctx.globalAlpha = zone * 0.5;
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 3;
    const x0 = ZONE.x - ZONE.w / 2;
    const y0 = ZONE.y - ZONE.h / 2;
    ctx.strokeRect(x0, y0, ZONE.w, ZONE.h);
    for (let i = 1; i < 3; i++) {
      line(ctx, x0 + (ZONE.w * i) / 3, y0, x0 + (ZONE.w * i) / 3, y0 + ZONE.h);
      line(ctx, x0, y0 + (ZONE.h * i) / 3, x0 + ZONE.w, y0 + (ZONE.h * i) / 3);
    }
    ctx.restore();
  }

  drawBat(ctx, t);

  // 投球の残像。直前の 3 つの位置を縫い目の無い紙の円で薄く重ね、濁らせない。
  if (t > 0.66 && t < HIT) {
    ctx.fillStyle = PAPER;
    for (let k = 3; k >= 1; k--) {
      const pose = pitchPose(t - k * 0.03);
      if (!pose) continue;
      ctx.globalAlpha = 0.16 / k;
      circle(ctx, pose.x, pose.y, pose.r);
    }
    ctx.globalAlpha = 1;
  }
  const pose = pitchPose(t);
  if (pose) drawBall(ctx, pose.x, pose.y, pose.r, pose.spin, pose.sx, pose.sy, pose.dir);

  // 打った瞬間の 3 コマ。地と図を反転し、球の影絵と集中線だけを残す。
  if (t >= HIT && t < HIT + 0.1) {
    ctx.fillStyle = YELLOW;
    ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
    ctx.fillStyle = INK;
    ctx.save();
    ctx.translate(ZONE.x, ZONE.y);
    for (let i = 0; i < 18; i++) {
      const a = (i / 18) * TAU + hash(i) * 0.2;
      const r0 = 240 + hash(i + 9) * 80;
      const r1 = 1400;
      const wdt = 0.035 + hash(i + 3) * 0.04;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0);
      ctx.lineTo(Math.cos(a - wdt) * r1, Math.sin(a - wdt) * r1);
      ctx.lineTo(Math.cos(a + wdt) * r1, Math.sin(a + wdt) * r1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.rotate(-0.62);
    ctx.scale(0.62, 1.45);
    circle(ctx, 0, 0, 188);
    ctx.restore();
  }
  burst(ctx, t, HIT + 0.1, ZONE.x, ZONE.y, 22, 11, {
    speed: 1500,
    gravity: 900,
    size: 20,
    life: 0.45,
  });
}

/* -------------------------------------------------------------- 02 CREATE 1.50–4.20 */

const CARD: Rect = { x: 150, y: 510, w: 780, h: 980 };
const TEAMS = ["湾岸シーガルズ", "山吹フェニックス", "南風ドルフィンズ", "北斗ライナーズ"];
const ABILITIES = [
  { name: "ミート", value: 72, rank: "B", fill: CORAL, badge: BLUE, ink: PAPER },
  { name: "パワー", value: 85, rank: "A", fill: BLUE, badge: CORAL, ink: INK },
  { name: "走力", value: 90, rank: "S", fill: YELLOW, badge: YELLOW, ink: INK },
];
const CHIPS = [
  { label: "ポジション", value: "遊撃手", fill: CORAL, at: 2.3 },
  { label: "投打", value: "右投左打", fill: PAPER, at: 2.4 },
  { label: "年齢", value: "18 歳 · 新人", fill: YELLOW, at: 2.5 },
];
const CREATE_BUTTON: Rect = { x: 290, y: 1560, w: 500, h: 112 };
const CREATE_TAP = 3.72;

/** 押し込み。押した瞬間から 80ms で影の分だけ沈み、離すとばねで戻る。 */
function pressDepth(t: number, taps: readonly number[]) {
  let depth = 0;
  for (const at of taps) {
    if (t < at) continue;
    const e = t - at;
    depth = e < 0.08 ? outQuad(e / 0.08) : Math.max(-0.3, 1 - spring(e - 0.08, 0.5, 3.2));
  }
  return depth;
}

function drawCreate(ctx: Ctx, t: number) {
  if (t < 1.5 || t >= 4.45) return;
  ctx.save();
  // 着地点から黄の面が広がり、夜の球場を覆う。
  const wipe = outExpo(prog(t, 1.5, 1.88));
  if (wipe < 1) {
    ctx.beginPath();
    ctx.arc(LAND.x, LAND.y, 30 + wipe * 2300, 0, TAU);
    ctx.clip();
  }
  ctx.fillStyle = YELLOW;
  ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
  // 網点。印刷物の地を 1 色で表す。
  ctx.fillStyle = mix(YELLOW, INK, 0.08);
  ctx.beginPath();
  for (let y = 0; y < HEIGHT; y += 30)
    for (let x = (y / 30) % 2 ? 15 : 0; x < WIDTH; x += 30) ctx.rect(x, y, 6, 6);
  ctx.fill();

  if (t < 3.95) drawPlayerCard(ctx, t);
  drawCreateButton(ctx, t);
  drawCreateCursor(ctx, t);
  ctx.restore();
}

function drawPlayerCard(ctx: Ctx, t: number) {
  // 白球が札へ形を受け渡す。ばねの行き過ぎで札が一度大きくなって収まる。
  const e = spring(t - 1.5, 0.55, 2.2);
  const hop =
    t > CREATE_TAP + 0.05 ? -34 * Math.sin(Math.PI * prog(t, CREATE_TAP + 0.05, 3.95)) : 0;
  const w = lerp(120, CARD.w, e);
  const h = lerp(120, CARD.h, e);
  const r = lerp(60, 28, clamp01(e));
  const x = LAND.x - w / 2;
  const y = LAND.y - h / 2 + hop;
  box(ctx, x, y, w, h, { fill: SHEET, r, shadow: lerp(0, 16, clamp01(e)), line: 7 });
  const seams = 1 - prog(e, 0, 0.3);
  if (seams > 0) drawBall(ctx, LAND.x, LAND.y + hop, 60, 0, w / 120, h / 120, 0, seams);
  if (t < 1.72) return;

  ctx.save();
  rrect(ctx, x, y, w, h, r);
  ctx.clip();
  ctx.translate(CARD.x, CARD.y + hop);
  const k = Math.min(1, e);
  // 中身は札の中心から縮尺を掛け、札の伸びに付いてくる。
  ctx.translate(CARD.w / 2, CARD.h / 2);
  ctx.scale(w / CARD.w / Math.max(0.01, k), h / CARD.h / Math.max(0.01, k));
  ctx.translate(-CARD.w / 2, -CARD.h / 2);

  // 球団の帯。スロットが回り、ばねで行き過ぎてから止まる。
  ctx.fillStyle = BLUE;
  ctx.fillRect(0, 0, CARD.w, 150);
  ctx.fillStyle = INK;
  ctx.fillRect(0, 147, CARD.w, 7);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, CARD.w, 147);
  ctx.clip();
  const s = t < 2.2 ? 0 : spring(t - 2.2, 0.5, 2.6) * 11;
  for (let i = Math.floor(s) - 1; i <= Math.floor(s) + 2; i++) {
    if (i < 0) continue;
    text(ctx, TEAMS[i % TEAMS.length], 40, 100 + (i - s) * 118, jp(54), PAPER);
  }
  ctx.restore();
  const num = spring(t - 2.0, 0.45, 3);
  scaled(ctx, 690, 75, num, num, () => text(ctx, "#1", 740, 104, jp(76), PAPER, "right"));

  // ドット絵の選手。画素が下の行から順に降り、outBack で一度沈んで収まる。
  box(ctx, 40, 190, 360, 360, { fill: BLUE_SOFT, r: 12, shadow: 0, line: 5 });
  const px = 21;
  const ox = 52;
  const oy = 202;
  PLAYER.forEach((row, j) =>
    [...row].forEach((ch, i) => {
      const color = HERO[ch];
      if (!color) return;
      const d = 1.8 + (15 - j) * 0.028 + hash(j * 16 + i) * 0.1;
      const p = prog(t, d, d + 0.32);
      if (p <= 0) return;
      ctx.fillStyle = color;
      ctx.fillRect(ox + i * px, oy + j * px + lerp(-700, 0, outBack(p, 1.3)), px, px);
    }),
  );

  for (const [n, chip] of CHIPS.entries()) {
    const y0 = 190 + n * 124;
    const pop = spring(t - chip.at, 0.5, 3);
    if (t < chip.at) continue;
    ctx.globalAlpha = clamp01(pop * 3);
    text(ctx, chip.label, 432, y0 + 30, jp(26), mix(INK, SHEET, 0.4));
    const cw = measure(ctx, chip.value, jp(38)) + 44;
    scaled(ctx, 432, y0 + 78, pop, pop, () => {
      box(ctx, 432, y0 + 44, cw, 68, { fill: chip.fill, r: 12, shadow: 6, line: 4 });
      text(ctx, chip.value, 454, y0 + 92, jp(38), chip.fill === CORAL ? PAPER : INK);
    });
    ctx.globalAlpha = 1;
  }

  // 名前。1 字ずつ落ちてきて、打鍵の後ろに四角の字送りが点滅する。
  ctx.globalAlpha = clamp01((t - 2.05) * 5);
  text(ctx, "おおぞら しょう", 40, 598, jp(26, 400), mix(INK, SHEET, 0.35));
  ctx.globalAlpha = 1;
  const name = [..."大空 翔"];
  let cursor = 40;
  for (const [i, ch] of name.entries()) {
    const at = 2.1 + i * 0.09;
    const cw = measure(ctx, ch, jp(104));
    if (t >= at) {
      const p = prog(t, at, at + 0.35);
      ctx.globalAlpha = clamp01(p * 4);
      text(ctx, ch, cursor, 700 - 70 * (1 - outBack(p, 1.6)), jp(104), INK);
      ctx.globalAlpha = 1;
      cursor += cw;
    }
  }
  if (t < 2.8 && Math.floor(t * 6) % 2 === 0) {
    ctx.fillStyle = INK;
    ctx.fillRect(cursor + 6, 612, 14, 96);
  }

  // 能力。棒が伸び、数が 1 から転がり、終わりに等級の札が跳ねる。
  for (const [n, a] of ABILITIES.entries()) {
    const y0 = 752 + n * 74;
    const start = 2.75 + n * 0.14;
    const g = outExpo(prog(t, start, start + 0.6));
    if (t < start - 0.2) continue;
    ctx.globalAlpha = clamp01((t - start + 0.2) * 5);
    text(ctx, a.name, 40, y0 + 46, jp(36), INK);
    box(ctx, 200, y0 + 10, 400, 46, { fill: PAPER, r: 8, shadow: 0, line: 4 });
    ctx.fillStyle = a.fill;
    ctx.fillRect(204, y0 + 14, 392 * (a.value / 99) * g, 38);
    ctx.fillStyle = INK;
    ctx.globalAlpha *= 0.2;
    for (let i = 1; i < 10; i++) ctx.fillRect(200 + i * 40, y0 + 14, 3, 38);
    ctx.globalAlpha = clamp01((t - start + 0.2) * 5);
    text(ctx, String(Math.round(lerp(1, a.value, g))), 668, y0 + 50, jp(44), INK, "right");
    const rank = spring(t - start - 0.5, 0.4, 3.4);
    if (t > start + 0.5)
      scaled(ctx, 720, y0 + 33, rank, rank, () => {
        box(ctx, 690, y0 + 3, 60, 60, { fill: a.badge, r: 10, shadow: 5, line: 4 });
        text(ctx, a.rank, 720, y0 + 49, jp(40), a.ink, "center");
      });
    ctx.globalAlpha = 1;
    burst(ctx, t, start + 0.5, 720, y0 + 33, 8, 40 + n, {
      speed: 500,
      gravity: 600,
      size: 10,
      life: 0.35,
      colors: [INK],
    });
  }
  ctx.restore();
}

function drawCreateButton(ctx: Ctx, t: number) {
  if (t < 3.25) return;
  const e = spring(t - 3.25, 0.55, 2.8);
  const drop = inCubic(prog(t, 3.92, 4.12)) * 500;
  const d = pressDepth(t, [CREATE_TAP]);
  const b = CREATE_BUTTON;
  ctx.save();
  ctx.globalAlpha = clamp01(e * 3);
  ctx.translate(8 * d, (1 - e) * 140 + drop + 8 * d);
  box(ctx, b.x, b.y, b.w, b.h, { fill: INK, r: 18, shadow: 0, line: 0 });
  box(ctx, b.x, b.y, b.w, b.h, { fill: PAPER, r: 18, shadow: 12 * (1 - d), line: 6 });
  text(ctx, "選手を作る", b.x + b.w / 2, b.y + 72, jp(46), INK, "center");
  ctx.restore();
}

/** 札の角から白球が出て、弧を描いてボタンを押す。球がこのリールの「指」になる。 */
function cursorInCreate(t: number) {
  const from = { x: 890, y: 540 };
  const to = { x: CREATE_BUTTON.x + CREATE_BUTTON.w / 2, y: CREATE_BUTTON.y + 40 };
  const p = prog(t, 3.42, CREATE_TAP);
  const q = inOutCubic(p);
  return {
    x: lerp(from.x, to.x, q),
    y: lerp(from.y, to.y, q) - Math.sin(Math.PI * p) * 260,
  };
}

function drawCreateCursor(ctx: Ctx, t: number) {
  if (t < 3.35 || t >= 3.95) return;
  const pos = cursorInCreate(t);
  const appear = spring(t - 3.35, 0.5, 3);
  const squash = t >= CREATE_TAP ? 1 - spring(t - CREATE_TAP, 0.4, 4) : 0;
  tapRing(ctx, t, CREATE_TAP, pos.x, pos.y + 20, INK);
  drawBall(ctx, pos.x, pos.y, 40 * appear, t * 10, 1 + 0.35 * squash, 1 - 0.35 * squash);
}

/** 押した点から広がる輪。押した位置を 250ms だけ残し、どこを押したかを因果で追えるようにする。 */
function tapRing(ctx: Ctx, t: number, at: number, x: number, y: number, color: string) {
  const p = prog(t, at, at + 0.25);
  if (p <= 0 || p >= 1) return;
  ctx.save();
  ctx.globalAlpha = 1 - p;
  ctx.strokeStyle = color;
  ctx.lineWidth = lerp(10, 2, p);
  ctx.beginPath();
  ctx.arc(x, y, lerp(36, 110, outCubic(p)), 0, TAU);
  ctx.stroke();
  ctx.restore();
}

/* ----------------------------------------------------------- 03 MATCHDAY 4.20–8.00 */

const PHONE: Rect = { x: 130, y: 170, w: 820, h: 1530 };
const SCREEN: Rect = { x: 152, y: 192, w: 776, h: 1486 };

type PadButton = { label: string; x: number; y: number; w: number; h: number; fill: string };

const PAD: PadButton[] = [
  ["ヒット", "二塁打", "三塁打"],
  ["ホームラン", "四球", "死球"],
  ["空振り三振", "見逃し三振", "ゴロ"],
  ["フライ", "ライナー", "併殺打"],
].flatMap((row, r) =>
  row.map((label, c) => ({
    label,
    x: 180 + c * 248,
    y: 960 + r * 128,
    w: 224,
    h: 108,
    fill: label === "ホームラン" ? YELLOW : r < 2 ? YELLOW_SOFT : PAPER,
  })),
);
PAD.push(
  { label: "取り消す", x: 180, y: 1480, w: 348, h: 108, fill: PAPER },
  { label: "試合を終える", x: 552, y: 1480, w: 348, h: 108, fill: YELLOW },
);

const PLUS: Rect = { x: 790, y: 790, w: 90, h: 90 };
const MINUS: Rect = { x: 590, y: 790, w: 90, h: 90 };
const SHEET_TOP = 1010;
const SAVE_BUTTON: Rect = { x: 240, y: SHEET_TOP + 330, w: 600, h: 110 };

// 拍に合わせた入力。0.5 秒で 1 打席、打点は倍の速さで連打し、5 打点目は上限で弾かれる。
const TAPS = [
  { at: 4.75, target: "二塁打" },
  { at: 5.25, target: "空振り三振" },
  { at: 5.75, target: "ホームラン" },
  { at: 6.05, target: "+" },
  { at: 6.25, target: "+" },
  { at: 6.45, target: "+" },
  { at: 6.65, target: "+" },
  { at: 7.0, target: "試合を終える" },
  { at: 7.48, target: "保存" },
] as const;
const REJECT = 6.65;
const RESULTS = [
  { at: 4.75, label: "二塁打", rbi: 0 },
  { at: 5.25, label: "空振り三振", rbi: 0 },
  { at: 5.75, label: "ホームラン", rbi: 1 },
];

function targetRect(target: string): Rect {
  if (target === "+") return PLUS;
  if (target === "保存") return SAVE_BUTTON;
  return PAD.find((b) => b.label === target) ?? PAD[0];
}

function cursorInMatch(t: number) {
  const points = [
    { at: 3.95, x: cursorInCreate(3.95).x, y: cursorInCreate(3.95).y },
    ...TAPS.map(({ at, target }) => {
      const r = targetRect(target);
      return { at, x: r.x + r.w / 2, y: r.y + r.h / 2 };
    }),
  ];
  for (let i = points.length - 1; i >= 0; i--) {
    if (t < points[i].at) continue;
    const a = points[i];
    const b = points[i + 1];
    if (!b) return { x: a.x, y: a.y, lift: 0 };
    const start = i === 0 ? 4.3 : a.at + 0.1;
    const p = prog(t, start, b.at - 0.04);
    const dist = Math.hypot(b.x - a.x, b.y - a.y);
    const lift = Math.sin(Math.PI * p) * Math.min(1, dist / 400);
    const q = inOutCubic(p);
    return { x: lerp(a.x, b.x, q), y: lerp(a.y, b.y, q) - lift * 120, lift };
  }
  return { x: points[0].x, y: points[0].y, lift: 0 };
}

function rbiAt(t: number) {
  let v = 1;
  for (const tap of TAPS) if (tap.target === "+" && tap.at !== REJECT && t >= tap.at) v++;
  return Math.min(4, v);
}

function drawMatchday(ctx: Ctx, t: number) {
  if (t < 3.95 || t >= 8.05) return;
  // 黄の面を 12 本のブラインドが閉じ、暗い面へ切り替える。
  for (let i = 0; i < 12; i++) {
    const p = outCubic(prog(t, 3.95 + i * 0.018, 4.17 + i * 0.018));
    ctx.fillStyle = INK;
    ctx.fillRect(i * 90, -40, 90 * p + 1, HEIGHT + 80);
  }
  // 本塁打の 2 コマだけ、背景を黄に反転させる。
  if (t >= 5.77 && t < 5.84) {
    ctx.fillStyle = YELLOW;
    ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
  }
  ctx.save();
  ctx.globalAlpha = 0.09 * prog(t, 4.15, 4.45);
  ctx.fillStyle = PAPER;
  ctx.beginPath();
  for (let y = 20; y < HEIGHT; y += 40) for (let x = 20; x < WIDTH; x += 40) ctx.rect(x, y, 5, 5);
  ctx.fill();
  ctx.restore();

  // 本塁打の花火。端末の外の暗い面で弾ける。
  burst(ctx, t, 5.8, 110, 560, 26, 71, { speed: 1100, gravity: 900, size: 20, life: 0.9 });
  burst(ctx, t, 5.92, 980, 760, 26, 83, { speed: 1100, gravity: 900, size: 20, life: 0.9 });
  burst(ctx, t, 6.05, 120, 1320, 20, 97, { speed: 900, gravity: 900, size: 18, life: 0.8 });

  const rise = spring(t - 4.0, 0.62, 2.0);
  ctx.save();
  ctx.translate(0, (1 - rise) * 1900);
  drawPhone(ctx, t);
  ctx.restore();

  drawFlyingCard(ctx, t);
  if (t < 7.75) {
    const pos = cursorInMatch(t);
    for (const tap of TAPS) {
      const r = targetRect(tap.target);
      tapRing(ctx, t, tap.at, r.x + r.w / 2, r.y + r.h / 2, tap.at === REJECT ? CORAL : YELLOW);
    }
    const tap = lastOf(TAPS, (x) => t >= x.at);
    const squash = tap && t - tap.at < 0.5 ? 1 - spring(t - tap.at, 0.4, 4.5) : 0;
    const lift = pos.lift;
    // 持ち上げた球は手前へ来るので、影を大きくずらして大きく描く。
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(pos.x + 14 + lift * 40, pos.y + 30 + lift * 60, 36, 18, 0, 0, TAU);
    ctx.fill();
    ctx.restore();
    drawBall(
      ctx,
      pos.x,
      pos.y,
      38 * (1 + lift * 0.25),
      t * 9,
      1 + 0.35 * squash,
      1 - 0.35 * squash,
    );
  }
}

/** CREATE で作った札が、中身ごと縮みながら端末の掲示板の顔へ吸い込まれる。 */
function drawFlyingCard(ctx: Ctx, t: number) {
  if (t < 3.95 || t >= 4.45) return;
  const p = prog(t, 3.95, 4.45);
  const rise = spring(t - 4.0, 0.62, 2.0);
  const q = inOutCubic(Math.min(1, p / 0.85));
  const target = { x: 248, y: 404 + (1 - rise) * 1900 };
  const from = { x: CARD.x + CARD.w / 2, y: CARD.y + CARD.h / 2 };
  const k = p < 0.85 ? lerp(1, 0.11, q) : 0.11 * (1 - (p - 0.85) / 0.15);
  ctx.save();
  ctx.translate(lerp(from.x, target.x, q), lerp(from.y, target.y, q) - Math.sin(Math.PI * q) * 160);
  ctx.rotate(Math.sin(Math.PI * q) * -0.14);
  ctx.scale(k, k);
  ctx.translate(-from.x, -from.y);
  drawPlayerCard(ctx, 3.95);
  ctx.restore();
}

function drawPhone(ctx: Ctx, t: number) {
  box(ctx, PHONE.x, PHONE.y, PHONE.w, PHONE.h, { fill: INK, r: 96, shadow: 18, line: 0 });
  ctx.fillStyle = INK;
  ctx.fillRect(PHONE.x - 8, 470, 10, 90);
  ctx.fillRect(PHONE.x + PHONE.w - 2, 520, 10, 150);
  ctx.save();
  rrect(ctx, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, 74);
  ctx.clip();
  ctx.fillStyle = SHEET;
  ctx.fillRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
  drawMatchScreen(ctx, t);
  ctx.restore();
}

function drawMatchScreen(ctx: Ctx, t: number) {
  // 状態の帯
  text(ctx, "19:05", 200, 240, jp(26), INK);
  box(ctx, 450, 208, 180, 46, { fill: INK, r: 23, shadow: 0, line: 0 });
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.strokeRect(826, 222, 44, 22);
  ctx.fillStyle = INK;
  ctx.fillRect(830, 226, 30, 14);

  text(ctx, "←", 180, 312, jp(40), INK);
  text(ctx, "試合", 240, 310, jp(36), INK);
  text(ctx, "···", 900, 306, jp(36), INK, "right");

  // 電光掲示板。今日の成績は記録した打席から数える。
  const recorded = RESULTS.filter((r) => t >= r.at + 0.4);
  box(ctx, 180, 340, 720, 240, { fill: BOARD_BG, r: 22, shadow: 8, line: 5 });
  box(ctx, 204, 360, 88, 88, { fill: BLUE_SOFT, r: 10, shadow: 0, line: 3 });
  drawSprite(ctx, HERO, 208, 364, 5);
  text(ctx, "大空 翔", 312, 400, jp(40), PAPER);
  text(ctx, "北斗ライナーズ · 遊撃手 · 1 番", 312, 436, jp(24, 400), mix(PAPER, BOARD_BG, 0.3));
  drawDots(ctx, "58", 768, 364, 9, 7, YELLOW);
  drawDots(ctx, "/143", 780, 438, 4, 3, mix(YELLOW, BOARD_BG, 0.3));
  const hits = recorded.filter((r) => r.label !== "空振り三振").length;
  const rbi = t >= 6.05 ? rbiAt(t) : recorded.reduce((s, r) => s + r.rbi, 0);
  text(ctx, `今日 ${recorded.length} 打数 ${hits} 安打 ${rbi} 打点`, 204, 492, jp(28), PAPER);
  const hr = t >= 5.78;
  const blink = hr && t < 6.4 ? (Math.floor((t - 5.78) * 10) % 2 === 0 ? 1 : 0.35) : 1;
  ctx.globalAlpha = blink;
  drawDots(
    ctx,
    hr ? "HOME RUN!" : "GAME 58",
    204,
    516,
    6,
    5,
    hr ? YELLOW : mix(YELLOW, BOARD_BG, 0.35),
    (c) => (hr ? (t >= 5.78 + c * 0.004 ? 1 : 0) : 1),
  );
  ctx.globalAlpha = 1;

  // 打席の列
  for (let i = 0; i < 3; i++) {
    const x = 180 + i * 248;
    const y = 610;
    const r = RESULTS[i];
    const landed = t >= r.at + 0.4;
    if (!landed) {
      ctx.save();
      ctx.setLineDash([12, 10]);
      ctx.strokeStyle = mix(INK, SHEET, 0.6);
      ctx.lineWidth = 3;
      rrect(ctx, x + 2, y + 2, 220, 146, 14);
      ctx.stroke();
      ctx.restore();
      text(ctx, `第 ${i + 1} 打席`, x + 112, y + 84, jp(24), mix(INK, SHEET, 0.5), "center");
      continue;
    }
    const pop = spring(t - r.at - 0.4, 0.45, 4);
    const selected = lastOf(RESULTS, (q) => t >= q.at + 0.4) === r;
    scaled(ctx, x + 112, y + 75, 0.85 + 0.15 * pop, 1.1 - 0.1 * pop, () => {
      box(ctx, x, y, 224, 150, { fill: selected ? BLUE_SOFT : PAPER, r: 14, shadow: 6, line: 4 });
      text(ctx, `第 ${i + 1} 打席`, x + 20, y + 38, jp(22, 400), INK);
      text(ctx, r.label, x + 20, y + 88, jp(r.label.length > 4 ? 32 : 38), INK);
      const n = i === 2 ? (t >= 6.05 ? rbiAt(t) : 1) : r.rbi;
      text(ctx, n > 0 ? `${n} 打点` : "—", x + 20, y + 128, jp(22, 400), INK);
    });
  }

  drawRbiRow(ctx, t);

  // 結果の面。下端の親指の届く範囲に主な 12 の結果と取り消しを常に置く。
  for (const [n, b] of PAD.entries()) {
    const at = 4.3 + (Math.floor(n / 3) + (n % 3)) * 0.035;
    const pop = outBack(prog(t, at, at + 0.3), 1.6);
    if (pop <= 0) continue;
    const d = pressDepth(
      t,
      TAPS.filter((x) => x.target === b.label).map((x) => x.at),
    );
    scaled(ctx, b.x + b.w / 2, b.y + b.h / 2, pop, pop, () => {
      box(ctx, b.x + 8 * d, b.y + 8 * d, b.w, b.h, {
        fill: b.fill,
        r: 14,
        shadow: 8 * (1 - d),
        line: 4,
      });
      const size = b.label.length > 5 ? 36 : 34;
      text(
        ctx,
        b.label,
        b.x + b.w / 2 + 8 * d,
        b.y + b.h / 2 + 12 + 8 * d,
        jp(size),
        INK,
        "center",
      );
    });
  }
  ctx.fillStyle = INK;
  rrect(ctx, 420, 1648, 240, 10, 5);
  ctx.fill();

  // 押した結果が札になって弧を描き、打席の列へ飛ぶ。押したものと増えたものを 1 本の軌跡で結ぶ。
  for (const [i, r] of RESULTS.entries()) {
    const p = prog(t, r.at + 0.04, r.at + 0.4);
    if (p <= 0 || p >= 1) continue;
    const from = targetRect(r.label);
    const a = { x: from.x + from.w / 2, y: from.y + from.h / 2 };
    const b = { x: 180 + i * 248 + 112, y: 685 };
    const c = { x: (a.x + b.x) / 2 + 160, y: Math.min(a.y, b.y) - 220 };
    const q = inOutCubic(p);
    const x = (1 - q) ** 2 * a.x + 2 * (1 - q) * q * c.x + q * q * b.x;
    const y = (1 - q) ** 2 * a.y + 2 * (1 - q) * q * c.y + q * q * b.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(Math.PI * p) * 0.25);
    box(ctx, -100, -36, 200, 72, {
      fill: r.label === "ホームラン" ? YELLOW : PAPER,
      r: 12,
      shadow: 8,
      line: 4,
    });
    text(ctx, r.label, 0, 12, jp(30), INK, "center");
    ctx.restore();
  }

  drawScoreSheet(ctx, t);
}

function drawRbiRow(ctx: Ctx, t: number) {
  const show = outCubic(prog(t, 4.45, 4.7));
  if (show <= 0) return;
  ctx.save();
  ctx.globalAlpha = show;
  text(ctx, "打点", 180, 852, jp(36), INK);
  const strikeout = t >= 5.25 + 0.4 && t < 5.75 + 0.4;
  const hrSelected = t >= 5.75 + 0.4;
  const disabled = strikeout;
  // 上限を試したら、拒否の文字でなく手応えで返す。5 が少しだけ見えて、ばねで 4 に戻る。
  const rejected = t >= REJECT;
  if (rejected) {
    const hint = outCubic(prog(t, REJECT + 0.05, REJECT + 0.25));
    ctx.globalAlpha = show * hint;
    text(ctx, "本塁打は 4 打点まで", 300, 852, jp(26), mix(CORAL, INK, 0.25));
    ctx.globalAlpha = show;
  } else if (hrSelected) {
    text(ctx, "本塁打 1〜4", 300, 852, jp(24, 400), mix(INK, SHEET, 0.45));
  }
  const flash = rejected && t < REJECT + 0.3 ? 1 - prog(t, REJECT, REJECT + 0.3) : 0;
  for (const [r, sign] of [
    [MINUS, "−"],
    [PLUS, "+"],
  ] as const) {
    const d =
      sign === "+"
        ? pressDepth(
            t,
            TAPS.filter((x) => x.target === "+").map((x) => x.at),
          )
        : 0;
    const stroke = sign === "+" && flash > 0 ? mix(INK, CORAL, flash) : INK;
    const fill = disabled ? mix(SHEET, INK, 0.08) : PAPER;
    box(ctx, r.x + 6 * d, r.y + 6 * d, r.w, r.h, {
      fill,
      r: 14,
      shadow: 6 * (1 - d),
      line: 4,
      stroke,
    });
    ctx.fillStyle = disabled ? mix(INK, SHEET, 0.6) : INK;
    ctx.fillRect(r.x + 25 + 6 * d, r.y + 41 + 6 * d, 40, 8);
    if (sign === "+") ctx.fillRect(r.x + 41 + 6 * d, r.y + 25 + 6 * d, 8, 40);
  }

  // 値は桁が転がる。前の値が上へ抜け、次の値が下から入る。
  const value = hrSelected ? (t >= 6.05 ? rbiAt(t) : 1) : 0;
  const lastChange = lastOf(TAPS, (x) => x.target === "+" && x.at !== REJECT && t >= x.at);
  const roll = lastChange ? outCubic(prog(t, lastChange.at, lastChange.at + 0.12)) : 1;
  let push = 0;
  if (rejected) {
    const e = t - REJECT;
    push = e < 0.07 ? 0.3 * outQuad(e / 0.07) : 0.3 * (1 - spring(e - 0.07, 0.35, 3.5));
  }
  const H = 72;
  ctx.save();
  ctx.beginPath();
  ctx.rect(690, 792, 96, 86);
  ctx.clip();
  const cx = 738;
  const base = 860;
  if (lastChange && roll < 1) {
    text(ctx, String(value - 1), cx, base - roll * H, jp(60), INK, "center");
    text(ctx, String(value), cx, base + (1 - roll) * H, jp(60), INK, "center");
  } else {
    text(ctx, String(value), cx, base - push * H, jp(60), INK, "center");
    if (push !== 0) text(ctx, "5", cx, base + (1 - push) * H, jp(60), CORAL, "center");
  }
  ctx.restore();
  ctx.restore();
}

function drawScoreSheet(ctx: Ctx, t: number) {
  if (t < 7.02) return;
  const e = spring(t - 7.02, 0.72, 2.4);
  ctx.save();
  ctx.globalAlpha = 0.35 * clamp01(e);
  ctx.fillStyle = INK;
  ctx.fillRect(SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
  ctx.restore();
  const top = lerp(SCREEN.y + SCREEN.h, SHEET_TOP, e);
  ctx.save();
  ctx.translate(0, top - SHEET_TOP);
  box(ctx, SCREEN.x - 6, SHEET_TOP, SCREEN.w + 12, 760, { fill: PAPER, r: 36, shadow: 0, line: 6 });
  ctx.fillStyle = mix(INK, PAPER, 0.7);
  rrect(ctx, 490, SHEET_TOP + 20, 100, 10, 5);
  ctx.fill();
  text(ctx, "スコア", 196, SHEET_TOP + 90, jp(34), INK);
  text(ctx, "北斗", 250, SHEET_TOP + 230, jp(44), INK, "center");
  text(ctx, "湾岸", 830, SHEET_TOP + 230, jp(44), INK, "center");
  // 得点は 0 から数え上げる。自チームの得点は打点の合計（4）以上でなければならない（C-2）。
  const ours = Math.min(5, Math.floor(prog(t, 7.15, 7.38) * 6));
  const theirs = Math.min(2, Math.floor(prog(t, 7.2, 7.36) * 3));
  drawDots(ctx, String(ours), 370, SHEET_TOP + 140, 14, 11, INK);
  drawDots(ctx, "-", 505, SHEET_TOP + 140, 14, 11, mix(INK, PAPER, 0.5));
  drawDots(ctx, String(theirs), 640, SHEET_TOP + 140, 14, 11, INK);
  const d = pressDepth(t, [7.48]);
  const b = SAVE_BUTTON;
  box(ctx, b.x + 8 * d, b.y + 8 * d, b.w, b.h, {
    fill: YELLOW,
    r: 16,
    shadow: 10 * (1 - d),
    line: 5,
  });
  text(ctx, "保存", b.x + b.w / 2 + 8 * d, b.y + 72 + 8 * d, jp(44), INK, "center");
  ctx.restore();
}

/* --------------------------------------------------------------- 04 GROW 8.00–10.40 */

const TILES = [
  { label: "本塁打", a: 6, b: 7, delta: "+1", rate: false },
  { label: "打点", a: 41, b: 45, delta: "+4", rate: false },
  { label: "安打", a: 54, b: 56, delta: "+2", rate: false },
  { label: "OPS", a: 762, b: 777, delta: "+.015", rate: true },
];
const GRID = { x: 80, y: 1432, cols: 13, rows: 11, pw: 70.8, ph: 24, cw: 62, ch: 16 };
const FILL_START = 9.45;
const FILL_END = 10.15;

/** inExpo で埋まる試合の、i 番目（59 以降）が埋まる時刻。 */
function fillTime(i: number) {
  const x = (i - 58) / 85;
  return FILL_START + ((Math.log2(Math.max(1e-6, x)) + 10) / 10) * (FILL_END - FILL_START);
}

function drawGrow(ctx: Ctx, t: number) {
  if (t < 7.55 || t >= 10.65) return;
  // 端末の画面の中で始まり、画面ごと引き伸ばして全面になる。
  const zoom = easeExpand(prog(t, 7.68, 8.05));
  const R = {
    x: lerp(SCREEN.x, 0, zoom),
    y: lerp(SCREEN.y, 0, zoom),
    w: lerp(SCREEN.w, WIDTH, zoom),
    h: lerp(SCREEN.h, HEIGHT, zoom),
  };
  const k = R.w / WIDTH;
  const radius = lerp(74 * (WIDTH / SCREEN.w) * k, 0, zoom);
  ctx.save();
  if (zoom < 1) {
    const bezel = 22 * k * (WIDTH / SCREEN.w);
    box(ctx, R.x - bezel, R.y - bezel, R.w + bezel * 2, R.h + bezel * 2, {
      fill: INK,
      r: radius + bezel,
      shadow: 18 * (1 - zoom),
      line: 0,
    });
  }
  rrect(ctx, R.x, R.y, R.w, R.h, radius);
  ctx.clip();
  // 保存の後、画面の下から結果がせり上がる。
  const reveal = outCubic(prog(t, 7.55, 7.68));
  ctx.beginPath();
  ctx.rect(R.x, R.y + R.h * (1 - reveal), R.w, R.h * reveal + 1);
  ctx.clip();
  ctx.fillStyle = SHEET;
  ctx.fillRect(R.x, R.y, R.w, R.h);
  ctx.translate(R.x, R.y + (R.h - HEIGHT * k) / 2);
  ctx.scale(k, k);
  drawGrowContent(ctx, t);
  ctx.restore();
}

function odometer(
  ctx: Ctx,
  value: number,
  digits: number,
  x: number,
  baseline: number,
  size: number,
  colWidth: number,
) {
  const H = size * 1.0;
  for (let k = 0; k < digits; k++) {
    const place = 10 ** k;
    const d = Math.floor(value / place) % 10;
    // 下の桁が 9 から 0 へ回るときだけ、上の桁も一緒に回る。
    const frac = k === 0 ? value - Math.floor(value) : Math.max(0, (value % place) - (place - 1));
    const cx = x + (digits - 1 - k) * colWidth + colWidth / 2;
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - colWidth / 2, baseline - size * 0.82, colWidth, size * 0.92);
    ctx.clip();
    text(ctx, String(d), cx, baseline - frac * H, jp(size), INK, "center");
    if (frac > 0)
      text(ctx, String((d + 1) % 10), cx, baseline + (1 - frac) * H, jp(size), INK, "center");
    ctx.restore();
  }
}

function deltaChip(
  ctx: Ctx,
  label: string,
  x: number,
  y: number,
  size: number,
  at: number,
  t: number,
  rot = 0,
) {
  if (t < at) return;
  const e = spring(t - at, 0.42, 3.4);
  const w = measure(ctx, label, jp(size)) + size * 0.9;
  const h = size * 1.5;
  ctx.save();
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate(rot * e);
  ctx.scale(e, e);
  box(ctx, -w / 2, -h / 2, w, h, { fill: CORAL_SOFT, r: 10, shadow: 5, line: 4 });
  text(ctx, label, 0, size * 0.36, jp(size), INK, "center");
  ctx.restore();
}

function drawGrowContent(ctx: Ctx, t: number) {
  text(ctx, "試合結果 · 第 58 戦", 80, 200, jp(30, 400), mix(INK, SHEET, 0.4));
  const head = "5 対 2 で";
  text(ctx, head, 80, 288, jp(76), INK);
  const hx = 80 + measure(ctx, head, jp(76)) + 16;
  const mark = outExpo(prog(t, 8.05, 8.35));
  ctx.fillStyle = YELLOW;
  ctx.fillRect(hx - 8, 232, (measure(ctx, "勝ち", jp(76)) + 16) * mark, 70);
  text(ctx, "勝ち", hx, 288, jp(76), GREEN);

  // 打率。小数点は白球で、数が転がる間だけ回る。
  text(ctx, "打率", 80, 400, jp(36), mix(INK, SHEET, 0.35));
  const roll = outCubic(prog(t, 8.15, 8.85));
  const avg = lerp(287, 293, roll);
  drawBall(ctx, 128, 600, 40, roll * 18);
  odometer(ctx, avg, 3, 180, 640, 280, 172);
  deltaChip(ctx, "+.006", 720, 452, 46, 8.85, t, -0.08);

  for (const [i, tile] of TILES.entries()) {
    const x = 80 + (i % 2) * 480;
    const y = 700 + Math.floor(i / 2) * 230;
    box(ctx, x, y, 440, 200, { fill: PAPER, r: 16, shadow: 10, line: 5 });
    text(ctx, tile.label, x + 28, y + 52, jp(30), mix(INK, PAPER, 0.35));
    const at = 8.35 + i * 0.1;
    const v = Math.round(lerp(tile.a, tile.b, outCubic(prog(t, at, at + 0.5))));
    const shown = tile.rate ? `.${String(v).padStart(3, "0")}` : String(v);
    text(ctx, shown, x + 28, y + 158, jp(96), INK);
    const w = measure(ctx, tile.delta, jp(34)) + 31;
    deltaChip(ctx, tile.delta, x + 440 - 28 - w, y + 112, 34, at + 0.5, t);
  }

  // 能力が上がる。祝福は 1 季に数回なので、紙吹雪の予算を使う。
  const band = spring(t - 8.95, 0.55, 2.8);
  if (t >= 8.95) {
    scaled(ctx, 540, 1250, band, band, () => {
      box(ctx, 80, 1180, 920, 140, { fill: YELLOW, r: 18, shadow: 12, line: 6 });
      // 字が 1 つずつ跳ねる波。ドット文字を字ごとに持ち上げる。
      const wave = t - 9.0;
      [..."LEVEL UP!"].forEach((ch, i) => {
        const up =
          wave > 0 && wave < 0.9
            ? Math.max(0, Math.sin(wave * 12 - i * 0.55)) * 22 * (1 - wave / 0.9)
            : 0;
        drawDots(ctx, ch, 116 + i * 42, 1226 - up, 7, 6, INK);
      });
      text(ctx, "パワー", 596, 1268, jp(40), INK);
      const pw = Math.round(lerp(85, 86, prog(t, 9.1, 9.25)));
      text(ctx, `85 → ${pw}`, 964, 1268, jp(44), INK, "right");
    });
  }
  burst(ctx, t, 9.05, 300, 1250, 44, 131, { speed: 1400, gravity: 2400, size: 18, life: 1.1 });

  // 今季の 143 試合。勝ちを黄、負けを墨の升で並べ、残りの日程を加速して埋める。
  const filled =
    t < FILL_START
      ? t >= 8.3
        ? 59
        : 58
      : Math.floor(58 + 85 * inExpo(prog(t, FILL_START, FILL_END))) + 1;
  const n = Math.min(143, filled);
  text(ctx, "2026 年", 80, 1404, jp(36), INK);
  const done = n >= 143;
  text(ctx, `${n} / 143 試合`, 1000, 1404, jp(36), done ? mix(CORAL, INK, 0.2) : INK, "right");
  for (let i = 0; i < 143; i++) {
    const col = i % GRID.cols;
    const row = Math.floor(i / GRID.cols);
    const x = GRID.x + col * GRID.pw;
    const y = GRID.y + row * GRID.ph;
    if (i >= n) {
      ctx.strokeStyle = mix(INK, SHEET, i === 58 ? 0 : 0.75);
      ctx.lineWidth = i === 58 && Math.floor(t * 6) % 2 === 0 ? 4 : 2;
      ctx.strokeRect(x + 1, y + 1, GRID.cw - 2, GRID.ch - 2);
      continue;
    }
    const at = i === 58 ? 8.3 : i > 58 ? fillTime(i) : -1;
    const pop = at < 0 ? 1 : 1 + 0.7 * (1 - prog(t, at, at + 0.1));
    const win = i === 58 || hash(i * 3.1) < 0.56;
    ctx.fillStyle = win ? YELLOW : INK;
    const w = GRID.cw * pop;
    const h = GRID.ch * pop;
    ctx.fillRect(x + (GRID.cw - w) / 2, y + (GRID.ch - h) / 2, w, h);
    if (win) {
      ctx.strokeStyle = INK;
      ctx.lineWidth = 2;
      ctx.strokeRect(x + (GRID.cw - w) / 2 + 1, y + (GRID.ch - h) / 2 + 1, w - 2, h - 2);
    }
  }
  // 加速の終わりは流線にする。コマ番号から hash で線を引き直し、毎コマ入れ替える。
  const speed = prog(t, 9.8, 10.15) * (1 - prog(t, 10.15, 10.22));
  if (speed > 0) {
    const frame = Math.floor(t * FPS);
    ctx.fillStyle = INK;
    for (let i = 0; i < 16; i++) {
      const y = hash(frame * 17 + i) * HEIGHT;
      const len = 300 + hash(frame * 29 + i) * 700;
      const x = hash(frame * 31 + i) * (WIDTH + len) - len;
      ctx.globalAlpha = speed * 0.5;
      ctx.fillRect(x, y, len, 3 + hash(i + frame) * 8);
    }
    ctx.globalAlpha = 1;
  }
}

/* ------------------------------------------------------------- 05 SEASON 10.40–12.60 */

const STAMPS = [
  { label: "首位打者", x: 220, at: 10.6, fill: YELLOW, rot: -0.12 },
  { label: "盗塁王", x: 540, at: 10.85, fill: CORAL, rot: 0.06 },
  { label: "MVP", x: 860, at: 11.1, fill: PAPER, rot: 0.14 },
];
const STAMP_Y = 600;
const STAMP_R = 125;
const YEARS = Array.from({ length: 15 }, (_, i) => {
  const arc = Math.sin((Math.PI * i) / 14);
  return {
    year: 2026 + i,
    avg: Math.round(255 + arc * 55 + (hash(i * 5.3) - 0.5) * 24),
    hr: Math.round(4 + arc * 30 + hash(i * 2.9) * 6),
    sb: Math.round(28 - i * 1.4 + hash(i * 8.1) * 10),
    titles: i === 0 ? 0 : Math.floor(hash(i * 4.4) * 3.2 * arc),
  };
});
const STACK_X = 130;
const STACK_W = 820;
const STACK_H = 110;
const stackY = (i: number) => 810 + i * 54;
const stackStart = (i: number) => 11.3 + 0.8 * Math.sqrt(i / 14);
const FLIP_START = 12.35;
const FLIP_END = 12.62;

// LEGACY の名鑑の格子。SEASON の最後の札の裏は、この格子の 1 枠を 5 倍にしたものと同じ絵にする。
const CELL_W = 120;
const CELL_H = 150;
const GRID_COLS = 8;
const GRID_ROWS = 12;
const HERO_CELL = { col: 3, row: 6 };
const cellX = (col: number) => 18 + col * 132;
const cellY = (row: number) => -12 + row * 162;
const HERO_CENTER = { x: cellX(HERO_CELL.col) + CELL_W / 2, y: cellY(HERO_CELL.row) + CELL_H / 2 };
const ZOOM_FROM = 5;

function drawSeason(ctx: Ctx, t: number) {
  if (t < 10.22 || t >= 12.7) return;
  if (t >= 10.36) {
    ctx.fillStyle = BLUE;
    ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
    // 放射の帯。明るさの違う 2 色を交互に塗り、ゆっくり回す。
    ctx.save();
    ctx.translate(540, 640);
    ctx.rotate(t * 0.25);
    ctx.fillStyle = mix(BLUE, PAPER, 0.1);
    for (let i = 0; i < 28; i += 2) {
      const a0 = (i / 28) * TAU;
      const a1 = ((i + 1) / 28) * TAU;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 2400, a0, a1);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    drawSeasonContent(ctx, t);
  }
  drawShutters(ctx, t);
}

/** 左右から閉じて、閉じた一瞬だけ FINAL を点灯し、文字ごと割れて開く。 */
function drawShutters(ctx: Ctx, t: number) {
  const close = inCubic(prog(t, 10.22, 10.36));
  const open = outCubic(prog(t, 10.47, 10.64));
  const c = close * (1 - open);
  if (c <= 0) return;
  for (const side of [-1, 1]) {
    const shift = (1 - c) * 560 * side;
    ctx.save();
    ctx.translate(shift, 0);
    ctx.beginPath();
    ctx.rect(side < 0 ? -40 : 540, -40, 580, HEIGHT + 80);
    ctx.clip();
    ctx.fillStyle = INK;
    ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
    ctx.fillStyle = YELLOW;
    ctx.fillRect(side < 0 ? 520 : 540, -40, 20, HEIGHT + 80);
    const label = "2026 FINAL";
    const pitch = 17;
    const w = dotWidth(label) * pitch;
    drawDots(ctx, label, 540 - w / 2, 900, pitch, 13, YELLOW, (col) =>
      t >= 10.36 + col * 0.0015 ? 1 : 0.12,
    );
    ctx.restore();
  }
}

function drawStamp(ctx: Ctx, s: (typeof STAMPS)[number], t: number) {
  const p = prog(t, s.at, s.at + 0.13);
  if (p <= 0) return;
  const exit = inCubic(prog(t, 12.25, 12.5));
  const fall = inQuad(p);
  const scale = lerp(2.4, 1, fall);
  const sq = p >= 1 ? 1 - spring(t - s.at - 0.13, 0.35, 4) : 0;
  const y = STAMP_Y - exit * 1000;
  // 高いところにある判ほど、影を大きくずらす。
  const shadow = 10 + 60 * (1 - fall);
  ctx.save();
  ctx.globalAlpha = clamp01(p * 3);
  ctx.translate(s.x, y);
  ctx.rotate(lerp(s.rot - 0.5, s.rot, fall));
  ctx.scale(scale * (1 + 0.12 * sq), scale * (1 - 0.1 * sq));
  ctx.fillStyle = INK;
  circle(ctx, shadow / scale, shadow / scale, STAMP_R);
  ctx.fillStyle = s.fill;
  circle(ctx, 0, 0, STAMP_R);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.arc(0, 0, STAMP_R - 4, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, STAMP_R - 24, 0, TAU);
  ctx.stroke();
  ctx.setLineDash([]);
  if (s.label === "MVP") drawDots(ctx, "MVP", -85, -44, 10, 8, INK);
  else
    text(
      ctx,
      s.label,
      0,
      8,
      jp(s.label.length > 3 ? 44 : 52),
      s.fill === CORAL ? PAPER : INK,
      "center",
    );
  text(ctx, "2026", 0, 62, jp(24), s.fill === CORAL ? PAPER : INK, "center");
  ctx.restore();
  // 着地の埃。ドットの粒が輪になって散る。
  const q = prog(t, s.at + 0.13, s.at + 0.5);
  if (q > 0 && q < 1 && exit === 0) {
    ctx.fillStyle = PAPER;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * TAU + hash(i + s.x) * 0.3;
      const d = STAMP_R + 20 + 120 * outCubic(q);
      const size = 18 * (1 - q);
      ctx.globalAlpha = 1 - q;
      ctx.fillRect(
        s.x + Math.cos(a) * d - size / 2,
        STAMP_Y + Math.sin(a) * d * 0.7 - size / 2,
        size,
        size,
      );
    }
    ctx.globalAlpha = 1;
  }
}

function drawSeasonContent(ctx: Ctx, t: number) {
  const exitTitle = inCubic(prog(t, 12.2, 12.45)) * -600;
  const pop = spring(t - 10.5, 0.5, 2.8);
  scaled(ctx, 540, 250 + exitTitle, pop, pop, () => {
    text(ctx, "2026 シーズン終了", 546, 276 + exitTitle, jp(66), INK, "center");
    text(ctx, "2026 シーズン終了", 540, 270 + exitTitle, jp(66), PAPER, "center");
    const label = "北斗ライナーズ 1 位 · 143 試合";
    const w = measure(ctx, label, jp(30)) + 48;
    box(ctx, 540 - w / 2, 314 + exitTitle, w, 60, { fill: INK, r: 30, shadow: 0, line: 0 });
    text(ctx, label, 540, 355 + exitTitle, jp(30), PAPER, "center");
  });
  for (const s of STAMPS) drawStamp(ctx, s, t);

  // 年度の札が右から飛んで積み重なる。間隔を √i で詰め、年月が速く過ぎるように見せる。
  for (let i = 0; i < 14; i++) {
    const start = stackStart(i);
    const p = prog(t, start, start + 0.24);
    if (p <= 0) continue;
    const exit = inCubic(prog(t, 12.22 + (13 - i) * 0.008, 12.5 + (13 - i) * 0.008)) * 1300;
    const x = lerp(STACK_X + 1100, STACK_X, outBack(p, 1.2));
    const y = stackY(i) + exit;
    const rot = lerp(0.14, (hash(i * 9.1) - 0.5) * 0.03, outCubic(p));
    ctx.save();
    ctx.translate(x + STACK_W / 2, y + STACK_H / 2);
    ctx.rotate(rot);
    ctx.translate(-STACK_W / 2, -STACK_H / 2);
    drawYearCard(ctx, YEARS[i], false);
    ctx.restore();
  }
  drawRetireCard(ctx, t);
}

function drawYearCard(ctx: Ctx, y: (typeof YEARS)[number], retire: boolean) {
  box(ctx, 0, 0, STACK_W, STACK_H, { fill: retire ? YELLOW : PAPER, r: 14, shadow: 8, line: 5 });
  box(ctx, 16, 10, 150, 44, { fill: INK, r: 8, shadow: 0, line: 0 });
  drawDots(ctx, String(y.year), 30, 17, 5, 4, YELLOW);
  if (retire) {
    text(ctx, "引退 · 通算 2,104 安打 312 本", 188, 44, jp(32), INK);
    return;
  }
  text(ctx, `.${y.avg}  ${y.hr} 本  ${y.sb} 盗塁`, 188, 44, jp(32), INK);
  for (let k = 0; k < y.titles; k++) {
    ctx.fillStyle = [YELLOW, CORAL, BLUE][k % 3];
    ctx.fillRect(STACK_W - 50 - k * 34, 16, 24, 24);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.strokeRect(STACK_W - 50 - k * 34, 16, 24, 24);
  }
}

/** 最後の年度の札が「引退」で持ち上がり、裏返ると名鑑の 1 枠になる。 */
function drawRetireCard(ctx: Ctx, t: number) {
  const i = 14;
  const start = stackStart(i);
  const p = prog(t, start, start + 0.24);
  if (p <= 0) return;
  const lift = inOutCubic(prog(t, 12.18, FLIP_START));
  const flip = prog(t, FLIP_START, FLIP_END);
  const x0 = lerp(STACK_X + 1100, STACK_X, outBack(p, 1.2)) + STACK_W / 2;
  const cx = lerp(x0, 540, lift);
  const cy = lerp(stackY(i) + STACK_H / 2, 960, lift);
  const h = lerp(STACK_H, CELL_H * ZOOM_FROM, inOutCubic(flip));
  const w = lerp(STACK_W, CELL_W * ZOOM_FROM, inOutCubic(flip));
  const face = Math.abs(Math.cos(Math.PI * flip));
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(face * (1 + 0.06 * Math.sin(Math.PI * lift)), 1);
  if (flip < 0.5) {
    ctx.scale(w / STACK_W, h / STACK_H);
    ctx.translate(-STACK_W / 2, -STACK_H / 2);
    drawYearCard(ctx, YEARS[i], true);
  } else {
    ctx.scale(w / CELL_W, h / CELL_H);
    ctx.translate(-CELL_W / 2, -CELL_H / 2);
    drawMiniCard(ctx, -1, 0, 0);
  }
  ctx.restore();
}

/* ------------------------------------------------------------- 06 LEGACY 12.60–15.00 */

/** 名鑑の 1 枠。index が -1 なら主役の選手で、殿堂入りの黄にする。 */
function drawMiniCard(ctx: Ctx, index: number, x: number, y: number) {
  const hero = index < 0;
  const team = hero ? BLUE : TEAM_COLORS[Math.floor(hash(index * 7.3) * TEAM_COLORS.length)];
  const retired = !hero && hash(index * 2.3) < 0.35;
  const skin = hero ? SKINS[0] : SKINS[Math.floor(hash(index * 5.9) * SKINS.length)];
  box(ctx, x, y, CELL_W, CELL_H, { fill: hero ? YELLOW : SHEET, r: 10, shadow: 6, line: 4 });
  ctx.fillStyle = retired ? GREY : team;
  ctx.fillRect(x + 4, y + 4, CELL_W - 8, 22);
  ctx.fillStyle = INK;
  ctx.fillRect(x + 4, y + 26, CELL_W - 8, 3);
  drawSprite(ctx, palette(retired ? GREY : team, skin), x + 20, y + 34, 5);
  if (hero) {
    text(ctx, "大空 翔", x + CELL_W / 2, y + 136, jp(19), INK, "center");
    // 殿堂の星。ドットで描く。
    ctx.fillStyle = INK;
    for (const [cx, cy] of [
      [2, 0],
      [1, 1],
      [2, 1],
      [3, 1],
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [1, 3],
      [3, 3],
    ])
      ctx.fillRect(x + CELL_W - 30 + cx * 4, y + 8 + cy * 4, 4, 4);
    return;
  }
  ctx.fillStyle = mix(INK, SHEET, 0.2);
  ctx.fillRect(x + 16, y + 122, 60 + hash(index) * 30, 8);
  ctx.fillStyle = mix(INK, SHEET, 0.6);
  ctx.fillRect(x + 16, y + 136, 40 + hash(index + 1) * 30, 5);
}

/** 名鑑の札の落下。初速 800px/秒、重力 26,000px/秒²。 */
function cardFall(t: number, t0: number) {
  const e = t - t0;
  return e > 0 ? 800 * e + 13000 * e * e : 0;
}

const TOSS_Y0 = 1180;
const TOSS_APEX = -150;
const TOSS_AT = 14.55;
// 投げ上げの頂点を t = 0.10 に置き、ループの継ぎ目の 0.55 秒後にする。頂点は画面の外にある。
const TOSS_G = (2 * (TOSS_Y0 - TOSS_APEX)) / 0.55 ** 2;
const TOSS_V = TOSS_G * 0.55;

function drawLegacy(ctx: Ctx, t: number) {
  if (t < 12.6) return;
  const open = easeExpand(prog(t, 12.6, 12.85));
  const card = {
    x: 540 - (CELL_W * ZOOM_FROM) / 2,
    y: 960 - (CELL_H * ZOOM_FROM) / 2,
    w: CELL_W * ZOOM_FROM,
    h: CELL_H * ZOOM_FROM,
  };
  ctx.save();
  if (open < 1) {
    ctx.beginPath();
    ctx.rect(
      lerp(card.x, 0, open),
      lerp(card.y, 0, open),
      lerp(card.w, WIDTH, open),
      lerp(card.h, HEIGHT, open),
    );
    ctx.clip();
  }
  drawField(ctx, prog(t, 14.7, 14.98));
  ctx.restore();

  // 札から名鑑へ引く。主役の枠を画面の中心から本来の位置へ送りながら、縮尺を 5 から 1 へ戻す。
  const e = easeEntrance(prog(t, 12.7, 13.6));
  const s = lerp(ZOOM_FROM, 1, e);
  const px = lerp(540, HERO_CENTER.x, e);
  const py = lerp(960, HERO_CENTER.y, e);
  ctx.save();
  ctx.translate(px, py);
  ctx.scale(s, s);
  ctx.translate(-HERO_CENTER.x, -HERO_CENTER.y);
  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const hero = col === HERO_CELL.col && row === HERO_CELL.row;
      const index = row * GRID_COLS + col;
      const x = cellX(col);
      const y = cellY(row);
      // 画面の外の枠は描かない。
      const sx = px + (x - HERO_CENTER.x) * s;
      const sy = py + (y - HERO_CENTER.y) * s;
      if (sx > WIDTH || sy > HEIGHT + 400 || sx + CELL_W * s < 0 || sy + CELL_H * s < -400)
        continue;
      const d = Math.hypot(col - HERO_CELL.col, row - HERO_CELL.row);
      const at = 12.72 + d * 0.045;
      const pop = hero ? 1 : outBack(prog(t, at, at + 0.3), 1.5);
      if (pop <= 0) continue;
      // 最後は枠が下の段から重力で落ち、夜の球場だけが残る。15 秒までに最上段も画面の下へ抜ける。
      const t0 = 14.45 + (GRID_ROWS - 1 - row) * 0.008 + hash(index * 1.7) * 0.06;
      const fall = cardFall(t, t0);
      const spin = t > t0 ? (hash(index * 3.7) - 0.5) * 1.6 * (t - t0) : 0;
      ctx.save();
      ctx.translate(x + CELL_W / 2, y + CELL_H / 2 + fall);
      ctx.rotate(spin);
      ctx.scale(pop, pop);
      ctx.translate(-CELL_W / 2, -CELL_H / 2);
      drawMiniCard(ctx, hero ? -1 : index, 0, 0);
      ctx.restore();
    }
  }
  ctx.restore();

  // 名鑑を暗くし、掲示板を降ろして題字を点灯する。
  const dim = 0.62 * outCubic(prog(t, 13.45, 13.75)) * (1 - prog(t, 14.55, 14.9));
  if (dim > 0) {
    ctx.fillStyle = INK;
    ctx.globalAlpha = dim;
    ctx.fillRect(-40, -40, WIDTH + 80, HEIGHT + 80);
    ctx.globalAlpha = 1;
  }
  if (t >= 13.45) {
    const drop = spring(t - 13.45, 0.55, 2.2);
    drawBoard(ctx, (1 - drop) * -820, TITLE_CELLS, (cell) => {
      const on = 13.8 + cell.c * 0.007 + cell.line * 0.05;
      const off = 14.6 + cell.c * 0.006;
      return t >= on && t < off ? 1 : 0;
    });
  }

  // 惹句。blur-focus の値（浮上と entrance の曲線）を、ぼかし抜きで使う。
  const tag = easeEntrance(prog(t, 13.95, 14.35)) * (1 - prog(t, 14.6, 14.8));
  if (tag > 0) {
    ctx.globalAlpha = tag;
    text(
      ctx,
      "1 試合ずつ、自分だけの選手名鑑を。",
      540,
      790 + (1 - tag) * 24,
      jp(46),
      PAPER,
      "center",
    );
    ctx.globalAlpha = 1;
  }
  drawNewPlayer(ctx, t);
}

/** 空の「選手を作る」札。脈打ち、沈んでから白球を投げ上げ、冒頭の投球へつなぐ。 */
function drawNewPlayer(ctx: Ctx, t: number) {
  if (t < 14.0) return;
  const appear = spring(t - 14.0, 0.5, 2.6);
  const pulse = t < 14.42 ? 1 + 0.03 * Math.sin((t - 14.0) * TAU * 2.2) : 1;
  const crouch = outQuad(prog(t, 14.42, TOSS_AT));
  const release = t >= TOSS_AT ? 1 - spring(t - TOSS_AT, 0.4, 4) : 0;
  const sy = 1 - 0.1 * crouch * (1 - prog(t, TOSS_AT, TOSS_AT + 0.01)) + 0.08 * release;
  const fall = cardFall(t, 14.6);
  const w = CELL_W * 2.6;
  const h = CELL_H * 2.6;
  const cx = 540;
  const cy = TOSS_Y0 + fall;
  ctx.save();
  ctx.translate(cx, cy + h / 2);
  ctx.scale(appear * pulse, appear * pulse * sy);
  ctx.translate(-cx, -(cy + h / 2));
  box(ctx, cx - w / 2, cy - h / 2, w, h, { fill: "#0b2016", r: 26, shadow: 0, line: 0 });
  ctx.setLineDash([22, 14]);
  ctx.strokeStyle = YELLOW;
  ctx.lineWidth = 7;
  rrect(ctx, cx - w / 2 + 4, cy - h / 2 + 4, w - 8, h - 8, 24);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillStyle = YELLOW;
  ctx.fillRect(cx - 50, cy - 70, 100, 20);
  ctx.fillRect(cx - 10, cy - 110, 20, 100);
  text(ctx, "選手を作る", cx, cy + 90, jp(38), PAPER, "center");
  ctx.restore();

  // 投げ上げ。LEGACY の最後から冒頭の 0.1 秒までを 1 本の放物線でつなぐ。
  if (t >= 14.42) {
    const grow = spring(t - 14.42, 0.5, 4);
    const tau = t - TOSS_AT;
    const y = tau > 0 ? TOSS_Y0 - TOSS_V * tau + 0.5 * TOSS_G * tau * tau : TOSS_Y0 - 60 * grow;
    const stretch = tau > 0 ? Math.max(0, 1 - tau * 3) * 0.25 : 0;
    drawBall(ctx, cx, y, 40 * Math.min(1, grow), t * 12, 1 - stretch * 0.6, 1 + stretch);
  }
}

/* ------------------------------------------------------------------------ HUD */

function hudColor(t: number) {
  if (t >= HIT && t < HIT + 0.1) return INK;
  if ((t >= 1.62 && t < 4.2) || (t >= 7.95 && t < 10.3)) return INK;
  return PAPER;
}

// ダイヤモンドの走者。本塁 → 1 塁 → 2 塁 → 3 塁 → 本塁と進み、コアループの相と 15 秒の進みを兼ねる。
const RUNS = [
  { from: 0, to: 1, at: 1.5 },
  { from: 1, to: 2, at: 4.2 },
  { from: 2, to: 3, at: 8.0 },
  { from: 3, to: 4, at: 14.3 },
];

function runner(t: number) {
  let base = 0;
  for (const run of RUNS) {
    const p = inOutCubic(prog(t, run.at, run.at + 0.45));
    if (p <= 0) break;
    base = lerp(run.from, run.to, p);
  }
  return base;
}

function phaseAt(t: number) {
  if (t >= 12.6) return 3;
  if (t >= 8.0) return 2;
  if (t >= 4.2 || t < 1.5) return 1;
  return 0;
}

function drawHud(ctx: Ctx, t: number) {
  const color = hudColor(t);
  // 名鑑の札が画面を埋める間は、HUD の下に夜の地の帯を敷き、注記を札の上で読めるようにする。
  const band = 0.9 * prog(t, 12.75, 13.0) * (1 - prog(t, 14.55, 14.85));
  if (band > 0) {
    ctx.save();
    ctx.globalAlpha = band;
    ctx.fillStyle = FIELD;
    ctx.fillRect(0, 0, WIDTH, 92);
    ctx.fillRect(0, 1732, WIDTH, HEIGHT - 1732);
    ctx.restore();
  }
  const M = 36;
  const K = 24;
  ctx.save();
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  for (const [x, y, dx, dy] of [
    [M, M, 1, 1],
    [WIDTH - M, M, -1, 1],
    [M, HEIGHT - M, 1, -1],
    [WIDTH - M, HEIGHT - M, -1, -1],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x + dx * K, y);
    ctx.lineTo(x, y);
    ctx.lineTo(x, y + dy * K);
    ctx.stroke();
  }
  ctx.font = mono(19);
  ctx.textBaseline = "top";
  ctx.fillText("BASEBALL PLAYER JOURNEY — REEL 2026", M + K + 12, M - 2);
  const frame = Math.floor(t * FPS);
  const ss = String(Math.floor(frame / FPS)).padStart(2, "0");
  const ff = String(frame % FPS).padStart(2, "0");
  ctx.textAlign = "right";
  ctx.fillText(`TC 00:00:${ss}:${ff}`, WIDTH - M - K - 12, M - 2);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  let index = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i].at) index = i;
  const scene = SCENES[index];
  ctx.globalAlpha = 0.95;
  text(ctx, `0${index + 1} / 0${SCENES.length}  ${scene.name}`, 190, 1778, jp(28), color);
  ctx.globalAlpha = 0.75;
  ctx.font = mono(19);
  ctx.fillText(scene.spec, 190, 1812);
  text(ctx, scene.req, 190, 1845, jp(20, 400), color);

  // コアループの 4 相。今の相だけを濃くする。
  ctx.font = mono(18);
  let x = WIDTH - M - K;
  const phase = phaseAt(t);
  for (let i = PHASES.length - 1; i >= 0; i--) {
    const label = PHASES[i];
    const w = ctx.measureText(label).width;
    x -= w;
    ctx.globalAlpha = i === phase ? 1 : 0.35;
    ctx.fillText(label, x, 1778);
    if (i > 0) {
      ctx.globalAlpha = 0.35;
      x -= 34;
      ctx.fillText("→", x + 8, 1778);
    }
  }

  // ダイヤモンド
  const dcx = 104;
  const dcy = 1812;
  const half = 42;
  const bases = [
    [dcx, dcy + half],
    [dcx + half, dcy],
    [dcx, dcy - half],
    [dcx - half, dcy],
  ];
  ctx.globalAlpha = 0.45;
  ctx.lineWidth = 3;
  ctx.beginPath();
  bases.forEach(([bx, by], i) => (i ? ctx.lineTo(bx, by) : ctx.moveTo(bx, by)));
  ctx.closePath();
  ctx.stroke();
  const pos = runner(t);
  for (let i = 1; i < 4; i++) {
    const [bx, by] = bases[i];
    const reached = pos >= i && pos < 4;
    ctx.globalAlpha = reached ? 1 : 0.6;
    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(Math.PI / 4);
    if (reached) ctx.fillRect(-8, -8, 16, 16);
    else ctx.strokeRect(-8, -8, 16, 16);
    ctx.restore();
  }
  const seg = Math.min(3, Math.floor(pos));
  const f = pos - seg;
  const [ax, ay] = bases[seg];
  const [bx2, by2] = bases[(seg + 1) % 4];
  ctx.globalAlpha = 1;
  ctx.fillStyle = CORAL;
  circle(ctx, lerp(ax, bx2, f), lerp(ay, by2, f), 10);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(lerp(ax, bx2, f), lerp(ay, by2, f), 10, 0, TAU);
  ctx.stroke();

  // 15 秒の進み。場面の境目に目盛りを打つ。
  const x0 = 190;
  const x1 = WIDTH - M - K;
  const yy = 1868;
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.25;
  line(ctx, x0, yy, x1, yy);
  for (const s of SCENES)
    line(ctx, lerp(x0, x1, s.at / DURATION), yy - 6, lerp(x0, x1, s.at / DURATION), yy + 6);
  ctx.globalAlpha = 0.85;
  line(ctx, x0, yy, lerp(x0, x1, t / DURATION), yy);
  ctx.restore();
}
