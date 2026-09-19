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
};

export function LivePreview({
  variants,
  title = "Live Preview",
  defaultVariant,
  showHeading = true,
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
      className="live-preview"
      aria-labelledby={showHeading ? headingId : undefined}
      aria-label={
        showHeading ? undefined : `${current.experiment} / ${current.variant} のプレビュー`
      }
    >
      {showHeading ? <h2 id={headingId}>{title}</h2> : null}
      <div className="live-controls">
        <SegmentedControl
          name={`${id}-variant`}
          legend="バリアント"
          value={current.variant}
          options={variants.map((item) => ({ value: item.variant, label: item.variant }))}
          onChange={setSelected}
        />
        <SegmentedControl
          name={`${id}-width`}
          legend="表示幅"
          value={width}
          options={widths}
          onChange={setWidth}
        />
      </div>
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
