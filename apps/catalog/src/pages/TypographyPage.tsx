import { LivePreview } from "../components/LivePreview";
import { TokenSample } from "../components/TokenSample";
import { TokenTable } from "../components/TokenTable";
import { TypographyPlayground } from "../components/TypographyPlayground";
import { catalog, defaultVariantId } from "../content/collect";
import { formatTokenValue } from "../content/tokens";

export function TypographyPage() {
  const primitives = catalog.tokens.filter(
    (token) => token.kind === "primitive" && token.name.startsWith("font."),
  );
  const semantics = catalog.tokens.filter(
    (token) => token.kind === "semantic" && token.name.startsWith("typography."),
  );
  const typography = catalog.experiments.find((item) => item.category === "typography");
  const live = typography?.liveVariants ?? [];

  return (
    <>
      <div className="page-intro">
        <h1>文字</h1>
      </div>
      <section aria-labelledby="semantic-heading">
        <h2 id="semantic-heading">役割</h2>
        <TokenTable
          caption="semantic token 6 個"
          rows={semantics.map((token) => ({
            name: token.name,
            value: (
              <div className="token-value-cell">
                <TokenSample token={token} />
                <code>{formatTokenValue(token.type, token.resolvedValue)}</code>
              </div>
            ),
            description: token.description,
            copy: token.cssNames.join(", "),
          }))}
        />
      </section>
      <section aria-labelledby="primitive-heading">
        <h2 id="primitive-heading">基本値</h2>
        <TokenTable
          caption="primitive token 10 個"
          rows={primitives.map((token) => ({
            name: token.name,
            value: (
              <div className="token-value-cell">
                <TokenSample token={token} />
                <code>{formatTokenValue(token.type, token.resolvedValue)}</code>
              </div>
            ),
            description: token.description,
            copy: token.cssNames.join(", "),
          }))}
        />
      </section>
      <TypographyPlayground roles={semantics} />
      <LivePreview
        variants={live}
        title="product-ui-typography"
        defaultVariant={typography ? defaultVariantId(typography) : undefined}
      />
    </>
  );
}
