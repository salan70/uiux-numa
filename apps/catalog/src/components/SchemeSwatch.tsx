import type { SchemeColor } from "../content/schemes";

type Props = {
  color: SchemeColor;
};

export function SchemeSwatch({ color }: Props) {
  return (
    <figure className="scheme-swatch">
      <div
        className="scheme-swatch-color"
        style={{ backgroundColor: color.value }}
        aria-label={`${color.role} / ${color.name}`}
      />
      <figcaption>
        <code>{color.role}</code>
        <span>{color.name}</span>
      </figcaption>
    </figure>
  );
}
