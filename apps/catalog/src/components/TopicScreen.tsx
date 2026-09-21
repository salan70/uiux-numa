import type { ReactNode } from "react";
import { topicById, type TopicId } from "../content/topics";
import { renderSentences } from "./Sentences";

/**
 * トピックの画面の枠。題名とリードだけを持ち、中身は topic ごとに描き分ける。
 * 一覧を挟んで詳細へ送ると、成果物を見るまでに 2 回押すことになる。
 */
export function TopicScreen({
  id,
  lead = true,
  children,
}: {
  id: TopicId;
  /** false で画面のリードを出さない。リードはホームの案内にも使うので、topic からは消さない。 */
  lead?: boolean;
  children: ReactNode;
}) {
  const topic = topicById(id);
  if (!topic) throw new Error(`Catalog の topic が不正: ${id}`);
  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {topic.label}
      </h1>
      {lead && <p className="index__lead">{renderSentences(topic.lead)}</p>}
      {children}
    </section>
  );
}
