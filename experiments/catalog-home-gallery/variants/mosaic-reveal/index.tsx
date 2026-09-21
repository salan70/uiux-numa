import { useEffect, useRef } from "react";
import { GalleryFrame } from "../../shared/GalleryFrame";
import { TILES, TileView } from "../../shared/tiles";
import "./variant.css";

// 一度に見えたタイルを順に出す間隔。多く見えても最後のタイルが待たされすぎないよう、上限を置く。
const STAGGER_MS = 50;
const STAGGER_CAP = 8;

/**
 * 大小のタイルを隙間なく敷き詰め、スクロールで見えたタイルから順に出す。
 * 出す前の状態は JavaScript が動いたときだけ付ける。動かない環境では最初から全部が見える。
 */
export default function Variant() {
  const wallRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = [...wall.querySelectorAll<HTMLElement>(".mz-item")];
    wall.dataset.reveal = "on";

    const show = (item: HTMLElement, order: number) => {
      if (item.dataset.shown) return;
      item.style.setProperty("--mz-delay", `${Math.min(order, STAGGER_CAP) * STAGGER_MS}ms`);
      item.dataset.shown = "true";
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entering = entries.filter((entry) => entry.isIntersecting);
        entering.forEach((entry, order) => {
          show(entry.target as HTMLElement, order);
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    items.forEach((item) => observer.observe(item));

    // まだ出ていないタイルへキーボードで進んだら、待たせずに出す。
    const onFocus = (event: FocusEvent) => {
      const item = (event.target as Element).closest<HTMLElement>(".mz-item");
      if (item) show(item, 0);
    };
    wall.addEventListener("focusin", onFocus);

    return () => {
      observer.disconnect();
      wall.removeEventListener("focusin", onFocus);
    };
  }, []);

  return (
    <GalleryFrame variantClass="gallery-mosaic">
      <ul className="mz-wall" ref={wallRef}>
        {TILES.map((tile) => (
          <li className={`mz-item mz-item--${tile.size}`} key={tile.id}>
            <TileView tile={tile} />
          </li>
        ))}
      </ul>
    </GalleryFrame>
  );
}
