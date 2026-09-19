import { LivePreview } from "../components/LivePreview";
import { Link } from "../components/Link";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { SvgGrid } from "../components/SvgGrid";
import { TokenSample } from "../components/TokenSample";
import { catalog } from "../content/collect";

export function HomePage() {
  const typographyTokens = catalog.tokens.filter((token) => token.kind === "semantic").slice(0, 3);
  const iconGroups = svgGroups("icons").slice(0, 2);
  const graphicsGroups = svgGroups("graphics").slice(0, 2);
  const components = catalog.experiments.find((item) => item.category === "components");

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">UI/UX 沼</p>
        <h1>成果物の見本帳</h1>
        <p className="lede">実際に作った配色、文字、SVG、コンポーネントを種別ごとに見る。</p>
      </div>
      <div className="artifact-bands">
        <section className="artifact-band" aria-labelledby="colors-heading">
          <div className="band-heading">
            <p className="eyebrow">01</p>
            <h2 id="colors-heading">
              <Link href="/colors">Colors</Link>
            </h2>
            <p>和名を持つ配色の role と、ライト / ダークの色面。</p>
          </div>
          <div className="home-swatch-row">
            {catalog.schemes.slice(0, 6).map((scheme) => (
              <div className="home-swatch" key={scheme.id}>
                <SchemeSwatch color={scheme.light[0]} />
                <span>{scheme.id}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="artifact-band" aria-labelledby="typography-heading">
          <div className="band-heading">
            <p className="eyebrow">02</p>
            <h2 id="typography-heading">
              <Link href="/typography">Typography</Link>
            </h2>
            <p>semantic role と primitive token の実寸見本。</p>
          </div>
          <div className="home-type-row">
            {typographyTokens.map((token) => (
              <article className="artifact-card" key={token.name}>
                <code>{token.name}</code>
                <TokenSample token={token} />
              </article>
            ))}
          </div>
        </section>

        <section className="artifact-band" aria-labelledby="icons-heading">
          <div className="band-heading">
            <p className="eyebrow">03</p>
            <h2 id="icons-heading">
              <Link href="/icons">Icons</Link>
            </h2>
            <p>アイコン set と variant の SVG。</p>
          </div>
          <SvgGrid groups={iconGroups} showSizeControl={false} />
        </section>

        <section className="artifact-band" aria-labelledby="graphics-heading">
          <div className="band-heading">
            <p className="eyebrow">04</p>
            <h2 id="graphics-heading">
              <Link href="/graphics">Graphics</Link>
            </h2>
            <p>ロゴと章扉イラストの SVG。</p>
          </div>
          <SvgGrid groups={graphicsGroups} showSizeControl={false} />
        </section>

        <section className="artifact-band" aria-labelledby="components-heading">
          <div className="band-heading">
            <p className="eyebrow">05</p>
            <h2 id="components-heading">
              <Link href="/components">Components</Link>
            </h2>
            <p>variant と表示幅を切り替えて動作を見る。</p>
          </div>
          {components && <LivePreview variants={components.liveVariants} title={components.slug} />}
        </section>
      </div>
    </>
  );
}

function svgGroups(category: "icons" | "graphics") {
  const experiments = new Set(
    catalog.experiments.filter((item) => item.category === category).map((item) => item.slug),
  );
  return catalog.svgs.filter((group) => experiments.has(group.experiment));
}
