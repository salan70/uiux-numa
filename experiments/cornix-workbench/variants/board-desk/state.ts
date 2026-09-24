// board-desk の状態。本体の main.tsx に集中していた状態を、関心ごとの hook に分ける。
// 各 hook は他の hook の内部を読まず、引数で受け取った値だけで動く。
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cornix, keyId } from "../../shared/fixture";
import {
  composePick,
  deviceCornixDoc,
  diffCornix,
  initialCornixDoc,
  initialMacDoc,
  targetOf,
  type CornixDoc,
  type MacDoc,
  type PickTarget,
  type Selection,
  type TargetId,
} from "../../shared/model";

/* ---------- モック専用: 本体では I/O の結果として決まる状態を、利用者が切り替えて確かめる ---------- */

export type WorkspacePhase = "unselected" | "permission" | "open";
export type CornixLoad = "ready" | "missing" | "legacy" | "error";
export type NextSave = "ok" | "error" | "conflict";
export type DiagnosticSource = "desired" | "invalid-cases";
export type MockState = {
  workspace: WorkspacePhase;
  cornixLoad: CornixLoad;
  jisState: "ready" | "missing" | "error";
  nextSave: NextSave;
  diagnostics: DiagnosticSource;
};
export function useMockState() {
  const [mock, setMock] = useState<MockState>({
    workspace: "open",
    cornixLoad: "ready",
    jisState: "ready",
    nextSave: "ok",
    diagnostics: "desired",
  });
  const update = useCallback(<K extends keyof MockState>(key: K, value: MockState[K]) => {
    setMock((m) => ({ ...m, [key]: value }));
  }, []);
  return { mock, update };
}

/* ---------- 編集中の文書（目標状態）と表示名 ---------- */

