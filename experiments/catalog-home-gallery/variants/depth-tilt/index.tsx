import { useEffect, useRef, type CSSProperties } from "react";
import { GalleryFrame } from "../../shared/GalleryFrame";
import { TILES, TileView, type Tile } from "../../shared/tiles";
import "./variant.css";

// タイル単体の最大の傾き（度）。視差の量は variant.css の --dt-parallax が持つ。
const TILT_DEG = 7;

/** 大きいタイルほど手前に置き、ポインタに合わせて大きくずらす。 */
function depthOf(tile: Tile, index: number): number {
  if (tile.size === "l") return 2;
  if (tile.size === "w") return 1;
  return index % 2;
}

/**
 * 奥行きの層を持つ壁。壁全体はポインタの位置に合わせて層ごとにずれ、
 * ポインタが乗ったタイルはその位置に向かって傾き、光の当たりが追う。
 * 精密ポインタで、動きを減らす設定でないときだけ動かす。それ以外では静止した壁になる。
 */
export default function Variant() {
  const wallRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const wall = wallRef.current;
    if (!wall) return;
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduce) return;
    wall.dataset.depth = "on";

    let frame = 0;
    let pointer: PointerEvent | null = null;

    // pointermove は描画より多く来るので、1 フレームに 1 回だけ反映する。
    const apply = () => {
      frame = 0;
      if (!pointer) return;
      const x = (pointer.clientX / window.innerWidth) * 2 - 1;
      const y = (pointer.clientY / window.innerHeight) * 2 - 1;
      wall.style.setProperty("--dt-mx", x.toFixed(3));
      wall.style.setProperty("--dt-my", y.toFixed(3));

      const item = (pointer.target as Element | null)?.closest<HTMLElement>(".dt-item");
      if (!item) return;
      const rect = item.getBoundingClientRect();
      const px = (pointer.clientX - rect.left) / rect.width;
      const py = (pointer.clientY - rect.top) / rect.height;
      item.style.setProperty("--dt-ry", `${((px - 0.5) * 2 * TILT_DEG).toFixed(2)}deg`);
      item.style.setProperty("--dt-rx", `${((0.5 - py) * 2 * TILT_DEG).toFixed(2)}deg`);
      item.style.setProperty("--dt-px", `${(px * 100).toFixed(1)}%`);
      item.style.setProperty("--dt-py", `${(py * 100).toFixed(1)}%`);
    };

    const onMove = (event: PointerEvent) => {
      pointer = event;
      if (!frame) frame = requestAnimationFrame(apply);
    };

    // 離れたタイルは水平へ戻す。
    const onLeave = (event: PointerEvent) => {
      const item = (event.target as Element).closest<HTMLElement>(".dt-item");
      if (!item || item.contains(event.relatedTarget as Node | null)) return;
      for (const name of ["--dt-rx", "--dt-ry"]) item.style.removeProperty(name);
    };

    // 壁から離れたら視差も中央へ戻す。
    const onWallLeave = () => {
      pointer = null;
      wall.style.removeProperty("--dt-mx");
      wall.style.removeProperty("--dt-my");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    wall.addEventListener("pointerout", onLeave);
    document.documentElement.addEventListener("pointerleave", onWallLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      wall.removeEventListener("pointerout", onLeave);
      document.documentElement.removeEventListener("pointerleave", onWallLeave);
      delete wall.dataset.depth;
    };
  }, []);

  return (
    <GalleryFrame variantClass="gallery-depth">
      <ul className="dt-wall" ref={wallRef}>
        {TILES.map((tile, index) => (
          <li
            className={`dt-item dt-item--${tile.size}`}
            key={tile.id}
            style={{ "--dt-depth": depthOf(tile, index) } as CSSProperties}
          >
            <div className="dt-layer">
              <TileView tile={tile} />
            </div>
          </li>
        ))}
      </ul>
    </GalleryFrame>
  );
}
