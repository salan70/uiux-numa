import type { ExperimentRecord } from "../content/collect";

/** 既定で見せる variant。採用があればその先頭、無ければ最初の 1 つ。 */
export function defaultVariant(work: ExperimentRecord): string {
  return work.adopted[0] ?? work.variantIds[0];
}

/** live を描く URL。preview の第 2 エントリが variant を単体で配信する。 */
export function previewPathFor(work: ExperimentRecord, variant: string): string | undefined {
  return work.liveVariants.find((item) => item.variant === variant)?.previewPath;
}
