import { useState } from "react";
import { EntranceText, usePlayOnView } from "../../shared/entrance";
import { Mock, Screen, Svg, VariantPills, WorkHead } from "../../shared/Mock";
import {
  defaultVariant,
  detailHref,
  ICON_WORKS,
  MOTION_WORKS,
  svgsFor,
  type IconWork,
  type MotionPattern,
  type MotionWork,
} from "../../shared/works";
import "./variant.css";

/**
 * 今の構成（成果物を画面に直接並べる）を保ち、部品の語彙だけを Colors と Components に揃える。
 * 太い罫の見出しと等幅のメタをやめ、題名と Colors と同じ ⓘ の 1 行で詳細へ送る。
 * Motion はこの案では今の並べ方（型ごとに見本と説明）のまま、見本を iframe から本文へ移しただけにする。
 */
export default function Variant() {
  return (
    <Mock variantClass="wl-quiet-sections" label="quiet-sections">
      <Screen id="icons" title="Icons">
        <div className="wl-body wl-works">
          {ICON_WORKS.map((work) => (
            <IconSection key={work.slug} work={work} />
          ))}
        </div>
      </Screen>
      <Screen id="motion" title="Motion">
        <div className="wl-body wl-works">
          {MOTION_WORKS.map((work) => (
            <MotionSection key={work.slug} work={work} />
          ))}
        </div>
      </Screen>
    </Mock>
  );
}

function IconSection({ work }: { work: IconWork }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  return (
    <article className="wl-work">
      <WorkHead title={work.title} href={detailHref(work.slug, current)} />
      <VariantPills
        label={`${work.title} の variant`}
        variants={work.variants}
        adopted={work.adopted}
        current={current}
        onSelect={setCurrent}
      />
      <ul className="qs-icons">
        {svgsFor(work.slug, current).map((asset) => (
          <li className="qs-icon" key={asset.name}>
            <Svg className="qs-icon__art" source={asset.source} />
            <span className="qs-icon__name">{asset.name}</span>
          </li>
        ))}
      </ul>
    </article>
  );
}

function MotionSection({ work }: { work: MotionWork }) {
  return (
    <article className="wl-work">
      <WorkHead title={work.title} href={detailHref(work.slug, work.usedInCatalog)} />
      <ol className="qs-patterns">
        {work.patterns.map((pattern) => (
          <PatternItem
            key={pattern.id}
            pattern={pattern}
            used={pattern.id === work.usedInCatalog}
          />
        ))}
      </ol>
    </article>
  );
}

function PatternItem({ pattern, used }: { pattern: MotionPattern; used: boolean }) {
  const [ref, playKey, replay] = usePlayOnView<HTMLDivElement>();
  return (
    <li className="qs-pattern">
      <div className="qs-pattern__text">
        <h4 className="qs-pattern__name">{pattern.id}</h4>
        {used && <p className="qs-pattern__mark">Catalog の見出しで使用</p>}
        <p className="qs-pattern__desc">{pattern.hypothesis}</p>
        <p className="qs-pattern__axis">{pattern.axis}</p>
      </div>
      <div className="qs-pattern__stage" ref={ref}>
        <EntranceText pattern={pattern.id} playKey={playKey} />
        <button type="button" className="wl-pill qs-pattern__replay" onClick={replay}>
          もう一度再生<span className="wl-visually-hidden">（{pattern.id}）</span>
        </button>
      </div>
    </li>
  );
}
