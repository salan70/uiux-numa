import { useMemo, useState, type CSSProperties } from "react";
import type { CatalogToken } from "../content/tokens";

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
      <h2 id="playground-heading">Typography playground</h2>
      <div className="playground-controls">
        <label>
          role
          <select value={selected.name} onChange={(event) => setRole(event.target.value)}>
            {roles.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name.replace("typography.", "")}
              </option>
            ))}
          </select>
        </label>
        <label>
          表示幅 {width}rem
          <input
            type="range"
            min={16}
            max={48}
            value={width}
            onChange={(event) => setWidth(Number(event.target.value))}
          />
        </label>
      </div>
      <label className="playground-text">
        任意テキスト
        <textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} />
      </label>
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
