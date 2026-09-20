import type { ReactNode } from "react";
import { topicById, type TopicId } from "../content/topics";

/**
 * トピックの画面の枠。題名とリードだけを持ち、中身は topic ごとに描き分ける。
 * 一覧を挟んで詳細へ送ると、成果物を見るまでに 2 回押すことになる。
 */
export function TopicScreen({ id, children }: { id: TopicId; children: ReactNode }) {
  const topic = topicById(id);
  if (!topic) throw new Error(`Catalog の topic が不正: ${id}`);
  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {topic.label}
      </h1>
      <p className="index__lead">{topic.lead}</p>
      {children}
    </section>
  );
}
