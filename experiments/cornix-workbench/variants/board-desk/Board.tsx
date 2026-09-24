import { useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";
import { cornix, keyId, type Box } from "../../shared/fixture";
import { macLayoutOf, viewOf, type Selection, type TargetId } from "../../shared/model";

type Scale = { unit: number; gap: number };

/** 盤面の 1u を container の実測幅と高さ予算から決める（本体の fitUnit と keymap preset に合わせる）。 */
function useBoardScale(widthU: number, heightU: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState<Scale>({ unit: 40, gap: 4 });
  useLayoutEffect(() => {
    // 盤面自身の大きさで高さが決まる要素を測ると、倍率が自分の出力に依存する。大きさが外から決まる親を測る。
    const el = ref.current?.parentElement;
    if (!el) return;
    const preset = cornix.board.scalePresets.keymap;
    const measure = () => {
      const style = getComputedStyle(el);
      const padX = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const padY = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
      const byWidth = (el.clientWidth - padX) / widthU;
      const byHeight = (el.clientHeight - padY) / heightU;
      const unit = Math.max(
        preset.minUnit,
        Math.min(preset.maxUnit, Math.floor(Math.min(byWidth, byHeight))),
      );
      setScale({ unit, gap: Math.max(preset.minGap, Math.round(unit * preset.gapRatio)) });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [widthU, heightU]);
  return { ref, scale };
}

function boxStyle(box: Box, { unit, gap }: Scale) {
  return {
    left: box.left * unit,
    top: box.top * unit,
    width: box.width * unit - gap,
    height: box.height * unit - gap,
    transform: box.angle ? `rotate(${box.angle}deg)` : undefined,
    transformOrigin: box.angle ? `${box.originX * unit}px ${box.originY * unit}px` : undefined,
    fontSize: Math.max(10, Math.round(unit * 0.3)),
  };
}

/** 選択中の位置から、方向キーの向きで幾何的に最も近いキーを選ぶ。 */
function neighbor<T>(items: { id: T; box: Box }[], from: Box, key: string): T | undefined {
  const cx = from.left + from.width / 2;
  const cy = from.top + from.height / 2;
  const dir = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[key];
  if (!dir) return undefined;
  let best: { id: T; score: number } | undefined;
  for (const item of items) {
    const dx = item.box.left + item.box.width / 2 - cx;
    const dy = item.box.top + item.box.height / 2 - cy;
    const along = dx * dir[0] + dy * dir[1];
    if (along <= 0.2) continue;
    const across = Math.abs(dx * dir[1] - dy * dir[0]);
    const score = along + across * 2.5;
    if (!best || score < best.score) best = { id: item.id, score };
  }
  return best?.id;
}

type BoardProps = {
  target: TargetId;
  layer: number;
  rawOf: (selection: NonNullable<Selection>) => string | undefined;
  names: Record<string, string>;
  selection: Selection;
  onSelect: (selection: NonNullable<Selection>) => void;
  onEnter: () => void;
  diffTargets: Set<string>;
  diagnosticTargets: Map<string, string>;
};

export function Board(props: BoardProps) {
  return props.target === "cornix" ? <CornixBoard {...props} /> : <MacBoard {...props} />;
}

function CornixBoard({
  layer,
  rawOf,
  names,
  selection,
  onSelect,
  onEnter,
  diffTargets,
  diagnosticTargets,
}: BoardProps) {
  const { width, height } = cornix.board.metrics;
  const { ref, scale } = useBoardScale(width, height + 1.4);
  const items = cornix.board.keys.map((k) => ({ id: k, box: k.box }));
  const onKeyDown = (event: KeyboardEvent, from: Box) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onEnter();
      return;
    }
    const next = neighbor(items, from, event.key);
    if (next) {
      event.preventDefault();
      onSelect({ kind: "key", row: next.row, col: next.col });
      document.querySelector<HTMLElement>(`[data-key="${next.row},${next.col}"]`)?.focus();
    }
  };
  return (
    <div className="bd-board-fit" ref={ref}>
      <div
        className="bd-board"
        role="group"
        aria-label={`Cornix LP の盤面、layer ${layer}。方向キーで移動、Enter で編集パネルへ`}
        style={{ width: width * scale.unit, height: height * scale.unit }}
      >
        {cornix.board.keys.map((k) => {
          const raw = rawOf({ kind: "key", row: k.row, col: k.col }) ?? "KC_NO";
          const view = viewOf(raw, names);
          const selected =
            selection?.kind === "key" && selection.row === k.row && selection.col === k.col;
          const target = `key:${layer}:${k.row}:${k.col}`;
          const diag = diagnosticTargets.get(target);
          return (
            <button
              key={keyId(k.row, k.col)}
              type="button"
              data-key={keyId(k.row, k.col)}
              className={`bd-key is-${view.kind}${selected ? " is-selected" : ""}`}
              style={boxStyle(k.box, scale)}
              tabIndex={selected || (!selection && k.row === 0 && k.col === 0) ? 0 : -1}
              aria-pressed={selected}
              aria-label={`row ${k.row} col ${k.col}: ${view.primary}${view.role ? ` ${view.role}` : ""}（${raw}）${diffTargets.has(target) ? "、実機と差分あり" : ""}${diag ? `、${diag}` : ""}`}
              title={raw}
              onClick={() => onSelect({ kind: "key", row: k.row, col: k.col })}
              onKeyDown={(e) => onKeyDown(e, k.box)}
            >
              <span className="bd-key-primary">{view.primary}</span>
              {view.role ? <span className="bd-key-role">{view.role}</span> : null}
              {diffTargets.has(target) ? <span className="bd-key-diff" aria-hidden="true" /> : null}
              {diag ? (
                <span className={`bd-key-diag is-${diag}`} aria-hidden="true">
                  !
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
      <EncoderStrip
        layer={layer}
        rawOf={rawOf}
        names={names}
        selection={selection}
        onSelect={onSelect}
        onEnter={onEnter}
        diffTargets={diffTargets}
      />
    </div>
  );
}

function EncoderStrip({
  layer,
  rawOf,
  names,
  selection,
  onSelect,
  onEnter,
  diffTargets,
}: Pick<
  BoardProps,
  "layer" | "rawOf" | "names" | "selection" | "onSelect" | "onEnter" | "diffTargets"
>) {
  return (
    <div className="bd-encoders" role="group" aria-label="encoder">
      {Array.from({ length: cornix.board.encoders.count }, (_, index) => (
        <div className="bd-encoder" key={index}>
          <span className="bd-encoder-name">
            <span aria-hidden="true" className="bd-encoder-dial" />
            encoder {index}（{index === 0 ? "左" : "右"}）
          </span>
          {(["ccw", "cw"] as const).map((direction) => {
            const raw = rawOf({ kind: "encoder", index, direction }) ?? "KC_NO";
            const view = viewOf(raw, names);
            const selected =
              selection?.kind === "encoder" &&
              selection.index === index &&
              selection.direction === direction;
            const target = `encoder:${layer}:${index}:${direction}`;
            return (
              <button
                key={direction}
                type="button"
                className={`bd-slot is-${view.kind}${selected ? " is-selected" : ""}`}
                aria-pressed={selected}
                title={raw}
                onClick={() => onSelect({ kind: "encoder", index, direction })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    onEnter();
                  }
                }}
              >
                <span className="bd-slot-dir">{direction === "ccw" ? "↺ 左回し" : "↻ 右回し"}</span>
                <span className="bd-slot-value">
                  {view.primary}
                  {view.role ? <small> {view.role}</small> : null}
                </span>
                {diffTargets.has(target) ? (
                  <span className="bd-key-diff" aria-label="実機と差分あり" />
                ) : null}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function MacBoard({ target, rawOf, names, selection, onSelect, onEnter }: BoardProps) {
  const layout = macLayoutOf(target);
  const { width, height } = layout.metrics;
  const { ref, scale } = useBoardScale(width, height);
  const items = layout.physical.map((k) => ({ id: k, box: k.box }));
  return (
    <div className="bd-board-fit" ref={ref}>
      <div
        className="bd-board"
        role="group"
        aria-label={`${layout.layout} 配列の盤面。方向キーで移動、Enter で編集パネルへ`}
        style={{ width: width * scale.unit, height: height * scale.unit }}
      >
        {layout.physical.map((k) => {
          const raw = rawOf({ kind: "macKey", keyCode: k.keyCode });
          const view = raw ? viewOf(raw, names) : undefined;
          const selected = selection?.kind === "macKey" && selection.keyCode === k.keyCode;
          return (
            <button
              key={k.keyCode}
              type="button"
              data-mac-key={k.keyCode}
              className={`bd-key ${view ? `is-${view.kind}` : "is-passthrough"}${selected ? " is-selected" : ""}`}
              style={{
                ...boxStyle(k.box, scale),
                fontSize: Math.max(10, Math.round(scale.unit * 0.26)),
              }}
              tabIndex={
                selected || (!selection && k.keyCode === layout.physical[0].keyCode) ? 0 : -1
              }
              aria-pressed={selected}
              aria-label={`${k.cap}: ${view ? `${view.primary}${view.role ? ` ${view.role}` : ""}（${raw}）` : "素通し"}`}
              title={raw ?? `${k.cap}（素通し）`}
              onClick={() => onSelect({ kind: "macKey", keyCode: k.keyCode })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  onEnter();
                  return;
                }
                const next = neighbor(items, k.box, e.key);
                if (next) {
                  e.preventDefault();
                  onSelect({ kind: "macKey", keyCode: next.keyCode });
                  document.querySelector<HTMLElement>(`[data-mac-key="${next.keyCode}"]`)?.focus();
                }
              }}
            >
              <span className="bd-key-primary">{view ? view.primary : k.cap}</span>
              {view?.role ? <span className="bd-key-role">{view.role}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
