import { forwardRef, useEffect, useState } from "react";
import { Button } from "../../../button/shared/Button";
import { cornix } from "../../shared/fixture";
import {
  behaviorOf,
  macLayoutOf,
  splitTapHold,
  viewOf,
  type PickTarget,
  type Selection,
  type TargetId,
} from "../../shared/model";
import type { SaveEntry, SaveFile } from "./state";

type Props = {
  target: TargetId;
  layer: number;
  selection: Selection;
  raw?: string;
  names: Record<string, string>;
  pickTarget: PickTarget;
  onPickTarget: (target: PickTarget) => void;
  onRaw: (raw: string) => void;
  onName: (raw: string, name: string) => void;
  onClear: () => void;
  onJumpLayer: (layer: number) => void;
  onBackToBoard: () => void;
  file: SaveFile;
  save?: SaveEntry;
  onRetry: () => void;
  onReload: () => void;
};

function positionLabel(target: TargetId, layer: number, selection: Selection) {
  if (!selection) return "";
  if (selection.kind === "key")
    return `layer ${layer} · row ${selection.row} · col ${selection.col}`;
  if (selection.kind === "encoder")
    return `layer ${layer} · encoder ${selection.index} · ${selection.direction === "ccw" ? "左回し" : "右回し"}`;
  const cap = macLayoutOf(target).physical.find((k) => k.keyCode === selection.keyCode)?.cap;
  return `layer ${layer} · ${cap ?? selection.keyCode}`;
}

export const Inspector = forwardRef<HTMLHeadingElement, Props>(
  function Inspector(props, headingRef) {
    const {
      target,
      layer,
      selection,
      raw,
      names,
      pickTarget,
      onPickTarget,
      onRaw,
      onName,
      onClear,
      onJumpLayer,
      onBackToBoard,
    } = props;
    const isMac = target !== "cornix";
    const [draftRaw, setDraftRaw] = useState(raw ?? "");
    const [draftName, setDraftName] = useState(raw ? (names[raw] ?? "") : "");
    useEffect(() => {
      setDraftRaw(raw ?? "");
      setDraftName(raw ? (names[raw] ?? "") : "");
    }, [raw, names]);

    const onKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onBackToBoard();
      }
    };

    if (!selection) {
      return (
        <aside className="bd-inspector" aria-labelledby="bd-inspector-title" onKeyDown={onKeyDown}>
          <h2 id="bd-inspector-title" ref={headingRef} tabIndex={-1} className="bd-panel-title">
            選択中のキー
          </h2>
          <p className="bd-muted">盤面のキーか encoder を選ぶと、ここで割り当てを変えられる。</p>
          <SaveBox {...props} />
        </aside>
      );
    }

    const view = raw ? viewOf(raw, names, false) : undefined;
    const parts = raw ? splitTapHold(raw) : { tap: "" };
    const layerRef = raw?.match(/^(?:MO|TG|TO|DF|OSL|TT)\((\d+)\)$|^LT(\d+)\(/);
    const refLayer = layerRef ? Number(layerRef[1] ?? layerRef[2]) : undefined;
    const pickOptions: { id: PickTarget; label: string; value: string }[] = [
      {
        id: "whole",
        label: "キー全体",
        value: view ? view.primary + (view.role ? ` ${view.role}` : "") : "素通し",
      },
      { id: "tap", label: "Tap", value: parts.tap ? viewOf(parts.tap, names).primary : "—" },
      { id: "hold", label: "Hold", value: parts.holdLabel ?? "なし" },
    ];

    return (
      <aside className="bd-inspector" aria-labelledby="bd-inspector-title" onKeyDown={onKeyDown}>
        <div className="bd-panel-head">
          <h2 id="bd-inspector-title" ref={headingRef} tabIndex={-1} className="bd-panel-title">
            選択中のキー
          </h2>
          <span className="bd-tag">{positionLabel(target, layer, selection)}</span>
        </div>

        <div className="bd-selected">
          <span className={`bd-cap is-${view?.kind ?? "passthrough"}`} aria-hidden="true">
            <span>{view ? view.primary : "—"}</span>
            {view?.role ? <small>{view.role}</small> : null}
          </span>
          <div>
            <code className="bd-raw">{raw ?? "割り当てなし（素通し）"}</code>
            <p className="bd-behavior">{raw ? behaviorOf(raw) : "入力をそのまま通す"}</p>
            {refLayer !== undefined && target === "cornix" ? (
              <button type="button" className="bd-link" onClick={() => onJumpLayer(refLayer)}>
                → layer {refLayer}（{cornix.layers[refLayer]?.name}）を開く
              </button>
            ) : null}
          </div>
        </div>

        <fieldset className="bd-seg">
          <legend>picker の適用先</legend>
          {pickOptions.map((o) => (
            <label key={o.id} className={pickTarget === o.id ? "is-on" : ""}>
              <input
                type="radio"
                name="bd-pick"
                checked={pickTarget === o.id}
                onChange={() => onPickTarget(o.id)}
              />
              <span className="bd-seg-label">{o.label}</span>
              <span className="bd-seg-value">{o.value}</span>
            </label>
          ))}
        </fieldset>
        <p className="bd-hint">
          {pickTarget === "hold"
            ? "Hold に選べるのは modifier だけ。picker の他のキーは無効になる。"
            : "下の picker から選ぶと、すぐに保存する。"}
        </p>

        <details className="bd-details">
          <summary>raw keycode{isMac ? "" : "・表示名"}</summary>
          <form
            className="bd-field"
            onSubmit={(e) => {
              e.preventDefault();
              if (draftRaw.trim()) onRaw(draftRaw.trim());
            }}
          >
            <label htmlFor="bd-raw">raw keycode</label>
            <div className="bd-field-row">
              <input
                id="bd-raw"
                value={draftRaw}
                onChange={(e) => setDraftRaw(e.target.value)}
                spellCheck={false}
              />
              <Button size="small" appearance="secondary" type="submit">
                反映
              </Button>
            </div>
          </form>
          {!isMac && raw ? (
            <div className="bd-field">
              <label htmlFor="bd-name">表示名（任意）</label>
              <input
                id="bd-name"
                value={draftName}
                placeholder="例: 英数"
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => onName(raw, draftName.trim())}
                onKeyDown={(e) => e.key === "Enter" && onName(raw, draftName.trim())}
              />
              <p className="bd-hint">cornix/labels.yaml に保存する。実機へ書く内容は変わらない。</p>
            </div>
          ) : null}
          {isMac && raw ? (
            <Button size="small" appearance="quiet" onClick={onClear}>
              割り当てを外す
            </Button>
          ) : null}
        </details>

        <SaveBox {...props} />
      </aside>
    );
  },
);

