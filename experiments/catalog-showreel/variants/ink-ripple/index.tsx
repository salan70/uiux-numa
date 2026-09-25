import { useEffect, useRef, useState } from "react";
import { useCatalogColors } from "../../../button/shared/useCatalogColors";
import { DURATION, drawFrame, FPS, HEIGHT, POSTER_TIME, resetMeasureCache, WIDTH } from "./reel";
import "./variant.css";

declare global {
  interface Window {
    /** 書き出し用。任意の時刻の 1 フレームを 1920×1080 の PNG で返す。 */
    __reelFrame?: (time: number) => string;
  }
}

const DISPLAY_FONT = '700 100px "LINE Seed JP"';

/**
 * 15 秒のモーションリール。canvas に時刻から 1 フレームを描き、ループ再生する。
 * `?t=<秒>` を付けるとその時刻で止め、preview の撮影に使う。
 */
export default function Variant() {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useCatalogColors(root);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);

  // 字の幅を測る前に書体を待つ。代替書体で測ると、語の組みが読み込み後にずれる。
  useEffect(() => {
    let alive = true;
    const fixed = Number.parseFloat(new URLSearchParams(window.location.search).get("t") ?? "");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    Promise.all([document.fonts.load(DISPLAY_FONT), document.fonts.ready]).finally(() => {
      if (!alive) return;
      resetMeasureCache();
      // reduced motion では自動で再生しない。ロゴが揃った 1 枚を置き、再生は利用者が選ぶ。
      timeRef.current = Number.isFinite(fixed) ? fixed : reduce ? POSTER_TIME : 0;
      setTime(timeRef.current);
      setPlaying(!Number.isFinite(fixed) && !reduce);
      setReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // 表示の大きさに合わせて canvas の画素数を決め、論理座標 1920×1080 を縮尺で当てる。
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !ready) return;
    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(canvas.clientWidth * ratio);
      canvas.height = Math.round(canvas.clientHeight * ratio);
      paint();
    };
    const paint = () => {
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
      drawFrame(ctx, timeRef.current);
    };
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    window.__reelFrame = (t: number) => {
      const off = document.createElement("canvas");
      off.width = WIDTH;
      off.height = HEIGHT;
      const ctx = off.getContext("2d");
      if (!ctx) return "";
      drawFrame(ctx, t);
      return off.toDataURL("image/png");
    };

    let frame = 0;
    let last = 0;
    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(canvas);
    const tick = (now: number) => {
      // 画面外やタブの裏では時計を進めない。戻ったときに途中から飛ばずに続く。
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      if (playing && visible) {
        timeRef.current = (timeRef.current + dt) % DURATION;
        paint();
        setTime(timeRef.current);
      }
      frame = requestAnimationFrame(tick);
    };
    if (playing) frame = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      io.disconnect();
      delete window.__reelFrame;
    };
  }, [ready, playing]);

  const seek = (value: number) => {
    timeRef.current = value;
    setTime(value);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.setTransform(canvas.width / WIDTH, 0, 0, canvas.height / HEIGHT, 0, 0);
    drawFrame(ctx, value);
  };

  return (
    <main ref={(node) => setRoot(node)} className="reel">
      <figure className="reel__screen">
        <canvas
          ref={canvasRef}
          className="reel__canvas"
          role="img"
          aria-label="UI/UX NUMA のモーションリール。赤い球が水面に落ちて波紋を立て、DESIGN IN MOTION の文字、easing の曲線、ボタンから画面への組み上げ、成果物の帯を経て、ロゴと UI/UX NUMA の語に収まる 15 秒のループ。"
        />
      </figure>
      <div className="reel__controls">
        <button
          type="button"
          className="reel__button"
          onClick={() => setPlaying((value) => !value)}
          disabled={!ready}
        >
          {playing ? "一時停止" : "再生"}
        </button>
        <input
          className="reel__seek"
          type="range"
          min={0}
          max={DURATION}
          step={1 / FPS}
          value={time}
          aria-label="再生位置"
          aria-valuetext={`${time.toFixed(1)} 秒`}
          onChange={(event) => seek(Number(event.target.value))}
          disabled={!ready}
        />
        <output className="reel__time">{time.toFixed(2).padStart(5, "0")}s</output>
      </div>
    </main>
  );
}
