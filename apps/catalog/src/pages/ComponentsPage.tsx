import { useState } from "react";
import { LiveFrame } from "../components/LiveFrame";
import { VariantChips } from "../components/VariantChips";
import { WorkHead } from "../components/WorkHead";
import { defaultVariant } from "../components/work";
import { worksInTopic, type ExperimentRecord } from "../content/collect";
import { TopicScreen } from "../components/TopicScreen";

/** 入力と操作の部品。live 標本を大きく出す。 */
export function ComponentsPage() {
  const list = worksInTopic("components");
  return (
    <TopicScreen id="components">
      {list.length === 0 ? (
        <p className="empty">まだ成果物がない。</p>
      ) : (
        <div className="topic-body">
          {list.map((work) => (
            <LiveWork key={work.slug} work={work} />
          ))}
        </div>
      )}
    </TopicScreen>
  );
}

function LiveWork({ work }: { work: ExperimentRecord }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  return (
    <div className="work">
      <WorkHead work={work} />
      <VariantChips work={work} current={current} onSelect={setCurrent} />
      <LiveFrame work={work} variant={current} tall caption="platforms" />
    </div>
  );
}
