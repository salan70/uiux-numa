// Cornix Bonsai の実際の純関数で fixture を読み、隣の fixture.json を書き出す。
// Cornix のリポジトリは読むだけで、実機への I/O と Apply は行わない。
// 実行: CORNIX_REPO=<cornix-bonsai の絶対パス> nix develop $CORNIX_REPO -c $CORNIX_REPO/node_modules/.bin/tsx export-fixture.mts
import { readFile, writeFile } from "node:fs/promises";
import { webcrypto } from "node:crypto";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const R = process.env.CORNIX_REPO;
if (!R) throw new Error("CORNIX_REPO に cornix-bonsai の絶対パスを指定する");
const src = (p: string) => `${R}/src/${p}`;

const { parseVil } = await import(src("core/vil/parse.ts"));
const { parseDefinition, toPhysicalLayout } = await import(src("core/definition/parse.ts"));
const { canonicalDefinitionText } = await import(src("core/definition/identity.ts"));
const { boardMetrics, keyBox } = await import(src("render/geometry.ts"));
const { buildKeymapView, observeCapacities } = await import(src("core/model/keymap-view.ts"));
const { createKeycodeTable } = await import(src("core/keycode/table.ts"));
const { keycodeDisplay, keycodeClass, describeDisplayKeycode } = await import(
  src("ui/keycode-labels.ts")
);
const { ISO_JIS_ROWS, EXTRA_ROW, PICKER_GROUP_OFFSETS, PICKER_TOTAL_UNITS } = await import(
  src("ui/keycode-catalog.ts")
);
const { buildOverviewModel } = await import(src("ui/overview-model.ts"));
const { validateKeymap, validateApplyKeymap } = await import(src("core/validation/validate.ts"));
const { evaluateApplyGate } = await import(src("core/validation/gate.ts"));
const { subjectKey } = await import(src("core/validation/types.ts"));
const { collectReferenceUsage } = await import(src("core/validation/reference-usage.ts"));
const { analyzeReachability } = await import(src("core/validation/reachability.ts"));
const { classifyKeycode } = await import(src("core/validation/keycode-vocabulary.ts"));
const { diffDocuments } = await import(src("core/diff/diff.ts"));
const { describeSetting } = await import(src("core/diff/describe.ts"));
const { detectBulkChange } = await import(src("core/diff/bulk-change.ts"));
const { setKeyAssignment, setEncoderAssignment } = await import(src("core/model/edit.ts"));
const { createValidatedApplyInput, createApplyPlan, targetKey } = await import(
  src("core/apply/plan.ts")
);
const { snapshotFromDocument } = await import(src("device/protocol.ts"));
const { EMPTY_LABELS, layerLabel } = await import(src("workspace/labels.ts"));
const { CORNIX_LP_V112_SETTINGS, settingLabel } = await import(src("workspace/settings.ts"));
const { definitionDigest, definitionPath, macKeymapPath } = await import(
  src("workspace/layout.ts")
);
const { parseMacKeymapYaml } = await import(src("core/mac-keymap/parse.ts"));
const { macPhysicalLayout } = await import(src("core/mac-keymap/physical-layout.ts"));
const { validateMacKeymap } = await import(src("core/mac-keymap/validate.ts"));
const { macKeycodeSupport, generateKarabinerRules } = await import(
  src("core/mac-keymap/generate.ts")
);
const { macBoardEntries, macLayerNumbers } = await import(src("ui/mac-board.ts"));
const { macKeycapLabel } = await import(src("ui/mac-keycap-labels.ts"));
const { describeDevices, deviceIfText } = await import(src("ui/mac-references.ts"));
const { macScopeLabel } = await import(src("ui/mac-workspace.ts"));
const { readObservedKeyboards } = await import(src("karabiner/node.ts"));
const { KEYMAP_BOARD_SCALE, OVERVIEW_BOARD_SCALE } = await import(src("ui/use-board-scale.ts"));

const INPUTS = {
  vil: "fixtures/cornix-lp/baseline.vil",
  definition: "fixtures/cornix-lp/vial-definition-v1.12.json",
  macJis: "fixtures/mac-keyboard/desired.yaml",
  macAnsi: "mac-keyboard.ansi.yaml",
  karabinerDevices: "fixtures/mac-keyboard/karabiner-devices.json",
  invalidCases: "fixtures/cornix-lp/invalid-cases.vil",
};
const read = (p: string) => readFile(join(R, p), "utf8");

