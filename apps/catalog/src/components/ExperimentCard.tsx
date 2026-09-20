import { categoryHref, type CatalogCategory } from "../content/category";
import { defaultVariantId, type ExperimentRecord } from "../content/collect";
import { catalog } from "../content/collect";
import { AssetMeta, experimentMeta } from "./AssetMeta";
import { Link } from "./Link";
import { LivePreview } from "./LivePreview";
import { SvgGrid } from "./SvgGrid";

type Props = {
  experiment: ExperimentRecord;
  category: CatalogCategory;
  kind: "live" | "svg";
};

export function ExperimentCard({ experiment, category, kind }: Props) {
  const href = `${categoryHref(category)}/${experiment.slug}`;
  const adopted = defaultVariantId(experiment);
  const groups = catalog.svgs.filter((group) => group.experiment === experiment.slug);
  const live = adopted
    ? experiment.liveVariants.filter((item) => item.variant === adopted)
    : experiment.liveVariants;

  return (
    <article className="experiment-card" data-chroma={category}>
      <h2>
        <Link href={href}>{experiment.title}</Link>
      </h2>
      {kind === "live" ? (
        <LivePreview variants={live} defaultVariant={adopted} showHeading={false} compact />
      ) : (
        <SvgGrid
          groups={adopted ? groups.filter((group) => group.variant === adopted) : groups}
          showSizeControl={false}
          limit={1}
        />
      )}
      <AssetMeta {...experimentMeta(experiment)} compact />
    </article>
  );
}
