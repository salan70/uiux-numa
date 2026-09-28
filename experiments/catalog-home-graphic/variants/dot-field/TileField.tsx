import { useEffect, useRef, useState } from "react";
import { ICON_SVGS, SCHEME_SWATCHES, type HomeTopic } from "../../shared/home";
import { useReducedMotion } from "../../shared/playback";

/**
 * tile の網点。topic ごとの図柄を網点の大きさで描く。hero の場（field.ts）と同じく、
 * 図柄を 1 区画 1 画素の小さな canvas へ描き、アンチエイリアスの濃さを点の面積にする。
 * 図柄は tile の右上に置き、topic の名前が載る左下を空ける。
 */

type Box = { x: number; y: number; w: number; h: number };
type Painter = (ctx: CanvasRenderingContext2D, box: Box) => void;

const EASE_ENTRANCE = [0.22, 1, 0.36, 1] as const;

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
}

/** 採用済み配色の primary を縦の帯に並べ、下へ向かって点を小さくする。濃淡の網点そのもの。 */
const paintColors: Painter = (ctx, box) => {
  const band = box.w / SCHEME_SWATCHES.length;
  const gradient = ctx.createLinearGradient(0, box.y, 0, box.y + box.h);
  gradient.addColorStop(0, "#000");
  gradient.addColorStop(1, "rgb(0 0 0 / 0)");
  ctx.fillStyle = gradient;
  SCHEME_SWATCHES.forEach((_, index) => {
    ctx.fillRect(box.x + index * band + band * 0.12, box.y, band * 0.76, box.h);
  });
};

/** 書体の見本。和文と欧文を 1 字ずつ。 */
const paintTypography: Painter = (ctx, box) => {
  const size = Math.min(box.h * 1.05, box.w * 0.52);
  ctx.fillStyle = "#000";
  ctx.font = `700 ${size}px "LINE Seed JP", "Hiragino Sans", sans-serif`;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "right";
  ctx.fillText("あA", box.x + box.w, box.y + box.h * 0.92);
};

/** 角丸の token。xs から full へ、形と大きさを段で上げる。 */
const paintTokens: Painter = (ctx, box) => {
  const steps = [0.08, 0.2, 0.34, 0.5];
  const gap = box.w * 0.05;
  const unit = (box.w - gap * 3) / 4;
  ctx.fillStyle = "#000";
  steps.forEach((radius, index) => {
    const side = Math.min(box.h, unit * (0.7 + index * 0.1));
    const x = box.x + index * (unit + gap) + (unit - side) / 2;
    const y = box.y + box.h - side;
    roundRect(ctx, x, y, side, side, side * radius);
    ctx.fill();
  });
};

/** 部品。塗りの pill の Button と、つまみの付いたスイッチ。 */
const paintComponents: Painter = (ctx, box) => {
  const pillH = box.h * 0.34;
  ctx.fillStyle = "#000";
  roundRect(ctx, box.x + box.w * 0.08, box.y + box.h * 0.06, box.w * 0.84, pillH, pillH);
  ctx.fill();
  const switchW = box.w * 0.42;
  const switchH = box.h * 0.3;
  const sx = box.x + box.w * 0.5 - switchW / 2 + box.w * 0.2;
  const sy = box.y + box.h * 0.62;
  ctx.lineWidth = Math.max(4, switchH * 0.14);
  ctx.strokeStyle = "#000";
  roundRect(ctx, sx, sy, switchW, switchH, switchH);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(sx + switchW - switchH / 2, sy + switchH / 2, switchH * 0.32, 0, Math.PI * 2);
  ctx.fill();
};

// Icons は採用済みのアイコンの字画をそのまま使う。1 つの組（class-tech-icons の line-round）に揃える。
// 網点の 1 区画は 9px なので、字画が 1 区画を超える太さになるよう 2 つに絞って大きく描く。4 つ並べると線が点の列に崩れた。
// 字画を path の d から読むので、circle や rect を含まない（path だけでできた）アイコンを選ぶ。
const ICON_NAMES = ["code", "ai"];
const ICON_PATHS = ICON_NAMES.map((name) => {
  const svg = ICON_SVGS.find((icon) => icon.name === name)?.svg ?? "";
  return [...svg.matchAll(/\sd="([^"]+)"/g)].map((match) => new Path2D(match[1]));
});

const paintIcons: Painter = (ctx, box) => {
  const size = Math.min(box.h * 1.1, box.w / 2.1);
  const scale = size / 24;
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ICON_PATHS.forEach((paths, index) => {
    ctx.save();
    ctx.translate(
      box.x +
        box.w -
        size * (ICON_PATHS.length - index) -
        size * 0.05 * (ICON_PATHS.length - 1 - index),
      box.y + (box.h - size) / 2,
    );
    ctx.scale(scale, scale);
    ctx.lineWidth = 3;
    paths.forEach((path) => ctx.stroke(path));
    ctx.restore();
  });
};