function SaveBox({ target, file, save, onRetry, onReload }: Props) {
  const status = save?.status ?? "idle";
  const text = {
    idle: "未保存の変更はない",
    saving: "保存中…",
    saved: `ローカル保存済み${save?.at ? `（${save.at}）` : ""}`,
    error: "保存に失敗した",
    conflict: "外部で変更されたため保存できない",
  }[status];
  const icon = { idle: "○", saving: "◌", saved: "✓", error: "×", conflict: "!" }[status];
  return (
    <section className={`bd-save is-${status}`} aria-live="polite" aria-label="保存状態">
      <p className="bd-save-line">
        <span aria-hidden="true" className="bd-save-icon">
          {icon}
        </span>
        <strong>{text}</strong>
      </p>
      <p className="bd-save-file">
        <code>{file}</code>
      </p>
      {status === "error" ? (
        <Button size="small" appearance="secondary" onClick={onRetry}>
          もう一度保存する
        </Button>
      ) : null}
      {status === "conflict" ? (
        <>
          <p className="bd-save-note">
            外部エディタの変更を上書きしないため、この後の編集は保存されない。ディスクから再読込して編集し直す。
          </p>
          <Button size="small" appearance="danger" onClick={onReload}>
            ディスクから再読込
          </Button>
        </>
      ) : null}
      <p className="bd-save-note">
        {target === "cornix"
          ? "ローカルの workspace への保存。実機へは「実機へ Apply」で反映する。"
          : "ローカルの workspace への保存。Mac への適用は CLI の cornix mac apply で行う。"}
      </p>
    </section>
  );
}
