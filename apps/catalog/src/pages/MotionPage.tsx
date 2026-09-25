import { MotionTiles } from "../../../../experiments/catalog-works-layout/shared/MotionTiles";
import { TopicScreen } from "../components/TopicScreen";
import { WorkHead } from "../components/WorkHead";
import { worksInTopic, type ExperimentRecord } from "../content/collect";

/**
 * 動きの成果物。Icons と同じ「面のセルに名前を添えた格子」で型を並べる（catalog-works-layout の motion-tiles）。
 * 見本は iframe に入れず本文に直接描き、セルが画面に入ったら 1 回再生し、押すと再生し直す。
 * iframe は読み込みの時点で再生が終わり、下にある見本はスクロールして届く前に止まっていた。
 */
export function MotionPage() {
  const list = worksInTopic("motion");
  return (
    <TopicScreen id="motion">
      {list.length === 0 ? (
        <p className="empty">まだ成果物がない。</p>
      ) : (
        <div className="topic-body">
          {list.map((work) => (
            <MotionWork key={work.slug} work={work} />
          ))}
        </div>
      )}
    </TopicScreen>
  );
}

function MotionWork({ work }: { work: ExperimentRecord }) {
  // 判断済みなら採用した型だけを並べる。却下した型は公開面に出さない（Colors と同じ扱い）。
  const variants = work.variants.filter((variant) => variant.status !== "rejected");
  return (
    <div className="work">
      <WorkHead work={work} />
      <MotionTiles patterns={variants.map((variant) => variant.id)} />
    </div>
  );
}
