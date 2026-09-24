import { useState } from "react";
import { Button } from "../../../button/shared/Button";
import { cornix, fixture } from "../../shared/fixture";
import { macLayoutOf, TARGETS, type TargetId } from "../../shared/model";
import { layerTone, SEVERITY } from "./Panels";
import {
  PANELS,
  type CornixLoad,
  type DevicePhase,
  type PanelId,
  type MockState,
  type SaveEntry,
} from "./state";

export type ThemeChoice = "system" | "light" | "dark";

const WORKSPACE_PATH = "~/Projects/Tools/cornix-bonsai";

export function Header({
  target,
  onTarget,
  targetState,
  device,
  theme,
  onTheme,
  onSwitchWorkspace,
}: {
  target: TargetId;
  onTarget: (t: TargetId) => void;
  targetState: Record<TargetId, "ready" | "missing" | "error">;
  device: DevicePhase;
  theme: ThemeChoice;
  onTheme: (t: ThemeChoice) => void;
  onSwitchWorkspace: () => void;
}) {
  const stateLabel = { ready: "読込済み", missing: "ファイルなし", error: "読込失敗" };
  return (
    <header className="bd-header">
      <div className="bd-brand">
        <span className="bd-logo" aria-hidden="true">
          🌱
        </span>
        <span>
          <strong>Cornix Bonsai</strong>
          <small>
            build {fixture.source.commit} ·{" "}
            <time dateTime="2026-09-24T12:00:00+09:00">09/24 12:00</time>
          </small>
        </span>
      </div>
      <div className="bd-workspace">
        <span className="bd-muted">workspace</span>
        <code>{WORKSPACE_PATH}</code>
        <button type="button" className="bd-link" onClick={onSwitchWorkspace}>
          切り替える
        </button>
      </div>
      <div className="bd-targets" role="radiogroup" aria-label="編集対象">
        {TARGETS.map((t) => {
          const s = targetState[t.id];
          return (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={target === t.id}
              className={`bd-target${target === t.id ? " is-on" : ""}`}
              onClick={() => onTarget(t.id)}
            >
              <span className={`bd-dot is-${s}`} aria-hidden="true" />
              {t.label}
              <span className="bd-visually-hidden">（{stateLabel[s]}）</span>
            </button>
          );
        })}
      </div>
      <span className="bd-spacer" />
      <span className={`bd-chip is-${device === "disconnected" ? "off" : "on"}`}>
        <span aria-hidden="true" className="bd-chip-dot" />
        {device === "disconnected"
          ? "Cornix LP 未接続"
          : device === "read"
            ? `${cornix.keyboard.name} · 読込済み`
            : `${cornix.keyboard.name} · 接続済み`}
      </span>
      <label className="bd-theme">
        <span className="bd-visually-hidden">テーマ</span>
        <select value={theme} onChange={(e) => onTheme(e.target.value as ThemeChoice)}>
          <option value="system">システム</option>
          <option value="light">ライト</option>
          <option value="dark">ダーク</option>
        </select>
      </label>
    </header>
  );
}

export function Rail({
  target,
  panel,
  onPanel,
  counts,
}: {
  target: TargetId;
  panel: PanelId | null;
  onPanel: (d: PanelId | null) => void;
  counts: Partial<Record<PanelId, string>>;
}) {
  const icon: Record<PanelId, string> = {
    overview: "▦",
    behaviors: "⚙",
    validation: "✓",
    device: "⇅",
    files: "▤",
  };
  return (
    <nav className="bd-rail" aria-label="作業">
      <button
        type="button"
        className={`bd-rail-btn tone-primary${panel === null ? " is-on" : ""}`}
        aria-pressed={panel === null}
        onClick={() => onPanel(null)}
      >
        <span aria-hidden="true" className="bd-rail-icon">
          ⌨
        </span>
        割り当て
      </button>
      {PANELS.map((d, i) => {
        const disabled = d.cornixOnly && target !== "cornix";
        return (
          <button
            key={d.id}
            type="button"
            data-panel={d.id}
            className={`bd-rail-btn tone-${["secondary", "tertiary", "primary", "secondary", "tertiary"][i]}${panel === d.id ? " is-on" : ""}`}
            aria-pressed={panel === d.id}
            aria-disabled={disabled}
            aria-describedby={disabled ? `bd-rail-why-${d.id}` : undefined}
            onClick={() => !disabled && onPanel(panel === d.id ? null : d.id)}
          >
            <span aria-hidden="true" className="bd-rail-icon">
              {icon[d.id]}
            </span>
            {d.short}
            {counts[d.id] ? <span className="bd-rail-count">{counts[d.id]}</span> : null}
            {disabled ? (
              <span id={`bd-rail-why-${d.id}`} className="bd-rail-why">
                Cornix のみ
              </span>
            ) : null}
          </button>
        );
      })}
    </nav>
  );
}

