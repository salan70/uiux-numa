import { MARK_DOT, MARK_LETTER } from "./Lockup";

/**
 * 網点の場。マークを格子の点の大きさで描き、線を引く順に点を立て、赤い点を落として波紋を広げる。
 * 描画は時刻 t（秒）と指の位置だけで決め、状態を持つ tween を使わない。止めた時刻から同じ絵が出る。
 */

export type FieldColors = { ink: string; dot: string; faint: string };

type Cell = {
  x: number;
  y: number;
  /** 0..1。格子の 1 区画のうち、線が覆う割合。点の面積をこれに比例させる。 */
  cover: number;
  /** 0..1。線を引く順の位置。 */
  order: number;
};

type Layout = {
  width: number;
  height: number;
  step: number;
  cols: number;
  rows: number;
  letter: Cell[];
  dot: Cell[];
  dotCenter: { x: number; y: number };
  dotRadius: number;
  background: HTMLCanvasElement;
};

// 時刻の割り付け（秒）。
export const TIMING = {
  drawStart: 0.25,
  drawEnd: 1.55,
  dropStart: 1.45,
  dropLength: 0.62,
  /** 着地は落下の 68%。 */
  landing: 1.45 + 0.62 * 0.68,
  /** 着地の後、この間隔で波紋を繰り返す。 */
  rippleEvery: 7,
  /** 動きを減らす設定で置く 1 枚の時刻。入場を終え、最初の波紋が画面の外へ抜けた後にする。 */
  settled: 1.45 + 0.62 * 0.68 + 6.5,
};

const RIPPLE_SPEED = 820; // px/秒
const RIPPLE_WIDTH = 110; // px
const LENS_RADIUS = 170; // px

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/** 行き過ぎを 1 回だけ見せるばねの近似。0 → 1。 */
function springOut(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 - Math.exp(-6 * p) * Math.cos(9 * p);
}

function easeInCubic(p: number) {
  return p * p * p;
}

/** 版面の大きさから格子とマークの配置を決め、各区画の被覆率と線の順を求める。 */
export function buildLayout(width: number, height: number, colors: FieldColors): Layout {
  const narrow = width < 720;
  const step = Math.round(Math.max(7, Math.min(11, width / 130)));
  const cols = Math.ceil(width / step) + 1;
  const rows = Math.ceil(height / step) + 1;

  // マークの座標は 32 四方。広い画面では右に寄せて版面の高さの 78% に、狭い画面では上に寄せて幅の 70% にする。
  const markSize = narrow
    ? Math.min(width * 0.7, height * 0.5)
    : Math.min(height * 0.78, width * 0.46);
  const scale = markSize / 32;
  const originX = narrow ? (width - markSize) / 2 : width - markSize - width * 0.06;
  const originY = narrow ? height * 0.06 : (height - markSize) / 2 + height * 0.02;

  // 被覆率は、1 区画を 1 画素にした小さな canvas へ線を描き、アンチエイリアスの濃さから読む。
  const mask = document.createElement("canvas");
  mask.width = cols;
  mask.height = rows;
  const mctx = mask.getContext("2d", { willReadFrequently: true })!;
  mctx.setTransform(scale / step, 0, 0, scale / step, originX / step, originY / step);
  mctx.lineWidth = 4;
  mctx.lineCap = "round";
  mctx.lineJoin = "round";
  mctx.strokeStyle = "#000";
  mctx.stroke(new Path2D(MARK_LETTER));
  const pixels = mctx.getImageData(0, 0, cols, rows).data;

  // 線を引く順は、パスを等間隔に刻んだ点のうち最も近いものの位置で決める。
  const probe = document.createElementNS("http://www.w3.org/2000/svg", "path");
  probe.setAttribute("d", MARK_LETTER);
  const holder = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  holder.setAttribute("width", "0");
  holder.setAttribute("height", "0");
  holder.style.position = "absolute";
  holder.appendChild(probe);
  document.body.appendChild(holder);
  const total = probe.getTotalLength();
  const samples: { x: number; y: number }[] = [];
  const count = 240;
  for (let i = 0; i <= count; i++) {
    const point = probe.getPointAtLength((total * i) / count);
    samples.push({ x: originX + point.x * scale, y: originY + point.y * scale });
  }
  holder.remove();

  const letter: Cell[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const cover = pixels[(row * cols + col) * 4 + 3] / 255;
      if (cover < 0.04) continue;
      const x = col * step + step / 2;
      const y = row * step + step / 2;
      let best = 0;
      let bestDistance = Infinity;
      samples.forEach((sample, index) => {
        const distance = (sample.x - x) ** 2 + (sample.y - y) ** 2;
        if (distance < bestDistance) {
          bestDistance = distance;
          best = index;
        }
      });
      letter.push({ x, y, cover, order: best / count });
    }
  }

  // 赤い点は区画ごとに円との重なりを解析的に近似する。
  const dotCenter = { x: originX + MARK_DOT.cx * scale, y: originY + MARK_DOT.cy * scale };
  const dotRadius = MARK_DOT.r * scale;
  const dot: Cell[] = [];
  const reach = dotRadius + step;
  for (let y = step / 2; y < height + step; y += step) {
    if (Math.abs(y - dotCenter.y) > reach) continue;
    for (let x = step / 2; x < width + step; x += step) {
      const distance = Math.hypot(x - dotCenter.x, y - dotCenter.y);
      const cover = clamp01((dotRadius - distance) / step + 0.5);
      if (cover < 0.04) continue;
      dot.push({ x, y, cover, order: 0 });
    }
  }

  const background = document.createElement("canvas");
  paintBackground(background, width, height, step, colors.faint);

  return { width, height, step, cols, rows, letter, dot, dotCenter, dotRadius, background };
}

