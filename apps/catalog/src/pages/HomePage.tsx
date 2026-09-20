import { LiveFrame } from "../components/LiveFrame";
import { Link } from "../components/Link";
import { Meta } from "../components/Meta";
import { dot } from "../components/work";
import { catalog, worksByUpdated, worksInTopic } from "../content/collect";
import { topicById, topicHref, workHref, TOPICS, type Topic } from "../content/topics";

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
            const sample = topic.id === "tokens" ? null : worksInTopic(topic.id)[0];
            return (
              <li className="topic" key={topic.id}>
                <Link href={topicHref(topic.id)} className="topic__hit">
                  <span className="topic__label">{topic.label}</span>
                  <span className="topic__count">{countOf(topic)}</span>
                </Link>
                <p className="topic__lead">{topic.lead}</p>
                {sample ? (
                  <LiveFrame work={sample} />
                ) : (
                  <div className="token-strip">
                    {catalog.tokenFamilies.map((family) => (
                      <p className="token-strip__row" key={family.id}>
                        <span className="token-strip__name">{family.label}</span>
                        <span className="token-strip__count">{family.tokens.length}</span>
                      </p>
                    ))}
                  </div>
                )}
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
