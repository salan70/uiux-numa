import type { ExperimentRecord } from "../content/collect";

/** 再利用の前提。role と maturity の意味は docs/asset-model.md にある。 */
export function Meta({ work }: { work: ExperimentRecord }) {
  return (
    <p className="meta">
      <span>{work.role}</span>
      <span>{work.maturity}</span>
      <span>{work.platforms.join("・")}</span>
      <span>{work.variantIds.length} variant</span>
    </p>
  );
}
