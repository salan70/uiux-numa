import { Card } from "../../../../experiments/card/shared/Card";
import { Link } from "../components/Link";
import { TopicScreen } from "../components/TopicScreen";
import { catalog } from "../content/collect";
import { CATALOG_COMPONENTS } from "../content/components";
import { workHref } from "../content/topics";

/**
 * 部品の一覧。採用済みの Card に見本と名前を載せ、詳細は部品ごとのページへ送る。
 * 見本は Card がカバーとして inert の飾りにする。リンクの中にボタンを入れ子にしない。
 */
export function ComponentsPage() {
  const entries = CATALOG_COMPONENTS.flatMap((entry) => {
    const work = catalog.experiments.find((item) => item.slug === entry.slug);
    return work?.topic ? [{ entry, work, href: workHref(work.topic, work.slug) }] : [];
  });

  return (
    <TopicScreen id="components">
      {entries.length === 0 ? (
        <p className="empty">まだ成果物がない。</p>
      ) : (
        <ul className="component-cards">
          {entries.map(({ entry, work, href }) => (
            <li key={entry.slug}>
              <Card
                href={href}
                title={entry.title}
                description={work.lead}
                cover={<entry.Preview />}
                linkAs={Link}
              />
            </li>
          ))}
        </ul>
      )}
    </TopicScreen>
  );
}
