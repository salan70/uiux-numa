// 案 heading-blocks: 規則の中の要素を、それぞれ小見出しを持つ段にする。
// 軸は hierarchy。ラベルを行の横ではなく上に立て、段の境を罫で示す。
import { Frame, Text } from "../../shared/Frame";
import { SPECIMENS } from "../../shared/specimens";
import type { Rule } from "../../shared/rules";
import "./variant.css";

function Block({
  heading,
  tone,
  children,
}: {
  heading: string;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="hb-block">
      <h3 className={tone ? `hb-heading hb-heading--${tone}` : "hb-heading"}>{heading}</h3>
      <div className="hb-body">{children}</div>
    </section>
  );
}

function RuleBlock({ rule }: { rule: Rule }) {
  const specimens = rule.figureKey ? SPECIMENS[rule.figureKey] : undefined;
  return (
    <article className="hb-rule">
      <header className="hb-head">
        <h2 className="hb-title">{rule.title}</h2>
        <p className="hb-meta">
          <span className="hb-applies">{rule.applies}</span>
          {rule.cores.map((core) => (
            <span className="hb-core" key={core}>
              {core}
            </span>
          ))}
        </p>
      </header>
      <Block heading="なぜこうするか">
        <Text value={rule.rationale} />
      </Block>
      <Block heading="やってはいけない" tone="bad">
        <Text value={rule.bad} />
        {specimens?.bad && <div className="hb-figure">{specimens.bad}</div>}
      </Block>
      <Block heading="こうする" tone="good">
        <Text value={rule.good} />
        {specimens?.good && <div className="hb-figure">{specimens.good}</div>}
      </Block>
      {rule.exception && (
        <Block heading="当てはまらない場合">
          <Text value={rule.exception} />
        </Block>
      )}
      {rule.source && (
        <Block heading="出典">
          <a className="gr-link" href={rule.source.url} target="_blank" rel="noreferrer">
            {rule.source.text}
          </a>
        </Block>
      )}
    </article>
  );
}

export default function HeadingBlocks() {
  return (
    <Frame
      id="heading-blocks"
      axis="軸: hierarchy"
      hypothesis="役割を行の横ではなく見出しとして立てれば、規則の中に読む順ができる。"
      renderRule={(rule, idx) => <RuleBlock key={idx} rule={rule} />}
    />
  );
}
