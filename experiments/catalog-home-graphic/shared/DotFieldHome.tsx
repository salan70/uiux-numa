import {
  useEffect,
  useRef,
  useState,
  type ComponentType,
  type CSSProperties,
  type PointerEvent,
  type ReactNode,
} from "react";
import { buildLayout, drawField, repaintBackground, TIMING, type FieldColors } from "./field";
import type { TopicId } from "./home";
import { Lockup } from "./Lockup";
import { PauseButton, useOnScreen, useReducedMotion } from "./playback";
import { TileField } from "./TileField";
import "./base.css";
import "./dot-field.css";

/** tile に載せる topic。番号は並び順から付ける。 */
export type DotTopic = { id: TopicId; label: string; href: string };

function readColors(element: HTMLElement): FieldColors {
  const style = getComputedStyle(element);
  return {
    ink: style.getPropertyValue("--hg-ink").trim() || "#1f1f1f",
    dot: style.getPropertyValue("--hg-dot").trim() || "#c9171e",
    faint: style.getPropertyValue("--hg-line").trim() || "#e3dede",
  };
}

/**
 * 網点の場を canvas に描く。時計は画面に入っている間だけ進み、止めた時刻から再開する。
 * 動きを減らす設定では、入場の終わった 1 枚だけを描き、指にも反応しない。
 */
function FieldCanvas({ paused, reduce }: { paused: boolean; reduce: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [host, setHost] = useState<HTMLDivElement | null>(null);
  const running = useOnScreen(host) && !paused && !reduce;

  // 描画に使う値は再描画を起こさないよう ref に持つ。
  const state = useRef({
    layout: null as ReturnType<typeof buildLayout> | null,
    colors: { ink: "#1f1f1f", dot: "#c9171e", faint: "#e3dede" } as FieldColors,
    clock: 0,
    pointer: { x: -9999, y: -9999, strength: 0, target: 0 },
  });

  // 版面の大きさと配色が変わったら、格子を作り直す。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !host) return;
    const frame = host.closest<HTMLElement>(".hg") ?? host;

    const rebuild = () => {
      const { width, height } = host.getBoundingClientRect();
      if (width < 1 || height < 1) return;
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      state.current.colors = readColors(frame);
      state.current.layout = buildLayout(width, height, state.current.colors);
      if (reduce) state.current.clock = TIMING.settled;
      paint();
    };

    const recolor = () => {
      state.current.colors = readColors(frame);
      if (state.current.layout) repaintBackground(state.current.layout, state.current.colors.faint);
      paint();
    };

    const paint = () => {
      const { layout, colors, clock, pointer } = state.current;
      const ctx = canvas.getContext("2d");
      if (!layout || !ctx) return;
      drawField(ctx, layout, colors, clock, pointer);
    };

    rebuild();
    const resize = new ResizeObserver(rebuild);
    resize.observe(host);
    // 配色と明暗の切り替えは Frame の style と data-theme に出る。
    const mutation = new MutationObserver(recolor);
    mutation.observe(frame, { attributes: true, attributeFilter: ["style", "data-theme"] });
    const scheme = window.matchMedia("(prefers-color-scheme: dark)");
    scheme.addEventListener("change", recolor);
    return () => {
      resize.disconnect();
      mutation.disconnect();
      scheme.removeEventListener("change", recolor);
    };
  }, [host, reduce]);

  // 時計。画面外、タブの裏、停止中は進めない。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !running) return;
    let frame = 0;
    let last = 0;
    const tick = (now: number) => {
      const dt = last ? Math.min(0.1, (now - last) / 1000) : 0;
      last = now;
      const current = state.current;
      current.clock += dt;
      const pointer = current.pointer;
      pointer.strength += (pointer.target - pointer.strength) * Math.min(1, dt * 8);
      const ctx = canvas.getContext("2d");
      if (current.layout && ctx)
        drawField(ctx, current.layout, current.colors, current.clock, pointer);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [running]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduce) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const pointer = state.current.pointer;
    pointer.x = event.clientX - rect.left;
    pointer.y = event.clientY - rect.top;
    pointer.target = 1;
  };

  return (
    <div
      className="df-field"
      ref={setHost}
      onPointerMove={onPointerMove}
      onPointerLeave={() => (state.current.pointer.target = 0)}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} />
    </div>
  );
}

function useSeen(element: Element | null): boolean {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!element || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setSeen(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, seen]);
  return seen;
}

type LinkComponent = ComponentType<{ href: string; className?: string; children: ReactNode }>;

function PlainLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

function Tile({
  topic,
  index,
  linkAs: LinkAs,
}: {
  topic: DotTopic;
  index: number;
  linkAs: LinkComponent;
}) {
  const [item, setItem] = useState<HTMLLIElement | null>(null);
  const seen = useSeen(item);
  return (
    <li
      ref={setItem}
      className={`df-tile df-tile--${topic.id}`}
      data-seen={seen || undefined}
      style={{ "--i": index } as CSSProperties}
    >
      <LinkAs href={topic.href} className="df-tile__link">
        {/* 指の出来事は li で受ける。Catalog の Link は ref を渡さない。 */}
        <TileField topic={topic.id} seen={seen} host={item} />
        <span className="df-tile__num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="df-tile__label">{topic.label}</span>
      </LinkAs>
    </li>
  );
}
/**
 * 採用した dot-field のトップ。マークを網点の大きさで描く場を hero にし、線を引く順に点が立ち、赤い点が落ちて波紋が場を渡る。
 * 指を近づけると点が膨らんで避ける。WORKS の tile も同じ網点で作り、topic ごとの図柄を点の大きさで描く。
 * 根の要素（class に hg と df を持つ）は呼ぶ側が置く。runner では Frame、Catalog では HomePage が置く。
 */
export function DotFieldHome({
  topics,
  linkAs = PlainLink,
}: {
  topics: DotTopic[];
  linkAs?: LinkComponent;
}) {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <>
      <section className="df-hero" aria-labelledby="df-title" data-paused={paused || undefined}>
        <FieldCanvas paused={paused} reduce={reduce} />
        <div className="df-copy">
          <p className="df-eyebrow" aria-hidden="true">
            <span>UI/UX</span>
            <span>R&amp;D</span>
            <span>CATALOG</span>
          </p>
          {/* Catalog は画面を開いたとき data-screen-heading の見出しへ focus を送る。 */}
          <h1 className="df-title" id="df-title" tabIndex={-1} data-screen-heading>
            <Lockup className="df-lockup" />
            <span className="hg-label">UI/UX NUMA</span>
          </h1>
        </div>
        {!reduce && (
          <PauseButton
            className="hg-pause df-pause"
            paused={paused}
            onToggle={() => setPaused((value) => !value)}
          />
        )}
      </section>

      <section className="df-works" aria-labelledby="df-works">
        <h2 className="df-works__head" id="df-works">
          <span>WORKS</span>
          <span className="df-works__rule" aria-hidden="true" />
        </h2>
        <ul className="df-grid">
          {topics.map((topic, index) => (
            <Tile key={topic.id} topic={topic} index={index} linkAs={linkAs} />
          ))}
        </ul>
      </section>
    </>
  );
}