function bezierPoint(t: number): [number, number] {
  const [x1, y1, x2, y2] = EASE_ENTRANCE;
  const u = 1 - t;
  const x = 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
  const y = 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
  return [x, y];
}

/** 動き。easing.entrance の曲線を描き、終点に玉を置く。 */
const paintMotion: Painter = (ctx, box) => {
  ctx.strokeStyle = "#000";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(6, box.h * 0.07);
  ctx.beginPath();
  for (let i = 0; i <= 64; i++) {
    const [x, y] = bezierPoint(i / 64);
    const px = box.x + x * box.w * 0.82;
    const py = box.y + box.h - y * box.h * 0.86;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();
  ctx.fillStyle = "#000";
  ctx.beginPath();
  ctx.arc(box.x + box.w * 0.93, box.y + box.h * 0.14, box.h * 0.14, 0, Math.PI * 2);
  ctx.fill();
};

const PAINTERS: Record<HomeTopic["id"], Painter> = {
  colors: paintColors,
  typography: paintTypography,
  tokens: paintTokens,
  components: paintComponents,
  icons: paintIcons,
  motion: paintMotion,
};

type Dot = { x: number; y: number; cover: number; color: string | null; delay: number };

type Layout = {
  width: number;
  height: number;
  step: number;
  dots: Dot[];
  grid: { x: number; y: number }[];
};

function buildLayout(topic: HomeTopic["id"], width: number, height: number): Layout {
  const step = 9;
  const cols = Math.ceil(width / step);
  const rows = Math.ceil(height / step);
  const mask = document.createElement("canvas");
  mask.width = cols;
  mask.height = rows;
  const ctx = mask.getContext("2d", { willReadFrequently: true })!;
  ctx.setTransform(1 / step, 0, 0, 1 / step, 0, 0);
  // 図柄の枠。右上に置き、名前の載る左下と番号の載る左上を空ける。
  const box = { x: width * 0.36, y: height * 0.1, w: width * 0.58, h: height * 0.5 };
  PAINTERS[topic](ctx, box);
  const pixels = ctx.getImageData(0, 0, cols, rows).data;

  const origin = { x: box.x + box.w, y: box.y };
  const reach = Math.hypot(box.w, box.h);
  const dots: Dot[] = [];
  const grid: { x: number; y: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * step + step / 2;
      const y = row * step + step / 2;
      grid.push({ x, y });
      const cover = pixels[(row * cols + col) * 4 + 3] / 255;
      if (cover < 0.05) continue;
      let color: string | null = null;
      if (topic === "colors") {
        const band = Math.floor(((x - box.x) / box.w) * SCHEME_SWATCHES.length);
        color = SCHEME_SWATCHES[Math.min(SCHEME_SWATCHES.length - 1, Math.max(0, band))].primary;
      }
      // 右上の角から順に立てる。hero の点が落ちた位置と同じ向きから広がる。
      const delay = (Math.hypot(x - origin.x, y - origin.y) / reach) * 0.55;
      dots.push({ x, y, cover, color, delay });
    }
  }
  return { width, height, step, dots, grid };
}

function springOut(p: number): number {
  if (p <= 0) return 0;
  if (p >= 1) return 1;
  return 1 - Math.exp(-6 * p) * Math.cos(9 * p);
}

type Colors = { ink: string; dot: string; faint: string };

const LENS = 120;

function draw(
  canvas: HTMLCanvasElement,
  layout: Layout,
  colors: Colors,
  t: number,
  pointer: { x: number; y: number; strength: number },
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const ratio = Math.min(2, window.devicePixelRatio || 1);
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  ctx.clearRect(0, 0, layout.width, layout.height);
  const lens = LENS * pointer.strength;
  const maxRadius = layout.step * 0.5;

  // 地の細かい点。指の近くだけ膨らませて赤にする。
  const faint = new Path2D();
  const warm = new Path2D();
  for (const { x, y } of layout.grid) {
    const near = lens > 1 ? Math.hypot(x - pointer.x, y - pointer.y) : Infinity;
    if (near < lens) {
      const f = (1 - near / lens) ** 2;
      const r = 0.7 + f * maxRadius * 0.55;
      warm.moveTo(x + r, y);
      warm.arc(x, y, r, 0, Math.PI * 2);
    } else {
      faint.moveTo(x + 0.7, y);
      faint.arc(x, y, 0.7, 0, Math.PI * 2);
    }
  }
  ctx.fillStyle = colors.faint;
  ctx.fill(faint);
  ctx.fillStyle = colors.dot;
  ctx.globalAlpha = 0.7;
  ctx.fill(warm);
  ctx.globalAlpha = 1;

  // 図柄の点。色の無い点は 1 回の fill にまとめ、配色の点は色ごとにまとめる。
  const byColor = new Map<string, Path2D>();
  for (const dot of layout.dots) {
    const grow = springOut((t - dot.delay) / 0.5);
    if (grow <= 0) continue;
    let r = Math.sqrt(dot.cover) * maxRadius * grow;
    let { x, y } = dot;
    if (lens > 1) {
      const dx = x - pointer.x;
      const dy = y - pointer.y;
      const near = Math.hypot(dx, dy);
      if (near < lens && near > 0.01) {
        const push = (1 - near / lens) ** 2;
        x += (dx / near) * push * 8;
        y += (dy / near) * push * 8;
        r *= 1 + push * 0.35;
      }
    }
    const key = dot.color ?? colors.ink;
    let path = byColor.get(key);
    if (!path) {
      path = new Path2D();
      byColor.set(key, path);
    }
    path.moveTo(x + r, y);
    path.arc(x, y, r, 0, Math.PI * 2);
  }
  for (const [color, path] of byColor) {
    ctx.fillStyle = color;
    ctx.fill(path);
  }
}

