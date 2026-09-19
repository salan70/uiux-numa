import { categoryHref, categoryLabel, type CatalogCategory } from "../content/category";
import { catalog, defaultVariantId, type ExperimentRecord } from "../content/collect";
import { LivePreview } from "./LivePreview";
import { SvgGrid } from "./SvgGrid";
import { Link } from "./Link";

type Props = {
  experiment: ExperimentRecord;
  kind: "live" | "svg";
};

export function ExperimentPage({ experiment, kind }: Props) {
  const adopted = defaultVariantId(experiment);
  const groups = catalog.svgs.filter((group) => group.experiment === experiment.slug);
  const parentHref = categoryHref(experiment.category);
  const parentLabel = categoryLabel(experiment.category);

  return (
    <>
      <div className="page-intro">
        <p className="crumb">
          <Link href={parentHref}>{parentLabel}</Link>
        </p>
        <h1>{experiment.title}</h1>
      </div>
      {kind === "live" ? (
        <LivePreview
          variants={
            adopted
              ? experiment.liveVariants.filter((item) => item.variant === adopted)
              : experiment.liveVariants
          }
          defaultVariant={adopted}
          showHeading={false}
        />
      ) : (
        <SvgGrid groups={adopted ? groups.filter((group) => group.variant === adopted) : groups} />
      )}
    </>
  );
}

export function experimentKind(category: CatalogCategory): "live" | "svg" {
  return category === "icons" || category === "graphics" ? "svg" : "live";
}
