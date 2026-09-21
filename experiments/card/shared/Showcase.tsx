import { Fragment, useState, type ReactNode } from "react";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import { Card } from "./Card";
import { ComponentsCover, IconsCover, TypographyCover } from "./covers";

type Row = {
  id: string;
  label: string;
  description: string;
  /** 使う token を最低限だけ出す。値ではなく名前を出し、正本の変更に追従させる。 */
  tokens: { label: string; values: string[] }[];
  sample: ReactNode;
};

const ROWS: Row[] = [
  {
    id: "cover",
    label: "カバーあり",
    description: "16:9 のカバーの下に、補足、題名、要約を 1 行ずつ置く",
    tokens: [
      { label: "枠", values: ["--radius-surface", "--color-surface-variant"] },
      { label: "面", values: ["--color-surface-container"] },
    ],
    sample: (
      <Card
        href="/components/button"
        title="Button"
        description="操作の役割と状態を、同じ形の規則で伝える。"
        meta="Component"
        cover={<ComponentsCover />}
      />
    ),
  },
  {
    id: "text",
    label: "文字だけ",
    description: "カバーの代わりに、要約を同じ 16:9 の枠の中に置く",
    tokens: [
      { label: "面", values: ["--color-surface-container"] },
      { label: "余白", values: ["--space-400"] },
    ],
    sample: (
      <Card
        href="/guidelines/ux-writing"
        title="ボタンの文言"
        description="文脈で対象が分かるときは、動詞だけで短く書く。ラベルは 2〜8 文字に収め、操作の結果が分かる言葉を選ぶ。"
        meta="Guideline · 9月21日"
      />
    ),
  },
  {
    id: "long",
    label: "長い題名",
    description: "高さは変えず、収まらない題名と要約は … で切る",
    tokens: [{ label: "題名", values: ["--typography-body-font-size", "--font-weight-bold"] }],
    sample: (
      <Card
        href="/foundations/typography"
        title="プロダクト画面で使う書体と、見出し、本文、操作、注記まで、画面の中で文字が担う役割を 1 つの規則で揃える"
        description="見出しから注記まで、役割ごとに書体、大きさ、太さ、行の高さを決める。"
        meta="Foundation"
        cover={<TypographyCover />}
      />
    ),
  },
  {
    id: "response",
    label: "反応",
    description:
      "ポインタを載せると、枠と題名は止めたまま枠の中身だけを 1.04 倍にする。Tab で移るとカードの外周に枠を出す",
    tokens: [
      { label: "動き", values: ["--duration-press", "--easing-out"] },
      { label: "枠", values: ["--border-width-thick", "--color-focus"] },
    ],
    sample: (
      <Card href="/foundations/icons" title="Icons" meta="Foundation" cover={<IconsCover />} />
    ),
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
  useCatalogColors(embedded ? null : root);

  const Root = embedded ? "div" : "main";

  return (
    <Root
      ref={(node) => setRoot(node)}
      className={`card-showcase ${variantClass}${embedded ? " card-showcase--embedded" : ""}`}
    >
      {embedded ? null : (
        <header className="card-showcase__header">
          <p className="card-showcase__eyebrow">COMPONENT / WEB</p>
          <h1>Card</h1>
          <p>一覧の 1 件を、全体で押せる面にまとめる。</p>
        </header>
      )}

      <section className="card-showcase__section" aria-labelledby="card-parts">
        <h2 id="card-parts">構成</h2>
        <div className="card-showcase__rows">
          {ROWS.map((row) => (
            <div className="card-showcase__row" key={row.id}>
              <div className="card-showcase__spec">
                <h3>{row.label}</h3>
                <p>{row.description}</p>
                <dl className="card-showcase__tokens" aria-label={`${row.label} の token`}>
                  {row.tokens.map((token) => (
                    <div key={token.label}>
                      <dt>{token.label}</dt>
                      <dd>
                        {/* 折り返しの機会は span の外の空白だけにし、/ の後でだけ改行させる。 */}
                        {token.values.map((value, index) => (
                          <Fragment key={value}>
                            {index > 0 ? " " : null}
                            <span>
                              {value}
                              {index < token.values.length - 1 ? " /" : null}
                            </span>
                          </Fragment>
                        ))}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="card-showcase__sample">{row.sample}</div>
            </div>
          ))}
        </div>
      </section>
    </Root>
  );
}
