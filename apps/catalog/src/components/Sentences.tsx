import { renderInline } from "../content/guidelines";

/** 文ごとに分けて包む。1 行に収まる間は続けて読ませ、折り返す時だけ文の切れ目で改行する。 */
export function renderSentences(text: string) {
  return text
    .split(/(?<=。)/)
    .filter((part) => part.length > 0)
    .map((sentence, i) => (
      <span key={i} className="sentence">
        {renderInline(sentence)}
      </span>
    ));
}
