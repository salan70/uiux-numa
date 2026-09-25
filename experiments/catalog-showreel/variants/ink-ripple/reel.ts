import {
  bezier,
  clamp01,
  hash,
  inCubic,
  inExpo,
  inOutCubic,
  inOutExpo,
  inQuad,
  lerp,
  outBack,
  outCubic,
  outExpo,
  outQuad,
  prog,
  spring,
} from "./motion";

// 15 秒のリールを、時刻 t から 1 フレームを描く純関数として書く。
// 再生、コマ送り、動画への書き出しが同じ絵になる。座標は 1920×1080 の論理座標で、呼び出し側が縮尺を掛ける。
// 場面の時刻と値の根拠は README の Variants の後の表にある。

export const DURATION = 15;
export const FPS = 30;
export const WIDTH = 1920;
export const HEIGHT = 1080;

/** reduced motion で自動再生しないときに見せる 1 枚。ロゴと語と副題が揃った時刻にする。 */
export const POSTER_TIME = 13.6;

const CX = WIDTH / 2;
const CY = HEIGHT / 2;
const TAU = Math.PI * 2;

// 配色は Catalog の既定配色の 24 役割から取る。
// 映像は選択中の配色に追従させない。配色によっては赤や金が暗い面で沈み、場面の意味が色で伝わらなくなる。
const INK = "#0f0e0d";
const SURFACE = "#1c1b19";
const RAISED = "#262522";
const PAPER = "#f4f0e8";
const RED = "#c9171e";
const GOLD = "#e6b422";
const GREY = "#2b2b2b";

const display = (size: number) =>
  `700 ${size}px "LINE Seed JP", "Helvetica Neue", Arial, sans-serif`;
const mono = (size: number) => `500 ${size}px ui-monospace, "SF Mono", Menlo, Consolas, monospace`;

type Ctx = CanvasRenderingContext2D;

// 場面の境目。HUD の見出しと各場面の出入りがこの値を共有する。
const SCENES = [
  { at: 0, name: "DROP" },
  { at: 1.14, name: "KINETIC TYPE" },
  { at: 3.45, name: "EASING" },
  { at: 5.85, name: "INTERFACE" },
  { at: 8.6, name: "SYSTEM" },
  { at: 10.95, name: "IDENTITY" },
] as const;

// Catalog の見出しに採用した entrance の曲線。リールでも同じ曲線を見せ、最後の語の入場にも使う。
const ENTRANCE = [0.22, 1, 0.36, 1] as const;
const LINEAR = [0.3, 0.3, 0.7, 0.7] as const;
const easeEntrance = bezier(...ENTRANCE);
const easeExpand = bezier(0.7, 0, 0.2, 1);
const easeDraw = bezier(0.65, 0, 0.35, 1);

export function drawFrame(ctx: Ctx, time: number) {
  const t = ((time % DURATION) + DURATION) % DURATION;
  ctx.save();
  ctx.fillStyle = INK;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  drawDrop(ctx, t);
  drawType(ctx, t);
  drawEase(ctx, t);
  drawInterface(ctx, t);
  drawSystem(ctx, t);
  drawIdentity(ctx, t);
  drawHud(ctx, t);
  ctx.restore();
}

/* ------------------------------------------------------------------ 描画の道具 */

const widthCache = new Map<string, number>();

/** フォントの読み込み後に呼ぶ。代替フォントで測った幅を捨てる。 */
export function resetMeasureCache() {
  widthCache.clear();
}

type Glyph = { ch: string; x: number; w: number };

function layoutText(ctx: Ctx, text: string, font: string, tracking: number) {
  ctx.font = font;
  const glyphs: Glyph[] = [];
  let x = 0;
  for (const ch of text) {
    const key = `${font}|${ch}`;
    let w = widthCache.get(key);
    if (w === undefined) {
      w = ctx.measureText(ch).width;
      widthCache.set(key, w);
    }
    glyphs.push({ ch, x, w });
    x += w + tracking;
  }
  return { glyphs, width: Math.max(0, x - tracking) };
}

function measure(ctx: Ctx, text: string, font: string) {
  return layoutText(ctx, text, font, 0).width;
}

function circle(ctx: Ctx, x: number, y: number, r: number) {
  if (r <= 0) return;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number) {
  if (rx <= 0 || ry <= 0) return;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function line(ctx: Ctx, x1: number, y1: number, x2: number, y2: number) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
}

function rrect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.roundRect(x, y, Math.max(0, w), Math.max(0, h), Math.max(0, Math.min(r, w / 2, h / 2)));
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

/**
 * ぼかしを重ね描きで近似する。canvas の filter は Safari で効かない版があり、書き出しと再生で絵が変わる。
 * 円周上にずらした 10 枚を薄く重ね、半径が 0 に近づいたら 1 枚に戻す。
 */
function blurred(ctx: Ctx, radius: number, alpha: number, draw: () => void) {
  if (alpha <= 0) return;
  if (radius < 0.5) {
    ctx.globalAlpha = alpha;
    draw();
    return;
  }
  const n = 10;
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    const r = radius * (i % 2 ? 1 : 0.5);
    ctx.save();
    ctx.translate(Math.cos(a) * r, Math.sin(a) * r);
    ctx.globalAlpha = alpha * 0.22;
    draw();
    ctx.restore();
  }
}

/** 場面の仕様を画面の隅に小さく添える。リールが自分の時間と曲線を注記する。 */
function caption(ctx: Ctx, text: string, x: number, y: number, color: string, alpha: number) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.globalAlpha = alpha * 0.7;
  ctx.fillStyle = color;
  ctx.font = mono(20);
  ctx.textBaseline = "alphabetic";
  ctx.fillText(text, x, y);
  ctx.restore();
}

function bezierPoint(c: readonly number[], s: number) {
  const u = 1 - s;
  return {
    x: 3 * u * u * s * c[0] + 3 * u * s * s * c[2] + s ** 3,
    y: 3 * u * u * s * c[1] + 3 * u * s * s * c[3] + s ** 3,
  };
}

/* ------------------------------------------------------------------ 01 DROP 0.00–1.14 */

const WATER = 780;
const BALL_R = 44;

function ballFallY(t: number) {
  const p = prog(t, 0.1, 0.62);
  return lerp(-120, WATER - BALL_R, p * p);
}

