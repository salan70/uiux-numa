import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { makePalette, schemes, type Mode } from "../../../color-schemes-material/shared/palettes";
import { cornix, type Diagnostic } from "../../shared/fixture";
import {
  composePick,
  deviceCornixDoc,
  macLayoutOf,
  targetOf,
  type TargetId,
} from "../../shared/model";
import { ApplyDialog } from "./ApplyDialog";
import { Board } from "./Board";
import {
  Header,
  LayerBar,
  MockControls,
  Rail,
  Recovery,
  StatusBar,
  WorkspaceGate,
  type ThemeChoice,
} from "./Chrome";
import {
  BehaviorsDrawer,
  DeviceDrawer,
  FilesDrawer,
  OverviewDrawer,
  ValidationDrawer,
} from "./Drawers";
import { Inspector } from "./Inspector";
import { Picker } from "./Picker";
import {
  DRAWERS,
  SAVE_PRIORITY,
  useApply,
  useCursor,
  useDevice,
  useDiff,
  useDocuments,
  useMockState,
  useSaveQueue,
  type DrawerId,
  type SaveFile,
} from "./state";
import "./board-desk.css";

function usePalette(choice: ThemeChoice) {
  const [systemDark, setSystemDark] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const on = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    media.addEventListener("change", on);
    return () => media.removeEventListener("change", on);
  }, []);
  const mode: Mode = choice === "system" ? (systemDark ? "dark" : "light") : choice;
  const style = useMemo(() => {
    const scheme = schemes.find((s) => s.id === "pop-toy")!;
    const palette = makePalette(scheme, mode);
    return Object.fromEntries(
      Object.entries(palette).map(([k, v]) => [`--color-${k}`, v]),
    ) as CSSProperties;
  }, [mode]);
  return { mode, style };
}

/** 実行基盤の `?bare`（実寸比較と撮影）では、画面いっぱいに固定する。 */
const bare = new URLSearchParams(window.location.search).has("bare");

