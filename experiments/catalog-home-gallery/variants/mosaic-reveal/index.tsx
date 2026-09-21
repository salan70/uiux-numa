import { useEffect, useRef, type CSSProperties } from "react";
import { GalleryFrame } from "../../shared/GalleryFrame";
import { TILES, TileView, type Tile } from "../../shared/tiles";
import "./variant.css";

// 一度に見えたタイルを順に出す間隔。多く見えても最後のタイルが待たされすぎないよう、上限を置く。
const STAGGER_MS = 50;
const STAGGER_CAP = 8;

// 段ごとに並べる件数。12 桁のグリッドで 2 件、3 件、4 件の段を繰り返し、段抜きの幅で重要度を表す。
// Card は幅で高さが決まるので、同じ段のカードは同じ幅にして下端を揃える。
const ROW_PATTERN = [2, 3, 4];

function spans(tiles: Tile[]): number[] {
  const result: number[] = [];
  let row = 0;
  while (result.length < tiles.length) {
    const count = ROW_PATTERN[row % ROW_PATTERN.length];
    for (let i = 0; i < count && result.length < tiles.length; i += 1) result.push(12 / count);
    row += 1;
  }
  return result;
}

/**
 * 幅の違う段を積んだ壁にし、スクロールで見えたタイルから順に出す。
 * 出す前の状態は JavaScript が動いたときだけ付ける。動かない環境では最初から全部が見える。
 */
export default function Variant() {
  const wallRef = useRef<HTMLUListElement>(null);
  const tileSpans = spans(TILES);

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
        {TILES.map((tile, index) => (
          <li
            className="mz-item"
            key={tile.id}
            style={{ "--mz-span": tileSpans[index] } as CSSProperties}
          >
            <TileView tile={tile} />
          </li>
        ))}
      </ul>
    </GalleryFrame>
  );
}
