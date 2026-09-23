import type { ComponentType } from "react";
import { Card } from "../../../../experiments/card/shared/Card";
import {
  ColorsCover,
  ComponentsCover,
  IconsCover,
  TokensCover,
  TypographyCover,
} from "../../../../experiments/card/shared/covers";
import { LogoMark } from "../components/icons";
import { Link } from "../components/Link";
import { MarqueeRows } from "../components/MarqueeRows";
import { catalog, worksInTopic } from "../content/collect";
import { galleryTiles } from "../content/galleryTiles";
import { topicHref, TOPICS, type Topic, type TopicId } from "../content/topics";
import { SITE_TITLE } from "../site";

/** トピックの入口に置くカバー。成果物の iframe ではなく、リポジトリの実物を縮小して置く。 */
const TOPIC_COVERS: Record<TopicId, ComponentType> = {
  colors: ColorsCover,
  typography: TypographyCover,
  tokens: TokensCover,
  components: ComponentsCover,
  icons: IconsCover,
};

/**
 * 成果物のカードを逆向きに流れる 3 段の帯で見せ、その下にトピックの入口を並べる。
 * 判断は docs/decisions/2026-09-21-catalog-home-marquee.md に残す。
 */
export function HomePage() {
  return (
    <>
      <section className="home-hero" aria-labelledby="home-title">
        <h1 className="home-hero__title" id="home-title" tabIndex={-1} data-screen-heading>
          <LogoMark />
          {SITE_TITLE}
        </h1>
        <MarqueeRows tiles={galleryTiles()} />
      </section>

      <section className="topics" aria-labelledby="topics-head">
        <h2 className="section-title" id="topics-head">
          WORKS
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
