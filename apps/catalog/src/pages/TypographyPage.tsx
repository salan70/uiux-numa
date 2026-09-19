import { LivePreview } from "../components/LivePreview";
import { TokenSample } from "../components/TokenSample";
import { TokenTable } from "../components/TokenTable";
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
          Semantic 6 個と primitive 10 個の token を表で確認する。説明は canonical JSON の
          $description である。
        </p>
      </div>
      <section aria-labelledby="semantic-heading">
        <h2 id="semantic-heading">Semantic tokens</h2>
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
        <h2 id="primitive-heading">Primitive tokens</h2>
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
      <LivePreview variants={live} title="product-ui-typography" />
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