/**
 * tile の網点の canvas。画面に入ったら点を右上から順に立てる。指を置くと、指の近くの点が膨らんで避ける。
 * 動くのは入場と指を置いている間だけで、それ以外は描いた絵のまま止めておく。
 */
export function TileField({
  topic,
  seen,
  host,
}: {
  topic: HomeTopic["id"];
  seen: boolean;
  host: HTMLElement | null;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [layout, setLayout] = useState<Layout | null>(null);
  const state = useRef({
    clock: 0,
    colors: { ink: "#1f1f1f", dot: "#c9171e", faint: "#e3dede" } as Colors,
    pointer: { x: -999, y: -999, strength: 0, target: 0 },
    frame: 0,
    last: 0,
  });

  // 大きさが変わったら図柄を作り直す。字の図柄があるので、書体の読み込みを待つ。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let alive = true;
    const rebuild = async () => {
      const { width, height } = canvas.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      await document.fonts.load('700 64px "LINE Seed JP"').catch(() => undefined);
      if (!alive) return;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      setLayout(buildLayout(topic, width, height));
    };
    rebuild();
    const observer = new ResizeObserver(() => void rebuild());
    observer.observe(canvas);
    return () => {
      alive = false;
      observer.disconnect();
    };
  }, [topic]);

  // 配色と明暗は Frame の変数から読む。
  useEffect(() => {
    const frame = canvasRef.current?.closest<HTMLElement>(".hg");
    if (!frame) return;
    const read = () => {
      const style = getComputedStyle(frame);
      state.current.colors = {
        ink: style.getPropertyValue("--hg-ink").trim() || "#1f1f1f",
        dot: style.getPropertyValue("--hg-dot").trim() || "#c9171e",
        faint: style.getPropertyValue("--hg-line").trim() || "#e3dede",
      };
      if (layout && canvasRef.current)
        draw(
          canvasRef.current,
          layout,
          state.current.colors,
          state.current.clock,
          state.current.pointer,
        );
    };
    read();
    const mutation = new MutationObserver(read);
    mutation.observe(frame, { attributes: true, attributeFilter: ["style", "data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", read);
    return () => {
      mutation.disconnect();
      scheme.removeEventListener("change", read);
    };
  }, [layout]);

  // 入場と指の動きの間だけ時計を回す。止まる条件がそろったら描いたまま止める。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !layout) return;
    const current = state.current;
    if (reduce) {
      current.clock = 10;
      current.pointer.strength = 0;
      draw(canvas, layout, current.colors, current.clock, current.pointer);
      return;
    }
    if (!seen) {
      draw(canvas, layout, current.colors, 0, current.pointer);
      return;
    }
    const tick = (now: number) => {
      const dt = current.last ? Math.min(0.1, (now - current.last) / 1000) : 0;
      current.last = now;
      current.clock += dt;
      const pointer = current.pointer;
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt * 10);
      draw(canvas, layout, current.colors, current.clock, pointer);
      const entering = current.clock < 1.2;
      const moving = Math.abs(pointer.target - pointer.strength) > 0.01 || pointer.target > 0;
      current.frame = entering || moving ? requestAnimationFrame(tick) : 0;
    };
    const wake = () => {
      if (current.frame) return;
      current.last = 0;
      current.frame = requestAnimationFrame(tick);
    };
    wake();

    // 指は tile 全体で受ける。canvas は字の下にあり、指の出来事を受けない。
    const onMove = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = canvas.getBoundingClientRect();
      current.pointer.x = event.clientX - rect.left;
      current.pointer.y = event.clientY - rect.top;
      current.pointer.target = 1;
      wake();
    };
    const onLeave = () => {
      current.pointer.target = 0;
      wake();
    };
    host?.addEventListener("pointermove", onMove);
    host?.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(current.frame);
      current.frame = 0;
      host?.removeEventListener("pointermove", onMove);
      host?.removeEventListener("pointerleave", onLeave);
    };
  }, [layout, seen, reduce, host]);

  return <canvas className="df-tile__field" ref={canvasRef} aria-hidden="true" />;
}
