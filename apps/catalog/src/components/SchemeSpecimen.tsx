import type { CSSProperties } from "react";
import type { ColorScheme, SchemeColor } from "../content/schemes";

type Props = {
  scheme?: ColorScheme;
  mode?: "light" | "dark";
};

export function SchemeSpecimen({ scheme, mode = "light" }: Props) {
  const colors = scheme ? (mode === "dark" ? scheme.dark : scheme.light) : undefined;
  return (
    <div className="scheme-specimen" style={colors ? schemeVars(colors) : undefined}>
      <p className="scheme-specimen-lede">本文は text、補足は text-muted で読む。</p>
      <p className="meta">面は surface、枠は border-strong である。</p>
      <p className="scheme-specimen-accent">色付き文字と罫線は accent-strong で示す。</p>
      <div className="scheme-specimen-actions">
        <span className="button button-primary">主ボタン</span>
        <span className="button">副ボタン</span>
        <input type="text" readOnly value="入力欄" aria-label="入力欄の見本" />
      </div>
    </div>
  );
}

export function schemeVars(colors: SchemeColor[]): CSSProperties {
  const style: Record<string, string> = {};
  for (const color of colors) style[color.cssName] = color.value;
  if (!style["--color-accent-strong"] && style["--color-accent-text"]) {
    style["--color-accent-strong"] = style["--color-accent-text"];
  }
  if (!style["--color-accent-text"] && style["--color-accent-strong"]) {
    style["--color-accent-text"] = style["--color-accent-strong"];
  }
  return style;
}
