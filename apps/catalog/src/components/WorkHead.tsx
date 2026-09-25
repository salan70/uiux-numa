import type { ExperimentRecord } from "../content/collect";
import { workHref } from "../content/topics";
import { DetailIcon } from "./icons";
import { Link } from "./Link";

/**
 * トピックの中の成果物 1 件の見出し。題名と、Colors のカードと同じ ⓘ だけを置き、詳細へはここから送る。
 * 日付、role、maturity は出さない。利用者が 2026-09-24 に、日付の情報は一切いらないと判断した。
 * 判断は experiments/catalog-works-layout の README にある。
 */
export function WorkHead({ work }: { work: ExperimentRecord }) {
  if (!work.topic) return null;
  return (
    <div className="topic-work-head">
      <h2 className="topic-work-head__title">{work.title}</h2>
      <Link
        href={workHref(work.topic, work.slug)}
        className="work-more"
        aria-label={`${work.title} の詳細`}
      >
        <DetailIcon />
      </Link>
    </div>
  );
}
