import { Field } from "@base-ui/react/field";
import { Slider } from "@base-ui/react/slider";
import { useMemo, useState, type CSSProperties } from "react";
import type { CatalogToken } from "../content/tokens";
import { SelectField } from "./SelectField";

type Props = {
  roles: CatalogToken[];
};

export function TypographyPlayground({ roles }: Props) {
  const [role, setRole] = useState(roles[0]?.name ?? "");
  const [text, setText] = useState("日本語プロダクト UI の見出しと本文を、同じ画面で確認する。");
  const [width, setWidth] = useState(40);

  const selected = useMemo(
    () => roles.find((item) => item.name === role) ?? roles[0],
    [role, roles],
  );
  const style = useMemo(() => typographyStyle(selected?.resolvedValue), [selected]);

  if (!selected) return null;

  return (
    <section className="playground" aria-labelledby="playground-heading">
      <h2 id="playground-heading">試し書き</h2>
      <div className="playground-controls">
        <SelectField
          label="役割"
          value={selected.name}
          options={roles.map((item) => ({
            value: item.name,
            label: item.name.replace("typography.", ""),
          }))}
          onChange={setRole}
        />
        <Slider.Root
          className="slider"
          value={width}
          min={16}
          max={48}
          onValueChange={(next) => setWidth(next)}
        >
          <div className="slider-head">
            <Slider.Label className="select-label">表示幅: {width} rem</Slider.Label>
          </div>
          <Slider.Control className="slider-control">
            <Slider.Track className="slider-track">
              <Slider.Indicator className="slider-indicator" />
              <Slider.Thumb aria-label="表示幅" className="slider-thumb" />
            </Slider.Track>
          </Slider.Control>
        </Slider.Root>
      </div>
      <Field.Root className="playground-text">
        <Field.Label>サンプルテキスト</Field.Label>
        <Field.Control
          render={
            <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} />
          }
        />
      </Field.Root>
      <div className="playground-stage" style={{ maxWidth: `${width}rem` }}>
        <p style={style}>{text}</p>
      </div>
    </section>
  );
}

function typographyStyle(value: unknown): CSSProperties {
  if (!value || typeof value !== "object") return {};
  const fields = value as Record<string, unknown>;
  const family = Array.isArray(fields.fontFamily) ? fields.fontFamily.join(", ") : undefined;
  const size = dimension(fields.fontSize);
  const tracking = dimension(fields.letterSpacing);
  return {
    fontFamily: family,
    fontSize: size,
    fontWeight: typeof fields.fontWeight === "number" ? fields.fontWeight : undefined,
    letterSpacing: tracking,
    lineHeight: typeof fields.lineHeight === "number" ? fields.lineHeight : undefined,
    margin: 0,
  };
}

function dimension(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as { value?: unknown; unit?: unknown };
  if (typeof record.value === "number" && typeof record.unit === "string") {
    return `${record.value}${record.unit}`;
  }
  return undefined;
}
