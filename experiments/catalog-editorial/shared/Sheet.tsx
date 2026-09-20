// 色と文字だけの見本（sheet 画面）。
// 画面を作る前に、配色と文字階梯だけを見て判断してもらうために置く。
// 構造は 4 案で共通にし、見た目は各 variant の CSS が作る。
// 同じ内容を同じ順で並べるほど、案の差が造形の差だけになる。
import type { ReactNode } from "react";
import { contrastRatio, formatRatio, passes } from "./contrast";
import { works } from "./data";

export type Mode = "light" | "dark";

export type PaletteEntry = {
  /** 日本語の役割名。画面語彙は日本語にする。 */
  role: string;
  /** この案の CSS カスタムプロパティ名。 */
  cssVar: string;
  light: string;
  dark: string;
  /** 参照元。既定パレットに寄せず、参照色から選んだ根拠を残す。 */
  reference: string;
  intent: string;
  /** コントラストの検査。相手は同じ表の cssVar を指す。 */
  check?: { against: string; minimum: 4.5 | 3 };
};

export type TypeStep = {
  name: string;
  /** CSS の font-size。実寸で組んで見せる。 */
  size: string;
  weight: 400 | 700;
  lineHeight: string;
  tracking: string;
  use: string;
  intent: string;
  /** 見本に使う文字列。省略すると実データの題名を使う。 */
  sample?: string;
};

export type SpaceStep = {
  name: string;
  value: string;
  use: string;
};

export type SheetSpec = {
  id: string;
  title: string;
  hypothesis: string;
  /** 「紙」の呼び名。案ごとの比喩を 1 語で示す。 */
  paper: string;
  palette: PaletteEntry[];
  paletteNote: string;
  type: TypeStep[];
  typeNote: string;
  space: SpaceStep[];
  grid: { wide: string; narrow: string; columns: number; intent: string };
  /** 部品の静止見本。案ごとの造形で描く。 */
  parts: ReactNode;
  /** 利用者に決めてもらうこと。 */
  open: string[];
};

/** 実データで一番長い題名。折返しの上限を確かめる。 */
export const longestTitle = works.reduce((a, b) => (b.title.length > a.length ? b.title : a), "");
/** 実データで一番短い題名。1 行に収まる下限を確かめる。 */
export const shortestTitle = works.reduce(
  (a, b) => (b.title.length < a.length ? b.title : a),
  longestTitle,
);
/** 実データの本文。行長の見本に使う。 */
export const sampleLead =
  works.find((item) => item.lead.length > 20)?.lead ?? "成果物を見て、触って、選ぶための面を作る。";