// JSON helpers: Map/Set -> plain JSON.
function plain(value: unknown): unknown {
  if (value instanceof Map) return Object.fromEntries([...value].map(([k, v]) => [String(k), plain(v)]));
  if (value instanceof Set) return [...value].map(plain);
  if (Array.isArray(value)) return value.map(plain);
  if (value !== null && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, plain(v)]));
  }
  return value;
}

const UNIT = { unit: 1, gap: 0 };
const labels = EMPTY_LABELS;

// ---------- Cornix ----------
const definitionText = await read(INPUTS.definition);
const definition = parseDefinition(definitionText);
const current = parseVil(await read(INPUTS.vil));
const physical = toPhysicalLayout(definition);

// 3 real edits via core edit functions.
const edits = [
  { kind: "key", position: { layer: 0, row: 0, col: 3 }, keycode: "KC_D", why: "plain basic key swap" },
  { kind: "key", position: { layer: 0, row: 7, col: 4 }, keycode: "LT3(KC_ENTER)", why: "layer-tap on a right thumb key (was KC_ENTER)" },
  { kind: "encoder", position: { layer: 0, index: 1, direction: 1 }, keycode: "LGUI(KC_RIGHT)", why: "encoder 1 clockwise (was LCTL(KC_RIGHT))" },
] as const;
let desired = current;
const editLog: unknown[] = [];
for (const edit of edits) {
  if (edit.kind === "key") {
    const before = desired.layout[edit.position.layer][edit.position.row][edit.position.col];
    desired = setKeyAssignment(desired, edit.position, edit.keycode);
    editLog.push({ fn: "setKeyAssignment", ...edit, before, after: edit.keycode });
  } else {
    const before = desired.encoderLayout[edit.position.layer][edit.position.index][edit.position.direction];
    desired = setEncoderAssignment(desired, edit.position, edit.keycode);
    editLog.push({ fn: "setEncoderAssignment", ...edit, before, after: edit.keycode });
  }
}

const view = buildKeymapView(desired, definition);
const table = createKeycodeTable(definition, view.capacities);

function display(keycode: string) {
  return {
    raw: keycode,
    display: {
      compact: keycodeDisplay(keycode, labels, table, { compact: true }),
      full: keycodeDisplay(keycode, labels, table, { compact: false }),
    },
    class: keycodeClass(keycode),
    kind: classifyKeycode(keycode).kind,
    describe: describeDisplayKeycode(keycode, table),
  };
}

// Board: metrics over layer-0 physical keys, exactly as KeymapTab does.
const layer0Keys = view.keys.filter((k: any) => k.position.layer === 0);
const metrics = boardMetrics(layer0Keys.map((k: any) => k.physical));
const boardKeys = layer0Keys.map((k: any) => ({
  row: k.position.row,
  col: k.position.col,
  physical: k.physical,
  box: keyBox(k.physical, metrics, UNIT),
}));

// Encoders
const encoderIndices = [...new Set(physical.encoders.map((e: any) => e.index))].sort((a: any, b: any) => a - b);
const encoderInfo = {
  count: encoderIndices.length,
  perLayerSlots: desired.encoderLayout[0]?.length,
  physical: physical.encoders.map((e: any) => ({
    ...e,
    directionName: e.direction === 0 ? "ccw" : "cw",
    boardOffsetU: { x: e.x - metrics.minX, y: e.y - metrics.minY },
  })),
  pushKeys: {
    _missing:
      "definition (vial.json KLE) and core code do not map encoder push switches to matrix keys; no function derives it. (Observation only, not code-derived: matrix col 6 holds physical keys only at (2,6) KC_MUTE and (5,6) KC_NO, placed at board center x=6 / x=7.5, y=2 — not at the encoder KLE positions.)",
  },
};

const layers = Array.from({ length: view.capacities.layerCount }, (_, layer) => {
  const keys: Record<string, unknown> = {};
  for (const k of view.keys.filter((k: any) => k.position.layer === layer)) {
    keys[`${k.position.row},${k.position.col}`] = display(k.keycode);
  }
  const encoders = encoderIndices.map((index) => {
    const pick = (dir: "ccw" | "cw") =>
      view.encoders.find((e: any) => e.layer === layer && e.index === index && e.direction === dir);
    const ccw = pick("ccw");
    const cw = pick("cw");
    return { index, ccw: ccw ? display(ccw.keycode) : null, cw: cw ? display(cw.keycode) : null };
  });
  const assigned =
    view.keys.some((e: any) => e.position.layer === layer && e.keycode !== "KC_NO" && e.keycode !== "KC_TRNS") ||
    view.encoders.some((e: any) => e.layer === layer && e.keycode !== "KC_NO" && e.keycode !== "KC_TRNS");
  return { index: layer, name: layerLabel(labels, layer), assignedChipShown: assigned, keys, encoders };
});

