import { useState } from "react";
import { Button } from "../../button/shared/Button";
import { EntranceText, PATTERN_SPECS, specParts, usePlayOnView } from "./entrance";
import "./motion-tiles.css";

/**
 * 動きの型を、Icons と同じ「面のセルに名前を添えた格子」で並べる。採用した motion-tiles の実装で、Catalog も使う。
 * セルが画面に入ったら 1 回再生し、押すと再生し直す。細いポインタでは載せたときにも再生する。
 * 「すべて再生」で全セルを同時に走らせ、並べて見比べる。
 * 見本の文字の分け方は PATTERN_SPECS が持つので、渡す型は catalog-screen-entrance の型に限る。
 */
export function MotionTiles({ patterns }: { patterns: string[] }) {
  // 全セルを同時に再生させる合図。各セルは自分の再生回数に足して見本の key にする。
  // どちらも増えるだけなので、和はどちらが増えても必ず変わる。
  const [all, setAll] = useState(0);
  return (
    <div className="mt">
      <p className="mt-controls">
        <Button appearance="quiet" size="small" onClick={() => setAll((n) => n + 1)}>
          すべて再生
        </Button>
      </p>
      <ul className="mt-tiles">
        {patterns.map((id) => (
          <Tile key={id} id={id} all={all} />
        ))}
      </ul>
    </div>
  );
}

const finePointer = () => window.matchMedia("(hover: hover) and (pointer: fine)").matches;

function Tile({ id, all }: { id: string; all: number }) {
  const [ref, playKey, replay] = usePlayOnView<HTMLButtonElement>();
  return (
    <li className="mt-tile">
      <button
        type="button"
        className="mt-tile__hit"
        ref={ref}
        onClick={replay}
        onPointerEnter={() => {
          if (finePointer()) replay();
        }}
      >
        <EntranceText pattern={id} playKey={playKey + all} lead={null} />
        <span className="mt-tile__label">{id} を再生</span>
      </button>
      <p className="mt-tile__name">{id}</p>
      <p className="mt-tile__spec">
        {specParts(PATTERN_SPECS[id]).map((part) => (
          <span key={part}>{part}</span>
        ))}
      </p>
    </li>
  );
}