function drawDrop(ctx: Ctx, t: number) {
  if (t >= 1.5) return;
  ctx.save();

  // 水面。球が落ちる先を先に置き、着水の予期を作る。
  const grow = outExpo(prog(t, 0.05, 0.75));
  const fade = 1 - prog(t, 0.62, 1.1);
  if (grow > 0 && fade > 0) {
    ctx.globalAlpha = 0.3 * fade;
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 2;
    line(ctx, CX - 760 * grow, WATER, CX + 760 * grow, WATER);
  }

  // 波紋。1 本目だけ赤にし、着水点を色で残す。
  for (let i = 0; i < 4; i++) {
    const start = 0.62 + i * 0.09;
    const p = prog(t, start, start + 1.1);
    if (p <= 0 || p >= 1) continue;
    const rx = 30 + outExpo(p) * (380 + i * 170);
    ctx.globalAlpha = (1 - p) ** 1.6 * (i === 0 ? 1 : 0.6);
    ctx.strokeStyle = i === 0 ? RED : PAPER;
    ctx.lineWidth = lerp(5, 1, p);
    ctx.beginPath();
    ctx.ellipse(CX, WATER, rx, rx * 0.16, 0, 0, TAU);
    ctx.stroke();
  }

  // しぶき。放物線で上がり、水面より下へ戻ったら消す。
  if (t > 0.62 && t < 1.3) {
    const dt = t - 0.62;
    ctx.fillStyle = RED;
    ctx.globalAlpha = 1;
    for (let k = 0; k < 14; k++) {
      const angle = lerp(-Math.PI * 0.92, -Math.PI * 0.08, hash(k));
      const speed = 420 + hash(k + 20) * 760;
      const x = CX + Math.cos(angle) * speed * dt;
      const y = WATER + Math.sin(angle) * speed * dt + 0.5 * 3200 * dt * dt;
      if (y > WATER) continue;
      circle(ctx, x, y, (3 + hash(k + 40) * 7) * (1 - dt / 0.7));
    }
  }

  // 球。落下で縦に伸び、着水で潰れ、跳ね上がって中央で止まる。
  ctx.fillStyle = RED;
  if (t >= 0.1 && t < 0.62) {
    const p = prog(t, 0.1, 0.62);
    // 残像。速いほど間隔が開き、目が軌跡を補える。
    for (let s = 3; s >= 1; s--) {
      ctx.globalAlpha = 0.14 * (4 - s) * p;
      const st = 1 + 0.55 * prog(t - s * 0.014, 0.1, 0.62) ** 2;
      ellipse(ctx, CX, ballFallY(t - s * 0.014), BALL_R / Math.sqrt(st), BALL_R * st);
    }
    ctx.globalAlpha = 1;
    const stretch = 1 + 0.55 * p * p;
    ellipse(ctx, CX, ballFallY(t), BALL_R / Math.sqrt(stretch), BALL_R * stretch);
  } else if (t >= 0.62 && t < 0.74) {
    const a = Math.sin(prog(t, 0.62, 0.74) * Math.PI);
    const sx = 1 + 0.6 * a;
    const sy = 1 - 0.42 * a;
    ctx.globalAlpha = 1;
    ellipse(ctx, CX, WATER - BALL_R * sy, BALL_R * sx, BALL_R * sy);
  } else if (t >= 0.74 && t < 1.02) {
    const q = prog(t, 0.74, 1.02);
    const stretch = 1 + 0.35 * (1 - q) ** 2;
    ctx.globalAlpha = 1;
    ellipse(
      ctx,
      CX,
      lerp(WATER - BALL_R, CY, outQuad(q)),
      BALL_R / Math.sqrt(stretch),
      BALL_R * stretch,
    );
  } else if (t >= 1.02 && t < 1.14) {
    // 予備動作。広がる前に一度縮む。
    ctx.globalAlpha = 1;
    circle(ctx, CX, CY, BALL_R * lerp(1, 0.78, outCubic(prog(t, 1.02, 1.14))));
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ 02 KINETIC TYPE 1.14–3.72 */

function drawType(ctx: Ctx, t: number) {
  if (t < 1.14 || t >= 3.75) return;
  ctx.save();
  // 背景は拍ごとに切る。赤、紙、墨の順で、語ごとに地と図を入れ替える。
  if (t < 1.5) {
    ctx.fillStyle = RED;
    circle(ctx, CX, CY, lerp(BALL_R * 0.78, 1160, easeExpand(prog(t, 1.14, 1.5))));
  } else if (t < 2.05) {
    ctx.fillStyle = RED;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  } else if (t < 2.55) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  if (t >= 1.36 && t < 2.05) beatDesign(ctx, t);
  if (t >= 2.05 && t < 2.55) beatIn(ctx, t);
  if (t >= 2.55) beatMotion(ctx, t);
  ctx.restore();
}

function beatDesign(ctx: Ctx, t: number) {
  const size = 300;
  const font = display(size);
  // 字間を広い状態から詰め、文字のせり上がりと同時に語が締まる。
  const tracking = lerp(0.32, -0.03, outExpo(prog(t, 1.36, 2.0))) * size;
  const { glyphs, width } = layoutText(ctx, "DESIGN", font, tracking);
  const x0 = CX - width / 2;
  const base = CY + size * 0.36;
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, base - size * 0.9, WIDTH, size * 1.05);
  ctx.clip();
  ctx.font = font;
  ctx.fillStyle = PAPER;
  glyphs.forEach((g, i) => {
    const p = prog(t, 1.36 + i * 0.035, 1.91 + i * 0.035);
    ctx.fillText(g.ch, x0 + g.x, base + (1 - outExpo(p)) * size);
  });
  ctx.restore();
  caption(
    ctx,
    "mask rise · stagger 35ms · expo-out 550ms",
    x0,
    base + 64,
    PAPER,
    prog(t, 1.5, 1.7),
  );
}

function beatIn(ctx: Ctx, t: number) {
  const size = 520;
  const e = outExpo(prog(t, 2.05, 2.45));
  ctx.save();
  ctx.translate(CX, CY);
  ctx.rotate(lerp(-0.1, 0, e));
  ctx.scale(lerp(1.4, 1, e), lerp(1.4, 1, e));
  ctx.font = display(size);
  ctx.textAlign = "center";
  ctx.fillStyle = INK;
  ctx.fillText("IN", 0, size * 0.36);
  ctx.restore();
  // 語の下を赤い帯が左から右へ抜ける。入りと抜けで曲線を変え、速さに緩急を付ける。
  const right = WIDTH * outExpo(prog(t, 2.1, 2.35));
  const left = WIDTH * inOutExpo(prog(t, 2.3, 2.55));
  if (right > left) {
    ctx.fillStyle = RED;
    ctx.fillRect(left, CY + size * 0.36 + 40, right - left, 22);
  }
  caption(
    ctx,
    "scale 140→100% · rotate −6°→0 · 400ms",
    120,
    HEIGHT - 150,
    INK,
    prog(t, 2.12, 2.25),
  );
}

function motionLayout(ctx: Ctx) {
  const size = 300;
  const font = display(size);
  const { glyphs, width } = layoutText(ctx, "MOTION", font, -0.02 * size);
  const dotR = size * 0.1;
  const total = width + size * 0.06 + dotR * 2;
  const x0 = CX - total / 2;
  const base = CY + size * 0.36;
  return {
    size,
    font,
    glyphs,
    x0,
    base,
    dotR,
    dotX: x0 + width + size * 0.06 + dotR,
    dotY: base - dotR,
  };
}

function beatMotion(ctx: Ctx, t: number) {
  const L = motionLayout(ctx);
  ctx.font = L.font;
  ctx.fillStyle = PAPER;
  L.glyphs.forEach((g, i) => {
    const pin = prog(t, 2.55 + i * 0.03, 3.05 + i * 0.03);
    const pout = prog(t, 3.2 + i * 0.025, 3.52 + i * 0.025);
    if (pin <= 0 || pout >= 1) return;
    const e = outExpo(pin);
    const x = inExpo(pout);
    const dx = (1 - e) * 560 - x * 2600;
    // 動く向きの逆へ上端を遅らせる。入りも抜けも左へ動くので、傾きは同じ向きになる。
    const skew = -(1 - e) * 0.45 - x * 0.5;
    const stretch = 1 + x * 2.5;
    const trail = Math.max(1 - e, x);
    for (let k = trail > 0.05 ? 3 : 0; k >= 0; k--) {
      ctx.save();
      ctx.globalAlpha = k === 0 ? clamp01(pin * 3) : 0.16 * trail;
      ctx.translate(L.x0 + g.x + dx + k * 46 * trail, L.base);
      ctx.transform(stretch, 0, skew, 1, 0, 0);
      ctx.fillText(g.ch, 0, 0);
      ctx.restore();
    }
  });

  // 句点の金の点。語が抜けたあとも残り、次の場面の主役になる。
  if (t < 3.3) {
    const s = Math.max(0, spring(t - 2.8, 0.35, 2.6));
    ctx.fillStyle = GOLD;
    circle(ctx, L.dotX, L.dotY, L.dotR * s);
  } else if (t < 3.72) {
    const p = inOutCubic(prog(t, 3.3, 3.72));
    ctx.fillStyle = GOLD;
    circle(
      ctx,
      lerp(L.dotX, TRACK_X0, p),
      lerp(L.dotY, TRACK_Y, p) - Math.sin(p * Math.PI) * 140,
      lerp(L.dotR, 22, p),
    );
  }
  caption(
    ctx,
    "skew −0.45→0 · smear on exit · 500ms",
    L.x0,
    L.base + 64,
    PAPER,
    prog(t, 2.7, 2.85) * (1 - prog(t, 3.15, 3.3)),
  );
}

/* ------------------------------------------------------------------ 03 EASING 3.45–5.88 */

const GRAPH_X = 280;
const GRAPH_Y = 860;
const GRAPH_S = 480;
const TRACK_X0 = 1020;
const TRACK_X1 = 1640;
const TRACK_Y = 620;
const RUN_A = [4.0, 4.55] as const;
const RUN_B = [4.95, 5.5] as const;

function easeControls(t: number) {
  const m = outBack(prog(t, 4.58, 4.95), 1.4);
  return LINEAR.map((v, i) => lerp(v, ENTRANCE[i], m));
}

function easeDotX(t: number) {
  if (t < RUN_A[0]) return TRACK_X0;
  if (t < RUN_A[1]) return lerp(TRACK_X0, TRACK_X1, prog(t, ...RUN_A));
  if (t < RUN_B[0]) return TRACK_X1;
  if (t < RUN_B[1]) return lerp(TRACK_X1, TRACK_X0, easeEntrance(prog(t, ...RUN_B)));
  return TRACK_X0;
}

function drawEase(ctx: Ctx, t: number) {
  if (t < 3.45 || t >= 5.9) return;
  const show = outExpo(prog(t, 3.45, 3.95));
  const hide = inExpo(prog(t, 5.4, 5.75));
  const c = easeControls(t);
  ctx.save();

  // グラフ。軸、格子、曲線、制御点の順に描き足す。
  ctx.save();
  ctx.translate(GRAPH_X, GRAPH_Y);
  ctx.scale(1 - hide * 0.4, 1 - hide * 0.4);
  ctx.globalAlpha = 1 - hide;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.1 * (1 - hide);
  for (let i = 1; i <= 4; i++) {
    const g = (GRAPH_S * i) / 4;
    line(ctx, g, 0, g, -GRAPH_S * show);
    line(ctx, 0, -g, GRAPH_S * show, -g);
  }
  ctx.globalAlpha = 0.6 * (1 - hide);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, -GRAPH_S * show);
  ctx.lineTo(0, 0);
  ctx.lineTo(GRAPH_S * show, 0);
  ctx.stroke();

  const drawn = outCubic(prog(t, 3.7, 4.05));
  if (drawn > 0) {
    ctx.globalAlpha = 1 - hide;
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.beginPath();
    for (let i = 0; i <= 64; i++) {
      const pt = bezierPoint(c, (i / 64) * drawn);
      if (i === 0) ctx.moveTo(pt.x * GRAPH_S, -pt.y * GRAPH_S);
      else ctx.lineTo(pt.x * GRAPH_S, -pt.y * GRAPH_S);
    }
    ctx.stroke();
  }

  const handles = prog(t, 3.9, 4.1) * (1 - hide);
  if (handles > 0) {
    const p1 = { x: c[0] * GRAPH_S, y: -c[1] * GRAPH_S };
    const p2 = { x: c[2] * GRAPH_S, y: -c[3] * GRAPH_S };
    ctx.globalAlpha = handles * 0.6;
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 2;
    line(ctx, 0, 0, p1.x, p1.y);
    line(ctx, GRAPH_S, -GRAPH_S, p2.x, p2.y);
    ctx.globalAlpha = handles;
    for (const p of [p1, p2]) {
      ctx.fillStyle = INK;
      circle(ctx, p.x, p.y, 10);
      ctx.beginPath();
      ctx.arc(p.x, p.y, 10, 0, TAU);
      ctx.stroke();
    }
  }

  // 走っている間は、曲線上の現在地と軸への投影を出す。
  const running =
    t >= RUN_A[0] && t < RUN_A[1] ? RUN_A : t >= RUN_B[0] && t < RUN_B[1] ? RUN_B : null;
  if (running) {
    const p = prog(t, running[0], running[1]);
    const v = running === RUN_A ? p : easeEntrance(p);
    const mx = p * GRAPH_S;
    const my = -v * GRAPH_S;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 8]);
    line(ctx, mx, 0, mx, my);
    line(ctx, 0, my, mx, my);
    ctx.setLineDash([]);
    ctx.globalAlpha = 1;
    ctx.fillStyle = RED;
    circle(ctx, mx, my, 11);
  }
  ctx.restore();

  const labels = show * (1 - hide);
  ctx.globalAlpha = labels;
  ctx.fillStyle = PAPER;
  ctx.font = mono(26);
  const f = (v: number) => v.toFixed(2);
  ctx.fillText(`cubic-bezier(${c.map(f).join(", ")})`, GRAPH_X, GRAPH_Y - GRAPH_S - 50);
  ctx.globalAlpha = labels * 0.5;
  ctx.font = mono(18);
  ctx.fillText("time →", GRAPH_X + GRAPH_S - 70, GRAPH_Y + 34);
  ctx.fillText("value ↑", GRAPH_X - 20, GRAPH_Y - GRAPH_S - 16);

  // 軌道。等間隔の時刻で落とした目盛りが、曲線の違いを間隔の違いとして見せる。
  ctx.globalAlpha = 0.3 * labels;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 2;
  line(ctx, TRACK_X0, TRACK_Y, lerp(TRACK_X0, TRACK_X1, show), TRACK_Y);
  for (let k = 0; k <= 12; k++) {
    const tickA = RUN_A[0] + (k * (RUN_A[1] - RUN_A[0])) / 12;
    const tickB = RUN_B[0] + (k * (RUN_B[1] - RUN_B[0])) / 12;
    // outBack(0) は浮動小数の誤差でわずかに正になるので、区間に入る前は 0 に固定する。
    const a = t > tickA ? outBack(prog(t, tickA, tickA + 0.15)) : 0;
    const b = t > tickB ? outBack(prog(t, tickB, tickB + 0.15)) : 0;
    const xa = lerp(TRACK_X0, TRACK_X1, k / 12);
    const xb = lerp(TRACK_X1, TRACK_X0, easeEntrance(k / 12));
    ctx.lineWidth = 3;
    if (a > 0) {
      ctx.globalAlpha = labels;
      ctx.strokeStyle = GOLD;
      line(ctx, xa, TRACK_Y + 40, xa, TRACK_Y + 40 + 26 * a);
      ctx.globalAlpha = labels * 0.1;
      ctx.fillStyle = GOLD;
      circle(ctx, xa, TRACK_Y, 22);
    }
    if (b > 0) {
      ctx.globalAlpha = labels;
      ctx.strokeStyle = RED;
      line(ctx, xb, TRACK_Y - 40, xb, TRACK_Y - 40 - 26 * b);
      ctx.globalAlpha = labels * 0.14;
      ctx.fillStyle = RED;
      circle(ctx, xb, TRACK_Y, 22);
    }
  }
  ctx.font = mono(20);
  ctx.textAlign = "right";
  ctx.globalAlpha = labels * prog(t, RUN_A[0], RUN_A[0] + 0.1) * 0.8;
  ctx.fillStyle = GOLD;
  ctx.fillText("linear", TRACK_X0 - 40, TRACK_Y + 62);
  ctx.globalAlpha = labels * prog(t, RUN_B[0], RUN_B[0] + 0.1) * 0.8;
  ctx.fillStyle = RED;
  ctx.fillText("entrance", TRACK_X0 - 40, TRACK_Y - 44);
  ctx.textAlign = "left";
  ctx.globalAlpha = labels * 0.7;
  ctx.fillStyle = PAPER;
  ctx.font = mono(22);
  ctx.fillText(
    t < 4.75 ? "same 550ms, even spacing" : "same 550ms, front-loaded",
    TRACK_X0,
    TRACK_Y - 140,
  );

  // 金の点。速さに比例して進む向きへ伸ばす。
  let x = easeDotX(t);
  let y = TRACK_Y;
  let r = 22;
  const vel = (easeDotX(t + 0.005) - easeDotX(t - 0.005)) / 0.01;
  let stretch = 1 + Math.min(Math.abs(vel) / 5000, 0.7);
  if (t >= 5.5) {
    const p = inOutCubic(prog(t, 5.5, 5.88));
    x = lerp(TRACK_X0, CX, p);
    y = lerp(TRACK_Y, CY, p) - Math.sin(p * Math.PI) * 160;
    r = lerp(22, 26, p);
    stretch = 1;
  }
  if (t >= 3.72 && t < 5.88) {
    ctx.globalAlpha = 1;
    ctx.fillStyle = GOLD;
    ellipse(ctx, x, y, r * stretch, r / stretch);
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ 04 INTERFACE 5.85–8.6 */

const PHONE_W = 460;
const PHONE_H = 900;
const FAB = { x: 160, y: 270, r: 42 };
const CLICK = { x: CX + 120, y: CY + 20 };

function buttonState(t: number) {
  if (t < 6.25) {
    // 点から角丸の正方形へ。ばねで行き過ぎ、回転しながら据わる。
    const p = spring(t - 5.85, 0.5, 2.4);
    const size = lerp(52, 170, p);
    return {
      x: CX,
      y: CY,
      w: size,
      h: size,
      r: lerp(26, 44, clamp01(p)),
      rot: (1 - p) * -Math.PI * 0.5,
      color: GOLD,
    };
  }
  if (t < 7.0) {
    const q = spring(t - 6.25, 0.55, 2.2);
    return {
      x: CX,
      y: CY,
      w: lerp(170, 420, q),
      h: lerp(170, 108, q),
      r: lerp(44, 54, clamp01(q)),
      rot: 0,
      color: mix(GOLD, RED, q * 1.5),
    };
  }
  // 押されたら読み込み中の丸へ縮み、完了後に画面の FAB の位置へ飛ぶ。
  const q = outExpo(prog(t, 7.0, 7.3));
  const fly = inOutCubic(prog(t, 7.75, 8.15));
  const d = lerp(108, FAB.r * 2, fly);
  return {
    x: lerp(CX, CX + FAB.x, fly),
    y: lerp(CY, CY + FAB.y, fly) - Math.sin(fly * Math.PI) * 80,
    w: fly > 0 ? d : lerp(420, 108, q),
    h: d,
    r: d / 2,
    rot: 0,
    color: RED,
  };
}

function pressScale(t: number) {
  if (t < 6.85) return 1;
  if (t < 6.93) return lerp(1, 0.95, outCubic(prog(t, 6.85, 6.93)));
  return 0.95 + 0.05 * spring(t - 6.93, 0.4, 3);
}

function drawInterface(ctx: Ctx, t: number) {
  if (t < 5.85 || t >= 8.6) return;
  ctx.save();
  if (t >= 7.6) drawPhone(ctx, t, CX, CY, true);

  if (t < 8.15) {
    const b = buttonState(t);
    const s = pressScale(t);
    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.rotate(b.rot);
    ctx.scale(s, s);
    ctx.fillStyle = b.color;
    rrect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, b.r);
    ctx.fill();

    // 押した点から広がる波。ボタンの形で切り抜く。
    const rp = prog(t, 6.86, 7.35);
    if (rp > 0 && rp < 1) {
      ctx.save();
      rrect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, b.r);
      ctx.clip();
      ctx.globalAlpha = 0.3 * (1 - rp);
      ctx.fillStyle = PAPER;
      circle(ctx, CLICK.x - CX, CLICK.y - CY, outExpo(rp) * 320);
      ctx.restore();
    }

    // ラベル。1 字ずつ浮かせ、押されたら消す。
    const labelIn = prog(t, 6.4, 6.7);
    const labelOut = prog(t, 7.0, 7.08);
    if (labelIn > 0 && labelOut < 1) {
      const font = display(36);
      const { glyphs, width } = layoutText(ctx, "Get started", font, 0);
      ctx.font = font;
      ctx.fillStyle = PAPER;
      glyphs.forEach((g, i) => {
        const p = prog(t, 6.4 + i * 0.018, 6.62 + i * 0.018);
        ctx.globalAlpha = p * (1 - labelOut);
        ctx.fillText(g.ch, -width / 2 + g.x, 13 + (1 - outCubic(p)) * 18);
      });
    }

    // 読み込み中の回転する弧。弧の長さも伸び縮みさせ、止まって見えないようにする。
    const spin = prog(t, 7.12, 7.2) * (1 - prog(t, 7.46, 7.52));
    if (spin > 0) {
      ctx.globalAlpha = spin;
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      const start = t * 9;
      ctx.beginPath();
      ctx.arc(0, 0, 24, start, start + Math.PI * (0.5 + 0.9 * Math.sin(t * 7) ** 2));
      ctx.stroke();
    }

    // 完了の印。線を引く速さで描き、飛ぶ間に FAB の十字へ入れ替える。
    const check = easeDraw(prog(t, 7.5, 7.72)) * (1 - prog(t, 7.8, 7.95));
    if (check > 0) {
      ctx.globalAlpha = 1;
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const len = 17 + 32.6;
      ctx.setLineDash([len * check, len]);
      ctx.beginPath();
      ctx.moveTo(-17, 1);
      ctx.lineTo(-5, 13);
      ctx.lineTo(18, -10);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    const plus = prog(t, 7.85, 8.05);
    if (plus > 0) drawPlus(ctx, plus);
    ctx.restore();

    // 完了の輪。
    const ring = prog(t, 7.55, 8.0);
    if (ring > 0 && ring < 1) {
      ctx.globalAlpha = 0.7 * (1 - ring);
      ctx.strokeStyle = RED;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(CX, CY, lerp(54, 120, outExpo(ring)), 0, TAU);
      ctx.stroke();
    }
  }

  // カーソル。弧を描いて寄り、押して、退く。
  if (t >= 6.3 && t < 7.45) {
    const p = inOutCubic(prog(t, 6.3, 6.82));
    const u = 1 - p;
    let x = u * u * 1560 + 2 * u * p * 1480 + p * p * CLICK.x;
    let y = u * u * 1020 + 2 * u * p * 640 + p * p * CLICK.y;
    const e = inCubic(prog(t, 7.05, 7.45));
    x += e * 380;
    y += e * 300;
    const press = t >= 6.85 && t < 7.0 ? lerp(1, 0.85, Math.sin(prog(t, 6.85, 7.0) * Math.PI)) : 1;
    ctx.globalAlpha = 1 - e;
    drawCursor(ctx, x, y, 1.5 * press);
  }
  ctx.restore();
}

