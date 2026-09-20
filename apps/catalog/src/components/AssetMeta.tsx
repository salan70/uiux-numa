import type { ExperimentRecord } from "../content/collect";
import { repoTreeUrl } from "../content/github";
import { catalog } from "../content/collect";

type Meta = {
  role: ExperimentRecord["role"];
  maturity: ExperimentRecord["maturity"];
  platforms: string[];
  sources?: string[];
  experimentPath?: string;
};

type Props = Meta & {
  compact?: boolean;
};

export function AssetMeta({
  role,
  maturity,
  platforms,
  sources = [],
  experimentPath,
  compact = false,
}: Props) {
  return (
    <div className={compact ? "asset-meta is-compact" : "asset-meta"}>
      <p className="meta">
        {role} / {maturity} / {platforms.join(", ")}
      </p>
      {compact ? null : (
        <p className="meta asset-sources">
          {experimentPath ? (
            <a href={repoTreeUrl(experimentPath)} rel="noreferrer">
              {experimentPath}
            </a>
          ) : null}
          {sources.map((source) => {
            const href = sourceHref(source);
            return href ? (
              <a key={source} href={href} rel="noreferrer">
                {source}
              </a>
            ) : (
              <code key={source}>{source}</code>
            );
          })}
        </p>
      )}
    </div>
  );
}

export function experimentMeta(experiment: ExperimentRecord): Meta {
  return {
    role: experiment.role,
    maturity: experiment.maturity,
    platforms: experiment.platforms,
    sources: experiment.sources,
    experimentPath: `experiments/${experiment.slug}`,
  };
}

function sourceHref(source: string): string | null {
  if (source.includes("/")) return repoTreeUrl(source);
  if (catalog.experiments.some((item) => item.slug === source)) {
    return repoTreeUrl(`experiments/${source}`);
  }
  return null;
}