const usage = collectReferenceUsage(desired);
const reachability = analyzeReachability(desired);

const tapDances = desired.tapDance.map((entry: any, index: number) => ({
  index,
  keycode: `TD(${index})`,
  usageCount: usage.tapDance.get(index) ?? 0,
  tap: display(entry[0]),
  hold: display(entry[1]),
  doubleTap: display(entry[2]),
  holdAfterTap: display(entry[3]),
  timeoutMs: entry[4],
  raw: entry,
}));
const combos = desired.combo.map((entry: any, index: number) => ({
  index,
  inputs: entry.slice(0, 4).map(display),
  output: display(entry[4]),
  raw: entry,
}));
const settings = Object.entries(desired.settings).map(([qsid, value]) => ({
  qsid: Number(qsid),
  label: CORNIX_LP_V112_SETTINGS.get(Number(qsid)) ?? null,
  settingLabel: settingLabel(Number(qsid)),
  value,
  describe: describeSetting(Number(qsid), value as number, { labels: CORNIX_LP_V112_SETTINGS }),
}));

function diag(d: any) {
  return { id: d.id, severity: d.severity, code: d.code, message: d.message, target: subjectKey(d.subject), subject: d.subject, details: d.details };
}
const validation = validateKeymap(desired, definition);

const overview = buildOverviewModel(desired);

const references = {
  usages: {
    tapDance: [...usage.tapDance.entries()].map(([index, count]: any) => ({ keycode: `TD(${index})`, count })),
    macro: [...usage.macro.entries()].map(([index, count]: any) => ({ keycode: `M(${index})`, count })),
  },
  unused: {
    tapDance: desired.tapDance.map((_: any, i: number) => i).filter((i: number) => !usage.tapDance.has(i)).map((i: number) => `TD(${i})`),
    macro: desired.macro.map((_: any, i: number) => i).filter((i: number) => !usage.macro.has(i)).map((i: number) => `M(${i})`),
  },
  unreachableLayers: desired.layout.map((_: any, i: number) => i).filter((i: number) => !reachability.reachable.has(i)),
  reachability: { reachable: [...reachability.reachable].sort((a: any, b: any) => a - b), edges: reachability.edges, emptyLayers: reachability.emptyLayers },
  diagnostics: validation.diagnostics.map(diag),
};

// Picker
function pickerEntry(entry: any) {
  if (!("keycode" in entry)) return { kind: "spacer", u: entry.u ?? 1 };
  return {
    kind: "key",
    u: entry.u ?? 1,
    keycode: entry.keycode,
    label: keycodeDisplay(entry.keycode, labels, table, { compact: true }),
    class: keycodeClass(entry.keycode),
    macSupported: macKeycodeSupport(entry.keycode).ok,
  };
}
const picker = {
  totalUnits: PICKER_TOTAL_UNITS,
  groupOffsets: PICKER_GROUP_OFFSETS,
  groupWidths: { main: 16, nav: 3, numpad: 4, _note: "hard-coded in KeycodePicker.tsx PickerGroup" },
  rows: ISO_JIS_ROWS.map((row: any) => ({
    main: (row.main ?? []).map(pickerEntry),
    nav: (row.nav ?? []).map(pickerEntry),
    numpad: (row.numpad ?? []).map(pickerEntry),
  })),
  extraRow: EXTRA_ROW.map(pickerEntry),
};

// Device diff (current = baseline as if full-read, desired = edited)
const diff = diffDocuments(current, desired, definition, { settings: { labels: CORNIX_LP_V112_SETTINGS } });
const diffRows = diff.entries.map((e: any) => ({
  target: subjectKey(e.subject),
  subject: e.subject,
  change: e.change,
  notationOnly: e.change === "notationOnly",
  before: e.before,
  after: e.after,
  beforeBehavior: e.beforeBehavior,
  afterBehavior: e.afterBehavior,
  beforeDisplay: e.before === "" ? null : display(e.before).display,
  afterDisplay: e.after === "" ? null : display(e.after).display,
}));

