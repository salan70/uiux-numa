import { DotFieldHome } from "../../../../experiments/catalog-home-graphic/shared/DotFieldHome";
import { Link } from "../components/Link";
import { TOPICS } from "../content/topics";

/**
 * トップ。マークを網点で描く hero と、topic ごとの図柄を網点で描く WORKS の入口を置く。
 * 採用した型は experiments/catalog-home-graphic の dot-field で、部品は同 Experiment の shared にある。
 * 判断は apps/catalog/README.md に残す。
 */
export function HomePage() {
  return (
    // 自前の入場を持つので、版面の区画の入場（catalog.css の entrance-block）を当てない。
    <div className="hg df home-graphic" data-own-entrance>
      <DotFieldHome
        topics={TOPICS.map(({ id, label, href }) => ({ id, label, href }))}
        linkAs={Link}
      />
    </div>
  );
}