export function LayerBar({
  target,
  layer,
  onLayer,
  layerNames,
}: {
  target: TargetId;
  layer: number;
  onLayer: (l: number) => void;
  layerNames: Record<number, string>;
}) {
  const [showHidden, setShowHidden] = useState(false);
  if (target !== "cornix") {
    const layout = macLayoutOf(target);
    return (
      <div className="bd-layerbar">
        <div className="bd-layers" role="radiogroup" aria-label="layer">
          {layout.layers.map((l) => (
            <button
              key={l.index}
              type="button"
              role="radio"
              aria-checked={layer === l.index}
              className={`bd-layer tone-${layerTone(l.index)}${layer === l.index ? " is-on" : ""}`}
              onClick={() => onLayer(l.index)}
            >
              L{l.index}
            </button>
          ))}
        </div>
        <span className="bd-spacer" />
        <span className="bd-chip is-quiet" title={layout.devices.deviceIf}>
          適用先: {layout.devices.describe}
        </span>
      </div>
    );
  }
  const shown = showHidden
    ? cornix.layers
    : cornix.layers.filter(
        (l) => !cornix.overview.hiddenLayers.includes(l.index) || l.index === layer,
      );
  return (
    <div className="bd-layerbar">
      <div className="bd-layers" role="radiogroup" aria-label="layer">
        {shown.map((l) => (
          <button
            key={l.index}
            type="button"
            role="radio"
            aria-checked={layer === l.index}
            className={`bd-layer tone-${layerTone(l.index)}${layer === l.index ? " is-on" : ""}`}
            onClick={() => onLayer(l.index)}
          >
            L{l.index} <span>{layerNames[l.index] ?? l.name}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="bd-link"
        aria-expanded={showHidden}
        onClick={() => setShowHidden((s) => !s)}
      >
        {showHidden ? "参照なしを隠す" : `参照なし ${cornix.overview.hiddenLayers.length} 件`}
      </button>
    </div>
  );
}

export function StatusBar({
  target,
  counts,
  onDiagnostics,
  save,
  saveFile,
  message,
  device,
  diffCount,
  applyBlockedReason,
  onApply,
  onExportKarabiner,
}: {
  target: TargetId;
  counts: Record<"error" | "warning" | "information", number>;
  onDiagnostics: () => void;
  save?: SaveEntry;
  saveFile: string;
  message: string;
  device: DevicePhase;
  diffCount: number;
  applyBlockedReason?: string;
  onApply: () => void;
  onExportKarabiner: () => void;
}) {
  const status = save?.status ?? "idle";
  const saveText = {
    idle: "変更なし",
    saving: "保存中…",
    saved: "ローカル保存済み",
    error: "保存に失敗",
    conflict: "外部変更のため保存できない",
  }[status];
  return (
    <footer className="bd-status">
      <div className="bd-sev-group">
        {(["error", "warning", "information"] as const).map((s) => (
          <button
            key={s}
            type="button"
            className={`bd-sev is-${s}`}
            onClick={onDiagnostics}
            aria-label={`${SEVERITY[s].label} ${counts[s]} 件。検証を開く`}
          >
            <span aria-hidden="true">{SEVERITY[s].icon}</span> {counts[s]}
          </button>
        ))}
      </div>
      <span className={`bd-status-save is-${status}`}>
        {saveText} <code>{saveFile}</code>
      </span>
      <span className="bd-status-msg" role="status" aria-live="polite">
        {message}
      </span>
      <span className="bd-spacer" />
      {target === "cornix" ? (
        <>
          <span className="bd-muted">
            {device === "read" ? `実機との差分 ${diffCount} 件` : "実機の差分は未読込"}
          </span>
          <Button
            size="small"
            disabled={Boolean(applyBlockedReason)}
            onClick={onApply}
            aria-describedby={applyBlockedReason ? "bd-apply-reason" : undefined}
          >
            実機へ Apply…
          </Button>
          {applyBlockedReason ? (
            <span id="bd-apply-reason" className="bd-status-why">
              {applyBlockedReason}
            </span>
          ) : null}
        </>
      ) : (
        <>
          <span className="bd-muted">適用は CLI の cornix mac apply</span>
          <Button size="small" appearance="secondary" onClick={onExportKarabiner}>
            Karabiner asset を書き出す
          </Button>
        </>
      )}
    </footer>
  );
}

export function WorkspaceGate({
  phase,
  onOpen,
}: {
  phase: "unselected" | "permission";
  onOpen: () => void;
}) {
  return (
    <main className="bd-gate" id="bd-main">
      <div className="bd-gate-card">
        <span className="bd-logo is-large" aria-hidden="true">
          🌱
        </span>
        <h1>{phase === "unselected" ? "workspace を開く" : "workspace へのアクセスを許可する"}</h1>
        <p>
          {phase === "unselected"
            ? "keymap.yaml や mac-keyboard.<layout>.yaml を置いた directory を選ぶ。keymap.yaml が無くても開ける。設定は外部へ送らない。"
            : `前回の workspace（${WORKSPACE_PATH}）を開くには、ブラウザの権限をもう一度許可する。`}
        </p>
        <Button size="large" onClick={onOpen}>
          {phase === "unselected" ? "Workspace を開く" : "アクセスを許可する"}
        </Button>
        <p className="bd-hint">Chrome / Chromium の macOS 版だけに対応する。</p>
      </div>
    </main>
  );
}

export function Recovery({
  kind,
  target,
  onAction,
  onReload,
  device,
}: {
  kind: CornixLoad | "mac-missing" | "mac-error";
  target: TargetId;
  onAction: () => void;
  onReload: () => void;
  device: DevicePhase;
}) {
  const file = TARGETS.find((t) => t.id === target)!.file;
  const content = {
    missing: {
      title: "keymap.yaml が無い",
      body: "この workspace には Cornix LP の設定がまだ無い。実機を読み込んで keymap.yaml と definition を作る。実機には書き込まない。Mac の編集はこのまま使える。",
      action:
        device === "disconnected"
          ? "接続してから実機 read で作成"
          : "実機 read で workspace を作成",
    },
    legacy: {
      title: "definition binding が古い digest 規則のまま",
      body: "keymap.yaml が指す definition は記録当時と同じ内容だと確かめられた。binding を今の規則へ移行できる。移行はこの操作でだけ行う。",
      action: "binding を移行する",
    },
    error: {
      title: "workspace を読み込めなかった",
      body: "keymap.yaml を読めなかった（例: 12 行目の YAML 構文エラー）。外部エディタで直してから再読込する。Mac の編集はこのまま使える。",
      action: "",
    },
    ready: { title: "", body: "", action: "" },
    "mac-missing": {
      title: `${file} が無い`,
      body: "この配列の設定ファイルがまだ無い。選んだ配列と空の layer 0 だけを持つ初期ファイルを作れる。",
      action: "初期ファイルを作る",
    },
    "mac-error": {
      title: `${file} を読み込めなかった`,
      body: "layout 宣言が配列と一致しない（例）。外部エディタで直してから再読込する。",
      action: "",
    },
  }[kind];
  return (
    <section className="bd-recovery" aria-labelledby="bd-recovery-title">
      <h2 id="bd-recovery-title">! {content.title}</h2>
      <p>{content.body}</p>
      <div className="bd-row">
        {content.action ? <Button onClick={onAction}>{content.action}</Button> : null}
        <Button appearance="secondary" onClick={onReload}>
          ディスクから再読込
        </Button>
      </div>
    </section>
  );
}

/** 本体には無い。I/O の結果として決まる状態を、比較のために切り替える。 */
export function MockControls({
  mock,
  update,
}: {
  mock: MockState;
  update: <K extends keyof MockState>(key: K, value: MockState[K]) => void;
}) {
  const [open, setOpen] = useState(false);
  const select = <K extends keyof MockState>(
    key: K,
    label: string,
    options: [MockState[K], string][],
  ) => (
    <label>
      <span>{label}</span>
      <select
        value={String(mock[key])}
        onChange={(e) => update(key, e.target.value as MockState[K])}
      >
        {options.map(([v, l]) => (
          <option key={String(v)} value={String(v)}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <div className="bd-mock">
      <button
        type="button"
        className="bd-mock-toggle"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        モック {open ? "▾" : "▴"}
      </button>
      {open ? (
        <div className="bd-mock-panel">
          <p>本体には無い操作。I/O の結果で決まる状態を切り替える。</p>
          {select("workspace", "workspace", [
            ["open", "開いている"],
            ["unselected", "未選択"],
            ["permission", "権限の再確認"],
          ])}
          {select("cornixLoad", "Cornix の読込", [
            ["ready", "ready"],
            ["missing", "keymap.yaml が無い"],
            ["legacy", "旧 digest binding"],
            ["error", "その他の失敗"],
          ])}
          {select("jisState", "Mac JIS", [
            ["ready", "ready"],
            ["missing", "ファイルなし"],
            ["error", "読込失敗"],
          ])}
          {select("nextSave", "次の保存", [
            ["ok", "成功"],
            ["error", "I/O 失敗"],
            ["conflict", "外部変更と競合"],
          ])}
          {select("diagnostics", "診断", [
            ["desired", "fixture の目標状態"],
            ["invalid-cases", "invalid-cases.vil（error あり）"],
          ])}
        </div>
      ) : null}
    </div>
  );
}
