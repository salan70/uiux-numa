import type { ExperimentRecord } from "../content/collect";
import { defaultVariant, dot, previewPathFor } from "./work";

type Props = {
  work: ExperimentRecord;
  variant?: string;
  tall?: boolean;
  /** 説明の右に出す値。既定は更新日、部品の一覧では platform を出す。 */
  caption?: "updated" | "platforms";
};

/** live 標本。variant は preview の第 2 エントリで隔離して描く。 */
export function LiveFrame({ work, variant, tall, caption = "updated" }: Props) {
  const id = variant ?? defaultVariant(work);
  const src = previewPathFor(work, id);
  if (!src) return <p className="empty">この variant は描けない。</p>;
  return (
    <div className={tall ? "live live--tall" : "live"}>
      <iframe className="live__frame" src={src} title={`${work.title} の ${id}`} loading="lazy" />
      <p className="live__caption">
        <span className="live__id">{id}</span>
        <span>{caption === "platforms" ? work.platforms.join("・") : dot(work.updated)}</span>
      </p>
    </div>
  );
}
