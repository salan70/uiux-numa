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
        <p className="lede">見出し、本文、操作、補足の 6 役割を同じ書体で揃える。</p>
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
      <section aria-labelledby="typography-usage-heading">
        <h2 id="typography-usage-heading">使い方</h2>
        <p>
          正本は <code>tokens/typography/typography.tokens.json</code> である。
        </p>
        <p>
          Web 用 CSS は <code>just tokens-build</code> で生成する。検査は{" "}
          <code>just tokens-check</code> である。
        </p>
        <p>
          利用側は <code>tokens/typography/index.css</code> を読み、semantic の CSS 変数を参照する。
        </p>
      </section>
    </>
  );
}
