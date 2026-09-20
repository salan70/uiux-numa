import { useId, useState } from "react";
import type { LiveVariant } from "../content/collect";
import { SegmentedControl } from "./SegmentedControl";

const widths = [
  { value: "mobile", label: "390px" },
  { value: "desktop", label: "1280px" },
  { value: "fit", label: "全幅" },
] as const;

const widthPx: Record<(typeof widths)[number]["value"], string> = {
  mobile: "390px",
  desktop: "1280px",
  fit: "100%",
};

type Props = {
  variants: LiveVariant[];
  title?: string;
  defaultVariant?: string;
  showHeading?: boolean;
  compact?: boolean;
};

export function LivePreview({
  variants,
  title = "Live Preview",
  defaultVariant,
  showHeading = true,
  compact = false,
}: Props) {
  const id = useId();
  const initial =
    variants.find((item) => item.variant === defaultVariant)?.variant ?? variants[0]?.variant ?? "";
  const [selected, setSelected] = useState(initial);
  const [width, setWidth] = useState<(typeof widths)[number]["value"]>("fit");
  const current = variants.find((item) => item.variant === selected) ?? variants[0];
  if (!current) return null;
  const headingId = `${id}-heading`;

  return (
    <section
      className={compact ? "live-preview is-compact" : "live-preview"}
      aria-labelledby={showHeading ? headingId : undefined}
      aria-label={
        showHeading ? undefined : `${current.experiment} / ${current.variant} のプレビュー`
      }
    >
      {showHeading ? <h2 id={headingId}>{title}</h2> : null}
      {variants.length > 1 || !compact ? (
        <div className="live-controls">
          {variants.length > 1 ? (
            <SegmentedControl
              name={`${id}-variant`}
              legend="バリアント"
              value={current.variant}
              options={variants.map((item) => ({ value: item.variant, label: item.variant }))}
              onChange={setSelected}
            />
          ) : null}
          {compact ? null : (
            <SegmentedControl
              name={`${id}-width`}
              legend="表示幅"
              value={width}
              options={widths}
              onChange={setWidth}
            />
          )}
        </div>
      ) : null}
      <div className="live-frame-wrap">
        <iframe
          className="live-frame"
          title={`${current.experiment} / ${current.variant} のプレビュー`}
          src={current.previewPath}
          style={{ width: widthPx[width] }}
        />
      </div>
    </section>
  );
}
