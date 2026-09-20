import type { ExperimentRecord } from "../content/collect";
import { workHref } from "../content/topics";
import { Link } from "./Link";
import { dot } from "./work";

/** トピックの中の成果物 1 件の見出し。詳細へはここから送る。 */
export function WorkHead({ work }: { work: ExperimentRecord }) {
  return (
    <div className="work-head">
      <h2 className="work-head__title">{work.title}</h2>
      <p className="work-head__meta">
        {work.topic && <Link href={workHref(work.topic, work.slug)}>詳細</Link>}
        <span>{work.role}</span>
        <span>{work.maturity}</span>
        <span>{dot(work.updated)}</span>
      </p>
    </div>
  );
}
