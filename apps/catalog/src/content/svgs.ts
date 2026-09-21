export type SvgAsset = {
  experiment: string;
  variant: string;
  name: string;
  sourcePath: string;
  source: string;
};

export type SvgVariant = {
  experiment: string;
  variant: string;
  assets: SvgAsset[];
};

const rawSvgFiles = import.meta.glob<string>("../../../../experiments/*/variants/*/dist/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const svgFiles: Record<string, string> = rawSvgFiles;

export function collectSvgs(files: Record<string, string>): SvgVariant[] {
  const grouped = new Map<string, SvgVariant>();
  for (const [sourcePath, source] of Object.entries(files)) {
    const match = sourcePath.match(/experiments\/([^/]+)\/variants\/([^/]+)\/dist\/([^/]+)\.svg$/);
    if (!match) throw new Error(`SVG パスが不正: ${sourcePath}`);
    const [, experiment, variant, name] = match;
    const key = `${experiment}/${variant}`;
    const group = grouped.get(key) ?? { experiment, variant, assets: [] };
    group.assets.push({
      experiment,
      variant,
      name,
      sourcePath: toRepoPath(sourcePath),
      source,
    });
    grouped.set(key, group);
  }

  return [...grouped.values()]
    .map((group) => ({
      ...group,
      assets: group.assets.sort((a, b) => a.name.localeCompare(b.name)),
    }))
    .sort((a, b) => `${a.experiment}/${a.variant}`.localeCompare(`${b.experiment}/${b.variant}`));
}

function toRepoPath(globKey: string): string {
  const match = globKey.match(/\/(experiments\/.*)$/);
  if (!match) throw new Error(`リポジトリパスに変換できない: ${globKey}`);
  return match[1];
}
