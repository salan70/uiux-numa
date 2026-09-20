import { FIGURE_COMPONENTS } from "../components/figures";
import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import {
  ALL_GUIDELINES,
  renderInline,
  resolveHref,
  type Guideline,
  type LinkItem,
  type Principle,
  type Rule,
} from "../content/guidelines";
import { workHref } from "../content/topics";

/** 索引から規則へ送る。動きを減らす設定では滑らせず、移動先へ focus も移す。 */
function goToRule(domId: string) {
  const target = document.getElementById(domId);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  target.focus();
}

type Layer = { id: string; title: string; lead: string };

const CORE_LAYER: Layer = {
  id: "core",
  title: "コア",
  lead: "この主題の考え方。ぶつかったときは上にあるものを優先する。",
};
const TIPS_LAYER: Layer = {
  id: "tips",
  title: "Tips",
  lead: "具体的な場面の規則。foundation はどのプロジェクトでも守り、module はこの主題を重視するときに選ぶ。",
};

// 未移行の文書は優先順位も適用も持たない。書いていない意味を lead で語らせない。
const LEGACY_CORE_LAYER: Layer = { ...CORE_LAYER, lead: "この主題で守る土台。場面によらず効く。" };
const LEGACY_TIPS_LAYER: Layer = {
  ...TIPS_LAYER,
  lead: "コアを個別の場面へ当てたもの。場面が変われば入れ替わる。",
};