/** 地の細かい点。動かないので 1 回だけ描いて使い回す。 */
function paintBackground(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  step: number,
  color: string,
) {
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.round(width * ratio);
  canvas.height = Math.round(height * ratio);
  const ctx = canvas.getContext("2d")!;
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let y = step / 2; y < height + step; y += step) {
    for (let x = step / 2; x < width + step; x += step) {
      ctx.moveTo(x + 0.8, y);
      ctx.arc(x, y, 0.8, 0, Math.PI * 2);
    }
  }
  ctx.fill();
}

export function repaintBackground(layout: Layout, color: string) {
  paintBackground(layout.background, layout.width, layout.height, layout.step, color);
}

/** 着地から数えた波紋の半径。まだ無ければ null。 */
function rippleRadii(t: number): number[] {
  if (t < TIMING.landing) return [];
  const since = t - TIMING.landing;
  const radii: number[] = [];
  // 最初の波紋に加えて、以後の周期の波紋。1 周の中で 2 つ重なることはない。
  const phase = since % TIMING.rippleEvery;
  radii.push(phase * RIPPLE_SPEED);
  radii.push(phase * RIPPLE_SPEED - 140);
  return radii.filter((radius) => radius > -RIPPLE_WIDTH);
}

function rippleBoost(distance: number, radii: number[], fade: number): number {
  let boost = 0;
  for (const radius of radii) {
    const offset = Math.abs(distance - radius);
    if (offset >= RIPPLE_WIDTH) continue;
    const falloff = 1 - offset / RIPPLE_WIDTH;
    // 遠くほど弱め、画面の端で消える。
    const decay = clamp01(1 - radius / fade);
    boost = Math.max(boost, falloff * falloff * decay);
  }
  return boost;
}

// 点を透明度の段に分けて 1 回の fill で描く。点ごとに fillStyle を替えると遅い。
const LEVELS = 6;

