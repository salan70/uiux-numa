import { useState } from "react";
import type { LiveVariant } from "../content/collect";

const widths = [
  { id: "mobile", label: "mobile", width: "390px" },
  { id: "desktop", label: "desktop", width: "1280px" },
  { id: "fit", label: "fit", width: "100%" },
] as const;

type Props = {
  variants: LiveVariant[];
};

export function LivePreview({ variants }: Props) {
  const [selected, setSelected] = useState(variants[0]?.variant ?? "");
  const [width, setWidth] = useState<(typeof widths)[number]["id"]>("fit");
  const current = variants.find((item) => item.variant === selected) ?? variants[0];
  if (!current) return null;
  const frame = widths.find((item) => item.id === width) ?? widths[2];

  return (
    <section className="live-preview" aria-labelledby="live-heading">
      <h2 id="live-heading">live variant</h2>
      <div className="live-controls">
        <label>
          variant
          <select value={current.variant} onChange={(event) => setSelected(event.target.value)}>
            {variants.map((item) => (
              <option key={item.variant} value={item.variant}>
                {item.variant}
              </option>
            ))}
          </select>
        </label>
        <fieldset>
          <legend>表示幅</legend>
          <div className="live-widths">
            {widths.map((item) => (
              <label key={item.id}>
                <input
                  type="radio"
                  name="live-width"
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
