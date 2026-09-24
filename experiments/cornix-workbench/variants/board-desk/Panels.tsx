import { useEffect, useRef, useState, type ReactNode } from "react";
import { Button } from "../../../button/shared/Button";
import { cornix, fixture, keyId, type Diagnostic, type DiffRow } from "../../shared/fixture";
import {
  macLayoutOf,
  subjectLabel,
  viewOf,
  type CornixDoc,
  type TargetId,
} from "../../shared/model";
import type { DevicePhase } from "./state";

export const SEVERITY = {
  error: { icon: "⛔", label: "エラー" },
  warning: { icon: "⚠", label: "警告" },
  information: { icon: "ⓘ", label: "情報" },
} as const;

export type PanelSize = "window" | "full";

/**
 * 左端の入口から開く作業パネル。画面中央の modal で開き、全画面へ広げられる。
 * Esc と × でいつでも閉じられる。途中で閉じられない Apply とはここで区別する。
 */
export function PanelDialog({
  tone,
  title,
  subtitle,
  size,
  onSize,
  onClose,
  children,
}: {
  /** 見出しの帯の色。tone-* の class 名。 */
  tone: string;
  title: string;
  subtitle: string;
  size: PanelSize;
  onSize: (size: PanelSize) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    heading.current?.focus();
    return () => dialog?.close();
  }, []);
  const full = size === "full";
  return (
    <dialog
      ref={ref}
      className={`bd-sheet is-${size} ${tone}`}
      aria-labelledby="bd-sheet-title"
      onCancel={(e) => {
        e.preventDefault();
        onClose();
      }}
      onClick={(e) => {
        // 背景（dialog 自身）を押したら閉じる。中身の余白では閉じない。
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <header className="bd-sheet-head">
        <h2 id="bd-sheet-title" ref={heading} tabIndex={-1}>
          {title}
          <small>{subtitle}</small>
        </h2>
        <span className="bd-spacer" />
        <button
          type="button"
          className="bd-sheet-btn"
          aria-pressed={full}
          onClick={() => onSize(full ? "window" : "full")}
        >
          <span aria-hidden="true">{full ? "⤡" : "⤢"}</span>{" "}
          {full ? "元の大きさに戻す" : "全画面で表示"}
        </button>
        <button type="button" className="bd-sheet-btn" onClick={onClose}>
          × 閉じる <kbd>Esc</kbd>
        </button>
      </header>
      <div className="bd-sheet-body">{children}</div>
    </dialog>
  );
}

export const layerTone = (layer: number) =>
  (["primary", "secondary", "tertiary"] as const)[layer % 3];

/* ---------- 全体マップ ---------- */

export function OverviewPanel({
  doc,
  names,
  layerNames,
  onRenameLayer,
  onOpenLayer,
  onExport,
  currentLayer,
}: {
  doc: CornixDoc;
  names: Record<string, string>;
  layerNames: Record<number, string>;
  onRenameLayer: (layer: number, name: string) => void;
  onOpenLayer: (layer: number) => void;
  onExport: (kind: "SVG" | "PDF") => void;
  currentLayer: number;
}) {
  const [showHidden, setShowHidden] = useState(false);
  const [hot, setHot] = useState<string | null>(null);
  const layers = showHidden
    ? [...cornix.overview.visibleLayers, ...cornix.overview.hiddenLayers]
    : cornix.overview.visibleLayers;
  const unit = 22;
  const { width, height } = cornix.board.metrics;
  return (
    <>
      <div className="bd-sheet-tools">
        <label className="bd-check">
          <input
            type="checkbox"
            checked={showHidden}
            onChange={(e) => setShowHidden(e.target.checked)}
          />
          参照なしの layer も表示（{cornix.overview.hiddenLayers.length} 件）
        </label>
        <span className="bd-spacer" />
        <Button size="small" appearance="secondary" onClick={() => onExport("SVG")}>
          layer {currentLayer} を SVG で書き出す
        </Button>
        <Button size="small" appearance="secondary" onClick={() => onExport("PDF")}>
          PDF
        </Button>
      </div>
      <div className="bd-ov-grid">
        {layers.map((l) => {
          const refs = cornix.overview.references.filter((r) => r.targetLayer === l);
          const name = layerNames[l] ?? cornix.layers[l].name;
          return (
            <section
              key={l}
              className={`bd-ov-card tone-${layerTone(l)}`}
              aria-labelledby={`bd-ov-${l}`}
            >
              <header>
                <span className="bd-layer-badge">L{l}</span>
                <input
                  id={`bd-ov-${l}`}
                  className="bd-ov-name"
                  aria-label={`layer ${l} の表示名`}
                  defaultValue={layerNames[l] ?? ""}
                  placeholder={cornix.layers[l].name}
                  onBlur={(e) => onRenameLayer(l, e.target.value.trim())}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                />
                {cornix.references.unreachableLayers.includes(l) ? (
                  <span className="bd-tag is-warn">到達不能</span>
                ) : null}
                <Button size="small" appearance="quiet" onClick={() => onOpenLayer(l)}>
                  開く
                </Button>
              </header>
              <div
                className="bd-ov-board"
                style={{ width: width * unit, height: height * unit }}
                aria-hidden="true"
              >
                {cornix.board.keys.map((k) => {
                  const raw = doc.keys[l][keyId(k.row, k.col)];
                  const v = viewOf(raw, names);
                  const id = `key:${l}:${k.row}:${k.col}`;
                  return (
                    <span
                      key={id}
                      className={`bd-mini is-${v.kind}${hot === id ? " is-hot" : ""}`}
                      style={{
                        left: k.box.left * unit,
                        top: k.box.top * unit,
                        width: k.box.width * unit - 1,
                        height: k.box.height * unit - 1,
                        transform: k.box.angle ? `rotate(${k.box.angle}deg)` : undefined,
                        transformOrigin: k.box.angle
                          ? `${k.box.originX * unit}px ${k.box.originY * unit}px`
                          : undefined,
                      }}
                    >
                      {raw === "KC_NO" ? "—" : raw === "KC_TRNS" ? "↓" : v.primary}
                    </span>
                  );
                })}
              </div>
              {refs.length > 0 ? (
                <ul className="bd-ov-refs" aria-label={`layer ${l} への参照元`}>
                  {refs.map((r) => (
                    <li key={r.source.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setHot(r.source.id)}
                        onMouseLeave={() => setHot(null)}
                        onFocus={() => setHot(r.source.id)}
                        onBlur={() => setHot(null)}
                        onClick={() => r.source.layer !== undefined && onOpenLayer(r.source.layer)}
                      >
                        ← L{r.source.layer} row {r.source.row} col {r.source.col}{" "}
                        <code>{r.source.keycode}</code>
                        <span className="bd-muted">（{r.action}）</span>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="bd-muted">{l === 0 ? "起点の layer" : "参照元なし"}</p>
              )}
            </section>
          );
        })}
      </div>
      <section className="bd-ov-td" aria-labelledby="bd-ov-td">
        <h3 id="bd-ov-td">使用中の Tap Dance</h3>
        {cornix.overview.tapDances.map((t) => {
          const td = cornix.tapDances[t.index];
          return (
            <p key={t.index}>
              <code>TD({t.index})</code> tap {td.tap.display.full.primary}{" "}
              {td.tap.display.full.role} · double {td.doubleTap.display.full.primary}{" "}
              {td.doubleTap.display.full.role} · {td.timeoutMs}ms · {t.usageCount} か所
            </p>
          );
        })}
      </section>
    </>
  );
}

/* ---------- 動作定義 ---------- */

export function BehaviorsPanel({ onSaved }: { onSaved: () => void }) {
  const [tab, setTab] = useState<"td" | "combo" | "settings">("td");
  const [values, setValues] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const commit = (key: string, value: string) => {
    const n = Number(value);
    if (!/^\d+$/.test(value) || n > 65535) {
      setErrors((e) => ({ ...e, [key]: "0〜65535 の整数を入れる。保存していない。" }));
      return;
    }
    setErrors((e) => ({ ...e, [key]: "" }));
    onSaved();
  };
  const numberField = (key: string, label: string, initial: number) => (
    <label className={`bd-num${errors[key] ? " is-invalid" : ""}`}>
      <span>{label}</span>
      <input
        inputMode="numeric"
        value={values[key] ?? String(initial)}
        aria-invalid={Boolean(errors[key])}
        aria-describedby={errors[key] ? `${key}-err` : undefined}
        onChange={(e) => setValues((v) => ({ ...v, [key]: e.target.value }))}
        onBlur={(e) => commit(key, e.target.value)}
      />
      {errors[key] ? (
        <span id={`${key}-err`} className="bd-error-text">
          × {errors[key]}
        </span>
      ) : null}
    </label>
  );
  const usedTd = cornix.tapDances.filter((t) => t.usageCount > 0);
  const usedCombos = cornix.combos.filter((c) => c.output.raw !== "KC_NO");
  return (
    <>
      <div className="bd-tabs" role="tablist" aria-label="動作定義">
        {(
          [
            ["td", `Tap Dance（使用中 ${usedTd.length} / ${cornix.tapDances.length}）`],
            ["combo", `Combo（使用中 ${usedCombos.length} / ${cornix.combos.length}）`],
            ["settings", `Settings（${cornix.settings.length}）`],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            className={tab === id ? "is-on" : ""}
            onClick={() => setTab(id)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "td" ? (
        <div className="bd-behaviors">
          {cornix.tapDances.slice(0, 6).map((t) => (
            <section key={t.index} className={`bd-td${t.usageCount ? " is-used" : ""}`}>
              <h3>
                <code>TD({t.index})</code>{" "}
                {t.usageCount ? (
                  <span className="bd-tag is-on">{t.usageCount} か所で使用</span>
                ) : (
                  <span className="bd-tag">未使用</span>
                )}
              </h3>
              <dl>
                {(
                  [
                    ["tap", t.tap],
                    ["hold", t.hold],
                    ["double tap", t.doubleTap],
                    ["hold after tap", t.holdAfterTap],
                  ] as const
                ).map(([k, a]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>
                      {a.display.full.primary} {a.display.full.role ?? ""} <code>{a.raw}</code>
                    </dd>
                  </div>
                ))}
              </dl>
              {numberField(`td-${t.index}`, "timeout（ms）", t.timeoutMs)}
            </section>
          ))}
          <p className="bd-muted">
            残り {cornix.tapDances.length - 6} 件は未使用。本体では一覧を続けて表示する。
          </p>
        </div>
      ) : null}
      {tab === "combo" ? (
        <div className="bd-behaviors">
          <p className="bd-muted">この workspace の Combo は 32 件すべてが空（KC_NO）。</p>
          {cornix.combos.slice(0, 3).map((c) => (
            <section key={c.index} className="bd-td">
              <h3>
                <code>Combo {c.index}</code> <span className="bd-tag">空</span>
              </h3>
              <p>
                入力 {c.inputs.map((i) => i.display.compact.primary).join(" + ")} → 出力{" "}
                {c.output.display.compact.primary}
              </p>
            </section>
          ))}
        </div>
      ) : null}
      {tab === "settings" ? (
        <div className="bd-behaviors bd-settings">
          {cornix.settings.map((s) => (
            <div key={s.qsid}>
              {numberField(`qsid-${s.qsid}`, `${s.settingLabel}（qsid ${s.qsid}）`, s.value)}
            </div>
          ))}
        </div>
      ) : null}
    </>
  );
}

/* ---------- 検証 ---------- */

export function ValidationPanel({
  target,
  diagnostics,
  onJump,
}: {
  target: TargetId;
  diagnostics: Diagnostic[];
  onJump: (d: Diagnostic) => void;
}) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const groups = new Map<string, Diagnostic[]>();
  for (const d of diagnostics) groups.set(d.code, [...(groups.get(d.code) ?? []), d]);
  const isMac = target !== "cornix";
  const macRefs = isMac ? macLayoutOf(target).references : undefined;
  return (
    <>
      <section aria-labelledby="bd-diag-title">
        <h3 id="bd-diag-title" className="bd-section-title">
          診断 {diagnostics.length} 件
        </h3>
        {diagnostics.length === 0 ? <p className="bd-muted">診断はない。</p> : null}
        <ul className="bd-diags">
          {[...groups.entries()].map(([code, items]) => {
            const [first, ...rest] = items;
            const s = SEVERITY[first.severity];
            const row = (d: Diagnostic) => (
              <li key={d.id} className={`bd-diag is-${d.severity}`}>
                <span className="bd-diag-sev">
                  <span aria-hidden="true">{s.icon}</span> {s.label}
                </span>
                <div>
                  <code>{d.code}</code>
                  <p>{d.message}</p>
                </div>
                {d.subject.kind === "key" ||
                d.subject.kind === "layer" ||
                d.subject.kind === "encoder" ? (
                  <Button size="small" appearance="quiet" onClick={() => onJump(d)}>
                    {subjectLabel(d.subject as DiffRow["subject"])} へ
                  </Button>
                ) : (
                  <span className="bd-muted">{subjectLabel(d.subject as DiffRow["subject"])}</span>
                )}
              </li>
            );
            return (
              <li key={code} className="bd-diag-group">
                <ul>
                  {row(first)}
                  {rest.length > 0 ? (
                    <li>
                      <button
                        type="button"
                        className="bd-link"
                        aria-expanded={Boolean(open[code])}
                        onClick={() => setOpen((o) => ({ ...o, [code]: !o[code] }))}
                      >
                        同じ code の残り {rest.length} 件を{open[code] ? "畳む" : "表示"}
                      </button>
                    </li>
                  ) : null}
                  {open[code] ? rest.map(row) : null}
                </ul>
              </li>
            );
          })}
        </ul>
        <p className="bd-hint">
          Apply を止めるかどうかは Apply 側の判定で決まる。error は常に止め、warning は Apply
          の確認で承認する。
        </p>
      </section>
      {isMac && macRefs ? (
        <section aria-labelledby="bd-ref-title">
          <h3 id="bd-ref-title" className="bd-section-title">
            ファイルと適用先
          </h3>
          <dl className="bd-kv">
            <dt>ファイル</dt>
            <dd>
              <code>{macRefs.file}</code>
            </dd>
            <dt>物理配列</dt>
            <dd>{macRefs.layout}</dd>
            <dt>適用先</dt>
            <dd>
              {macRefs.devices} <code>{macRefs.deviceIf}</code>
            </dd>
            <dt>件数</dt>
            <dd>
              layer {macRefs.layerCount} · 割り当て {macRefs.assignmentCount} · Karabiner 非対応{" "}
              {macRefs.unsupportedCount}
            </dd>
            <dt>内蔵配列</dt>
            <dd>{macRefs.detectedBuiltInLayout}</dd>
          </dl>
        </section>
      ) : (
        <section aria-labelledby="bd-ref-title">
          <h3 id="bd-ref-title" className="bd-section-title">
            参照
          </h3>
          <dl className="bd-kv">
            <dt>使用中</dt>
            <dd>
              {cornix.references.usages.tapDance
                .map((u) => `${u.keycode} × ${u.count}`)
                .join("、") || "なし"}
            </dd>
            <dt>未使用</dt>
            <dd>
              Tap Dance {cornix.references.unused.tapDance.length} 件、Macro{" "}
              {cornix.references.unused.macro.length} 件
            </dd>
            <dt>到達不能</dt>
            <dd>{cornix.references.unreachableLayers.map((l) => `layer ${l}`).join("、")}</dd>
          </dl>
        </section>
      )}
    </>
  );
}

/* ---------- 実機と適用 ---------- */

export function DevicePanel({
  target,
  phase,
  roundTrips,
  total,
  readAt,
  diff,
  applyBlockedReason,
  onConnect,
  onDisconnect,
  onRead,
  onApply,
  onRestore,
  onExportKarabiner,
}: {
  target: TargetId;
  phase: DevicePhase;
  roundTrips: number;
  total: number;
  readAt: string;
  diff: DiffRow[];
  applyBlockedReason?: string;
  onConnect: () => void;
  onDisconnect: () => void;
  onRead: () => void;
  onApply: () => void;
  onRestore: () => void;
  onExportKarabiner: () => void;
}) {
  if (target !== "cornix") {
    const layout = macLayoutOf(target);
    return (
      <>
        <section className="bd-step is-info">
          <h3 className="bd-section-title">Mac への適用は CLI で行う</h3>
          <p>
            Web UI は <code>{layout.references.file}</code> を編集して保存するだけで、Karabiner
            の設定には触れない。
          </p>
          <pre className="bd-code">
            just mac apply{"\n"}just mac apply --confirm &lt;fingerprint&gt;
          </pre>
          <p className="bd-hint">
            1 行目で差分と fingerprint を確かめ、2 行目で適用する。適用前に自動で backup を取る。
          </p>
        </section>
        <section className="bd-step">
          <h3 className="bd-section-title">適用先</h3>
          <p>
            {layout.references.devices} <code>{layout.references.deviceIf}</code>
          </p>
          <p className="bd-hint">適用先を増やすときは CLI の cornix mac devices を使う。</p>
        </section>
        <section className="bd-step">
          <h3 className="bd-section-title">Karabiner asset</h3>
          <p>
            編集中の内容から complex_modifications の定義を書き出す。error があると書き出さない。
          </p>
          <Button size="small" appearance="secondary" onClick={onExportKarabiner}>
            Karabiner asset を書き出す
          </Button>
        </section>
      </>
    );
  }
  const connected = phase !== "disconnected";
  const read = phase === "read";
  return (
    <>
      <ol className="bd-steps">
        <li className={`bd-step ${connected ? "is-done" : "is-current"}`}>
          <h3 className="bd-section-title">
            <span className="bd-step-no">1</span> 接続する
          </h3>
          <p>
            {connected
              ? `${cornix.keyboard.name} に接続している。`
              : "未接続。接続しただけでは実機の設定を読み込まない。"}
          </p>
          {connected ? (
            <Button size="small" appearance="quiet" onClick={onDisconnect}>
              切断
            </Button>
          ) : (
            <Button size="small" onClick={onConnect}>
              接続（ブラウザの機器選択を開く）
            </Button>
          )}
        </li>
        <li className={`bd-step ${read ? "is-done" : connected ? "is-current" : ""}`}>
          <h3 className="bd-section-title">
            <span className="bd-step-no">2</span> 実機から読み込む
          </h3>
          {phase === "reading" ? (
            <p aria-live="polite">
              読み込み中… 往復 {roundTrips} / {total} 回
              <progress max={total} value={roundTrips} />
            </p>
          ) : read ? (
            <p>
              {readAt} に読み込んだ。全 {total} 往復。
            </p>
          ) : (
            <p>この接続で読み込むまで差分は出ない。</p>
          )}
          <Button
            size="small"
            appearance="secondary"
            disabled={!connected || phase === "reading"}
            onClick={onRead}
          >
            実機から読み込む
          </Button>
          <dl className="bd-kv">
            <dt>UID</dt>
            <dd>
              実機 <code>{cornix.keyboard.uid}</code>（workspace と一致）
            </dd>
            <dt>definition</dt>
            <dd>
              <code>{cornix.desiredDiagnostics.definitionBinding.path}</code>（一致）
            </dd>
          </dl>
        </li>
        <li className={`bd-step ${read ? "is-current" : ""}`}>
          <h3 className="bd-section-title">
            <span className="bd-step-no">3</span> 差分を確かめて Apply する
          </h3>
          {read ? (
            <>
              <p>
                workspace と実機の差分 <strong>{diff.length} 件</strong>
              </p>
              <ul className="bd-diff-mini">
                {diff.map((d) => (
                  <li key={d.target}>
                    <span>{subjectLabel(d.subject)}</span>
                    <span>
                      {d.beforeDisplay.full.primary} {d.beforeDisplay.full.role ?? ""} →{" "}
                      <strong>
                        {d.afterDisplay.full.primary} {d.afterDisplay.full.role ?? ""}
                      </strong>
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="bd-muted">読み込むと差分がここに出る。</p>
          )}
          <Button
            disabled={Boolean(applyBlockedReason)}
            onClick={onApply}
            aria-describedby={applyBlockedReason ? "bd-apply-reason-panel" : undefined}
          >
            実機へ Apply…
          </Button>
          {applyBlockedReason ? (
            <p id="bd-apply-reason-panel" className="bd-hint">
              {applyBlockedReason}
            </p>
          ) : null}
        </li>
      </ol>
      <section className="bd-step">
        <h3 className="bd-section-title">backup から復元</h3>
        <p>
          <code>cornix/backups/latest.vil</code>{" "}
          を目標状態として読み込む。この時点では実機に書き込まず、通常の差分確認と Apply に戻る。
        </p>
        <Button size="small" appearance="quiet" onClick={onRestore}>
          backup から復元
        </Button>
      </section>
      <p className="bd-hint">
        出典: {fixture.source.repo} {fixture.source.commit} の fixture。
      </p>
    </>
  );
}

/* ---------- ファイル ---------- */

export function FilesPanel({
  cornixReady,
  onVilImport,
  onVilExport,
  onReload,
}: {
  cornixReady: boolean;
  onVilImport: () => void;
  onVilExport: () => void;
  onReload: () => void;
}) {
  return (
    <>
      <section className="bd-step">
        <h3 className="bd-section-title">.vil</h3>
        <p>
          読込は目標状態（keymap.yaml）を置き換える。実機には書き込まない。書出は cornix/generated/
          に保存する。
        </p>
        <div className="bd-row">
          <Button size="small" appearance="secondary" disabled={!cornixReady} onClick={onVilImport}>
            VIL 読込…
          </Button>
          <Button size="small" appearance="secondary" disabled={!cornixReady} onClick={onVilExport}>
            VIL 書出
          </Button>
        </div>
        {!cornixReady ? (
          <p className="bd-hint">keymap.yaml を読み込めていないため使えない。</p>
        ) : null}
      </section>
      <section className="bd-step">
        <h3 className="bd-section-title">ディスクから再読込</h3>
        <p>外部エディタで変えたファイルを取り込む。保存の競合もここで解ける。</p>
        <Button size="small" appearance="secondary" onClick={onReload}>
          再読込
        </Button>
      </section>
      <section className="bd-step">
        <h3 className="bd-section-title">利用者ガイド</h3>
        <p>
          <a
            className="bd-link"
            href="https://github.com/salan70/cornix-bonsai/blob/main/docs/user-guide/web-ui.md"
            target="_blank"
            rel="noreferrer"
          >
            Web UI の使い方（新しいタブ）
          </a>
        </p>
      </section>
    </>
  );
}
