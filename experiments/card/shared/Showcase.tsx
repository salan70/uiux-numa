import { useState, type MouseEvent } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import { Card, type CardProps } from "./Card";

const SINGLES: { id: string; label: string; description: string; card: CardProps }[] = [
  {
    id: "basic",
    label: "基本",
    description: "題名と要約",
    card: {
      href: "/guidelines/spacing",
      title: "余白の刻み",
      description: "部品の内側と外側の余白を、同じ刻みから選ぶ。",
    },
  },
  {
    id: "meta",
    label: "補足つき",
    description: "種別と日付を題名の上に置く",
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
    description: "題名が折り返しても形を保つ",
    card: {
      href: "/components/button",
      title: "役割と状態を同じ形の規則で伝える、画面の主要な操作と補助操作のための Button",
      description: "4 種の役割と 3 サイズを同じ API で扱う。",
      meta: "Component",
    },
  },
];

const LIST: CardProps[] = [
  {
    href: "/foundations/colors",
    title: "Colors",
    description: "役割ごとに決めた色の組。",
    meta: "Foundation",
  },
  {
    href: "/foundations/typography",
    title: "Typography",
    description: "書体と文字の役割。",
    meta: "Foundation",
  },
  {
    href: "/foundations/tokens",
    title: "Tokens",
    description: "正本の値そのもの。",
    meta: "Foundation",
  },
  {
    href: "/foundations/icons",
    title: "Icons",
    description: "画面で使う記号の組。",
    meta: "Foundation",
  },
  {
    href: "/components",
    title: "Components",
    description: "画面を組む部品。",
    meta: "Component",
  },
  {
    href: "/guidelines",
    title: "Guidelines",
    description: "主題ごとの方針。",
    meta: "Guideline",
  },
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
