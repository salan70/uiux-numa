import { useEffect, useRef, type ReactNode } from "react";
import { Card } from "../../../../experiments/card/shared/Card";
import { GALLERY_KIND_LABEL, type GalleryTile } from "../content/galleryTiles";
import { Link } from "./Link";

// 段ごとの速さ（px/秒）と向き、始まりの位置。隣り合う段を逆向きにし、速さと継ぎ目を揃えない。
const ROWS = [
  { speed: 26, direction: -1, start: 0.1 },
  { speed: 18, direction: 1, start: 0.55 },
  { speed: 32, direction: -1, start: 0.3 },
];

function splitRows(tiles: GalleryTile[], count: number): GalleryTile[][] {
  const rows: GalleryTile[][] = Array.from({ length: count }, () => []);
  tiles.forEach((tile, index) => rows[index % count].push(tile));
  return rows;
}

/**
 * 流れる帯の複製に置くリンク。読み上げは複製の群ごと aria-hidden で隠し、Tab でも辿らせない。
 * inert にすると hover も押下も届かなくなり、帯の半分が押せない面になるので使わない。
 */
function DecorativeLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Link href={href} className={className} tabIndex={-1}>
      {children}
    </Link>
  );
}

function TileCard({ tile, decorative }: { tile: GalleryTile; decorative: boolean }) {
  return (
    <Card
      href={tile.href}
      title={tile.title}
      meta={GALLERY_KIND_LABEL[tile.kind]}
      description={tile.description}
      cover={tile.cover}
      linkAs={decorative ? DecorativeLink : Link}
    />
  );
}

/**
 * 1 段の流れる帯。transform ではなく横スクロールの位置を動かす。
 * キーボードで帯の外のカードへ進んだとき、ブラウザが自分でスクロールして見える位置へ出すためである。
 * 利用者はトラックパッドや指でも帯を送れる。
 */
function MarqueeRow({
  tiles,
  speed,
  direction,
  start,
}: {
  tiles: GalleryTile[];
  speed: number;
  direction: number;
  start: number;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLUListElement>(null);

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
    // フォーカスが帯の中にある間は戻さない。戻すとフォーカスしたカードが画面外へ飛ぶ。
    const wrap = (value: number) => {
      if (reduce.matches || focusInside()) return value;
      const width = loop();
      if (value >= width) return value - width;
      if (value < 0) return value + width;
      return value;
    };

    const target = () => (held || reduce.matches ? 0 : speed * direction);

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
    const hold = () => {
      held = true;
    };
    // フォーカスが入った段はすぐ止める。減速の間に流れると、見える位置へ出したカードがずれていく。
    const holdForFocus = () => {
      held = true;
      velocity = 0;
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

    // 流さないときは先頭から見せる。
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
    row.addEventListener("focusin", holdForFocus);
    row.addEventListener("focusout", release);
    row.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      document.removeEventListener("visibilitychange", wake);
      reduce.removeEventListener("change", wake);
      row.removeEventListener("pointerenter", hold);
      row.removeEventListener("pointerleave", release);
      row.removeEventListener("focusin", holdForFocus);
      row.removeEventListener("focusout", release);
      row.removeEventListener("scroll", onScroll);
    };
  }, [speed, direction, start]);

  return (
    <div className="marquee__row" ref={rowRef}>
      <div className="marquee__track">
        <ul className="marquee__group" ref={groupRef}>
          {tiles.map((tile) => (
            <li key={tile.id}>
              <TileCard tile={tile} decorative={false} />
            </li>
          ))}
        </ul>
        {/* 継ぎ目なく流すための複製。読み上げと Tab には出さず、hover と押下は本物と同じく受ける。 */}
        <ul className="marquee__group marquee__group--clone" aria-hidden="true">
          {tiles.map((tile) => (
            <li key={tile.id}>
              <TileCard tile={tile} decorative />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** 逆向きに流れる 3 段の帯。 */
export function MarqueeRows({ tiles }: { tiles: GalleryTile[] }) {
  const rows = splitRows(tiles, ROWS.length);

  return (
    <div className="marquee">
      {rows.map((row, index) => (
        <MarqueeRow key={index} tiles={row} {...ROWS[index]} />
      ))}
    </div>
  );
}
