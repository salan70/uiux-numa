import { formatTokenValue, type CatalogToken } from "../content/tokens";
import { renderSentences } from "./Sentences";

/**
 * 役割の token に入れる文。
 * その役割で実際に書く文を入れる。字形の羅列では役割ごとの文の長さと行数が出ないため、
 * 組んだときの見え方が判断できない。
 * body だけ複数行にしてあるのは、行間の値が 1 行では確かめられないからである。
 * 文面は正本の $description に書いた用途から取り、説明と食い違わないようにした。
 */
const ROLE_SAMPLES: Record<string, string> = {
  "typography.title": "文字の役割を決める",
  "typography.heading": "本文と見出しの組み方",
  "typography.body": "行の長さを決める。日本語は行間を広く取る。",
  "typography.ui": "この書体は 2 つのウェイトを持つ",
  "typography.control": "この成果物を開く",
  "typography.caption": "文字の値は tokens/typography が正本",
};

/**
 * 素の値に入れる文字。
 * font.size や font.weight は役割を持たないので、意味のある文は当てられない。
 * 仮名・片仮名・漢字・欧字・数字を 1 つずつ並べ、字形と太さの差だけを見る並びにする。
 */
const GLYPHS = "あア亜 Aa 0123";

/** token を実際に当てた見本を描く。値だけでは字面と大きさが判断できないため。 */
export function TokenSample({ token }: { token: CatalogToken }) {
  if (token.type === "typography") {
    return <TypographySample value={token.resolvedValue} text={ROLE_SAMPLES[token.name]} />;
  }

  // 文字に関係しない token（余白）は、文字ではなく長さの帯で見せる。
  if (token.name.startsWith("space.")) {
    return (
      <span
        className="token-table__bar"
        style={{ inlineSize: formatTokenValue("dimension", token.resolvedValue) }}
        aria-hidden="true"
      />
    );
  }

  // 角丸は値を当てた枠で、線は値を当てた罫で見せる。数値だけでは丸みと太さが判断できない。
  if (token.name.startsWith("radius.")) {
    return (
      <span
        className="token-table__corner"
        style={{ borderRadius: formatTokenValue("dimension", token.resolvedValue) }}
        aria-hidden="true"
      />
    );
  }
  if (token.name.startsWith("border.")) {
    return (
      <span
        className="token-table__rule"
        style={{ borderBlockStartWidth: formatTokenValue("dimension", token.resolvedValue) }}
        aria-hidden="true"
      />
    );
  }

  if (token.type === "dimension") {
    return (
      <span
        className="token-table__sample"
        style={{ fontSize: formatTokenValue("dimension", token.resolvedValue) }}
      >
        {GLYPHS}
      </span>
    );
  }
  if (token.type === "fontFamily") {
    return (
      <span
        className="token-table__sample"
        style={{ fontFamily: formatTokenValue("fontFamily", token.resolvedValue) }}
      >
        {GLYPHS}
      </span>
    );
  }
  if (token.type === "fontWeight") {
    return (
      <span
        className="token-table__sample"
        style={{ fontWeight: typeof token.resolvedValue === "number" ? token.resolvedValue : 400 }}
      >
        {GLYPHS}
      </span>
    );
  }
  if (token.type === "number") {
    return (
      <span
        className="token-table__sample"
        style={{ lineHeight: typeof token.resolvedValue === "number" ? token.resolvedValue : 1.5 }}
      >
        行間を確かめる 2 行の
        <br />
        見本の文字である
      </span>
    );
  }
  return <span className="token-table__dash">—</span>;
}

function TypographySample({ value, text }: { value: unknown; text?: string }) {
  const fields = asRecord(value);
  if (!fields) return <span className="token-table__dash">—</span>;
  return (
    <span
      className="token-table__sample"
      style={{
        fontFamily: Array.isArray(fields.fontFamily) ? fields.fontFamily.join(", ") : undefined,
        fontSize: dimension(fields.fontSize),
        fontWeight: typeof fields.fontWeight === "number" ? fields.fontWeight : undefined,
        letterSpacing: dimension(fields.letterSpacing),
        lineHeight: typeof fields.lineHeight === "number" ? fields.lineHeight : undefined,
      }}
    >
      {text ? renderSentences(text) : GLYPHS}
    </span>
  );
}

/**
 * composite な token を項目名つきの組にする。
 * 値だけを並べていたときは「1.5rem 700 行 1.3 字間 0px」となり、
 * どの数が何を指すのかが、行 と 字間 の 2 つ以外は読めなかった。
 * 書体は画面の先頭で 1 度だけ出し、役割ごとには出さない（利用者の判断、2026-09-21）。
 * 全役割が同じ書体なので、各組に同じ名前が並ぶだけになる。
 */
export function compositeSpec(value: unknown): Array<{ label: string; value: string }> {
  const fields = asRecord(value);
  if (!fields) return [];
  const out: Array<{ label: string; value: string }> = [];
  const size = dimension(fields.fontSize);
  if (size) out.push({ label: "大きさ", value: size });
  if (fields.fontWeight != null) out.push({ label: "太さ", value: String(fields.fontWeight) });
  if (fields.lineHeight != null) out.push({ label: "行間", value: String(fields.lineHeight) });
  const tracking = dimension(fields.letterSpacing);
  if (tracking) out.push({ label: "字間", value: tracking });
  return out;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** DTCG の dimension は {value, unit} で持つ。CSS に渡せる 1.5rem の形へ戻す。 */
function dimension(value: unknown): string | undefined {
  const record = asRecord(value);
  if (!record) return undefined;
  if (typeof record.unit !== "string") return undefined;
  if (typeof record.value !== "number" && typeof record.value !== "string") return undefined;
  return `${record.value}${record.unit}`;
}
