// 案 meta-aside: 本文の桁とメタの桁に分ける。
// 軸は layout。読む筋（なぜ→bad→good→例外）を 1 本にし、分類と出典は右の細い桁へ出す。
import { Frame, Text } from "../../shared/Frame";
import { SPECIMENS } from "../../shared/specimens";
import type { Rule } from "../../shared/rules";
import "./variant.css";

function RuleBlock({ rule }: { rule: Rule }) {
  const specimens = rule.figureKey ? SPECIMENS[rule.figureKey] : undefined;
  return (
    <article className="ma-rule">
      <div className="ma-body">
        <h2 className="ma-title">{rule.title}</h2>
        <p className="ma-rationale">
          <Text value={rule.rationale} />
        </p>
        <dl className="ma-examples">
          <dt className="ma-mark ma-mark--bad">bad</dt>
          <dd className="ma-example">
            <Text value={rule.bad} />
            {specimens?.bad && <div className="ma-figure">{specimens.bad}</div>}
          </dd>
          <dt className="ma-mark ma-mark--good">good</dt>
          <dd className="ma-example">
            <Text value={rule.good} />
            {specimens?.good && <div className="ma-figure">{specimens.good}</div>}
          </dd>
        </dl>
        {rule.exception && (
          <p className="ma-exception">
            <span className="ma-mark">例外</span>
            <span>
              <Text value={rule.exception} />
            </span>
          </p>
        )}
      </div>
      {/* メタは読む筋の外に出す。規則を読む間は目に入らず、要るときだけ右を見る。 */}
      <aside className="ma-meta">
        <dl className="ma-meta__list">
          <dt>適用</dt>
          <dd>{rule.applies}</dd>
          <dt>コア</dt>
          <dd>
            {rule.cores.map((core) => (
              <span className="ma-meta__core" key={core}>
                {core}
              </span>
            ))}
          </dd>
          {rule.source && (
            <>
              <dt>出典</dt>
              <dd>
                <a className="gr-link" href={rule.source.url} target="_blank" rel="noreferrer">
                  {rule.source.text}
                </a>
              </dd>
            </>
          )}
        </dl>
      </aside>
    </article>
  );
}

export default function MetaAside() {
  return (
    <Frame
      id="meta-aside"
      axis="軸: layout"
      hypothesis="分類と出典を本文の桁から外せば、規則そのものが 1 本の読み筋になる。"
      renderRule={(rule, idx) => <RuleBlock key={idx} rule={rule} />}
    />
  );
}