// Transcription of src/ui/main.tsx toWriteTarget (not exported there).
function toWriteTarget(entry: any): any {
  const s = entry.subject;
  switch (s.kind) {
    case "key": return s.layer < 0 ? undefined : { kind: "key", layer: s.layer, row: s.row, col: s.col };
    case "encoder": return { kind: "encoder", layer: s.layer, index: s.index, direction: s.direction === "ccw" ? 0 : 1 };
    case "tapDance": return { kind: "tapDance", index: s.index };
    case "combo": return { kind: "combo", index: s.index };
    case "setting": return { kind: "setting", qsid: s.qsid };
    default: return undefined;
  }
}
const targets = diff.entries.map(toWriteTarget).filter((t: any) => t !== undefined);
const digest = await definitionDigest(definitionText, webcrypto as any);
const binding = { path: definitionPath(digest), digest };
const deviceProfile = {
  keyboardUid: current.uid,
  capacities: observeCapacities(current),
  supportedQsids: Object.keys(current.settings).map(Number),
};
const applyValidation = validateApplyKeymap(desired, definition, deviceProfile, binding, targets);
const gate = evaluateApplyGate(applyValidation.evidence, []);
let applyPlan: unknown;
try {
  const ackAll = gate.acknowledgeable.map((d: any) => d.id);
  const gateAcked = evaluateApplyGate(applyValidation.evidence, ackAll);
  const backup = { ...snapshotFromDocument(current, definition), readAt: 0 };
  const plan = createApplyPlan(createValidatedApplyInput(gateAcked, backup));
  applyPlan = {
    note: "createApplyPlan with backup = snapshotFromDocument(baseline) (simulated full read) and all warnings acknowledged; nothing was written",
    acknowledgedIds: ackAll,
    fingerprint: plan.fingerprint,
    operations: plan.operations.map((op: any) => ({ targetKey: targetKey(op.target), ...op })),
  };
} catch (error) {
  applyPlan = { _missing: `createApplyPlan threw: ${error instanceof Error ? error.message : String(error)}` };
}

const desiredDiagnostics = {
  note: "validateApplyKeymap(desired, definition, deviceProfile{uid,capacities,supportedQsids from baseline}, binding, diff targets) + evaluateApplyGate(evidence, []) — same path as src/ui/main.tsx applyGate with no acknowledgements and matching definition digest",
  deviceProfile,
  definitionBinding: binding,
  summary: applyValidation.summary,
  diagnostics: applyValidation.diagnostics.map(diag),
  gate: {
    allowed: gate.allowed,
    blocking: gate.blocking.map(diag),
    acknowledgeable: gate.acknowledgeable.map(diag),
    fatal: gate.fatal.map(diag),
  },
  bulkChange: plain(detectBulkChange(diff)),
  applyPlan,
};

const cornix = {
  documentShown: "desired (workspace document = baseline + 3 edits); board/layers/overview/references/diagnostics are computed on it, as the UI does for the workspace",
  keyboard: { name: definition.name, vendorId: definition.vendorId, productId: definition.productId, matrix: definition.matrix, uid: desired.uid, vialProtocol: desired.vialProtocol, viaProtocol: desired.viaProtocol },
  capacities: view.capacities,
  customKeycodes: table.customKeycodes,
  layoutOptions: view.layoutOptions,
  orphanPositions: view.orphanPositions,
  board: {
    unit: "KLE u (keyBox called with scale {unit:1, gap:0}); multiply by px-per-u, subtract gap from width/height",
    scalePresets: { keymap: KEYMAP_BOARD_SCALE, overview: OVERVIEW_BOARD_SCALE, gapFormula: "gap = max(minGap, round(unit*gapRatio))" },
    metrics,
    keys: boardKeys,
    encoders: encoderInfo,
  },
  layers,
  tapDances,
  combos,
  combosNote: "baseline.vil has 32 combo slots, all KC_NO (combo unused per fixtures/README)",
  macros: desired.macro,
  settings,
  overview: plain(overview),
  diagnostics: { summary: validation.summary, items: validation.diagnostics.map(diag) },
  references,
  picker,
  device: {
    note: "current = baseline.vil; desired = baseline with 3 real edits applied via core edit functions",
    edits: editLog,
    diff: {
      changedCount: diff.changedCount,
      notationOnlyCount: diff.notationOnlyCount,
      comparedCount: diff.comparedCount,
      layers: plain(diff.layers),
      rows: diffRows,
    },
    fullReadRoundTrips: {
      _missing: "no code constant; readVialDevice counts round trips dynamically (VialSession progress). Documented measurement is 168 round trips for Cornix LP",
      documented: 168,
      documentedIn: "docs/decisions/0004-webhid-transport.md",
    },
  },
  desiredDiagnostics,
  invalidCasesDiagnostics: await (async () => {
    const doc = parseVil(await read(INPUTS.invalidCases));
    const v = validateKeymap(doc, definition);
    const g = evaluateApplyGate(v.diagnostics, []);
    return {
      note: "supplementary: validateKeymap + evaluateApplyGate on fixtures/cornix-lp/invalid-cases.vil (synthetic fixture built to hit error/warning); baseline-derived desired has none",
      summary: v.summary,
      items: v.diagnostics.map(diag),
      gate: { allowed: g.allowed, acknowledgeableIds: g.acknowledgeable.map((d: any) => d.id), fatalIds: g.fatal.map((d: any) => d.id) },
    };
  })(),
};

