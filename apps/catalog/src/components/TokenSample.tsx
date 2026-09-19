import type { CatalogToken } from "../content/tokens";
import { formatTokenValue } from "../content/tokens";

export function TokenSample({ token }: { token: CatalogToken }) {
  if (token.type === "fontFamily") {
    return (
      <p
        className="token-sample"
        style={{ fontFamily: formatTokenValue(token.type, token.resolvedValue) }}
      >
        あAa 日本語 UI
      </p>
    );
  }
  if (token.type === "dimension") {
    return (
      <p
        className="token-sample"
        style={{ fontSize: formatTokenValue(token.type, token.resolvedValue) }}
      >
        あAa 日本語 UI
      </p>
    );
  }
  if (token.type === "fontWeight") {
    const weight = typeof token.resolvedValue === "number" ? token.resolvedValue : 400;
    return (
      <p className="token-sample" style={{ fontWeight: weight }}>
        あAa 日本語 UI
      </p>
    );
  }
  if (token.type === "number") {
    return (
      <p
        className="token-sample"
        style={{ lineHeight: typeof token.resolvedValue === "number" ? token.resolvedValue : 1.5 }}
      >
        あAa
        <br />
        複数行の行間見本
      </p>
    );
  }
  if (token.type === "typography") {
    return <TypographySample value={token.resolvedValue} />;
  }
  return (
    <pre className="token-fallback">
      <code>{JSON.stringify(token.resolvedValue, null, 2)}</code>
    </pre>
  );
}

function TypographySample({ value }: { value: unknown }) {
  if (!value || typeof value !== "object") {
    return (
      <pre className="token-fallback">
        <code>{JSON.stringify(value, null, 2)}</code>
      </pre>
    );
  }
  const fields = value as Record<string, unknown>;
  const family = Array.isArray(fields.fontFamily) ? fields.fontFamily.join(", ") : undefined;
  const size = formatMaybeDimension(fields.fontSize);
  const tracking = formatMaybeDimension(fields.letterSpacing);
  return (
    <p
      className="token-sample"
      style={{
        fontFamily: family,
        fontSize: size,
        fontWeight: typeof fields.fontWeight === "number" ? fields.fontWeight : undefined,
        letterSpacing: tracking,
        lineHeight: typeof fields.lineHeight === "number" ? fields.lineHeight : undefined,
      }}
    >
      あAa 日本語 UI
    </p>
  );
}

function formatMaybeDimension(value: unknown): string | undefined {
  if (!value || typeof value !== "object") return undefined;
  const record = value as { value?: unknown; unit?: unknown };
  if (typeof record.value === "number" && typeof record.unit === "string") {
    return `${record.value}${record.unit}`;
  }
  return undefined;
}
