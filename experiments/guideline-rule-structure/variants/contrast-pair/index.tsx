// 案 contrast-pair: good と bad を左右に並べ、対比そのものを形にする。
// 軸は comparison。規則の中で最も情報量のある 2 つを同じ高さに置き、差を横で読ませる。
import { Frame, Text } from "../../shared/Frame";
import type { Rule } from "../../shared/rules";
import "./variant.css";

function RuleBlock({ rule }: { rule: Rule }) {
  return (
    <article className="cp-rule">
      {/* 適用は規則の題名のすぐ横に置く。どのプロジェクトで守るかは題名と対で読む情報である。 */}
      <div className="cp-head">
        <h2 className="cp-title">{rule.title}</h2>
        <span className="cp-applies">{rule.applies}</span>
      </div>
      <p className="cp-rationale">
        <Text value={rule.rationale} />
      </p>
      {/* 採る側を先に読ませる。bad から読むと、正しい形に辿り着くまで 2 度読むことになる。
          標本は置かない。規則が扱うのは場面であって、特定の画面の見た目ではない。 */}
      <div className="cp-pair">
        <section className="cp-side cp-side--good">
          <h3 className="cp-mark cp-mark--good">good</h3>
          <p className="cp-text">
            <Text value={rule.good} />
          </p>
        </section>
        <section className="cp-side cp-side--bad">
          <h3 className="cp-mark cp-mark--bad">bad</h3>
          <p className="cp-text">
            <Text value={rule.bad} />
          </p>
        </section>
      </div>
      {rule.exception && (
        <p className="cp-exception">
          <span className="cp-exception__label">例外</span>
          <span>
            <Text value={rule.exception} />
          </span>
        </p>
      )}
    </article>
  );
}

export default function ContrastPair() {
  return (
    <Frame
      id="contrast-pair"
      axis="軸: comparison"
      hypothesis="good と bad を横に並べれば、規則の中身は 1 度の視線移動で比べられる。"
      renderRule={(rule, idx) => <RuleBlock key={idx} rule={rule} />}
    />
  );
}