export function GuidelinesPage({ slug }: { slug: string }) {
  const guideline = ALL_GUIDELINES.find((item) => item.slug === slug);
  if (!guideline) return <p className="empty">その方針の文書がない。</p>;

  // scope を持つのは未移行の文書だけ。
  const legacy = guideline.scope !== null;
  const coreLayer = legacy ? LEGACY_CORE_LAYER : CORE_LAYER;
  const tipsLayer = legacy ? LEGACY_TIPS_LAYER : TIPS_LAYER;
  const layers = [
    { ...coreLayer, rules: guideline.core },
    { ...tipsLayer, rules: guideline.tips },
  ];

  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {guideline.title}
      </h1>
      <p className="index__lead">{guideline.summary}</p>

      <div className="guide-layout">
        <div className="guide-layout__main">
          <GuideFacts guideline={guideline} />

          <CoreLayer layer={coreLayer} cores={guideline.core} />
          <TipsLayer layer={tipsLayer} rules={guideline.tips} cores={guideline.core} />

          {/* 確認項目と出典は未移行の文書だけが持つ。 */}
          {guideline.checklist.length > 0 && (
            <section className="guide-block" aria-labelledby="guide-checklist-head">
              <div className="work-head">
                <h2 className="work-head__title" id="guide-checklist-head">
                  確認項目
                </h2>
              </div>
              <ul className="guide-checklist">
                {guideline.checklist.map((item, idx) => (
                  <li key={idx} className="guide-checklist__item">
                    <span className="guide-checklist__icon" aria-hidden="true" />
                    <span>{renderInline(item)}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {guideline.sources.length > 0 && (
            <section className="guide-block" aria-labelledby="guide-sources-head">
              <div className="work-head">
                <h2 className="work-head__title" id="guide-sources-head">
                  出典
                </h2>
              </div>
              <ul className="guide-sources">
                {guideline.sources.map((src, idx) => (
                  <li key={idx} className="guide-sources__item">
                    {src.url ? (
                      <a
                        href={resolveHref(src.url)}
                        className="guide-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {src.text}
                      </a>
                    ) : (
                      <span className="guide-strong">{src.text}</span>
                    )}
                    {src.description && <span>: {src.description}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        {/* 索引は本文の右へ置く。読んでいる途中でも規則の全体が見える。 */}
        <aside className="guide-aside" aria-labelledby="guide-toc-head">
          <div className="guide-aside__inner">
            <h2 className="guide-aside__title" id="guide-toc-head">
              規則の索引
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

function GuideFacts({ guideline }: { guideline: Guideline }) {
  return (
    <section className="guide-block" aria-labelledby="guide-about">
      <div className="work-head">
        <h2 className="work-head__title" id="guide-about">
          この方針について
        </h2>
      </div>
      <dl className="guide-facts">
        <dt>目的</dt>
        <dd>{guideline.purpose}</dd>
        {guideline.scope && (
          <>
            <dt>適用範囲</dt>
            <dd>{guideline.scope}</dd>
          </>
        )}
      </dl>
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
      <p className="guide-layer__lead">{layer.lead}</p>
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
function TipsLayer({ layer, rules, cores }: { layer: Layer; rules: Rule[]; cores: Principle[] }) {
  const id = layer.id;
  return (
    <section className="guide-block" aria-labelledby={`guide-${id}-head`}>
      <div className="work-head">
        <h2 className="work-head__title" id={`guide-${id}-head`}>
          {layer.title}
        </h2>
        <p className="work-head__meta">{rules.length} 件</p>
      </div>
      <p className="guide-layer__lead">{layer.lead}</p>
      <div className="guide-rules">
        {rules.map((rule, idx) => {
          const Figure = rule.figureKey ? FIGURE_COMPONENTS[rule.figureKey] : null;
          return (
            <article key={idx} id={`rule-${id}-${idx}`} className="guide-rule" tabIndex={-1}>
              <h3 className="guide-rule__title">{rule.title}</h3>
              {rule.applies && (
                <p className="guide-rule__tags">
                  <span className="guide-tag">{rule.applies}</span>
                  {rule.cores.map((coreTitle) => {
                    const coreId = `rule-${CORE_LAYER.id}-${cores.findIndex(
                      (core) => core.title === coreTitle,
                    )}`;
                    return (
                      <a
                        key={coreTitle}
                        className="guide-tag guide-tag--core"
                        href={`#${coreId}`}
                        onClick={(event) => {
                          event.preventDefault();
                          goToRule(coreId);
                        }}
                      >
                        {coreTitle}
                      </a>
                    );
                  })}
                </p>
              )}
              {Figure && (
                <div className="guide-rule__figure">
                  <Figure />
                </div>
              )}
              <div className="guide-rule__rationale">{renderInline(rule.rationale)}</div>
              <div className="guide-examples">
                <div className="guide-example guide-example--bad">
                  <div className="guide-example__header">
                    <span className="guide-example__tag guide-example__tag--bad">悪い例</span>
                  </div>
                  <div className="guide-example__body">{renderInline(rule.bad)}</div>
                </div>
                <div className="guide-example guide-example--good">
                  <div className="guide-example__header">
                    <span className="guide-example__tag guide-example__tag--good">良い例</span>
                  </div>
                  <div className="guide-example__body">{renderInline(rule.good)}</div>
                </div>
              </div>
              {rule.exception && (
                <div className="guide-rule__exception">
                  <span className="guide-rule__exception-label">例外:</span>
                  {renderInline(rule.exception)}
                </div>
              )}
              {(rule.experiment || rule.source) && (
                <div className="guide-rule__origins">
                  {rule.experiment && (
                    <span className="guide-rule__origin-item">
                      <span className="guide-rule__origin-label">実験:</span>
                      <ExperimentLink item={rule.experiment} />
                    </span>
                  )}
                  {rule.source && (
                    <span className="guide-rule__origin-item">
                      <span className="guide-rule__origin-label">出典:</span>
                      <a
                        href={resolveHref(rule.source.url)}
                        className="guide-link"
                        target="_blank"
                        rel="noreferrer"
                      >
                        {rule.source.text}
                      </a>
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

/**
 * 出どころへのリンク。
 * 公開している成果物を指しているならその詳細へ、そうでなければリポジトリの該当ファイルへ送る。
 */
function ExperimentLink({ item }: { item: LinkItem }) {
  const match = item.url.match(/experiments\/([a-z0-9-]+)/);
  const work = match ? catalog.experiments.find((record) => record.slug === match[1]) : undefined;
  if (work?.topic) {
    return (
      <Link href={workHref(work.topic, work.slug)} className="guide-link">
        {item.text}
      </Link>
    );
  }
  return (
    <a href={resolveHref(item.url)} className="guide-link" target="_blank" rel="noreferrer">
      {item.text}
    </a>
  );
}
