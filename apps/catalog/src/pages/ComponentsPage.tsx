import { Link } from "../components/Link";
import { renderSentences } from "../components/Sentences";
import { TopicScreen } from "../components/TopicScreen";
import { catalog } from "../content/collect";
import { CATALOG_COMPONENTS } from "../content/components";
import { workHref } from "../content/topics";

/**
 * 部品の一覧。見本と名前のカードを並べ、詳細は部品ごとのページへ送る。
 * 見本は操作させない。リンクの中にボタンを入れ子にしないため、inert で飾りにする。
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
            <li className="component-card" key={entry.slug}>
              <div className="component-card__preview" inert aria-hidden="true">
                <entry.Preview />
              </div>
              <div className="component-card__body">
                <h2 className="component-card__title">
                  <Link href={href} className="component-card__link">
                    {entry.title}
                  </Link>
                </h2>
                <p className="component-card__lead">{renderSentences(work.lead)}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </TopicScreen>
  );
}
