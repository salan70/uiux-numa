// 画面に依存しない、編集対象・文書・差分の純粋な型と関数。
// 本体では Core の関数（applyPick、keycodeDisplay、diffDocuments）が担う部分を、fixture の範囲で写す。
import {
  classOf,
  cornix,
  displayOf,
  keyId,
  mac,
  type Assignment,
  type Display,
  type DiffRow,
} from "./fixture";

export type TargetId = "cornix" | "mac-ansi" | "mac-jis";
export const TARGETS: { id: TargetId; label: string; file: string }[] = [
  { id: "cornix", label: "Cornix LP", file: "keymap.yaml" },
  { id: "mac-ansi", label: "Mac ANSI", file: "mac-keyboard.ansi.yaml" },
  { id: "mac-jis", label: "Mac JIS", file: "mac-keyboard.jis.yaml" },
];
export const targetOf = (id: TargetId) => TARGETS.find((t) => t.id === id)!;
export const macLayoutOf = (id: TargetId) => (id === "mac-ansi" ? mac.ansi : mac.jis);

export type Selection =
  | { kind: "key"; row: number; col: number }
  | { kind: "encoder"; index: number; direction: "ccw" | "cw" }
  | { kind: "macKey"; keyCode: string }
  | null;

export type PickTarget = "whole" | "tap" | "hold";

/** Cornix の目標状態。layer ごとに `row,col` と encoder の raw keycode を持つ。 */
export type CornixDoc = {
  keys: Record<string, string>[];
  encoders: { ccw: string; cw: string }[][];
};
/** Mac の目標状態。layer 番号ごとに keyCode の raw keycode を持つ。割り当てが無いキーは素通し。 */
export type MacDoc = Record<number, Record<string, string>>;

export function initialCornixDoc(): CornixDoc {
  return {
    keys: cornix.layers.map((layer) =>
      Object.fromEntries(Object.entries(layer.keys).map(([id, a]) => [id, a.raw])),
    ),
    encoders: cornix.layers.map((layer) =>
      layer.encoders.map((e) => ({ ccw: e.ccw.raw, cw: e.cw.raw })),
    ),
  };
}

/** 実機の現在状態。fixture の目標状態から、書き出し時に加えた 3 件の編集を戻したもの（= baseline.vil）。 */
export function deviceCornixDoc(): CornixDoc {
  const doc = initialCornixDoc();
  for (const row of cornix.device.diff.rows) {
    const s = row.subject;
    if (s.kind === "key")
      doc.keys[s.layer as number][keyId(s.row as number, s.col as number)] = row.before;
    if (s.kind === "encoder")
      doc.encoders[s.layer as number][s.index as number][s.direction as "ccw" | "cw"] = row.before;
  }
  return doc;
}

export function initialMacDoc(id: TargetId): MacDoc {
  const layout = macLayoutOf(id);
  return Object.fromEntries(
    layout.layers.map((layer) => [
      layer.index,
      Object.fromEntries(Object.entries(layer.assignments).map(([k, a]) => [k, a.raw])),
    ]),
  );
}

const MOD_SYMBOL: Record<string, string> = { CTL: "⌃", SFT: "⇧", ALT: "⌥", GUI: "⌘" };
/** picker の modifier keycode（Vial の表記）から mod-tap の接頭辞への対応。 */
const HOLD_MODIFIERS: Record<string, string> = {
  KC_LCTRL: "LCTL",
  KC_LSHIFT: "LSFT",
  KC_LALT: "LALT",
  KC_LGUI: "LGUI",
  KC_RCTRL: "RCTL",
  KC_RSHIFT: "RSFT",
  KC_RALT: "RALT",
  KC_RGUI: "RGUI",
};
export const isHoldModifier = (keycode: string) => keycode in HOLD_MODIFIERS;

/** raw 式を tap 部分と hold 部分に分ける。mod-tap と layer-tap だけを扱う。 */
export function splitTapHold(raw: string): { tap: string; hold?: string; holdLabel?: string } {
  const modTap = raw.match(/^([LR](CTL|SFT|ALT|GUI))_T\((.+)\)$/);
  if (modTap) {
    const hold = Object.keys(HOLD_MODIFIERS).find((k) => HOLD_MODIFIERS[k] === modTap[1]);
    return { tap: modTap[3], hold, holdLabel: MOD_SYMBOL[modTap[2]] };
  }
  const layerTap = raw.match(/^LT(\d+)\((.+)\)$/);
  if (layerTap)
    return { tap: layerTap[2], hold: `MO(${layerTap[1]})`, holdLabel: `layer ${layerTap[1]}` };
  return { tap: raw };
}

