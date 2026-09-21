import { useState, type CSSProperties } from "react";
import {
  contrastRatio,
  makePalette,
  schemes,
  type Mode,
  type Palette,
  type Scheme,
} from "./palettes";
import "./color-showcase.css";

const familyIds = ["primary", "secondary", "tertiary"] as const;
const familyLabels: Record<(typeof familyIds)[number], string> = {
  primary: "Primary / 主色",
  secondary: "Secondary / 副色",
  tertiary: "Tertiary / 第三色",
};
const familyRoles: Record<(typeof familyIds)[number], string[]> = {
  primary: ["primary", "on-primary", "primary-text", "primary-container", "on-primary-container"],
  secondary: ["secondary", "on-secondary", "secondary-container", "on-secondary-container"],
  tertiary: ["tertiary", "on-tertiary", "tertiary-container", "on-tertiary-container"],
};
const neutralRoles = [
  "background",
  "surface",
  "on-surface",
  "surface-container",
  "surface-variant",
  "on-surface-variant",
  "outline",
  "focus",
];
const statusRoles = ["success", "warning", "error"];

type Props = { schemeId?: string; overview?: boolean };

export function ColorShowcase({ schemeId, overview = false }: Props) {
  const selected = schemes.find((scheme) => scheme.id === schemeId);
  const [mode, setMode] = useState<Mode>(() =>
    new URLSearchParams(window.location.search).get("mode") === "dark" ? "dark" : "light",
  );

  if (overview) {
    return (
      <main className="cm-showcase cm-overview">
        <header className="cm-page-head">
          <p className="cm-kicker">COLOR SYSTEM / 2026</p>
          <h1>10 種の配色を比べる。</h1>
          <p>主色・副色・第 3 色の組み合わせを比べます。</p>
        </header>
        <div className="cm-overview-grid">
          {schemes.map((scheme) => (
            <OverviewCard key={scheme.id} scheme={scheme} />
          ))}
        </div>
        <p className="cm-overview-foot">
          各カードの見出しから、ライト・ダークの全役割を確認できます。
        </p>
      </main>
    );
  }

  if (!selected)
    return (
      <main className="cm-showcase">
        <p>配色が見つかりません。</p>
      </main>
    );
  const palette = makePalette(selected, mode);
  const style = paletteStyle(palette);
  const roleCount =
    Object.values(familyRoles).reduce((total, roles) => total + roles.length, 0) +
    neutralRoles.length +
    statusRoles.length;

  return (
    <main className="cm-showcase cm-detail" style={style} data-mode={mode}>
      <header className="cm-detail-head">
        <div>
          <p className="cm-kicker">COLOR STUDY / {selected.id.toUpperCase()}</p>
          <h1>{selected.label}</h1>
          <p>テーマ色はそのままに、使い方に合わせた派生色を加える。</p>
        </div>
        <div className="cm-mode-switch" role="group" aria-label="表示する配色モード">
          {(["light", "dark"] as const).map((choice) => (
            <button
              key={choice}
              type="button"
              aria-pressed={mode === choice}
              onClick={() => setMode(choice)}
            >
              {choice === "light" ? "ライト" : "ダーク"}
            </button>
          ))}
        </div>
      </header>

      <section className="cm-preview" aria-label="3 色を使った画面例">
        <div className="cm-preview-copy">
          <span
            className="cm-chip"
            style={roleStyle("tertiary-container", "on-tertiary-container")}
          >
            COLLECTION / 03
          </span>
          <h2>色は、役割を持つ。</h2>
          <p>
            3
            つの色相を、強さの違う場所に配分する。面の色は控えめにして、文字と操作を読みやすく保つ。
          </p>
          <div className="cm-preview-actions">
            <span className="cm-button" style={roleStyle("primary", "on-primary")}>
              Primary action
            </span>
            <span
              className="cm-button cm-button-container"
              style={roleStyle("secondary-container", "on-secondary-container")}
            >
              Secondary
            </span>
          </div>
        </div>
        <div className="cm-preview-panel" style={{ background: "var(--color-surface-container)" }}>
          <div className="cm-panel-top">
            <span>PALETTE NOTE</span>
            <span>03 / 10</span>
          </div>
          <div className="cm-mini-bars" aria-label="Primary、Secondary、Tertiary">
            {familyIds.map((family) => (
              <span key={family} style={{ background: `var(--color-${family})` }} />
            ))}
          </div>
          <p className="cm-panel-title">{selected.label}の色相</p>
          <div className="cm-panel-row">
            <span>Primary</span>
            <strong>{selected.primary.name}</strong>
          </div>
          <div className="cm-panel-row">
            <span>Secondary</span>
            <strong>{selected.secondary.name}</strong>
          </div>
          <div className="cm-panel-row">
            <span>Tertiary</span>
            <strong>{selected.tertiary.name}</strong>
          </div>
          <div className="cm-panel-note" style={roleStyle("surface-variant", "success")}>
            状態色はブランド色と分けて使う
          </div>
        </div>
      </section>

      <section className="cm-seed-section">
        <div className="cm-section-heading">
          <div>
            <p className="cm-kicker">KEY COLORS</p>
            <h2>3 つの色相</h2>
          </div>
          <p>テーマ名に沿う色を基準色にして、用途に合わせた派生色を作っています。</p>
        </div>
        <div className="cm-seed-grid">
          {familyIds.map((family) => {
            const seed = selected[family];
            return (
              <div className="cm-seed-card" key={family}>
                <div className="cm-seed-swatch" style={{ background: `var(--color-${family})` }} />
                <div className="cm-seed-meta">
                  <span>{familyLabels[family]}</span>
                  <strong>{seed.name}</strong>
                  <code>{seed.hex}</code>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="cm-role-section">
        <div className="cm-section-heading">
          <div>
            <p className="cm-kicker">COLOR ROLES</p>
            <h2>役割ごとの色</h2>
          </div>
          <p>全 {roleCount} 色。基準色を保ち、文字色は隣の色面と 4.5:1 以上を確保します。</p>
        </div>
        <div className="cm-role-groups">
          {familyIds.map((family) => (
            <RoleGroup
              key={family}
              title={familyLabels[family]}
              roles={familyRoles[family]}
              palette={palette}
            />
          ))}
          <RoleGroup title="Surface / 面・線" roles={neutralRoles} palette={palette} />
          <RoleGroup title="Status / 状態" roles={statusRoles} palette={palette} />
        </div>
      </section>
      <footer className="cm-detail-footer">
        COLOR SYSTEM STUDY{" "}
        <span>
          {selected.id} / {mode}
        </span>
      </footer>
    </main>
  );
}

function OverviewCard({ scheme }: { scheme: Scheme }) {
  const light = makePalette(scheme, "light");
  const dark = makePalette(scheme, "dark");
  return (
    <a className="cm-overview-card" href={`#color-schemes-material/${scheme.id}`}>
      <div className="cm-overview-card-head">
        <span>{scheme.label}</span>
        <code>{scheme.id}</code>
      </div>
      <div className="cm-overview-modes">
        <MiniPalette mode="light" scheme={scheme} palette={light} />
        <MiniPalette mode="dark" scheme={scheme} palette={dark} />
      </div>
      <div className="cm-overview-link">
        役割を見る <span aria-hidden="true">↗</span>
      </div>
    </a>
  );
}

function MiniPalette({ mode, scheme, palette }: { mode: Mode; scheme: Scheme; palette: Palette }) {
  const style = paletteStyle(palette);
  return (
    <div className={`cm-mini-palette cm-mini-${mode}`} style={style}>
      <div className="cm-mini-label">{mode === "light" ? "LIGHT" : "DARK"}</div>
      <div className="cm-mini-family-row">
        {familyIds.map((family) => (
          <span
            key={family}
            title={`${family}: ${scheme[family].name}`}
            style={{ background: palette[family], color: palette[`on-${family}`] }}
          >
            {family[0].toUpperCase()}
          </span>
        ))}
      </div>
      <div className="cm-mini-container-row">
        {familyIds.map((family) => (
          <span key={family} style={{ background: palette[`${family}-container`] }} />
        ))}
      </div>
    </div>
  );
}

function RoleGroup({
  title,
  roles,
  palette,
}: {
  title: string;
  roles: string[];
  palette: Palette;
}) {
  return (
    <section className="cm-role-group">
      <div className="cm-role-group-title">
        <h3>{title}</h3>
        <span>{roles.length} roles</span>
      </div>
      <div className="cm-role-grid">
        {roles.map((role) => (
          <RoleSwatch key={role} role={role} palette={palette} />
        ))}
      </div>
    </section>
  );
}

function RoleSwatch({ role, palette }: { role: string; palette: Palette }) {
  const [copied, setCopied] = useState(false);
  const color = palette[role];
  const isOnRole = role.startsWith("on-");
  const isStatus = statusRoles.includes(role);
  const onSurfaceRoles = ["outline", "focus", "primary-text"];
  const isTextRole = isOnRole || isStatus || onSurfaceRoles.includes(role);
  const pairedRole = isOnRole
    ? role.slice(3)
    : isStatus || onSurfaceRoles.includes(role)
      ? "surface"
      : role;
  const background = isTextRole ? palette[pairedRole] : color;
  const foreground = isTextRole
    ? color
    : (palette[`on-${role}`] ??
      (role === "surface-variant" ? palette["on-surface-variant"] : palette["on-surface"]));
  const ratio = contrastRatio(foreground, background);
  async function copyColor() {
    try {
      await navigator.clipboard?.writeText(color);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  }
  return (
    <button
      className="cm-role-swatch"
      type="button"
      onClick={copyColor}
      title={`${role} ${color} をコピー`}
      aria-label={`${role} ${color} をコピー`}
    >
      <span className="cm-role-color" style={{ background, color: foreground }}>
        {role}
        <small>
          {isTextRole ? `on-${pairedRole}` : `on-${role}` in palette ? `on-${role}` : "COLOR"}
        </small>
      </span>
      <span className="cm-role-meta">
        <code>{color}</code>
        <small>{copied ? "コピー済み" : `${ratio.toFixed(1)}:1`}</small>
      </span>
    </button>
  );
}

function roleStyle(background: string, foreground: string): CSSProperties {
  return { background: `var(--color-${background})`, color: `var(--color-${foreground})` };
}

function paletteStyle(palette: Palette): CSSProperties {
  return Object.fromEntries(
    Object.entries(palette).map(([role, value]) => [`--color-${role}`, value]),
  ) as CSSProperties;
}
