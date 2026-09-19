import { categoryHref, categoryLabel, type CatalogCategory } from "../content/category";
import { catalog, defaultVariantId, type ExperimentRecord } from "../content/collect";
import { githubBlobUrl } from "../content/github";
import { LivePreview } from "./LivePreview";
import { MarkdownBody } from "./MarkdownBody";
import { StatusBadge } from "./StatusBadge";
import { SvgGrid } from "./SvgGrid";
import { Link } from "./Link";

type Props = {
  experiment: ExperimentRecord;
  kind: "live" | "svg";
};

export function ExperimentPage({ experiment, kind }: Props) {
  const adopted = defaultVariantId(experiment);
  const rejected = experiment.variants.filter((item) => item.status === "rejected");
  const statuses = Object.fromEntries(experiment.variants.map((item) => [item.id, item.status]));
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
        <p className="meta">
          <StatusBadge status={experimentStatus(experiment)} /> 更新日{" "}
          <time dateTime={experiment.updated}>{experiment.updated}</time>
        </p>
      </div>
      <section aria-labelledby="overview-heading">
        <h2 id="overview-heading">概要</h2>
        <MarkdownBody html={experiment.problemHtml} />
      </section>
      <section aria-labelledby="adopted-heading">
        <h2 id="adopted-heading">{adopted ? "採用案" : "掲載する案"}</h2>
        {kind === "live" ? (
          <LivePreview
            variants={
              adopted
                ? experiment.liveVariants.filter((item) => item.variant === adopted)
                : experiment.liveVariants
            }
            title={experiment.title}
            defaultVariant={adopted}
          />
        ) : (
          <SvgGrid
            groups={adopted ? groups.filter((group) => group.variant === adopted) : groups}
            statuses={statuses}
          />
        )}
      </section>
      <section aria-labelledby="decision-heading">
        <h2 id="decision-heading">採用理由</h2>
        <MarkdownBody html={experiment.decisionHtml} />
      </section>
      {rejected.length > 0 ? (
        <section aria-labelledby="compare-heading">
          <h2 id="compare-heading">比較した案</h2>
          <ul className="record-list">
            {rejected.map((variant) => (
              <li key={variant.id}>
                <code>{variant.id}</code> <StatusBadge status={variant.status} />
              </li>
            ))}
          </ul>
          {kind === "svg" ? (
            <SvgGrid
              groups={groups.filter((group) => rejected.some((item) => item.id === group.variant))}
              statuses={statuses}
            />
          ) : (
            <LivePreview
              variants={experiment.liveVariants.filter((item) =>
                rejected.some((variant) => variant.id === item.variant),
              )}
              title="比較した案"
            />
          )}
          <MarkdownBody html={experiment.rejectedHtml} />
        </section>
      ) : null}
      {experiment.accessibilityHtml ? (
        <section aria-labelledby="a11y-heading">
          <h2 id="a11y-heading">アクセシビリティ</h2>
          <MarkdownBody html={experiment.accessibilityHtml} />
        </section>
      ) : null}
      <section aria-labelledby="resources-heading">
        <h2 id="resources-heading">リソース</h2>
        <p>
          Experiment の記録:{" "}
          <a href={githubBlobUrl(`experiments/${experiment.slug}/README.md`)} rel="noreferrer">
            experiments/{experiment.slug}/README.md
          </a>
        </p>
      </section>
    </>
  );
}

function experimentStatus(experiment: ExperimentRecord) {
  if (experiment.status !== "decided") return "exploring" as const;
  return experiment.adopted.length > 0 ? ("adopted" as const) : ("rejected" as const);
}

export function experimentKind(category: CatalogCategory): "live" | "svg" {
  return category === "icons" || category === "graphics" ? "svg" : "live";
}