/** picker で選んだ keycode を、キー全体・Tap・Hold の適用先に合わせて組み立てる（本体の applyPick に相当）。 */
export function composePick(current: string, picked: string, target: PickTarget): string {
  if (target === "whole") return picked;
  const parts = splitTapHold(current);
  if (target === "tap") {
    const layerTap = current.match(/^LT(\d+)\(/);
    if (layerTap) return `LT${layerTap[1]}(${picked})`;
    const modTap = current.match(/^([LR](CTL|SFT|ALT|GUI))_T\(/);
    if (modTap) return `${modTap[1]}_T(${picked})`;
    return picked;
  }
  const mod = HOLD_MODIFIERS[picked];
  return mod ? `${mod}_T(${parts.tap})` : current;
}

export type KeyView = { primary: string; role?: string; kind: string; raw: string };

/** raw 式の keycap 表示。表示名があれば優先する。 */
export function viewOf(raw: string, names: Record<string, string>, compact = true): KeyView {
  const name = names[raw];
  const known = displayOf(raw);
  const kind = kindOf(raw);
  if (name) return { primary: name, raw, kind };
  if (known) {
    const d: Display = compact ? known.compact : known.full;
    return { primary: d.primary, role: d.role, kind, raw };
  }
  const parts = splitTapHold(raw);
  if (parts.hold) {
    const inner = displayOf(parts.tap)?.compact.primary ?? parts.tap.replace(/^KC_/, "");
    return { primary: inner, role: parts.holdLabel, kind, raw };
  }
  return { primary: raw.replace(/^KC_/, ""), kind, raw };
}

export function kindOf(raw: string): string {
  const known = classOf(raw);
  if (known) return known;
  if (raw === "KC_NO") return "none";
  if (raw === "KC_TRNS" || raw === "KC_TRANSPARENT") return "transparent";
  if (/^LT\d+\(/.test(raw)) return "layer-tap";
  if (/^(MO|TG|TO|DF|OSL|TT)\(/.test(raw)) return "layer";
  if (/^[LR](CTL|SFT|ALT|GUI)_T\(/.test(raw)) return "mod-tap";
  if (/^TD\(/.test(raw)) return "tapdance";
  if (/^(USER|CUSTOM|BT|M)\d*/.test(raw) && !raw.startsWith("KC_")) return "custom";
  if (/^[A-Z]+\(/.test(raw)) return "mod";
  if (/^KC_[LR](CTL|CTRL|SFT|SHIFT|ALT|GUI)$/.test(raw)) return "mod";
  return "basic";
}

/** 実機の現在状態と目標状態の差分（本体の diffDocuments に相当。key と encoder だけを比べる）。 */
export function diffCornix(
  device: CornixDoc,
  desired: CornixDoc,
  names: Record<string, string>,
): DiffRow[] {
  const rows: DiffRow[] = [];
  const disp = (raw: string) => {
    const v = viewOf(raw, names, false);
    const d = { primary: v.primary, role: v.role };
    return { compact: d, full: d };
  };
  desired.keys.forEach((layer, l) => {
    for (const [id, after] of Object.entries(layer)) {
      const before = device.keys[l][id];
      if (before === after) continue;
      const [row, col] = id.split(",").map(Number);
      rows.push({
        target: `key:${l}:${row}:${col}`,
        subject: { kind: "key", layer: l, row, col },
        change: "changed",
        notationOnly: false,
        before,
        after,
        beforeBehavior: behaviorOf(before),
        afterBehavior: behaviorOf(after),
        beforeDisplay: disp(before),
        afterDisplay: disp(after),
      });
    }
  });
  desired.encoders.forEach((layer, l) =>
    layer.forEach((enc, index) =>
      (["ccw", "cw"] as const).forEach((direction) => {
        const before = device.encoders[l][index][direction];
        const after = enc[direction];
        if (before === after) return;
        rows.push({
          target: `encoder:${l}:${index}:${direction}`,
          subject: { kind: "encoder", layer: l, index, direction },
          change: "changed",
          notationOnly: false,
          before,
          after,
          beforeBehavior: behaviorOf(before),
          afterBehavior: behaviorOf(after),
          beforeDisplay: disp(before),
          afterDisplay: disp(after),
        });
      }),
    ),
  );
  return rows;
}

const knownDescribe = new Map<string, string>();
for (const layer of cornix.layers) {
  for (const a of Object.values(layer.keys)) knownDescribe.set(a.raw, a.describe);
  for (const e of layer.encoders)
    [e.ccw, e.cw].forEach((a: Assignment) => knownDescribe.set(a.raw, a.describe));
}
for (const row of cornix.device.diff.rows) {
  knownDescribe.set(row.before, row.beforeBehavior);
  knownDescribe.set(row.after, row.afterBehavior);
}
export function behaviorOf(raw: string): string {
  const known = knownDescribe.get(raw);
  if (known) return known;
  const parts = splitTapHold(raw);
  if (parts.hold) return `tap で ${parts.tap} / hold で ${parts.holdLabel}`;
  return raw;
}

export function subjectLabel(subject: DiffRow["subject"]): string {
  if (subject.kind === "key")
    return `layer ${subject.layer} / row ${subject.row} col ${subject.col}`;
  if (subject.kind === "encoder")
    return `layer ${subject.layer} / encoder ${subject.index} ${subject.direction === "ccw" ? "左回し" : "右回し"}`;
  if (subject.kind === "layer") return `layer ${subject.layer}`;
  if (subject.kind === "tapDance") return `Tap Dance ${subject.index}`;
  if (subject.kind === "combo") return `Combo ${subject.index}`;
  return "文書全体";
}
