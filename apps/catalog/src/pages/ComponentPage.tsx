import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import { catalogComponent } from "../content/components";
import { topicHref } from "../content/topics";
import { NotFoundPage } from "./NotFoundPage";

/** 部品 1 件。採用実装を iframe に入れず本文へ置き、親の token と配色を継承させる。 */
export function ComponentPage({ slug }: { slug: string }) {
  const entry = catalogComponent(slug);
  const work = catalog.experiments.find((item) => item.slug === slug);
  // 登録から外した部品と公開面に出ない成果物の URL は開けない。
  if (!entry || !work || work.topic !== "components") return <NotFoundPage />;

  return (
    <article className="detail component-detail">
      <p className="detail__crumb">
        <Link href={topicHref("components")}>Components</Link>
        <span aria-hidden="true">／</span>
        <span>{work.role}</span>
        <span aria-hidden="true">／</span>
        <span>{work.maturity}</span>
      </p>
      <h1 className="detail__title" tabIndex={-1} data-screen-heading>
        {entry.title}
      </h1>
      <div className="component-detail__body">
        <entry.Detail />
      </div>
    </article>
  );
}
