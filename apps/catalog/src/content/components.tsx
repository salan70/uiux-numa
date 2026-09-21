import type { ComponentType } from "react";
import { Button } from "../../../../experiments/button/shared/Button";
import { Showcase } from "../../../../experiments/button/shared/Showcase";
import { Card } from "../../../../experiments/card/shared/Card";
import { ColorsCover } from "../../../../experiments/card/shared/covers";
import { Showcase as CardShowcase } from "../../../../experiments/card/shared/Showcase";

/**
 * Components に載せる部品の正本。1 件ごとに一覧の見本と詳細の本文を持つ。
 * 採用実装は Experiment から直接 import し、親ページの token と配色を継承させる。
 */
export type CatalogComponent = {
  /** Experiment の slug。詳細の URL にも使う。 */
  slug: string;
  /** 部品の名前。Experiment の題名は検討の名前なので、Catalog ではこちらを見出しにする。 */
  title: string;
  /** 一覧の Card のカバーに置く見本。Card が操作させない飾りとして描く。 */
  Preview: ComponentType;
  /** 詳細ページの本文。 */
  Detail: ComponentType;
};

export const CATALOG_COMPONENTS: CatalogComponent[] = [
  {
    slug: "button",
    title: "Button",
    Preview: ButtonPreview,
    Detail: () => <Showcase variantClass="button-pill-action" embedded />,
  },
  {
    slug: "card",
    title: "Card",
    Preview: CardPreview,
    Detail: () => <CardShowcase variantClass="card-zoom-cover" embedded />,
  },
];

function ButtonPreview() {
  return (
    <div className="component-preview-buttons">
      <Button appearance="primary">続ける</Button>
      <Button appearance="secondary">続ける</Button>
      <Button appearance="quiet">続ける</Button>
      <Button appearance="danger">削除</Button>
    </div>
  );
}

function CardPreview() {
  return (
    <div className="component-preview-card">
      <Card
        href="/foundations/colors"
        title="Colors"
        meta="1 件"
        description="役割ごとに決めた色の組。"
        cover={<ColorsCover />}
      />
    </div>
  );
}

export function catalogComponent(slug: string): CatalogComponent | undefined {
  return CATALOG_COMPONENTS.find((entry) => entry.slug === slug);
}
