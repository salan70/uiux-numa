import { useState, type ReactNode } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import "./base.css";

/**
 * Catalog のトップの版面。サイドバーは描かない。比べるのは版面の中の組み方と動きだけで、ナビは案で変わらない。
 * 配色と明暗は useCatalogColors で Catalog の選択を読む。
 */
export function Frame({ variantClass, children }: { variantClass: string; children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useCatalogColors(root);
  return (
    <div ref={(node) => setRoot(node)} className={`hg ${variantClass}`}>
      {children}
    </div>
  );
}
