import { useMemo, useState } from "react";
import type { PreviewItem } from "../content/collect";

type Props = {
  previews: PreviewItem[];
};

export function PreviewGallery({ previews }: Props) {
  const variants = useMemo(
    () => [...new Set(previews.flatMap((item) => (item.variant ? [item.variant] : [])))].sort(),
    [previews],
  );
  const states = useMemo(() => [...new Set(previews.map((item) => item.state))].sort(), [previews]);
  const [variant, setVariant] = useState("all");
  const [state, setState] = useState("all");

  const visible = previews.filter((item) => {
    if (variant !== "all" && item.variant !== variant && item.kind !== "compare") return false;
    if (state !== "all" && item.state !== state) return false;
    return true;
  });

  return (
    <section className="gallery" aria-labelledby="gallery-heading">
      <h2 id="gallery-heading">preview</h2>
      <div className="gallery-filters">
        <label>
          variant
          <select value={variant} onChange={(event) => setVariant(event.target.value)}>
            <option value="all">すべて</option>
            {variants.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
        <label>
          state
          <select value={state} onChange={(event) => setState(event.target.value)}>
            <option value="all">すべて</option>
            {states.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </label>
      </div>
      {visible.length === 0 ? (
        <p>条件に合う preview はない。</p>
      ) : (
        <ul className="gallery-list">
          {visible.map((item) => (
            <li key={item.fileName}>
              <figure>
                <img src={item.src} alt={item.alt} />
                <figcaption>
                  {item.kind === "compare"
                    ? `比較 / ${item.state}`
                    : `${item.variant} / ${item.state}`}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
