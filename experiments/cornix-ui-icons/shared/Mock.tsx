// Cornix Bonsai（board-desk、main 17fd920）でアイコンを置く箇所を、実寸で切り出した利用画面モック。
// 3 案で同じ部品を使い、違いは SVG だけにする。アイコンと語の対応は Cornix と同じにする。
import { useMemo, type CSSProperties } from "react";
import { makePalette, schemes, type Mode } from "../../color-schemes-material/shared/palettes";
import "./mock.css";

export type Icons = Record<string, string>;

/** 配布用 SVG を inline に展開する。意味は隣の文言か aria-label が担うので、アイコンは読み上げから外す。 */
function Icon({ svg, size = "md" }: { svg: string; size?: "sm" | "md" | "lg" }) {
  return (
    <span
      className={`cx-icon cx-icon--${size}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

const RAIL: [string, string, string][] = [
  ["keymap", "割り当て", "primary"],
  ["overview", "全体", "secondary"],
  ["behaviors", "動作", "tertiary"],
  ["validation", "検証", "primary"],
  ["device", "実機", "secondary"],
  ["files", "ファイル", "tertiary"],
];

export function Mock({ icons }: { icons: Icons }) {
  const mode: Mode =
    new URLSearchParams(window.location.search).get("mode") === "dark" ? "dark" : "light";
  const style = useMemo(() => {
    const palette = makePalette(
      schemes.find((s) => s.id === "pop-toy")!,
      mode,
    );
    return Object.fromEntries(
      Object.entries(palette).map(([k, v]) => [`--color-${k}`, v]),
    ) as CSSProperties;
  }, [mode]);
  const i = (name: string, size?: "sm" | "md" | "lg") => <Icon svg={icons[name]} size={size} />;

  return (
    <div className="cx" data-theme={mode} style={style}>
      <nav className="cx-rail" aria-label="作業">
        {RAIL.map(([name, label, tone], index) => (
          <button
            key={name}
            type="button"
            className={`cx-rail-btn tone-${tone}${index === 0 ? " is-on" : ""}`}
            aria-pressed={index === 0}
          >
            <span className="cx-rail-tile">{i(name, "lg")}</span>
            {label}
            {name === "validation" ? <span className="cx-count">6</span> : null}
          </button>
        ))}
      </nav>

      <main className="cx-main">
        <section className="cx-card">
          <h2>パネルの見出し</h2>
          <header className="cx-sheet-head tone-secondary">
            <strong>全体マップ</strong>
            <small>Cornix LP</small>
            <span className="cx-spacer" />
            <button type="button" className="cx-sheet-btn">
              {i("expand", "sm")} 全画面で表示
            </button>
            <button type="button" className="cx-sheet-btn">
              {i("close", "sm")} 閉じる <kbd>Esc</kbd>
            </button>
          </header>
          <header className="cx-sheet-head tone-tertiary">
            <strong>動作定義</strong>
            <small>全画面</small>
            <span className="cx-spacer" />
            <button type="button" className="cx-sheet-btn" aria-pressed="true">
              {i("collapse", "sm")} 元の大きさに戻す
            </button>
          </header>
        </section>

        <section className="cx-card">
          <h2>保存状態（編集パネル）</h2>
          <div className="cx-saves">
            <p className="cx-save is-saving">
              <span className="cx-save-icon">{i("saving", "sm")}</span>
              <strong>保存中…</strong>
            </p>
            <p className="cx-save is-saved">
              <span className="cx-save-icon">{i("check", "sm")}</span>
              <strong>ローカル保存済み（14:02）</strong>
            </p>
            <p className="cx-save is-error">
              <span className="cx-save-icon">{i("error", "sm")}</span>
              <strong>保存に失敗した</strong>
            </p>
            <p className="cx-save is-conflict">
              <span className="cx-save-icon">{i("warning", "sm")}</span>
              <strong>外部で変更されたため保存できない</strong>
            </p>
          </div>
          <p className="cx-link">{i("arrow-right", "sm")} layer 3（layer 3）を開く</p>
        </section>

        <section className="cx-card">
          <h2>encoder の帯</h2>
          <div className="cx-encoders">
            {[0, 1].map((n) => (
              <div className="cx-encoder" key={n}>
                <span className="cx-encoder-name">encoder {n}</span>
                <button type="button" className="cx-slot">
                  <span className="cx-slot-dir">{i("rotate-ccw", "sm")} 左回し</span>
                  <b>{n === 0 ? "VOLD" : "← ⌃"}</b>
                </button>
                <button type="button" className="cx-slot">
                  <span className="cx-slot-dir">{i("rotate-cw", "sm")} 右回し</span>
                  <b>{n === 0 ? "VOLU" : "→ ⌘"}</b>
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="cx-card">
          <h2>検証の一覧</h2>
          <ul className="cx-diags">
            <li className="is-error">
              <span className="cx-sev">{i("error", "sm")} エラー</span>
              <code>compatibility/matrix-shape-mismatch</code>
            </li>
            <li className="is-warning">
              <span className="cx-sev">{i("warning", "sm")} 警告</span>
              <code>reference/out-of-range</code>
            </li>
            <li className="is-information">
              <span className="cx-sev">{i("info", "sm")} 情報</span>
              <code>reachability/unreachable-layer</code>
            </li>
          </ul>
        </section>

        <section className="cx-card">
          <h2>Apply の段階</h2>
          <ol className="cx-steps">
            {["backup", "差分確認", "確認", "書き込み", "結果"].map((s, n) => (
              <li key={s} className={n < 2 ? "is-done" : n === 2 ? "is-current" : ""}>
                <span className="cx-step-no">{n < 2 ? i("check", "sm") : n + 1}</span>
                {s}
              </li>
            ))}
          </ol>
        </section>
      </main>

      <footer className="cx-status">
        <button type="button" className="cx-sev-btn is-error" aria-label="エラー 1 件。検証を開く">
          {i("error", "sm")} 1
        </button>
        <button type="button" className="cx-sev-btn is-warning" aria-label="警告 5 件。検証を開く">
          {i("warning", "sm")} 5
        </button>
        <button
          type="button"
          className="cx-sev-btn is-information"
          aria-label="情報 1 件。検証を開く"
        >
          {i("info", "sm")} 1
        </button>
        <span className="cx-status-save">
          ローカル保存済み <code>keymap.yaml</code>
        </span>
        <span className="cx-spacer" />
        <span className="cx-muted">実機との差分 3 件</span>
        <button type="button" className="cx-apply">
          実機へ Apply…
        </button>
      </footer>
    </div>
  );
}
