import { ENTRANCE_VARIANT } from "../components/EntranceWords";
import { LiveFrame } from "../components/LiveFrame";
import { TopicScreen } from "../components/TopicScreen";
import { WorkHead } from "../components/WorkHead";
import { worksInTopic, type ExperimentRecord } from "../content/collect";

/**
 * 動きの成果物。静止画では動きを判断できないので、一覧を挟まず live 標本を直接置く。
 * 1 つの成果物が型を複数持つので、切り替えずに縦に並べ、型ごとに説明を添える。
 * 切り替えにすると、見比べるたびに押し直して再生を待つことになる。
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
      <ol className="motion-patterns">
        {variants.map((variant) => (
          <li className="motion-pattern" key={variant.id}>
            <div className="motion-pattern__spec">
              <h3 className="motion-pattern__name">{variant.id}</h3>
              {/* 説明は README の Variants 表から読む。画面に同じ文を二重に書かない。 */}
              <p className="motion-pattern__desc">{variant.hypothesis}</p>
              <p className="motion-pattern__axis">{variant.axis}</p>
              {ENTRANCE_VARIANT.experiment === work.slug &&
                ENTRANCE_VARIANT.variant === variant.id && (
                  <p className="variants__mark">Catalog の見出しで使用</p>
                )}
            </div>
            <LiveFrame work={work} variant={variant.id} tall />
          </li>
        ))}
      </ol>
    </div>
  );
}
