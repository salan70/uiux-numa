// Cornix Bonsai の fixture を実際の純関数で読んだスナップショット（出典は fixture.json の source）。
// 値は export-fixture.mts が書き出す。手で編集しない。
import raw from "./fixture.json";

export type Display = { primary: string; role?: string; name?: string; raw?: string };
export type Assignment = {
  raw: string;
  display: { compact: Display; full: Display };
  class: string;
  kind: string;
  describe: string;
  support?: { ok: boolean; reason?: string };
};
export type Box = {
  left: number;
  top: number;
  width: number;
  height: number;
  angle: number;
  originX: number;
  originY: number;
};
export type BoardKey = { row: number; col: number; box: Box };
export type EncoderSlots = { index: number; ccw: Assignment; cw: Assignment };
export type Layer = {
  index: number;
  name: string;
  keys: Record<string, Assignment>;
  encoders: EncoderSlots[];
};
export type PickerCell =
  | {
      kind: "key";
      u: number;
      keycode: string;
      label: Display;
      class: string;
      macSupported: boolean;
    }
  | { kind: "spacer"; u: number };
export type PickerRow = { main: PickerCell[]; nav: PickerCell[]; numpad: PickerCell[] };
export type Subject =
  | { kind: "key"; layer: number; row: number; col: number }
  | { kind: "encoder"; layer: number; index: number; direction: "ccw" | "cw" }
  | { kind: "layer"; layer: number }
  | { kind: "tapDance"; index: number }
  | { kind: "combo"; index: number }
  | { kind: "document" }
  | { kind: string; [key: string]: unknown };
export type Diagnostic = {
  id: string;
  severity: "error" | "warning" | "information";
  code: string;
  message: string;
  target: string;
  subject: Subject;
};
export type DiffRow = {
  target: string;
  subject: Subject;
  change: "added" | "changed" | "removed";
  notationOnly: boolean;
  before: string;
  after: string;
  beforeBehavior: string;
  afterBehavior: string;
  beforeDisplay: { compact: Display; full: Display };
  afterDisplay: { compact: Display; full: Display };
};
export type OverviewReference = {
  source: { kind: string; id: string; layer?: number; row?: number; col?: number; keycode: string };
  targetLayer: number;
  action: string;
};
export type TapDance = {
  index: number;
  keycode: string;
  usageCount: number;
  tap: Assignment;
  hold: Assignment;
  doubleTap: Assignment;
  holdAfterTap: Assignment;
  timeoutMs: number;
};
export type Combo = { index: number; inputs: Assignment[]; output: Assignment };
export type Setting = {
  qsid: number;
  label: string;
  settingLabel: string;
  value: number;
  describe: string;
};
export type MacPhysicalKey = { keyCode: string; box: Box; cap: string };
export type MacLayout = {
  state: "ready" | "missing" | "error";
  layout: string;
  sourcePath?: string;
  workspacePath?: string;
  scopeLabel?: string;
  metrics: { width: number; height: number };
  physical: MacPhysicalKey[];
  layers: { index: number; assignments: Record<string, Assignment> }[];
  devices: { describe: string; deviceIf: string };
  references: {
    file: string;
    layout: string;
    devices: string;
    deviceIf: string;
    detectedBuiltInLayout: string;
    layerCount: number;
    assignmentCount: number;
    unsupportedCount: number;
  };
  diagnostics: { summary: Record<string, number>; items: Diagnostic[] };
  generatedManipulatorCount?: number;
};

type Fixture = {
  source: { repo: string; commit: string; inputs: string[] };
  cornix: {
    keyboard: { name: string; uid: string };
    board: {
      metrics: { width: number; height: number };
      keys: BoardKey[];
      scalePresets: {
        keymap: { minUnit: number; maxUnit: number; minGap: number; gapRatio: number };
      };
      encoders: { count: number };
    };
    layers: Layer[];
    tapDances: TapDance[];
    combos: Combo[];
    settings: Setting[];
    overview: {
      visibleLayers: number[];
      hiddenLayers: number[];
      references: OverviewReference[];
      tapDances: { index: number; usageCount: number }[];
    };
    diagnostics: { summary: Record<string, number>; items: Diagnostic[] };
    invalidCasesDiagnostics: {
      summary: Record<string, number>;
      items: Diagnostic[];
      gate: { allowed: boolean; acknowledgeableIds: string[]; fatalIds: string[] };
    };
    references: {
      usages: {
        tapDance: { keycode: string; count: number }[];
        macro: { keycode: string; count: number }[];
      };
      unused: { tapDance: string[]; macro: string[] };
      unreachableLayers: number[];
    };
    picker: {
      rows: PickerRow[];
      extraRow: PickerCell[];
      groupOffsets: { main: number; nav: number; numpad: number };
      totalUnits: number;
    };
    device: {
      diff: { rows: DiffRow[] };
      fullReadRoundTrips: { documented: number };
    };
    desiredDiagnostics: {
      deviceProfile: { keyboardUid: string };
      definitionBinding: { path: string; digest: string };
    };
  };
  mac: { ansi: MacLayout; jis: MacLayout };
};

export const fixture = raw as unknown as Fixture;
export const cornix = fixture.cornix;
export const mac = fixture.mac;

/** 盤面の位置キー。Cornix の keymap.yaml と同じく `row,col` で引く。 */
export const keyId = (row: number, col: number) => `${row},${col}`;

const classes = new Map<string, string>();

/** fixture に現れる raw keycode の表示。新しく選んだ keycode の表示に使う。 */
export const displayOf = (() => {
  const table = new Map<string, Assignment["display"]>();
  const add = (a?: Assignment) => {
    if (a && !table.has(a.raw)) table.set(a.raw, a.display);
    if (a && !classes.has(a.raw)) classes.set(a.raw, a.class);
  };
  for (const layer of cornix.layers) {
    Object.values(layer.keys).forEach(add);
    layer.encoders.forEach((e) => (add(e.ccw), add(e.cw)));
  }
  for (const row of [
    ...cornix.picker.rows.flatMap((r) => [...r.main, ...r.nav, ...r.numpad]),
    ...cornix.picker.extraRow,
  ]) {
    if (row.kind === "key" && !table.has(row.keycode))
      table.set(row.keycode, { compact: row.label, full: row.label });
    if (row.kind === "key" && !classes.has(row.keycode)) classes.set(row.keycode, row.class);
  }
  for (const layout of [mac.ansi, mac.jis])
    for (const layer of layout.layers) Object.values(layer.assignments).forEach(add);
  return (keycode: string) => table.get(keycode);
})();

/** 本体の keycodeClass が fixture の raw に付けた分類。fixture に無い raw は undefined。 */
export const classOf = (keycode: string) => classes.get(keycode);