// ---------- Mac ----------
const observed = await readObservedKeyboards(join(R, INPUTS.karabinerDevices));

async function macSide(layout: "ansi" | "jis", path: string | undefined) {
  const phys = macPhysicalLayout(layout);
  const m = boardMetrics(phys);
  const physicalOut = phys.map((p: any) => ({ keyCode: p.keyCode, shape: p, box: keyBox(p, m, UNIT), cap: macKeycapLabel(p.keyCode, layout) }));
  const base = { layout, workspacePath: macKeymapPath(layout), metrics: m, physical: physicalOut };
  if (path === undefined) return { ...base, state: "missing" };
  let document: any;
  try {
    document = parseMacKeymapYaml(await read(path));
  } catch (error) {
    return { ...base, state: "error", sourcePath: path, reason: error instanceof Error ? error.message : String(error) };
  }
  const v = validateMacKeymap(document);
  const layerNums = macLayerNumbers(document);
  const macLayers = layerNums.map((layer: number) => {
    const assignments: Record<string, unknown> = {};
    for (const [keyCode, keycode] of document.layers.get(layer) ?? []) {
      assignments[keyCode] = {
        raw: keycode,
        display: {
          compact: keycodeDisplay(keycode, labels, undefined, { compact: true }),
          full: keycodeDisplay(keycode, labels, undefined, { compact: false }),
        },
        class: keycodeClass(keycode),
        kind: classifyKeycode(keycode).kind,
        support: macKeycodeSupport(keycode),
        describe: describeDisplayKeycode(keycode, undefined),
      };
    }
    const onBoard = new Set(macBoardEntries(document, layer).map((e: any) => e.keyCode));
    return {
      index: layer,
      assignments,
      passthroughCount: macBoardEntries(document, layer).filter((e: any) => e.keycode === undefined).length,
      assignedNotOnBoard: [...(document.layers.get(layer)?.keys() ?? [])].filter((k: string) => !onBoard.has(k)),
    };
  });
  const state = { kind: "ready", document, path: macKeymapPath(layout) };
  const assignmentCount = [...document.layers.values()].reduce((t: number, l: any) => t + l.size, 0);
  return {
    ...base,
    state: "ready",
    sourcePath: path,
    scopeLabel: macScopeLabel(state),
    document: plain(document),
    layers: macLayers,
    devices: { declared: document.devices, describe: describeDevices(document.devices), deviceIf: deviceIfText(document.devices), observedKeyboards: observed },
    diagnostics: { summary: v.summary, items: v.diagnostics.map(diag) },
    references: {
      file: macKeymapPath(layout),
      layout: document.layout.toUpperCase(),
      devices: describeDevices(document.devices),
      deviceIf: deviceIfText(document.devices),
      detectedBuiltInLayout: "Browser では検出しない。CLI が apply / diff 時に検出する。",
      layerCount: document.layers.size,
      assignmentCount,
      unsupportedCount: v.diagnostics.filter((d: any) => d.code.startsWith("mac-keymap/unsupported")).length,
    },
    generatedManipulatorCount: (() => {
      const g: any = generateKarabinerRules(document);
      return g.rules?.reduce?.((t: number, r: any) => t + (r.manipulators?.length ?? 0), 0);
    })(),
  };
}

const mac = {
  ansi: { ...(await macSide("ansi", INPUTS.macAnsi)), _sourceNote: "mac-keyboard.ansi.yaml is a tracked file at the cornix repo root (not under fixtures/)" },
  jis: await macSide("jis", INPUTS.macJis),
};

const out = {
  source: {
    repo: "salan70/cornix-bonsai",
    commit: "8381191",
    inputs: Object.values(INPUTS),
    generatedBy: "scratchpad/cornix-export/export.ts (tsx), real core/ui pure functions",
    labels: "EMPTY_LABELS (no labels.yaml in fixtures); layer names via layerLabel fallback",
  },
  cornix,
  mac,
};

const here = dirname(fileURLToPath(import.meta.url));
await writeFile(join(here, "fixture.json"), `${JSON.stringify(plain(out), null, 2)}\n`, "utf8");
console.log("wrote", join(here, "fixture.json"));
