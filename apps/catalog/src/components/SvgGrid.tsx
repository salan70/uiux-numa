import { useId, useState, type CSSProperties } from "react";
import type { SvgVariant } from "../content/svgs";

const sizes = [24, 48, 96] as const;

type Props = {
  groups: SvgVariant[];
  showSizeControl?: boolean;
  limit?: number;
};

export function SvgGrid({ groups, showSizeControl = true, limit }: Props) {
  const id = useId();
  const [size, setSize] = useState<(typeof sizes)[number]>(48);
  const visibleGroups = limit === undefined ? groups : groups.slice(0, limit);

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
              {group.experiment} / {group.variant}
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
                    <figcaption>{asset.name}</figcaption>
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
