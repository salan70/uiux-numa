import { useState } from "react";
import { CopyButton } from "../components/CopyButton";
import { Link } from "../components/Link";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { SegmentedControl } from "../components/SegmentedControl";
import { catalog } from "../content/collect";
import {
  formatRatio,
  hexFromCssColor,
  contrastRatioFromCss,
  passesWcag,
  ROLE_CONTRAST,
  ROLE_GROUPS,
} from "../content/contrast";
import type { ColorScheme, SchemeColor } from "../content/schemes";
import { NotFoundPage } from "./NotFoundPage";

export function ColorsPage() {
  const experiment = catalog.experiments.find((item) => item.slug === "color-schemes");
  const adoptedIds = experiment?.adopted ?? [];
  const adopted = adoptedIds
    .map((id) => catalog.schemes.find((scheme) => scheme.id === id))
    .filter((scheme): scheme is ColorScheme => Boolean(scheme));
  const rejected = catalog.schemes.filter((scheme) => !adoptedIds.includes(scheme.id));

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Foundations</p>
        <h1>Colors</h1>
        <p className="lede">採用した配色を正として掲載する。却下案は比較資料として残す。</p>
      </div>
      <section aria-labelledby="adopted-colors-heading">
        <h2 id="adopted-colors-heading">採用</h2>
        <SchemeList schemes={adopted} />
      </section>
      <section aria-labelledby="rejected-colors-heading">
        <h2 id="rejected-colors-heading">比較資料</h2>
        <p className="lede">評価の前に却下した 4 案である。</p>
        <SchemeList schemes={rejected} />
      </section>
      <section aria-labelledby="colors-usage-heading">
        <h2 id="colors-usage-heading">使い方</h2>
        <p>
          各 variant の <code>scheme.css</code> を読み、ルート要素へ <code>cs-{"{id}"}</code>{" "}
          クラスを付ける。
        </p>
        <p>
          例: <code>{`<div className="cs-sumi">`}</code>
        </p>
      </section>
    </>
  );
}

export function ColorDetailPage({ scheme: schemeId }: { scheme: string }) {
  const scheme = catalog.schemes.find((item) => item.id === schemeId);
  const [mode, setMode] = useState<"light" | "dark">("light");
  if (!scheme) return <NotFoundPage />;
  const colors = mode === "dark" ? scheme.dark : scheme.light;
  const byRole = new Map(colors.map((color) => [color.role, color]));

  return (
    <>
      <div className="page-intro">
        <p className="crumb">
          <Link href="/foundations/colors">Colors</Link>
        </p>
        <p className="eyebrow">配色</p>
        <h1>
          {scheme.id} <span className="meta">（{scheme.label}）</span>
        </h1>
      </div>
      <SegmentedControl
        name="color-mode"
        legend="表示"
        value={mode}
        options={[
          { value: "light", label: "Light" },
          { value: "dark", label: "Dark" },
        ]}
        onChange={setMode}
      />
      {ROLE_GROUPS.map((group) => (
        <section key={group.id} aria-labelledby={`${scheme.id}-${group.id}-heading`}>
          <h2 id={`${scheme.id}-${group.id}-heading`}>{group.label}</h2>
          <div className="token-table-wrap">
            <table className="token-table">
              <caption>
                {scheme.id} / {group.label} / {mode}
              </caption>
              <colgroup>
                <col className="color-col-role" />
                <col className="color-col-ja" />
                <col className="color-col-hex" />
                <col className="color-col-contrast" />
                <col className="color-col-copy" />
              </colgroup>
              <thead>
                <tr>
                  <th scope="col">role</th>
                  <th scope="col">和名</th>
                  <th scope="col">HEX</th>
                  <th scope="col">コントラスト比</th>
                  <th scope="col">Copy</th>
                </tr>
              </thead>
              <tbody>
                {group.roles.map((role) => {
                  const color = byRole.get(role);
                  if (!color) return null;
                  return (
                    <tr key={role}>
                      <th scope="row">
                        <code>{color.cssName}</code>
                      </th>
                      <td>{color.name}</td>
                      <td>
                        <span className="hex-swatch">
                          <span
                            className="hex-swatch-chip"
                            style={{ backgroundColor: color.value }}
                          />
                          <code>{safeHex(color.value)}</code>
                        </span>
                      </td>
                      <td>{contrastCell(color, byRole)}</td>
                      <td>
                        <CopyButton value={color.cssName} label={color.cssName} showValue={false} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <section aria-labelledby="color-usage-heading">
        <h2 id="color-usage-heading">使い方</h2>
        <p>
          <code>{scheme.sourcePath}</code> を読み、
          <code>{`<div className="cs-${scheme.id}">`}</code> で配色を有効にする。
        </p>
      </section>
    </>
  );
}

function SchemeList({ schemes }: { schemes: ColorScheme[] }) {
  return (
    <ul className="scheme-list">
      {schemes.map((scheme) => (
        <li key={scheme.id}>
          <article className="scheme-card">
            <header>
              <h3>
                <Link href={`/foundations/colors/${scheme.id}`}>
                  {scheme.id} <span className="meta">（{scheme.label}）</span>
                </Link>
              </h3>
            </header>
            <div className="home-swatch-row">
              {scheme.light.slice(0, 6).map((color) => (
                <SchemeSwatch color={color} key={color.cssName} />
              ))}
            </div>
          </article>
        </li>
      ))}
    </ul>
  );
}

function contrastCell(color: SchemeColor, byRole: Map<string, SchemeColor>) {
  const pair = ROLE_CONTRAST[color.role];
  if (!pair) {
    return (
      <div className="contrast-cell">
        <span>—</span>
        <span>—</span>
        <span>—</span>
      </div>
    );
  }
  const background = byRole.get(pair.against);
  if (!background) {
    return (
      <div className="contrast-cell">
        <span>—</span>
        <span>—</span>
        <span>—</span>
      </div>
    );
  }
  try {
    const ratio = contrastRatioFromCss(color.value, background.value);
    const normal = passesWcag(ratio, 4.5);
    const large = passesWcag(ratio, 3);
    return (
      <div className="contrast-cell">
        <span className="tabular">
          {formatRatio(ratio)}（{color.role} / {pair.against}）
        </span>
        <span className={normal ? "contrast-verdict-pass" : "contrast-verdict-fail"}>
          {normal ? "4.5:1 合格" : "4.5:1 不合格"}
        </span>
        <span className={large ? "contrast-verdict-pass" : "contrast-verdict-fail"}>
          {large ? "3:1 合格" : "3:1 不合格"}
        </span>
      </div>
    );
  } catch {
    return (
      <div className="contrast-cell">
        <span>—</span>
        <span>—</span>
        <span>—</span>
      </div>
    );
  }
}

function safeHex(value: string): string {
  try {
    return hexFromCssColor(value);
  } catch {
    return value;
  }
}
