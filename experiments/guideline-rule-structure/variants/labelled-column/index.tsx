// 案 labelled-column: 規則の全行を「ラベルの桁｜中身の桁」に揃える。
// 軸は labelling。役割を語で名指しし、左端に桁を 1 本通して位置でも示す。
import { Frame, Text } from "../../shared/Frame";
import { SPECIMENS } from "../../shared/specimens";
import type { Rule } from "../../shared/rules";
import "./variant.css";

function Row({
  label,
  tone,
  children,
}: {
  label: string;
  tone?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <dt className={tone ? `lc-label lc-label--${tone}` : "lc-label"}>{label}</dt>
      <dd className="lc-body">{children}</dd>
    </>
  );
}

function RuleBlock({ rule }: { rule: Rule }) {
  const specimens = rule.figureKey ? SPECIMENS[rule.figureKey] : undefined;
  return (
    <article className="lc-rule">
      <h2 className="lc-title">{rule.title}</h2>
      <dl className="lc-rows">
        <Row label="分類">
          {rule.applies}
          {rule.cores.map((core) => (
            <span className="lc-core" key={core}>
              {core}
            </span>
          ))}
        </Row>
        <Row label="なぜ">
          <Text value={rule.rationale} />
        </Row>
        <Row label="bad" tone="bad">
          <Text value={rule.bad} />
          {specimens?.bad && <div className="lc-figure">{specimens.bad}</div>}
        </Row>
        <Row label="good" tone="good">
          <Text value={rule.good} />
          {specimens?.good && <div className="lc-figure">{specimens.good}</div>}
        </Row>
        {rule.exception && (
          <Row label="例外">
            <Text value={rule.exception} />
          </Row>
        )}
        {rule.source && (
          <Row label="出典">
            <a className="gr-link" href={rule.source.url} target="_blank" rel="noreferrer">
              {rule.source.text}
            </a>
          </Row>
        )}
      </dl>
    </article>
  );
}

export default function LabelledColumn() {
  return (
    <Frame
      id="labelled-column"
      axis="軸: labelling"
      hypothesis="すべての行に役割の名を付け、左端に桁を 1 本通せば、読まずに当てられる。"
      renderRule={(rule, idx) => <RuleBlock key={idx} rule={rule} />}
    />
  );
}
