import { useState } from "react";
import { LiveFrame } from "../components/LiveFrame";
import { Link } from "../components/Link";
import { Meta } from "../components/Meta";
import { defaultVariant, dot } from "../components/work";
import { catalog } from "../content/collect";
import { topicById, topicHref } from "../content/topics";
import { NotFoundPage } from "./NotFoundPage";
import { renderSentences } from "../components/Sentences";

/** 成果物 1 件。live を主役にし、variant の切替と前提を脇に置く。 */
export function DetailPage({ slug }: { slug: string }) {
  const work = catalog.experiments.find((item) => item.slug === slug);
  const [current, setCurrent] = useState<string | null>(null);
  // 公開面に出ない成果物の URL は開けない。
  if (!work || !work.topic) return <NotFoundPage />;

  const topic = topicById(work.topic);
  const variant = current ?? defaultVariant(work);

  return (
    <article className="detail">
      <p className="detail__crumb">
        {topic && <Link href={topicHref(topic.id)}>{topic.label}</Link>}
        <span aria-hidden="true">／</span>
        <span>{dot(work.updated)}</span>
      </p>
      <h1 className="detail__title" tabIndex={-1} data-screen-heading>
        {work.title}
      </h1>
      <p className="detail__lead">{renderSentences(work.lead)}</p>
      <div className="detail__live">
        <LiveFrame work={work} variant={variant} tall />
      </div>
      <div className="detail__side">
        <h2 className="detail__side-head">variant</h2>
        <ul className="variants">
          {work.variantIds.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="variants__item"
                aria-pressed={id === variant}
                onClick={() => setCurrent(id)}
              >
                <span className="variants__id">{id}</span>
                {work.adopted.includes(id) && <span className="variants__mark">採用</span>}
              </button>
            </li>
          ))}
        </ul>
        <h2 className="detail__side-head">前提</h2>
        <Meta work={work} />
        <p className="detail__source">
          正本は <code>{work.repoPath}</code>
        </p>
      </div>
    </article>
  );
}