export default function BoardDesk() {
  const [theme, setTheme] = useState<ThemeChoice>("system");
  const { mode, style } = usePalette(theme);
  const { mock, update } = useMockState();
  const docs = useDocuments();
  const cursor = useCursor();
  const saves = useSaveQueue(mock.nextSave);
  const device = useDevice();
  const apply = useApply();
  const [drawer, setDrawer] = useState<DrawerId | null>(null);
  const [message, setMessage] = useState("");
  const inspectorHeading = useRef<HTMLHeadingElement>(null);
  const drawerHeading = useRef<HTMLHeadingElement>(null);
  const railReturn = useRef<DrawerId | null>(null);

  const { target, layer, selection } = cursor;
  const isCornix = target === "cornix";
  const macState = target === "mac-jis" ? mock.jisState : "ready";
  const cornixReady = mock.cornixLoad === "ready";
  const editable = isCornix ? cornixReady : macState === "ready";

  const diff = useDiff(device.current, docs.cornixDoc, docs.names);
  const diffTargets = useMemo(
    () => new Set(device.phase === "read" ? diff.map((d) => d.target) : []),
    [diff, device.phase],
  );

  const diagnostics: Diagnostic[] = isCornix
    ? mock.diagnostics === "invalid-cases"
      ? cornix.invalidCasesDiagnostics.items
      : cornix.diagnostics.items
    : macLayoutOf(target).diagnostics.items;
  const counts = { error: 0, warning: 0, information: 0 };
  diagnostics.forEach((d) => (counts[d.severity] += 1));
  const diagnosticTargets = useMemo(() => {
    const m = new Map<string, string>();
    for (const d of diagnostics) if (d.severity !== "information") m.set(d.target, d.severity);
    return m;
  }, [diagnostics]);

  const saveFile: SaveFile = isCornix ? "keymap.yaml" : (targetOf(target).file as SaveFile);
  const relevant = isCornix ? (["keymap.yaml", "cornix/labels.yaml"] as SaveFile[]) : [saveFile];
  const aggregate = SAVE_PRIORITY.map((s) =>
    relevant.find((f) => saves.files[f]?.status === s),
  ).find(Boolean);
  const aggregateEntry = aggregate ? saves.files[aggregate] : undefined;

  const applyBlockedReason = !cornixReady
    ? "keymap.yaml を読み込めていない"
    : device.phase === "disconnected"
      ? "実機に接続していない"
      : device.phase !== "read"
        ? "この接続で実機を読み込んでいない"
        : counts.error > 0 && isCornix
          ? "error があるため Apply できない"
          : diff.length === 0
            ? "実機との差分が 0 件"
            : undefined;

  const say = useCallback((text: string) => {
    setMessage("");
    window.setTimeout(() => setMessage(text), 0);
  }, []);

  const openDrawer = (d: DrawerId | null) => {
    railReturn.current = d ?? drawer;
    setDrawer(d);
  };
  // 引き出しを開いたら、描画後に見出しへ focus を移す。
  useEffect(() => {
    if (drawer) drawerHeading.current?.focus();
  }, [drawer]);
  const closeDrawer = () => {
    const back = railReturn.current;
    setDrawer(null);
    if (back) document.querySelector<HTMLElement>(`[data-drawer="${back}"]`)?.focus();
  };
  // focus が引き出しの外（入力欄から外れた後など）にあっても、Esc で閉じられるようにする。Apply 中は Apply が優先する。
  useEffect(() => {
    if (!drawer) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || document.querySelector("dialog[open]")) return;
      const back = railReturn.current;
      setDrawer(null);
      if (back) document.querySelector<HTMLElement>(`[data-drawer="${back}"]`)?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawer]);

  const focusBoard = () => {
    const selected = document.querySelector<HTMLElement>(
      ".bd-board .is-selected, .bd-encoders .is-selected",
    );
    (selected ?? document.querySelector<HTMLElement>(".bd-board button"))?.focus();
  };

  const edit = (raw: string | null) => {
    if (!editable || !selection) return;
    docs.assign(target, layer, selection, raw);
    saves.save(saveFile);
  };

  const onPick = (keycode: string) => {
    const current = docs.rawAt(target, layer, selection) ?? "KC_NO";
    const next = composePick(current, keycode, cursor.pickTarget);
    if (next === current) return;
    edit(next);
  };

  const changeTarget = (next: TargetId) => {
    cursor.changeTarget(next);
    const def = DRAWERS.find((d) => d.id === drawer);
    if (def?.cornixOnly && next !== "cornix") {
      setDrawer(null);
      say(`${targetOf(next).label} には${def.label}が無いため、割り当てに戻した。`);
    }
  };

  const jumpToDiagnostic = (d: Diagnostic) => {
    const s = d.subject;
    if ("layer" in s && typeof s.layer === "number") cursor.setLayer(s.layer);
    if (s.kind === "key")
      cursor.setSelection({ kind: "key", row: s.row as number, col: s.col as number });
    if (s.kind === "encoder")
      cursor.setSelection({
        kind: "encoder",
        index: s.index as number,
        direction: s.direction as "ccw" | "cw",
      });
    setDrawer(null);
    focusBoard();
  };

  if (mock.workspace !== "open") {
    return (
      <div className={`bd${bare ? " is-bare" : ""}`} data-theme={mode} style={style}>
        <WorkspaceGate phase={mock.workspace} onOpen={() => update("workspace", "open")} />
        <MockControls mock={mock} update={update} />
      </div>
    );
  }

  const drawerDef = DRAWERS.find((d) => d.id === drawer);
  const recoveryKind = isCornix
    ? cornixReady
      ? null
      : mock.cornixLoad
    : macState === "ready"
      ? null
      : macState === "missing"
        ? "mac-missing"
        : "mac-error";

  return (
    <div className={`bd${bare ? " is-bare" : ""}`} data-theme={mode} style={style}>
      <a className="bd-skip" href="#bd-main">
        盤面へ移動
      </a>
      <Header
        target={target}
        onTarget={changeTarget}
        targetState={{
          cornix: cornixReady ? "ready" : mock.cornixLoad === "missing" ? "missing" : "error",
          "mac-ansi": "ready",
          "mac-jis": mock.jisState,
        }}
        device={device.phase}
        theme={theme}
        onTheme={setTheme}
        onSwitchWorkspace={() => update("workspace", "unselected")}
      />
      <Rail
        target={target}
        drawer={drawer}
        onDrawer={openDrawer}
        counts={{
          validation:
            counts.error + counts.warning > 0 ? String(counts.error + counts.warning) : undefined,
          device:
            isCornix && device.phase === "read" && diff.length ? String(diff.length) : undefined,
        }}
      />
      <main className="bd-desk" id="bd-main">
        <div className="bd-center">
          {recoveryKind ? (
            <Recovery
              kind={recoveryKind}
              target={target}
              device={device.phase}
              onAction={() => {
                if (recoveryKind === "mac-missing") update("jisState", "ready");
                else if (recoveryKind === "missing") {
                  if (device.phase === "disconnected") device.connect();
                  device.read(() => update("cornixLoad", "ready"));
                } else update("cornixLoad", "ready");
              }}
              onReload={() => {
                saves.reload();
                say("ディスクから再読込した。");
              }}
            />
          ) : (
            <>
              <LayerBar
                target={target}
                layer={layer}
                onLayer={cursor.setLayer}
                layerNames={docs.layerNames}
              />
              <section className="bd-stage" aria-label="盤面">
                <Board
                  target={target}
                  layer={layer}
                  rawOf={(s) => docs.rawAt(target, layer, s)}
                  names={docs.names}
                  selection={selection}
                  onSelect={cursor.setSelection}
                  onEnter={() => inspectorHeading.current?.focus()}
                  diffTargets={diffTargets}
                  diagnosticTargets={diagnosticTargets}
                />
              </section>
              <section className="bd-picker-wrap" aria-label="keycode picker">
                <Picker
                  enabled={Boolean(selection) && editable}
                  isMac={!isCornix}
                  pickTarget={cursor.pickTarget}
                  current={docs.rawAt(target, layer, selection)}
                  names={docs.names}
                  onPick={onPick}
                />
              </section>
            </>
          )}
        </div>
        <Inspector
          ref={inspectorHeading}
          target={target}
          layer={layer}
          selection={recoveryKind ? null : selection}
          raw={docs.rawAt(target, layer, selection)}
          names={docs.names}
          pickTarget={cursor.pickTarget}
          onPickTarget={cursor.setPickTarget}
          onRaw={(raw) => edit(raw)}
          onName={(raw, name) => {
            if ((docs.names[raw] ?? "") === name) return;
            docs.setNames((n) => {
              const next = { ...n };
              if (name) next[raw] = name;
              else delete next[raw];
              return next;
            });
            saves.save("cornix/labels.yaml");
          }}
          onClear={() => edit(null)}
          onJumpLayer={(l) => cursor.setLayer(l)}
          onBackToBoard={focusBoard}
          file={saveFile}
          save={saves.files[saveFile]}
          onRetry={() => saves.retry(saveFile)}
          onReload={() => {
            saves.reload();
            docs.reset();
            say("ディスクから再読込した。未保存だった編集は取り込まれていない。");
          }}
        />
        {drawer && drawerDef ? (
          <aside className={`bd-drawer tone-${drawer}`} aria-labelledby="bd-drawer-title">
            <header className="bd-drawer-head">
              <h2 id="bd-drawer-title" ref={drawerHeading} tabIndex={-1}>
                {drawerDef.label}
                <small>{targetOf(target).label}</small>
              </h2>
              <button type="button" className="bd-close" onClick={closeDrawer}>
                × 閉じる <kbd>Esc</kbd>
              </button>
            </header>
            <div className="bd-drawer-body">
              {drawer === "overview" ? (
                <OverviewDrawer
                  doc={docs.cornixDoc}
                  names={docs.names}
                  layerNames={docs.layerNames}
                  currentLayer={layer}
                  onRenameLayer={(l, name) => {
                    if ((docs.layerNames[l] ?? "") === name) return;
                    docs.setLayerNames((n) => ({ ...n, [l]: name }));
                    saves.save("cornix/labels.yaml");
                  }}
                  onOpenLayer={(l) => {
                    cursor.setLayer(l);
                    setDrawer(null);
                  }}
                  onExport={(kind) =>
                    say(
                      `cornix/generated/keymap-layer-${layer}.${kind.toLowerCase()} に書き出した。`,
                    )
                  }
                />
              ) : null}
              {drawer === "behaviors" ? (
                <BehaviorsDrawer onSaved={() => saves.save("keymap.yaml")} />
              ) : null}
              {drawer === "validation" ? (
                <ValidationDrawer
                  target={target}
                  diagnostics={diagnostics}
                  onJump={jumpToDiagnostic}
                />
              ) : null}
              {drawer === "device" ? (
                <DeviceDrawer
                  target={target}
                  phase={device.phase}
                  roundTrips={device.roundTrips}
                  total={device.total}
                  readAt={device.readAt}
                  diff={diff}
                  applyBlockedReason={applyBlockedReason}
                  onConnect={device.connect}
                  onDisconnect={device.disconnect}
                  onRead={() => device.read()}
                  onApply={() => apply.open(device.total)}
                  onRestore={() => {
                    docs.setCornixDoc(deviceCornixDoc());
                    saves.save("keymap.yaml");
                    say(
                      "cornix/backups/latest.vil を目標状態に読み込んだ。実機はまだ書き換えていない。",
                    );
                  }}
                  onExportKarabiner={() =>
                    say("cornix/generated/karabiner-complex-modifications.json に書き出した。")
                  }
                />
              ) : null}
              {drawer === "files" ? (
                <FilesDrawer
                  cornixReady={cornixReady}
                  onVilImport={() =>
                    say(".vil を読み込み、keymap.yaml に保存した（モックでは内容を変えない）。")
                  }
                  onVilExport={() => say("cornix/generated/keymap.vil に書き出した。")}
                  onReload={() => {
                    saves.reload();
                    say("ディスクから再読込した。");
                  }}
                />
              ) : null}
            </div>
          </aside>
        ) : null}
      </main>
      <StatusBar
        target={target}
        counts={counts}
        onDiagnostics={() => openDrawer("validation")}
        save={aggregateEntry}
        saveFile={aggregate ?? saveFile}
        message={message}
        device={device.phase}
        diffCount={diff.length}
        applyBlockedReason={applyBlockedReason}
        onApply={() => apply.open(device.total)}
        onExportKarabiner={() =>
          say("cornix/generated/karabiner-complex-modifications.json に書き出した。")
        }
      />
      {apply.phase ? (
        <ApplyDialog
          phase={apply.phase}
          total={device.total}
          diff={diff}
          warnings={diagnostics.filter((d) => d.severity === "warning")}
          onNext={apply.next}
          onWrite={() =>
            apply.write(diff.length, () => {
              device.setCurrent(docs.cornixDoc);
            })
          }
          onAbort={() => {
            apply.abort();
            device.setPhase("connected");
          }}
          onClose={apply.close}
        />
      ) : null}
      <MockControls mock={mock} update={update} />
    </div>
  );
}
