import { useState, type MouseEvent } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import { Card, type CardProps } from "./Card";
import {
  ColorsCover,
  ComponentsCover,
  GuidelinesCover,
  IconsCover,
  TokensCover,
  TypographyCover,
} from "./covers";

const SINGLES: { id: string; label: string; description: string; card: CardProps }[] = [
  {
    id: "cover",
    label: "カバーあり",
    description: "枠はカバーだけが持ち、題名は下に置く",
    card: {
      href: "/components/button",
      title: "Button",
      description: "操作の役割と状態を、同じ形の規則で伝える。",
      cover: <ComponentsCover />,
    },
  },
  {
    id: "text",
    label: "カバーなし",
    description: "文字を枠の中に置く",
    card: {
      href: "/guidelines/ux-writing",
      title: "ボタンの文言",
      description: "文脈で対象が分かるときは、動詞だけで短く書く。",
      meta: "Guideline · 9月21日",
    },
  },
  {
    id: "long",
    label: "長い題名",
    description: "題名が折り返しても枠の形を保つ",
    card: {
      href: "/foundations/typography",
      title: "プロダクト画面で使う書体と、見出しから注記までの文字の役割",
      meta: "Foundation",
      cover: <TypographyCover />,
    },
  },
];

const LIST: CardProps[] = [
  { href: "/foundations/colors", title: "Colors", cover: <ColorsCover /> },
  { href: "/foundations/typography", title: "Typography", cover: <TypographyCover /> },
  { href: "/foundations/tokens", title: "Tokens", cover: <TokensCover /> },
  { href: "/foundations/icons", title: "Icons", cover: <IconsCover /> },
  { href: "/components", title: "Components", cover: <ComponentsCover /> },
  { href: "/guidelines", title: "Guidelines", cover: <GuidelinesCover /> },
];

export function Showcase({
  variantClass,
  embedded = false,
}: {
  variantClass: string;
  embedded?: boolean;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  useCatalogColors(embedded ? null : root);

  // 見本のリンクは移動させず、押した結果だけを表示する。
  function openCard(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest(".card__link");
    if (!link) return;
    event.preventDefault();
    setOpened(link.textContent);
  }

  const Root = embedded ? "div" : "main";

  return (
    <Root
      ref={(node) => setRoot(node)}
      className={`card-showcase ${variantClass}${embedded ? " card-showcase--embedded" : ""}`}
      onClick={openCard}
    >
      {embedded ? null : (
        <header className="card-showcase__header">
          <p className="card-showcase__eyebrow">COMPONENT / WEB</p>
          <h1>Card</h1>
          <p>一覧の 1 件を、全体で押せる面にまとめる。</p>
        </header>
      )}

      {/* 押した結果の行は常に 1 行分の高さを持たせ、表示の有無で下の見本を動かさない。 */}
      <p className="card-showcase__status" aria-live="polite">
        {opened ? `開いた: ${opened}` : "カードを押すと、開いた先をここに出す。"}
      </p>

      <section aria-labelledby="card-parts">
        <div className="card-showcase__section-head">
          <h2 id="card-parts">構成</h2>
        </div>
        <div className="card-showcase__singles">
          {SINGLES.map((single) => (
            <div className="card-showcase__single" key={single.id}>
              <p className="card-showcase__label">
                <span>{single.label}</span>
                {single.description}
              </p>
              <Card {...single.card} />
            </div>
          ))}
        </div>
      </section>

      <section className="card-showcase__list-section" aria-labelledby="card-list">
        <div className="card-showcase__section-head">
          <h2 id="card-list">一覧</h2>
        </div>
        <ul className="card-showcase__list">
          {LIST.map((card) => (
            <li key={card.href}>
              <Card {...card} />
            </li>
          ))}
        </ul>
      </section>
    </Root>
  );
}