export function drawField(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  colors: FieldColors,
  t: number,
  pointer: { x: number; y: number; strength: number },
) {
  const { width, height, step } = layout;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.drawImage(layout.background, 0, 0);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  const maxRadius = step * 0.56;
  const radii = rippleRadii(t);
  const fade = Math.hypot(width, height) * 0.9;
  const { dotCenter } = layout;

  // 地の点。波紋と指の近くだけ大きくし、赤で塗る。
  const buckets: Path2D[] = Array.from({ length: LEVELS }, () => new Path2D());
  const lensReach = LENS_RADIUS * pointer.strength;
  if (radii.length || lensReach > 1) {
    for (let y = step / 2; y < height + step; y += step) {
      for (let x = step / 2; x < width + step; x += step) {
        const distance = Math.hypot(x - dotCenter.x, y - dotCenter.y);
        let boost = radii.length ? rippleBoost(distance, radii, fade) : 0;
        if (lensReach > 1) {
          const near = Math.hypot(x - pointer.x, y - pointer.y);
          if (near < lensReach) boost = Math.max(boost, (1 - near / lensReach) ** 2 * 0.9);
        }
        if (boost < 0.06) continue;
        const radius = 0.8 + boost * (maxRadius * 0.62 - 0.8);
        const level = Math.min(LEVELS - 1, Math.floor(boost * LEVELS));
        buckets[level].moveTo(x + radius, y);
        buckets[level].arc(x, y, radius, 0, Math.PI * 2);
      }
    }
  }
  ctx.fillStyle = colors.dot;
  buckets.forEach((path, level) => {
    ctx.globalAlpha = (level + 1) / LEVELS;
    ctx.fill(path);
  });
  ctx.globalAlpha = 1;

  // マークの字画。線を引く順に点を立て、ばねで大きさを行き過ぎさせる。
  const drawn = clamp01((t - TIMING.drawStart) / (TIMING.drawEnd - TIMING.drawStart));
  const letters = new Path2D();
  for (const cell of layout.letter) {
    const local = (drawn - cell.order * 0.9) / 0.1;
    if (local <= 0) continue;
    let radius = Math.sqrt(cell.cover) * maxRadius * springOut(Math.min(1, local / 3));
    let { x, y } = cell;
    if (radii.length) {
      const boost = rippleBoost(Math.hypot(x - dotCenter.x, y - dotCenter.y), radii, fade);
      radius *= 1 + boost * 0.45;
    }
    if (lensReach > 1) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const near = Math.hypot(dx, dy);
      if (near < lensReach && near > 0.01) {
        const push = (1 - near / lensReach) ** 2;
        x += (dx / near) * push * 14;
        y += (dy / near) * push * 14;
        radius *= 1 + push * 0.3;
      }
    }
    if (radius < 0.2) continue;
    letters.moveTo(x + radius, y);
    letters.arc(x, y, radius, 0, Math.PI * 2);
  }
  ctx.fillStyle = colors.ink;
  ctx.fill(letters);

  // 赤い点。上から等加速度で落ち、着地で潰れ、跳ねて止まる。
  const dropP = (t - TIMING.dropStart) / TIMING.dropLength;
  if (dropP > 0) {
    let offsetY = 0;
    let sx = 1;
    let sy = 1;
    if (dropP < 0.68) {
      const fall = easeInCubic(dropP / 0.68);
      offsetY = -(dotCenter.y + layout.dotRadius * 2) * (1 - fall);
      sx = 0.85 + 0.15 * fall;
      sy = 1.35 - 0.35 * fall;
    } else if (dropP < 1) {
      const bounce = (dropP - 0.68) / 0.32;
      const squash = Math.max(0, 1 - bounce * 3);
      offsetY = -Math.sin(bounce * Math.PI) * layout.dotRadius * 0.7;
      sx = 1 + 0.45 * squash;
      sy = 1 - 0.4 * squash;
    }
    const dots = new Path2D();
    for (const cell of layout.dot) {
      // 潰れは点の下端を支点にする。
      const x = dotCenter.x + (cell.x - dotCenter.x) * sx;
      const y =
        dotCenter.y + layout.dotRadius + (cell.y - dotCenter.y - layout.dotRadius) * sy + offsetY;
      const radius = Math.sqrt(cell.cover) * maxRadius;
      dots.moveTo(x + radius, y);
      dots.arc(x, y, radius, 0, Math.PI * 2);
    }
    ctx.fillStyle = colors.dot;
    ctx.fill(dots);
  }
}
