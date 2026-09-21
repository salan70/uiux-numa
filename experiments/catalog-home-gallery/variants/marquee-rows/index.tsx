import { useEffect, useRef, useState } from "react";
import { GalleryFrame } from "../../shared/GalleryFrame";
import { TILES, TileView, type Tile } from "../../shared/tiles";
import "./variant.css";

// 段ごとの速さ（px/秒）と向き。隣り合う段を逆向きにし、速さも揃えない。
const ROWS = [
  { speed: 26, direction: -1, start: 0.1 },
  { speed: 18, direction: 1, start: 0.55 },
  { speed: 32, direction: -1, start: 0.3 },
];

function splitRows(tiles: Tile[], count: number): Tile[][] {
  const rows: Tile[][] = Array.from({ length: count }, () => []);
  tiles.forEach((tile, index) => rows[index % count].push(tile));
  return rows;
}

/**
 * 1 段の流れる帯。transform ではなく横スクロールの位置を動かす。
 * キーボードで帯の外のタイルへ進んだとき、ブラウザが自分でスクロールして見える位置へ出すためである。
 * 利用者はトラックパッドや指でも帯を送れる。
 */
function MarqueeRow({
  tiles,
  speed,
  direction,
  start,
  paused,
}: {
  tiles: Tile[];
  speed: number;
  direction: number;
  start: number;
  paused: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);
  const pausedRef = useRef(paused);
  const wakeRef = useRef<() => void>(() => {});

  useEffect(() => {
    pausedRef.current = paused;
    wakeRef.current();
  }, [paused]);

  useEffect(() => {
    const row = rowRef.current;
    const group = groupRef.current;
    if (!row || !group) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

    let frame = 0;
    let last = 0;
    let velocity = 0;
    let visible = false;
    let held = false;
    // scrollLeft は整数へ丸められるので、位置は小数で別に持つ。
    let position = 0;

    const loop = () => group.offsetWidth;
    const focusInside = () => row.contains(document.activeElement);

    // 複製の帯を並べているので、1 周分ずれたら同じ見た目の位置へ戻す。
    // フォーカスが帯の中にある間は戻さない。戻すとフォーカスしたタイルが画面外へ飛ぶ。
    const wrap = (value: number) => {
      if (reduce.matches || focusInside()) return value;
      const width = loop();
      if (value >= width) return value - width;
      if (value < 0) return value + width;
      return value;
    };

    const target = () => (held || pausedRef.current || reduce.matches ? 0 : speed * direction);

    const tick = (now: number) => {
      const dt = last ? Math.min((now - last) / 1000, 0.1) : 0;
      last = now;
      // 止めるときも流し始めるときも、速さを徐々に寄せる。急に止まると帯が引っかかって見える。
      velocity += (target() - velocity) * Math.min(1, dt * 3);
      // 利用者が自分で送った分は、その位置から続ける。
      if (Math.abs(row.scrollLeft - position) > 1) position = row.scrollLeft;
      position = wrap(position + velocity * dt);
      row.scrollLeft = position;

      const settled = target() === 0 && Math.abs(velocity) < 0.5;
      if (settled) velocity = 0;
      frame = visible && !document.hidden && !settled ? requestAnimationFrame(tick) : 0;
    };

    const wake = () => {
      if (frame || !visible || document.hidden || target() === 0) return;
      last = 0;
      frame = requestAnimationFrame(tick);
    };
    wakeRef.current = wake;

    const hold = () => {
      held = true;
    };
    const release = () => {
      if (focusInside() || row.matches(":hover")) return;
      held = false;
      wake();
    };
    // 止まっている間に利用者が送った分も、1 周で戻す。
    const onScroll = () => {
      if (frame) return;
      const next = wrap(row.scrollLeft);
      if (next !== row.scrollLeft) row.scrollLeft = next;
      position = row.scrollLeft;
    };

    // 段ごとに始まりの位置をずらし、3 段の継ぎ目を揃えない。流さないときは先頭から見せる。
    position = reduce.matches ? 0 : loop() * start;
    row.scrollLeft = position;

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
    });
    observer.observe(row);
    document.addEventListener("visibilitychange", wake);
    reduce.addEventListener("change", wake);
    row.addEventListener("pointerenter", hold);
    row.addEventListener("pointerleave", release);
    row.addEventListener("focusin", hold);
    row.addEventListener("focusout", release);
    row.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      reduce.removeEventListener("change", wake);
      row.removeEventListener("pointerenter", hold);
      row.removeEventListener("pointerleave", release);
      row.removeEventListener("focusin", hold);
      row.removeEventListener("focusout", release);
      row.removeEventListener("scroll", onScroll);
    };
  }, [speed, direction, start]);

  return (
    <div className="mq-row" ref={rowRef}>
      <div className="mq-track">
        <ul className="mq-group" ref={groupRef}>
          {tiles.map((tile) => (
            <li key={tile.id}>
              <TileView tile={tile} />
            </li>
          ))}
        </ul>
        {/* 継ぎ目なく流すための複製。読み上げと Tab には出さず、hover と押下は本物と同じく受ける。 */}
        <ul className="mq-group mq-group--clone" aria-hidden="true">
          {tiles.map((tile) => (
            <li key={tile.id}>
              <TileView tile={tile} decorative />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Variant() {
  const [paused, setPaused] = useState(false);
  const rows = splitRows(TILES, ROWS.length);

  return (
    <GalleryFrame
      variantClass="gallery-marquee"
      toolbar={
        <button
          type="button"
          className="gallery__control mq-control"
          aria-pressed={paused}
          onClick={() => setPaused((current) => !current)}
        >
          {paused ? "流す" : "止める"}
        </button>
      }
    >
      <div className="mq-rows" data-paused={paused || undefined}>
        {rows.map((tiles, index) => (
          <MarqueeRow key={index} tiles={tiles} paused={paused} {...ROWS[index]} />
        ))}
      </div>
    </GalleryFrame>
  );
}
