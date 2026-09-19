import { catalog } from "../content/collect";
import { CopyButton } from "../components/CopyButton";
import { TokenSample } from "../components/TokenSample";
import { TypographyPlayground } from "../components/TypographyPlayground";
import { githubBlobUrl } from "../content/github";
import { formatTokenValue } from "../content/tokens";

export function TokensPage() {
  const primitives = catalog.tokens.filter((token) => token.kind === "primitive");
  const semantics = catalog.tokens.filter((token) => token.kind === "semantic");
  const source = catalog.tokens[0]?.sourcePath ?? "tokens/typography/typography.tokens.json";

  return (
    <>
      <h1>Tokens</h1>
      <p className="lede">
        canonical JSON から収集した Typography foundation。正本は{" "}
        <a href={githubBlobUrl(source)}>GitHub の JSON</a> にある。
      </p>
      <TokenGroup title="primitive" tokens={primitives} />
      <TokenGroup title="semantic" tokens={semantics} />
      <TypographyPlayground roles={semantics} />
    </>
  );
}

function TokenGroup({ title, tokens }: { title: string; tokens: typeof catalog.tokens }) {
  return (
    <section aria-labelledby={`${title}-heading`}>
      <h2 id={`${title}-heading`}>{title}</h2>
      <ul className="token-list">
        {tokens.map((token) => (
          <li key={token.name} className="token-card">
            <h3>{token.name}</h3>
            <p className="meta">
              {token.kind} · {token.type}
            </p>
            <TokenSample token={token} />
            <p>{token.description}</p>
            <p>
              値: <code>{formatTokenValue(token.type, token.resolvedValue)}</code>
            </p>
            {token.references.length > 0 && (
              <p>
                参照:{" "}
                {token.references.map((name, index) => (
                  <span key={name}>
                    {index > 0 ? " " : ""}
                    <code>{name}</code>
                  </span>
                ))}
              </p>
            )}
            <p>
              JSON path <CopyButton value={token.jsonPath} label="JSON path" />
            </p>
            <p>
              CSS 変数
              {token.cssNames.map((name) => (
                <CopyButton key={name} value={name} label="CSS 変数名" />
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
