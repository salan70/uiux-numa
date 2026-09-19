import { useId, useState, type CSSProperties } from "react";
import type { VariantStatus } from "../content/collect";
import type { SvgVariant } from "../content/svgs";
import { CopyButton } from "./CopyButton";
import { StatusBadge } from "./StatusBadge";

const sizes = [24, 48, 96] as const;

type Props = {
  groups: SvgVariant[];
  showSizeControl?: boolean;
  limit?: number;
  statuses?: Record<string, VariantStatus>;
};

export function SvgGrid({ groups, showSizeControl = true, limit, statuses }: Props) {
  const id = useId();
  const [size, setSize] = useState<(typeof sizes)[number]>(48);
  const ordered = [...groups].sort((a, b) => {
    const rank = (variant: string) => (statuses?.[variant] === "adopted" ? 0 : 1);
    return rank(a.variant) - rank(b.variant) || a.variant.localeCompare(b.variant);
  });
  const visibleGroups = limit === undefined ? ordered : ordered.slice(0, limit);

  return (
    <div className="svg-catalog">
      {showSizeControl && (
        <fieldset className="svg-size-control">
          <legend>表示サイズ</legend>
          <div>
            {sizes.map((item) => (
              <label key={item}>
                <input
                  type="radio"
                  name={`${id}-size`}
                  value={item}
                  checked={size === item}
                  onChange={() => setSize(item)}
                />
                {item}px
              </label>
            ))}
          </div>
        </fieldset>
      )}
      <div className="svg-groups">
        {visibleGroups.map((group) => (
          <section key={`${group.experiment}/${group.variant}`} className="svg-group">
            <h3>
              {group.variant}{" "}
              {statuses?.[group.variant] ? <StatusBadge status={statuses[group.variant]} /> : null}
            </h3>
            <ul className="svg-grid">
              {group.assets.map((asset) => (
                <li key={asset.sourcePath}>
                  <figure className="svg-card">
                    <div
                      className="svg-art"
                      style={{ "--svg-size": `${size}px` } as CSSProperties}
                      dangerouslySetInnerHTML={{ __html: asset.source }}
                    />
                    <figcaption>
                      {asset.name}
                      <CopyButton
                        value={asset.source}
                        label={`${asset.name} の SVG`}
                        showValue={false}
                      />
                    </figcaption>
                  </figure>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
