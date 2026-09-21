import { useState, type MouseEvent, type ReactNode } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import { Card } from "./Card";
import { ColorsCover, ComponentsCover, IconsCover, TokensCover, TypographyCover } from "./covers";

type Row = {
  id: string;
  label: string;
  description: string;
  /** 使う token を最低限だけ出す。値ではなく名前を出し、正本の変更に追従させる。 */
  tokens: { label: string; values: string[] }[];
  sample: ReactNode;
};

const PARTS: Row[] = [
  {
    id: "cover",
    label: "カバーあり",
    description: "16:9 のカバーの下に題名を置く",
    tokens: [
      { label: "枠", values: ["--radius-surface", "--color-surface-variant"] },
      { label: "面", values: ["--color-surface-container"] },
    ],
    sample: (
      <Card
        href="/components/button"
        title="Button"
        description="操作の役割と状態を、同じ形の規則で伝える。"
        cover={<ComponentsCover />}
      />
    ),
  },
  {
    id: "text",
    label: "文字だけ",
    description: "カバーの代わりに、題名と要約を枠の中に置く",
    tokens: [
      { label: "面", values: ["--color-surface-container"] },
      { label: "余白", values: ["--space-400"] },
    ],
    sample: (
      <Card
        href="/guidelines/ux-writing"
        title="ボタンの文言"
        description="文脈で対象が分かるときは、動詞だけで短く書く。"
        meta="Guideline · 9月21日"
      />
    ),
  },
  {
    id: "long",
    label: "長い題名",
    description: "題名は折り返し、枠の形は変えない",
    tokens: [{ label: "題名", values: ["--typography-body-font-size", "--font-weight-bold"] }],
    sample: (
      <Card
        href="/foundations/typography"
        title="プロダクト画面で使う書体と、見出し、本文、操作、注記まで、画面の中で文字が担う役割を 1 つの規則で揃える"
        meta="Foundation"
        cover={<TypographyCover />}
      />
    ),
  },
];

const EXAMPLES = [
  { href: "/foundations/colors", title: "Colors", cover: <ColorsCover /> },
  { href: "/foundations/tokens", title: "Tokens", cover: <TokensCover /> },
  { href: "/foundations/icons", title: "Icons", cover: <IconsCover /> },
  { href: "/components", title: "Components", cover: <ComponentsCover /> },
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

  const STATES: Row[] = [
    {
      id: "hover",
      label: "Hover",
      description: "枠と題名は止め、枠の中身だけを 1.04 倍にする。reduced motion では止める",
      tokens: [{ label: "動き", values: ["--duration-press", "--easing-out"] }],
      sample: <Card href="/foundations/icons" title="Icons" cover={<IconsCover />} />,
    },
    {
      id: "focus",
      label: "Focus",
      description: "Tab で移ると、カードの外周に枠を出す",
      tokens: [{ label: "枠", values: ["--border-width-thick", "--color-focus"] }],
      sample: <Card href="/foundations/tokens" title="Tokens" cover={<TokensCover />} />,
    },
    {
      id: "press",
      label: "Press",
      description: "カードのどこを押しても題名のリンク先へ移る。見本では移らず、結果を下に出す",
      tokens: [],
      sample: (
        <div className="card-showcase__press">
          <Card href="/foundations/colors" title="Colors" cover={<ColorsCover />} />
          {/* 結果の行は常に 1 行分の高さを持たせ、表示の有無で周りを動かさない。 */}
          <p className="card-showcase__status" aria-live="polite">
            {opened ? `開いた: ${opened}` : "まだ押していない"}
          </p>
        </div>
      ),
    },
  ];

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

      <RowSection id="card-parts" title="構成" rows={PARTS} />
      <RowSection id="card-states" title="状態" rows={STATES} />

      <section className="card-showcase__examples" aria-labelledby="card-examples">
        <h2 id="card-examples">例</h2>
        <ul className="card-showcase__list">
          {EXAMPLES.map((card) => (
            <li key={card.href}>
              <Card {...card} />
            </li>
          ))}
        </ul>
      </section>
    </Root>
  );
}

function RowSection({ id, title, rows }: { id: string; title: string; rows: Row[] }) {
  return (
    <section className="card-showcase__section" aria-labelledby={id}>
      <h2 id={id}>{title}</h2>
      <div className="card-showcase__rows">
        {rows.map((row) => (
          <div className="card-showcase__row" key={row.id}>
            <div className="card-showcase__spec">
              <h3>{row.label}</h3>
              <p>{row.description}</p>
              {row.tokens.length > 0 ? (
                <dl className="card-showcase__tokens" aria-label={`${row.label} の token`}>
                  {row.tokens.map((token) => (
                    <div key={token.label}>
                      <dt>{token.label}</dt>
                      <dd>{token.values.join(" / ")}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </div>
            <div className="card-showcase__sample">{row.sample}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