function drawPlus(ctx: Ctx, alpha: number) {
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 6;
  ctx.lineCap = "round";
  const s = 14 * lerp(0.6, 1, outBack(alpha));
  line(ctx, -s, 0, s, 0);
  line(ctx, 0, -s, 0, s);
}

function drawCursor(ctx: Ctx, x: number, y: number, s: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 34);
  ctx.lineTo(9, 26);
  ctx.lineTo(15, 40);
  ctx.lineTo(21, 37);
  ctx.lineTo(15, 24);
  ctx.lineTo(27, 24);
  ctx.closePath();
  ctx.fillStyle = PAPER;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2.5;
  ctx.lineJoin = "round";
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * 画面の模型。中心を原点に描く。animate が真なら部品を時刻どおりに組み上げ、偽なら組み上がった姿を描く。
 * 04 の組み上げと 05 のタイルが同じ関数を使い、場面の境目で絵が飛ばない。
 */
function drawPhone(ctx: Ctx, t: number, x: number, y: number, animate: boolean) {
  const inAt = (delay: number, zeta = 0.62, freq = 2.1) =>
    animate ? spring(t - delay, zeta, freq) : 1;
  const fadeAt = (delay: number) => (animate ? clamp01((t - delay) / 0.2) : 1);
  const left = -PHONE_W / 2;
  const top = -PHONE_H / 2;

  // 呼び出し側の透明度（05 のタイルの出現）に掛け合わせる。
  const base = ctx.globalAlpha;
  ctx.save();
  ctx.translate(x, y);
  const frame = inAt(7.6);
  ctx.scale(lerp(0.94, 1, frame), lerp(0.94, 1, frame));
  ctx.globalAlpha = base * fadeAt(7.6);
  ctx.fillStyle = SURFACE;
  rrect(ctx, left, top, PHONE_W, PHONE_H, 56);
  ctx.fill();
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 2;
  ctx.globalAlpha *= 0.2;
  ctx.stroke();
  ctx.globalAlpha = base * fadeAt(7.6);
  ctx.fillStyle = INK;
  rrect(ctx, -50, top + 18, 100, 28, 14);
  ctx.fill();

  // 状態の行。
  ctx.globalAlpha = base * fadeAt(7.7) * 0.7;
  ctx.fillStyle = PAPER;
  ctx.font = mono(20);
  ctx.fillText("9:41", left + 40, top + 40);
  for (let i = 0; i < 3; i++) {
    rrect(ctx, 150 + i * 16, top + 26, 10, 14, 3);
    ctx.fill();
  }

  // 見出しと切替。
  const head = inAt(7.72);
  ctx.globalAlpha = base * fadeAt(7.72);
  ctx.fillStyle = PAPER;
  ctx.font = display(52);
  ctx.fillText("Works", left + 32, top + 150 - (1 - head) * 60);
  const on = animate ? clamp01(spring(t - 8.3, 0.5, 2.6)) : 1;
  const knob = animate ? spring(t - 8.3, 0.5, 2.6) : 1;
  ctx.fillStyle = mix("#3a3835", RED, on);
  rrect(ctx, 118, top + 104 - (1 - head) * 60, 80, 44, 22);
  ctx.fill();
  ctx.fillStyle = PAPER;
  circle(ctx, lerp(140, 176, knob), top + 126 - (1 - head) * 60, 17);

  // 主役のカード。中に entrance の曲線を描き、この場面が前の場面の続きだと分かるようにする。
  const hero = inAt(7.8, 0.55, 2.2);
  ctx.save();
  ctx.globalAlpha = base * fadeAt(7.8);
  ctx.translate(0, -145);
  ctx.scale(lerp(0.88, 1, hero), lerp(0.88, 1, hero));
  ctx.fillStyle = GOLD;
  rrect(ctx, -198, -125, 396, 250, 30);
  ctx.fill();
  ctx.fillStyle = INK;
  ctx.font = display(44);
  ctx.fillText("Motion", -170, -55);
  ctx.font = mono(18);
  ctx.globalAlpha *= 0.7;
  ctx.fillText("entrance · 900ms", -170, -22);
  ctx.globalAlpha = base * fadeAt(7.8);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  const curve = animate ? easeDraw(prog(t, 7.95, 8.4)) : 1;
  ctx.beginPath();
  for (let i = 0; i <= 32; i++) {
    const pt = bezierPoint(ENTRANCE, (i / 32) * curve);
    const px = 40 + pt.x * 130;
    const py = 90 - pt.y * 130;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.globalAlpha = base * fadeAt(7.8) * 0.2;
  ctx.fillStyle = INK;
  rrect(ctx, -170, 80, 180, 10, 5);
  ctx.fill();
  ctx.globalAlpha = base * fadeAt(7.8);
  rrect(ctx, -170, 80, 180 * (animate ? outCubic(prog(t, 8.1, 8.6)) : 0.7), 10, 5);
  ctx.fill();
  ctx.restore();

  // 一覧の行。右から順に入る。
  const avatars = [RED, PAPER, GOLD];
  for (let i = 0; i < 3; i++) {
    const k = inAt(7.9 + i * 0.07);
    const rowY = 10 + i * 104;
    ctx.save();
    ctx.translate((1 - k) * 320, 0);
    ctx.globalAlpha = base * fadeAt(7.9 + i * 0.07);
    ctx.fillStyle = RAISED;
    rrect(ctx, -198, rowY, 396, 88, 22);
    ctx.fill();
    ctx.fillStyle = avatars[i];
    circle(ctx, -150, rowY + 44, 24);
    ctx.fillStyle = PAPER;
    ctx.globalAlpha *= 0.85;
    rrect(ctx, -108, rowY + 26, 180 - i * 30, 14, 7);
    ctx.fill();
    ctx.globalAlpha *= 0.4;
    rrect(ctx, -108, rowY + 52, 120, 10, 5);
    ctx.fill();
    ctx.restore();
  }

  // 下のタブ。
  ctx.globalAlpha = base * fadeAt(8.0) * 0.12;
  ctx.strokeStyle = PAPER;
  ctx.lineWidth = 2;
  line(ctx, left, 350, -left, 350);
  ctx.fillStyle = PAPER;
  for (let i = 0; i < 4; i++) {
    ctx.globalAlpha = base * fadeAt(8.0 + i * 0.03) * (i === 0 ? 0.9 : 0.35);
    rrect(ctx, -163 + i * 100, 385, 26, 26, 8);
    ctx.fill();
  }

  // FAB。04 では飛んできたボタンが着いてから描き、着いた衝撃を小さく跳ねさせる。
  if (!animate || t >= 8.15) {
    const land = animate ? 0.9 + 0.1 * spring(t - 8.15, 0.4, 3) : 1;
    ctx.save();
    ctx.globalAlpha = base * 1;
    ctx.translate(FAB.x, FAB.y);
    ctx.scale(land, land);
    ctx.fillStyle = RED;
    circle(ctx, 0, 0, FAB.r);
    drawPlus(ctx, 1);
    ctx.restore();
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ 05 SYSTEM 8.6–11.0 */

const CELL_W = 560;
const CELL_H = 1000;
const TILE_KINDS = 6;

type Camera = { zoom: number; rx: number; rz: number; f: number };

function camera(t: number): Camera {
  const pull = inOutExpo(prog(t, 8.6, 9.5));
  return { zoom: lerp(1, 0.36, pull), rx: lerp(0, 0.62, pull), rz: lerp(0, -0.16, pull), f: 2600 };
}

/** 平面上の点を、傾けた床として透視投影する。奥（画面の上）ほど小さくなる。 */
function project(cam: Camera, x: number, y: number) {
  const c = Math.cos(cam.rz);
  const s = Math.sin(cam.rz);
  const xr = x * c - y * s;
  const yr = x * s + y * c;
  const depth = -yr * Math.sin(cam.rx);
  const w = cam.f + depth;
  if (w < 200) return null;
  const k = (cam.f / w) * cam.zoom;
  return { x: CX + xr * k, y: CY + yr * Math.cos(cam.rx) * k };
}

function speedAt(t: number) {
  return outCubic(prog(t, 9.0, 9.7)) * 700 + inExpo(prog(t, 10.2, 10.95)) * 14000;
}

/** 帯の送り量。速さを数値積分する。t だけで決まるので、どの時刻からでも同じ位置になる。 */
function travel(t: number) {
  const step = 1 / 240;
  let sum = 0;
  for (let u = 9.0; u < t; u += step)
    sum += speedAt(Math.min(u + step / 2, t)) * Math.min(step, t - u);
  return sum;
}

function drawSystem(ctx: Ctx, t: number) {
  if (t < 8.6 || t >= 11.0) return;
  const cam = camera(t);
  const moved = travel(t);
  const smear = inExpo(prog(t, 10.2, 10.95));
  ctx.save();
  // 奥の段から描き、手前の段が上に重なる。
  for (let r = -4; r <= 2; r++) {
    // 隣り合う段を逆向きに流す。トップの帯（marquee-rows）と同じ構図にする。
    const off = moved * (r % 2 === 0 ? -1 : 1) * (1 + 0.2 * hash(r + 7));
    const y = r * CELL_H;
    const jMin = Math.ceil((-4400 - off) / CELL_W);
    const jMax = Math.floor((4400 - off) / CELL_W);
    for (let j = jMin; j <= jMax; j++) {
      const x = j * CELL_W + off;
      const p = project(cam, x, y);
      if (!p || p.x < -700 || p.x > WIDTH + 700 || p.y < -700 || p.y > HEIGHT + 700) continue;
      const hero = r === 0 && j === 0;
      // 中心の画面から距離の順に現れる。波紋と同じく中心から外へ広がる。
      const d = Math.hypot(j, r);
      const a = hero ? 1 : prog(t, 8.85 + d * 0.07, 9.35 + d * 0.07);
      if (a <= 0) continue;
      const px = project(cam, x + 50, y);
      const py = project(cam, x, y + 50);
      if (!px || !py) continue;
      const sc = hero ? 1 : lerp(0.6, 1, outBack(a));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.transform(
        (px.x - p.x) / 50,
        (px.y - p.y) / 50,
        (py.x - p.x) / 50,
        (py.y - p.y) / 50,
        0,
        0,
      );
      ctx.scale(sc * (1 + smear * 2.5), sc);
      ctx.globalAlpha = Math.min(a, 1) * (1 - smear * 0.35);
      if (hero) drawPhone(ctx, t, 0, 0, true);
      else drawTile(ctx, Math.floor(hash(r * 131 + j * 17) * TILE_KINDS));
      ctx.restore();
    }
  }

  // 加速の終わりに流線を重ね、速さを線で見せる。
  if (smear > 0) {
    ctx.strokeStyle = PAPER;
    for (let i = 0; i < 40; i++) {
      ctx.globalAlpha = smear * (0.2 + 0.5 * hash(i + 300));
      ctx.lineWidth = 1 + hash(i + 400) * 3;
      const yy = hash(i + 200) * HEIGHT;
      const len = (200 + hash(i + 500) * 900) * smear;
      const xx = ((hash(i + 600) * WIDTH + t * 9000) % (WIDTH + len)) - len;
      line(ctx, xx, yy, xx + len, yy);
    }
  }
  ctx.restore();
}

/** 帯に並ぶ成果物の見本。Catalog の Works の種類（配色、字、印、曲線、部品、画面）から取る。 */
function drawTile(ctx: Ctx, kind: number) {
  const w = PHONE_W;
  const h = PHONE_H;
  ctx.save();
  rrect(ctx, -w / 2, -h / 2, w, h, 40);
  ctx.clip();
  switch (kind) {
    case 0: {
      const bands = [RED, GOLD, PAPER, GREY, "#e6e6e6"];
      bands.forEach((color, i) => {
        ctx.fillStyle = color;
        ctx.fillRect(-w / 2, -h / 2 + i * (h / 5), w, h / 5 + 1);
        ctx.fillStyle = i === 3 || i === 0 ? PAPER : INK;
        ctx.font = mono(24);
        ctx.fillText(color, -w / 2 + 32, -h / 2 + (i + 1) * (h / 5) - 28);
      });
      break;
    }
    case 1: {
      ctx.fillStyle = PAPER;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.fillStyle = INK;
      ctx.font = display(260);
      ctx.fillText("Aa", -196, 20);
      ctx.font = mono(24);
      ctx.fillText("LINE Seed JP", -190, 90);
      ctx.fillStyle = "#e3dede";
      for (let i = 0; i < 4; i++) {
        rrect(ctx, -190, 150 + i * 44, 380 - (i % 2) * 90, 16, 8);
        ctx.fill();
      }
      break;
    }
    case 2: {
      ctx.fillStyle = RED;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.save();
      ctx.translate(-144, -144);
      ctx.scale(9, 9);
      ctx.strokeStyle = PAPER;
      ctx.lineWidth = 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke(logoPath());
      ctx.restore();
      break;
    }
    case 3: {
      ctx.fillStyle = SURFACE;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeStyle = PAPER;
      ctx.globalAlpha *= 0.5;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-160, -160);
      ctx.lineTo(-160, 160);
      ctx.lineTo(160, 160);
      ctx.stroke();
      ctx.globalAlpha /= 0.5;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 8;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let i = 0; i <= 32; i++) {
        const pt = bezierPoint(ENTRANCE, i / 32);
        if (i === 0) ctx.moveTo(-160 + pt.x * 320, 160 - pt.y * 320);
        else ctx.lineTo(-160 + pt.x * 320, 160 - pt.y * 320);
      }
      ctx.stroke();
      ctx.fillStyle = PAPER;
      ctx.font = mono(24);
      ctx.fillText("easing.entrance", -160, 240);
      break;
    }
    case 4: {
      ctx.fillStyle = SURFACE;
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.font = display(34);
      const pills: [string, string | null, string][] = [
        [RED, null, PAPER],
        [SURFACE, PAPER, PAPER],
        [GOLD, null, INK],
      ];
      pills.forEach(([fill, stroke, text], i) => {
        const y = -170 + i * 150;
        ctx.fillStyle = fill;
        rrect(ctx, -170, y - 50, 340, 100, 50);
        ctx.fill();
        if (stroke) {
          ctx.strokeStyle = stroke;
          ctx.lineWidth = 3;
          ctx.stroke();
        }
        ctx.fillStyle = text;
        ctx.textAlign = "center";
        ctx.fillText("Button", 0, y + 12);
        ctx.textAlign = "left";
      });
      break;
    }
    default:
      ctx.restore();
      drawPhone(ctx, 0, 0, 0, false);
      return;
  }
  ctx.restore();
}

/* ------------------------------------------------------------------ 06 IDENTITY 10.95–15.0 */

// Catalog のロゴと同じ path と点（experiments/uiux-numa-logo/variants/nu-dot/dist/mark.svg）。
const LOGO_D = "M6 28V14a4 4 0 0 1 8 0v8a6 6 0 0 0 12 0V8";
// 直線 14 + 半円 4π + 直線 8 + 半円 6π + 直線 14。
const LOGO_LEN = 14 + 4 * Math.PI + 8 + 6 * Math.PI + 14;
let logoCache: Path2D | null = null;
const logoPath = () => (logoCache ??= new Path2D(LOGO_D));

const LOGO_BOX = 340;
const LOGO_X = CX - LOGO_BOX / 2;
// nu-dot の字は nu-round より 2 単位下にあるので、枠を 2 単位上げて字の画面上の位置を保つ。
const LOGO_Y = 130 - 2 * (LOGO_BOX / 32);
const LOGO_K = LOGO_BOX / 32;
const DOT_REST = { x: LOGO_X + 26 * LOGO_K, y: LOGO_Y + 2.5 * LOGO_K, r: 2.5 * LOGO_K };
const WORD_SIZE = 150;
const WORD_BASE = 690;
const TAGLINE = "MOTION · INTERACTION · SYSTEMS";

function drawIdentity(ctx: Ctx, t: number) {
  if (t < 10.95) return;
  ctx.save();

  // 流線が水平の 1 本へ収束し、閃光を挟んでロゴの線へ受け渡す。
  if (t < 11.35) {
    const conv = outExpo(prog(t, 10.95, 11.3));
    ctx.strokeStyle = PAPER;
    for (let i = 0; i < 36; i++) {
      ctx.globalAlpha = (1 - prog(t, 11.1, 11.35)) * (0.3 + 0.5 * hash(i + 700));
      ctx.lineWidth = lerp(4, 1, conv);
      const yy = lerp(hash(i) * HEIGHT, CY, conv);
      const len = 300 + hash(i + 50) * 900;
      const xx = ((hash(i + 9) * WIDTH + (t - 10.95) * 6000) % (WIDTH + 1200)) - 600;
      line(ctx, xx, yy, xx + len, yy);
    }
  }

  // ロゴの線。描き始めから終わりへ引き、退場では始まりから終わりへ巻き取る。
  const on = easeDraw(prog(t, 11.15, 11.95));
  const off = inOutCubic(prog(t, 14.3, 14.72));
  if (on > 0 && off < 1) {
    ctx.save();
    ctx.translate(LOGO_X, LOGO_Y);
    ctx.scale(LOGO_K, LOGO_K);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = PAPER;
    ctx.lineWidth = 4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([LOGO_LEN, LOGO_LEN]);
    ctx.lineDashOffset = off > 0 ? -LOGO_LEN * off : LOGO_LEN - LOGO_LEN * on;
    ctx.stroke(logoPath());
    ctx.restore();
  }

  drawLogoDot(ctx, t);
  drawWordmark(ctx, t);
  drawTagline(ctx, t);

  // 閃光。05 の加速の頂点で 1 度だけ白く飛ばす。
  if (t < 11.2) {
    ctx.globalAlpha = 0.9 * (1 - outCubic(prog(t, 10.97, 11.12))) * prog(t, 10.95, 10.97);
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
  }
  ctx.restore();
}

/** 冒頭の赤い球が、ロゴの終点の上に落ちて句読点になる。最後は画面の下へ落ち、冒頭の落下へつながる。 */
function drawLogoDot(ctx: Ctx, t: number) {
  if (t < 11.72) return;
  const { x, r } = DOT_REST;
  let y = DOT_REST.y;
  let sx = 1;
  let sy = 1;
  if (t < 11.98) {
    const p = prog(t, 11.72, 11.98);
    y = lerp(-80, DOT_REST.y, inQuad(p));
    sy = 1 + 0.5 * p * p;
    sx = 1 / Math.sqrt(sy);
  } else if (t < 12.1) {
    const a = Math.sin(prog(t, 11.98, 12.1) * Math.PI);
    sx = 1 + 0.45 * a;
    sy = 1 - 0.35 * a;
    y = DOT_REST.y + r * (1 - sy);
  } else if (t >= 14.48) {
    // 落ちる前に少し浮く。予備動作が無いと、消えたように見える。
    const lift = outQuad(prog(t, 14.48, 14.62)) * 26;
    const fall = inQuad(prog(t, 14.62, 15.0));
    y = DOT_REST.y - lift + fall * (HEIGHT + 200 - DOT_REST.y);
    sy = 1 + 0.6 * fall;
    sx = 1 / Math.sqrt(sy);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = RED;
  ellipse(ctx, x, y, r * sx, r * sy);

  // 着地の輪。冒頭の波紋を小さく繰り返す。
  ctx.strokeStyle = RED;
  for (let i = 0; i < 2; i++) {
    const p = prog(t, 11.98 + i * 0.1, 12.78 + i * 0.1);
    if (p <= 0 || p >= 1) continue;
    ctx.globalAlpha = 0.7 * (1 - p);
    ctx.lineWidth = lerp(4, 1, p);
    ctx.beginPath();
    ctx.arc(x, DOT_REST.y, r + outExpo(p) * 130, 0, TAU);
    ctx.stroke();
  }
}

/** 語ごとに、ぼけた状態から焦点を合わせる。Catalog の見出し（blur-focus）と同じ曲線、時間、間隔にする。 */
function drawWordmark(ctx: Ctx, t: number) {
  if (t < 12.0) return;
  const font = display(WORD_SIZE);
  const words = ["UI/UX", "NUMA"];
  const space = measure(ctx, " ", font);
  const widths = words.map((w) => measure(ctx, w, font));
  let x = CX - (widths[0] + space + widths[1]) / 2;
  ctx.save();
  if (t >= 14.1) {
    ctx.beginPath();
    ctx.rect(0, 0, WIDTH, WORD_BASE + WORD_SIZE * 0.28);
    ctx.clip();
  }
  ctx.font = font;
  ctx.fillStyle = PAPER;
  words.forEach((word, i) => {
    const e = easeEntrance(prog(t, 12.0 + i * 0.08, 12.9 + i * 0.08));
    const o = inExpo(prog(t, 14.18 + i * 0.06, 14.5 + i * 0.06));
    const wx = x;
    x += widths[i] + space;
    if (e <= 0 || o >= 1) return;
    // blur-focus の 12px と 0.25em を、この字の大きさ（見出しの約 2 倍）に合わせて 2 倍にする。
    const dy = (1 - e) * 0.25 * WORD_SIZE + o * 1.1 * WORD_SIZE;
    blurred(ctx, (1 - e) * 24, e, () => ctx.fillText(word, wx, WORD_BASE + dy));
  });
  ctx.restore();
}

function drawTagline(ctx: Ctx, t: number) {
  if (t < 12.45 || t >= 14.4) return;
  const size = 28;
  const font = mono(size);
  const { glyphs, width } = layoutText(ctx, TAGLINE, font, size * 0.24);
  const x0 = CX - width / 2;
  const y = 790;
  const full = Math.floor(prog(t, 12.5, 13.25) * glyphs.length);
  const shown = t >= 14.1 ? Math.floor((1 - prog(t, 14.1, 14.35)) * full) : full;
  ctx.font = font;
  for (let i = 0; i < shown; i++) {
    const g = glyphs[i];
    ctx.globalAlpha = g.ch === "·" ? 1 : 0.8;
    ctx.fillStyle = g.ch === "·" ? RED : PAPER;
    ctx.fillText(g.ch, x0 + g.x, y);
  }
  // 打ち終えたら点滅させ、消す直前で止める。
  const typing = t < 13.25 || t >= 14.1;
  if (typing || Math.floor(t * 3) % 2 === 0) {
    const last = glyphs[Math.min(shown, glyphs.length - 1)];
    const cx = shown >= glyphs.length ? x0 + width + 10 : x0 + last.x;
    ctx.globalAlpha = 1;
    ctx.fillStyle = RED;
    ctx.fillRect(cx, y - 24, 14, 30);
  }
}

/* ------------------------------------------------------------------ HUD */

function drawHud(ctx: Ctx, t: number) {
  const color = t >= 2.05 && t < 2.55 ? INK : PAPER;
  const M = 44;
  const K = 26;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2;
  // トンボ。映像の枠を示し、リールらしさを出す。
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
  ctx.font = mono(18);
  ctx.textBaseline = "top";
  ctx.fillText("UI/UX NUMA — MOTION REEL 2026", M + K + 14, M - 1);
  const frame = Math.floor(t * FPS);
  const ss = String(Math.floor(frame / FPS)).padStart(2, "0");
  const ff = String(frame % FPS).padStart(2, "0");
  ctx.textAlign = "right";
  ctx.fillText(`TC 00:00:${ss}:${ff}`, WIDTH - M - K - 14, M - 1);
  ctx.textBaseline = "bottom";
  ctx.fillText("1920×1080 · 30fps · loop", WIDTH - M - K - 14, HEIGHT - M + 1);
  ctx.textAlign = "left";
  let index = 0;
  for (let i = 0; i < SCENES.length; i++) if (t >= SCENES[i].at) index = i;
  ctx.fillText(
    `0${index + 1} / 0${SCENES.length}  ${SCENES[index].name}`,
    M + K + 14,
    HEIGHT - M + 1,
  );

  // 進み具合。場面の境目に目盛りを打つ。
  const x0 = 700;
  const x1 = WIDTH - 700;
  const yy = HEIGHT - M - 9;
  ctx.globalAlpha = 0.2;
  line(ctx, x0, yy, x1, yy);
  for (const s of SCENES)
    line(ctx, lerp(x0, x1, s.at / DURATION), yy - 5, lerp(x0, x1, s.at / DURATION), yy + 5);
  ctx.globalAlpha = 0.8;
  line(ctx, x0, yy, lerp(x0, x1, t / DURATION), yy);
  ctx.restore();
}
