import { LivePreview } from "../components/LivePreview";
import { TokenSample } from "../components/TokenSample";
import { TypographyPlayground } from "../components/TypographyPlayground";
import { catalog } from "../content/collect";
import { formatTokenValue } from "../content/tokens";

export function TypographyPage() {
  const primitives = catalog.tokens.filter((token) => token.kind === "primitive");
  const semantics = catalog.tokens.filter((token) => token.kind === "semantic");
  const live = catalog.experiments
    .filter((experiment) => experiment.category === "typography")
    .flatMap((experiment) => experiment.liveVariants);

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Typography</p>
        <h1>Typography</h1>
        <p className="lede">
          Semantic role と primitive token
          の実寸見本、表示確認用プレイグラウンド、実画面プレビュー。
        </p>
      </div>
      <TokenGroup title="Semantic tokens" tokens={semantics} />
      <TokenGroup title="Primitive tokens" tokens={primitives} />
      <TypographyPlayground roles={semantics} />
      <LivePreview variants={live} title="product-ui-typography" />
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
            <h3>
              <code>{token.name}</code>
            </h3>
            <TokenSample token={token} />
            <p className="token-value">
              <code>{formatTokenValue(token.type, token.resolvedValue)}</code>
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