export function Sheet({ spec }: { spec: SheetSpec }): ReactNode {
  return (
    <div className="ed-sheet">
      <header className="ed-sheet__head">
        <p className="ed-sheet__kicker">色と文字の見本</p>
        <h1 className="ed-sheet__title">{spec.title}</h1>
        <p className="ed-sheet__hypothesis">{spec.hypothesis}</p>
        <dl className="ed-sheet__facts">
          <div>
            <dt>案の id</dt>
            <dd>
              <code>{spec.id}</code>
            </dd>
          </div>
          <div>
            <dt>紙</dt>
            <dd>{spec.paper}</dd>
          </div>
          <div>
            <dt>書体</dt>
            <dd>LINE Seed JP 400 / 700</dd>
          </div>
        </dl>
      </header>

      <section className="ed-sheet__section" aria-labelledby="sheet-color">
        <h2 className="ed-sheet__h2" id="sheet-color">
          配色の役割
        </h2>
        <p className="ed-sheet__note">{spec.paletteNote}</p>
        <PaletteTable entries={spec.palette} />
      </section>

      <section className="ed-sheet__section" aria-labelledby="sheet-type">
        <h2 className="ed-sheet__h2" id="sheet-type">
          文字の階梯
        </h2>
        <p className="ed-sheet__note">{spec.typeNote}</p>
        <ol className="ed-sheet__scale">
          {spec.type.map((step) => (
            <li className="ed-sheet__step" key={step.name}>
              <p className="ed-sheet__step-meta">
                <span className="ed-sheet__step-name">{step.name}</span>
                <span>{step.size}</span>
                <span>{step.weight}</span>
                <span>行 {step.lineHeight}</span>
                <span>字間 {step.tracking}</span>
              </p>
              <p
                className="ed-sheet__step-sample"
                style={{
                  fontSize: step.size,
                  fontWeight: step.weight,
                  lineHeight: step.lineHeight,
                  letterSpacing: step.tracking,
                }}
              >
                {step.sample ?? longestTitle}
              </p>
              <p className="ed-sheet__step-intent">
                <span className="ed-sheet__step-use">{step.use}</span>
                {step.intent}
              </p>
            </li>
          ))}
        </ol>
        <div className="ed-sheet__measure">
          <p className="ed-sheet__note">本文の行長</p>
          <p className="ed-sheet__measure-body">{sampleLead}</p>
          <p className="ed-sheet__step-intent">
            実データの Problem 節から取った 1 文で組んでいる。
          </p>
        </div>
      </section>

      <section className="ed-sheet__section" aria-labelledby="sheet-space">
        <h2 className="ed-sheet__h2" id="sheet-space">
          余白の刻み
        </h2>
        <ul className="ed-sheet__space">
          {spec.space.map((step) => (
            <li key={step.name}>
              <span className="ed-sheet__space-bar" style={{ inlineSize: step.value }} />
              <span className="ed-sheet__space-name">{step.name}</span>
              <span className="ed-sheet__space-value">{step.value}</span>
              <span className="ed-sheet__space-use">{step.use}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="ed-sheet__section" aria-labelledby="sheet-grid">
        <h2 className="ed-sheet__h2" id="sheet-grid">
          グリッド
        </h2>
        <p className="ed-sheet__note">{spec.grid.intent}</p>
        <div
          className="ed-sheet__grid"
          style={{ "--ed-sheet-cols": spec.grid.columns } as React.CSSProperties}
          aria-hidden="true"
        >
          {Array.from({ length: spec.grid.columns }, (_, index) => (
            <span key={index} />
          ))}
        </div>
        <dl className="ed-sheet__facts">
          <div>
            <dt>1280</dt>
            <dd>{spec.grid.wide}</dd>
          </div>
          <div>
            <dt>390</dt>
            <dd>{spec.grid.narrow}</dd>
          </div>
        </dl>
      </section>

      <section className="ed-sheet__section" aria-labelledby="sheet-parts">
        <h2 className="ed-sheet__h2" id="sheet-parts">
          部品の静止
        </h2>
        <div className="ed-sheet__parts">{spec.parts}</div>
      </section>

      <section className="ed-sheet__section" aria-labelledby="sheet-open">
        <h2 className="ed-sheet__h2" id="sheet-open">
          決めてほしいこと
        </h2>
        <ul className="ed-sheet__open">
          {spec.open.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function PaletteTable({ entries }: { entries: PaletteEntry[] }): ReactNode {
  return (
    <div className="ed-sheet__table-wrap">
      <table className="ed-sheet__table">
        <thead>
          <tr>
            <th scope="col">役割</th>
            <th scope="col">ライト</th>
            <th scope="col">ダーク</th>
            <th scope="col">参照</th>
            <th scope="col">意図</th>
            <th scope="col">コントラスト</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => (
            <tr key={entry.cssVar}>
              <th scope="row">
                {entry.role}
                <code>{entry.cssVar}</code>
              </th>
              <td>
                <Swatch value={entry.light} />
              </td>
              <td>
                <Swatch value={entry.dark} />
              </td>
              <td className="ed-sheet__ref-cell">{entry.reference}</td>
              <td className="ed-sheet__intent-cell">{entry.intent}</td>
              <td>
                <ContrastCell entry={entry} entries={entries} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Swatch({ value }: { value: string }): ReactNode {
  return (
    <span className="ed-sheet__swatch">
      <span className="ed-sheet__chip" style={{ background: value }} />
      <code>{value}</code>
    </span>
  );
}

function ContrastCell({
  entry,
  entries,
}: {
  entry: PaletteEntry;
  entries: PaletteEntry[];
}): ReactNode {
  if (!entry.check) return <span className="ed-sheet__dash">—</span>;
  const against = entries.find((item) => item.cssVar === entry.check?.against);
  if (!against) return <span className="ed-sheet__dash">—</span>;
  const minimum = entry.check.minimum;
  const rows: Array<{ mode: Mode; label: string; ratio: number }> = (
    ["light", "dark"] as Mode[]
  ).map((mode) => ({
    mode,
    label: mode === "light" ? "ライト" : "ダーク",
    ratio: contrastRatio(entry[mode], against[mode]),
  }));
  return (
    <span className="ed-sheet__contrast">
      <span className="ed-sheet__contrast-target">
        対 {against.role} / {minimum}:1
      </span>
      {rows.map((row) => (
        <span
          className="ed-sheet__contrast-row"
          key={row.mode}
          data-pass={passes(row.ratio, minimum) ? "true" : "false"}
        >
          {row.label} {formatRatio(row.ratio)}
          <span className="ed-sheet__contrast-mark">
            {passes(row.ratio, minimum) ? "合格" : "不足"}
          </span>
        </span>
      ))}
    </span>
  );
}
