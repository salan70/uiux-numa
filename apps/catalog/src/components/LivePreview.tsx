import { useId, useState } from "react";
import type { LiveVariant } from "../content/collect";

const widths = [
  { id: "mobile", label: "390px", width: "390px" },
  { id: "desktop", label: "1280px", width: "1280px" },
  { id: "fit", label: "幅いっぱい", width: "100%" },
] as const;

type Props = {
  variants: LiveVariant[];
  title?: string;
};

export function LivePreview({ variants, title = "live preview" }: Props) {
  const id = useId();
  const [selected, setSelected] = useState(variants[0]?.variant ?? "");
  const [width, setWidth] = useState<(typeof widths)[number]["id"]>("fit");
  const current = variants.find((item) => item.variant === selected) ?? variants[0];
  if (!current) return null;
  const frame = widths.find((item) => item.id === width) ?? widths[2];
  const headingId = `${id}-heading`;

  return (
    <section className="live-preview" aria-labelledby={headingId}>
      <h2 id={headingId}>{title}</h2>
      <div className="live-controls">
        <fieldset>
          <legend>variant</legend>
          <div className="live-variants">
            {variants.map((item) => (
              <label key={item.variant}>
                <input
                  type="radio"
                  name={`${id}-variant`}
                  value={item.variant}
                  checked={current.variant === item.variant}
                  onChange={() => setSelected(item.variant)}
                />
                {item.variant}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>表示幅</legend>
          <div className="live-widths">
            {widths.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name={`${id}-width`}
                  value={item.id}
                  checked={width === item.id}
                  onChange={() => setWidth(item.id)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>
      <div className="live-frame-wrap">
        <iframe
          className="live-frame"
          title={`${current.experiment} / ${current.variant} の live preview`}
          src={current.previewPath}
          style={{ width: frame.width }}
        />
      </div>
    </section>
  );
}
