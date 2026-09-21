import { ALL_GUIDELINES, renderInline, type Principle, type Rule } from "../content/guidelines";

/** 索引から規則へ送る。動きを減らす設定では滑らせず、移動先へ focus も移す。 */
function goToRule(domId: string) {
  const target = document.getElementById(domId);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  target.focus();
}

/** 文ごとに分けて包む。1 行に収まる間は続けて読ませ、折り返す時だけ文の切れ目で改行する。 */
function renderSentences(text: string) {
  return text
    .split(/(?<=。)/)
    .filter((part) => part.length > 0)
    .map((sentence, i) => (
      <span key={i} className="guide-sentence">
        {renderInline(sentence)}
      </span>
    ));
}

// 節の名は英語にする。文書名とナビが英語なので、節だけ日本語だと語が混じる。
type Layer = { id: string; title: string };

const CORE_LAYER: Layer = { id: "core", title: "Core" };
const TIPS_LAYER: Layer = { id: "tips", title: "Tips" };

export function GuidelinesPage({ slug }: { slug: string }) {
  const guideline = ALL_GUIDELINES.find((item) => item.slug === slug);
  if (!guideline) return <p className="empty">その方針の文書がない。</p>;

  const layers = [
    { ...CORE_LAYER, rules: guideline.core },
    { ...TIPS_LAYER, rules: guideline.tips },
  ];

  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {guideline.title}
      </h1>
      <p className="index__lead">{guideline.summary}</p>

      <div className="guide-layout">
        <div className="guide-layout__main">
          <GuideProse id="guide-purpose" title="Purpose" body={guideline.purpose} />

          <CoreLayer layer={CORE_LAYER} cores={guideline.core} />
          <TipsLayer layer={TIPS_LAYER} rules={guideline.tips} />
        </div>

        {/* 索引は本文の右へ置く。読んでいる途中でも規則の全体が見える。 */}
        <aside className="guide-aside" aria-labelledby="guide-toc-head">
          <div className="guide-aside__inner">
            <h2 className="guide-aside__title" id="guide-toc-head">
              Index
            </h2>
            {layers.map((layer) => (
              <nav
                className="guide-aside__layer"
                key={layer.id}
                aria-label={`${layer.title}の索引`}
              >
                <p className="guide-aside__layer-name">{layer.title}</p>
                <ul className="guide-aside__list">
                  {layer.rules.map((rule, idx) => (
                    <li key={idx}>
                      <a
                        className="guide-aside__link"
                        href={`#rule-${layer.id}-${idx}`}
                        onClick={(event) => {
                          event.preventDefault();
                          goToRule(`rule-${layer.id}-${idx}`);
                        }}
                      >
                        {rule.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

/**
 * 目的と適用範囲。
 * 「この方針について」という器の見出しをやめ、節の名を中身そのものにした。
 * 項目が 1 つしかない定義リストは、見出しと dt が同じことを 2 度言っていた。
 */
function GuideProse({ id, title, body }: { id: string; title: string; body: string }) {
  return (
    <section className="guide-block" aria-labelledby={id}>
      <div className="work-head">
        <h2 className="work-head__title" id={id}>
          {title}
        </h2>
      </div>
      <p className="guide-prose">{renderSentences(body)}</p>
    </section>
  );
}

/** コアは思想の短い一覧。番号が衝突したときの優先順位を表す。 */
function CoreLayer({ layer, cores }: { layer: Layer; cores: Principle[] }) {
  return (
    <section className="guide-block" aria-labelledby={`guide-${layer.id}-head`}>
      <div className="work-head">
        <h2 className="work-head__title" id={`guide-${layer.id}-head`}>
          {layer.title}
        </h2>
        <p className="work-head__meta">{cores.length} 件</p>
      </div>
      <ol className="guide-cores">
        {cores.map((core, idx) => (
          <li key={idx} id={`rule-${layer.id}-${idx}`} className="guide-core" tabIndex={-1}>
            <h3 className="guide-core__title">{core.title}</h3>
            <p className="guide-core__body">{renderInline(core.body)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/** Tips は具体的な場面の規則。適用と、結び付くコアをタグで示す。 */
function TipsLayer({ layer, rules }: { layer: Layer; rules: Rule[] }) {
  const id = layer.id;
  return (
    <section className="guide-block" aria-labelledby={`guide-${id}-head`}>
      <div className="work-head">
        <h2 className="work-head__title" id={`guide-${id}-head`}>
          {layer.title}
        </h2>
        <p className="work-head__meta">{rules.length} 件</p>
      </div>
      <div className="guide-rules">
        {rules.map((rule, idx) => (
          <article key={idx} id={`rule-${id}-${idx}`} className="guide-rule" tabIndex={-1}>
            {/* 適用は規則の題名のすぐ横に置く。どのプロジェクトで守るかは題名と対で読む情報である。 */}
            <div className="guide-rule__head">
              <h3 className="guide-rule__title">{rule.title}</h3>
              {rule.applies && <span className="guide-rule__applies">{rule.applies}</span>}
            </div>
            <p className="guide-rule__rationale">{renderSentences(rule.rationale)}</p>
            {/* 採る側を先に読ませる。bad から読むと、正しい形に辿り着くまで 2 度読むことになる。 */}
            <div className="guide-pair">
              <section className="guide-side guide-side--good">
                <h4 className="guide-mark guide-mark--good">good</h4>
                <p className="guide-side__body">{renderInline(rule.good)}</p>
              </section>
              <section className="guide-side guide-side--bad">
                <h4 className="guide-mark guide-mark--bad">bad</h4>
                <p className="guide-side__body">{renderInline(rule.bad)}</p>
              </section>
            </div>
            {rule.exception && (
              <p className="guide-rule__exception">
                <span className="guide-rule__exception-label">例外</span>
                <span>{renderInline(rule.exception)}</span>
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