export function useDocuments() {
  const [cornixDoc, setCornixDoc] = useState<CornixDoc>(initialCornixDoc);
  const [macDocs, setMacDocs] = useState<Record<"mac-ansi" | "mac-jis", MacDoc>>(() => ({
    "mac-ansi": initialMacDoc("mac-ansi"),
    "mac-jis": initialMacDoc("mac-jis"),
  }));
  /** cornix/labels.yaml の表示名。raw 式に完全一致で付ける。 */
  const [names, setNames] = useState<Record<string, string>>({});
  const [layerNames, setLayerNames] = useState<Record<number, string>>({});

  const rawAt = useCallback(
    (target: TargetId, layer: number, selection: Selection): string | undefined => {
      if (!selection) return undefined;
      if (target === "cornix") {
        if (selection.kind === "key")
          return cornixDoc.keys[layer]?.[keyId(selection.row, selection.col)];
        if (selection.kind === "encoder")
          return cornixDoc.encoders[layer]?.[selection.index]?.[selection.direction];
        return undefined;
      }
      if (selection.kind !== "macKey") return undefined;
      return macDocs[target][layer]?.[selection.keyCode];
    },
    [cornixDoc, macDocs],
  );

  const assign = useCallback(
    (target: TargetId, layer: number, selection: Selection, raw: string | null) => {
      if (!selection) return;
      if (target === "cornix") {
        setCornixDoc((doc) => {
          if (raw === null) return doc;
          if (selection.kind === "key") {
            const keys = doc.keys.slice();
            keys[layer] = { ...keys[layer], [keyId(selection.row, selection.col)]: raw };
            return { ...doc, keys };
          }
          if (selection.kind === "encoder") {
            const encoders = doc.encoders.slice();
            encoders[layer] = encoders[layer].map((e, i) =>
              i === selection.index ? { ...e, [selection.direction]: raw } : e,
            );
            return { ...doc, encoders };
          }
          return doc;
        });
        return;
      }
      if (selection.kind !== "macKey") return;
      setMacDocs((docs) => {
        const layerDoc = { ...(docs[target][layer] ?? {}) };
        if (raw === null) delete layerDoc[selection.keyCode];
        else layerDoc[selection.keyCode] = raw;
        return { ...docs, [target]: { ...docs[target], [layer]: layerDoc } };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setCornixDoc(initialCornixDoc());
    setMacDocs({ "mac-ansi": initialMacDoc("mac-ansi"), "mac-jis": initialMacDoc("mac-jis") });
  }, []);

  return {
    cornixDoc,
    setCornixDoc,
    macDocs,
    names,
    setNames,
    layerNames,
    setLayerNames,
    rawAt,
    assign,
    reset,
  };
}

/* ---------- 編集の現在地（対象、layer、選択、適用先） ---------- */

export function useCursor() {
  const [target, setTarget] = useState<TargetId>("cornix");
  const [layers, setLayers] = useState<Record<TargetId, number>>({
    cornix: 0,
    "mac-ansi": 0,
    "mac-jis": 0,
  });
  const [selection, setSelection] = useState<Selection>({ kind: "key", row: 0, col: 3 });
  const [pickTarget, setPickTarget] = useState<PickTarget>("whole");
  const changeTarget = useCallback((next: TargetId) => {
    setTarget(next);
    setSelection(null);
    setPickTarget("whole");
  }, []);
  const setLayer = useCallback(
    (layer: number) => setLayers((l) => ({ ...l, [target]: layer })),
    [target],
  );
  return {
    target,
    changeTarget,
    layer: layers[target],
    setLayer,
    selection,
    setSelection,
    pickTarget,
    setPickTarget,
  };
}

/* ---------- 保存キュー（ファイルごと） ---------- */

export type SaveStatus = "idle" | "saving" | "saved" | "error" | "conflict";
export type SaveEntry = { status: SaveStatus; at?: string };
export type SaveFile =
  | "keymap.yaml"
  | "cornix/labels.yaml"
  | "mac-keyboard.ansi.yaml"
  | "mac-keyboard.jis.yaml";

/** 1 か所にまとめて示すときの優先順（本体の save-state.ts と同じ）。 */
export const SAVE_PRIORITY: SaveStatus[] = ["conflict", "error", "saving", "saved", "idle"];

export function useSaveQueue(nextSave: NextSave) {
  const [files, setFiles] = useState<Partial<Record<SaveFile, SaveEntry>>>({
    "keymap.yaml": { status: "saved", at: "12:04" },
  });
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const save = useCallback(
    (file: SaveFile) => {
      setFiles((f) => {
        if (f[file]?.status === "conflict") return f;
        return { ...f, [file]: { status: "saving" } };
      });
      const id = window.setTimeout(() => {
        const now = new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" });
        setFiles((f) => {
          if (f[file]?.status === "conflict") return f;
          const status: SaveStatus = nextSave === "ok" ? "saved" : nextSave;
          return { ...f, [file]: { status, at: now } };
        });
      }, 450);
      timers.current.push(id);
    },
    [nextSave],
  );
  const retry = save;
  /** 再読込。競合を解き、ディスクの内容を取り込む。 */
  const reload = useCallback(() => setFiles({}), []);
  return { files, save, retry, reload };
}

/* ---------- 実機（Cornix LP のみ） ---------- */

export type DevicePhase = "disconnected" | "connected" | "reading" | "read";
export function useDevice() {
  const [phase, setPhase] = useState<DevicePhase>("read");
  const [current, setCurrent] = useState<CornixDoc>(deviceCornixDoc);
  const [roundTrips, setRoundTrips] = useState(0);
  const [readAt, setReadAt] = useState("12:04");
  const total = cornix.device.fullReadRoundTrips.documented;

  const connect = useCallback(() => setPhase("connected"), []);
  const disconnect = useCallback(() => setPhase("disconnected"), []);
  const read = useCallback(
    (onDone?: () => void) => {
      setPhase("reading");
      setRoundTrips(0);
      let n = 0;
      const id = window.setInterval(() => {
        n = Math.min(total, n + 12);
        setRoundTrips(n);
        if (n >= total) {
          window.clearInterval(id);
          setPhase("read");
          setReadAt(new Date().toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" }));
          onDone?.();
        }
      }, 40);
    },
    [total],
  );
  return {
    phase,
    setPhase,
    connect,
    disconnect,
    read,
    roundTrips,
    total,
    current,
    setCurrent,
    readAt,
  };
}

export function useDiff(device: CornixDoc, desired: CornixDoc, names: Record<string, string>) {
  return useMemo(() => diffCornix(device, desired, names), [device, desired, names]);
}

/* ---------- Apply（線形の 5 段階） ---------- */

export const APPLY_STEPS = ["backup", "差分確認", "確認", "書き込み", "結果"] as const;
export type ApplyPhase =
  | { step: 0; roundTrips: number }
  | { step: 1 }
  | { step: 2 }
  | { step: 3; verified: number }
  | { step: 4; outcome: "done" | "aborted"; verified: number };

export function useApply() {
  const [phase, setPhase] = useState<ApplyPhase | null>(null);
  const timer = useRef<number | null>(null);
  const stop = () => {
    if (timer.current !== null) window.clearInterval(timer.current);
    timer.current = null;
  };
  useEffect(() => stop, []);

  const open = useCallback((total: number) => {
    stop();
    setPhase({ step: 0, roundTrips: 0 });
    let n = 0;
    timer.current = window.setInterval(() => {
      n = Math.min(total, n + 14);
      setPhase({ step: 0, roundTrips: n });
      if (n >= total) {
        stop();
        setPhase({ step: 1 });
      }
    }, 40);
  }, []);
  const next = useCallback(() => setPhase((p) => p && (p.step === 1 ? { step: 2 } : p)), []);
  const write = useCallback((count: number, onDone: () => void) => {
    stop();
    setPhase({ step: 3, verified: 0 });
    let n = 0;
    timer.current = window.setInterval(() => {
      n += 1;
      if (n >= count) {
        stop();
        setPhase({ step: 4, outcome: "done", verified: count });
        onDone();
        return;
      }
      setPhase({ step: 3, verified: n });
    }, 700);
  }, []);
  const abort = useCallback(() => {
    stop();
    setPhase((p) => ({
      step: 4,
      outcome: "aborted",
      verified: p && p.step === 3 ? p.verified : 0,
    }));
  }, []);
  const close = useCallback(() => {
    stop();
    setPhase(null);
  }, []);
  return { phase, open, next, write, abort, close };
}

/* ---------- 引き出し ---------- */

export type PanelId = "overview" | "behaviors" | "validation" | "device" | "files";
export const PANELS: { id: PanelId; label: string; short: string; cornixOnly: boolean }[] = [
  { id: "overview", label: "全体マップ", short: "全体", cornixOnly: true },
  { id: "behaviors", label: "動作定義", short: "動作", cornixOnly: true },
  { id: "validation", label: "検証", short: "検証", cornixOnly: false },
  { id: "device", label: "実機と適用", short: "実機", cornixOnly: false },
  { id: "files", label: "ファイル", short: "ファイル", cornixOnly: false },
];

export { composePick, targetOf };
