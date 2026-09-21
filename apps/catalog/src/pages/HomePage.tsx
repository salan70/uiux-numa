import type { ComponentType } from "react";
import { Card } from "../../../../experiments/card/shared/Card";
import {
  ColorsCover,
  ComponentsCover,
  IconsCover,
  TokensCover,
  TypographyCover,
} from "../../../../experiments/card/shared/covers";
import { LiveFrame } from "../components/LiveFrame";
import { Link } from "../components/Link";
import { Meta } from "../components/Meta";
import { dot } from "../components/work";
import { catalog, worksByUpdated, worksInTopic } from "../content/collect";
import {
  topicById,
  topicHref,
  workHref,
  TOPICS,
  type Topic,
  type TopicId,
} from "../content/topics";

/** トピックの入口に置くカバー。成果物の iframe ではなく、リポジトリの実物を縮小して置く。 */
const TOPIC_COVERS: Record<TopicId, ComponentType> = {
  colors: ColorsCover,
  typography: TypographyCover,
  tokens: TokensCover,
  components: ComponentsCover,
  icons: IconsCover,
};

/** 最後に更新した成果物を主役にし、その下にトピックの入口を並べる。 */
export function HomePage() {
  const hero = worksByUpdated()[0];
  if (!hero) return <p className="empty">まだ成果物がない。</p>;
  const heroTopic = hero.topic ? topicById(hero.topic) : undefined;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__kicker">
          <span className="hero__topic">{heroTopic?.label ?? "成果物"}</span>
          <span>最終更新 {dot(hero.updated)}</span>
        </p>
        <h1 className="hero__title" id="hero-title" tabIndex={-1} data-screen-heading>
          {hero.title}
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__live">
          <LiveFrame work={hero} tall />
        </div>
        <div className="hero__side">
          <Meta work={hero} />
          {hero.topic && (
            <p className="hero__action">
              <Link href={workHref(hero.topic, hero.slug)} className="btn">
                この成果物を開く
              </Link>
            </p>
          )}
        </div>
      </section>

      <section className="topics" aria-labelledby="topics-head">
        <h2 className="section-title" id="topics-head">
          トピック
        </h2>
        <ul className="topic-list">
          {TOPICS.map((topic) => {
            const Cover = TOPIC_COVERS[topic.id];
            return (
              <li key={topic.id}>
                <Card
                  href={topicHref(topic.id)}
                  title={topic.label}
                  meta={countOf(topic)}
                  description={topic.lead}
                  cover={<Cover />}
                  linkAs={Link}
                />
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function countOf(topic: Topic): string {
  if (topic.id === "tokens") return `${catalog.tokens.length} token`;
  return `${worksInTopic(topic.id).length} 件`;
}
