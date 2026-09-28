import { useEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Frame } from "../../shared/Frame";
import { HOME_TOPICS, SCHEME_SWATCHES, type HomeTopic } from "../../shared/home";
import { Lockup } from "../../shared/Lockup";
import { PauseButton, useOnScreen, useReducedMotion } from "../../shared/playback";
import { buildLayout, drawField, repaintBackground, TIMING, type FieldColors } from "./field";
import "./variant.css";

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

function useSeen<T extends Element>() {
  const [element, setElement] = useState<T | null>(null);
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
  return [setElement, seen] as const;
}

/** 配色の tile だけは、採用済み配色の primary を網点の色にする。成果物そのものの色である。 */
const SPECTRUM = `linear-gradient(115deg, ${SCHEME_SWATCHES.map((scheme) => scheme.primary).join(", ")})`;

function Tile({ topic, index }: { topic: HomeTopic; index: number }) {
  const [ref, seen] = useSeen<HTMLLIElement>();
  // 指の位置は tile の要素へ直接書く。
  const onPointerMove = (event: PointerEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };
  return (
    <li
      ref={ref}
      className={`df-tile df-tile--${topic.id}`}
      data-seen={seen || undefined}
      style={
        {
          "--i": index,
          ...(topic.id === "colors" ? { "--df-ink": SPECTRUM } : {}),
        } as CSSProperties
      }
    >
      <a className="df-tile__link" href={topic.href} onPointerMove={onPointerMove}>
        <span className="df-tile__screen" aria-hidden="true" />
        <span className="df-tile__num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="df-tile__label">{topic.label}</span>
      </a>
    </li>
  );
}

/**
 * マークを網点の大きさで描く場を hero にする。線を引く順に点が立ち、赤い点が落ちて波紋が場を渡る。
 * 指を近づけると点が膨らんで避ける。WORKS の tile も同じ網点で作り、指の位置から網点が濃くなる。
 */
export default function Variant() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);

  return (
    <Frame variantClass="df">
      <section className="df-hero" aria-labelledby="df-title" data-paused={paused || undefined}>
        <FieldCanvas paused={paused} reduce={reduce} />
        <div className="df-copy">
          <p className="df-eyebrow" aria-hidden="true">
            <span>UI/UX</span>
            <span>R&amp;D</span>
            <span>CATALOG</span>
          </p>
          <h1 className="df-title" id="df-title">
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
          {HOME_TOPICS.map((topic, index) => (
            <Tile key={topic.id} topic={topic} index={index} />
          ))}
        </ul>
      </section>
    </Frame>
  );
}
