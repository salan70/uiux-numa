import { Mock, Screen, WorkHead } from "../../shared/Mock";
import { MotionTiles } from "../../shared/MotionTiles";
import { detailHref, MOTION_WORKS } from "../../shared/works";

/**
 * Icons と同じ「面のセルに名前を添えた格子」で型を並べる。
 * 部品は shared/MotionTiles にあり、Catalog の Motion 画面も同じものを使う。
 */
export default function Variant() {
  return (
    <Mock variantClass="wl-motion-tiles" label="motion-tiles">
      <Screen id="motion" title="Motion">
        <div className="wl-body wl-works">
          {MOTION_WORKS.map((work) => (
            <article className="wl-work" key={work.slug}>
              <WorkHead title={work.title} href={detailHref(work.slug, work.usedInCatalog)} />
              <MotionTiles patterns={work.patterns.map((pattern) => pattern.id)} />
            </article>
          ))}
        </div>
      </Screen>
    </Mock>
  );
}
