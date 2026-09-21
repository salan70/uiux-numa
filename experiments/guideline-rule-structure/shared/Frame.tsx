// 比較の地。案ごとに違うのは規則ブロック 1 件の組み方だけで、
// 版面、配色、文字、標本、データはすべての案で同じものを使う。
import type { ReactNode } from "react";
import "../../../tokens/typography/index.css";
import { RULES, inline, type Rule } from "./rules";
import "./frame.css";

export function Text({ value }: { value: string }) {
  return (
    <>
      {inline(value).map((part, idx) =>
        typeof part === "string" ? (
          part
        ) : (
          <code className="gr-code" key={idx}>
            {part.code}
          </code>
        ),
      )}
    </>
  );
}

export function Frame({
  id,
  axis,
  hypothesis,
  renderRule,
}: {
  id: string;
  axis: string;
  hypothesis: string;
  renderRule: (rule: Rule, index: number) => ReactNode;
}) {
  return (
    <div className="gr-root">
      <main className="gr-main">
        <header className="gr-head">
          <h1 className="gr-head__id">{id}</h1>
          <p className="gr-head__axis">{axis}</p>
        </header>
        <p className="gr-head__hypothesis">{hypothesis}</p>
        <div className="gr-rules">{RULES.map((rule, idx) => renderRule(rule, idx))}</div>
      </main>
    </div>
  );
}
