import { useState } from "react";
import { SvgGrid } from "../components/SvgGrid";
import { VariantChips } from "../components/VariantChips";
import { WorkHead } from "../components/WorkHead";
import { defaultVariant } from "../components/work";
import { worksInTopic, type ExperimentRecord } from "../content/collect";
import { TopicScreen } from "../components/TopicScreen";

/** 記号の組。一覧を挟まず SVG そのものを並べる。 */
export function IconsPage() {
  const list = worksInTopic("icons");
  return (
    <TopicScreen id="icons">
      {list.length === 0 ? (
        <p className="empty">まだ成果物がない。</p>
      ) : (
        <div className="topic-body">
          {list.map((work) => (
            <SvgWork key={work.slug} work={work} />
          ))}
        </div>
      )}
    </TopicScreen>
  );
}

function SvgWork({ work }: { work: ExperimentRecord }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  return (
    <div className="work">
      <WorkHead work={work} />
      <VariantChips work={work} current={current} onSelect={setCurrent} />
      <SvgGrid experiment={work.slug} variant={current} />
    </div>
  );
}
