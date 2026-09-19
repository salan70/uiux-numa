import { Link } from "../components/Link";
import { LivePreview } from "../components/LivePreview";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { SvgGrid } from "../components/SvgGrid";
import { TokenSample } from "../components/TokenSample";
import { categoryHref, categoryLabel } from "../content/category";
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
        <h1>UI/UX 沼</h1>
        <p className="lede">
          実験から採用した配色、文字、SVG、コンポーネントを正として掲載する。却下案は比較資料として残す。
        </p>
      </div>
      <div className="artifact-bands">
        <section className="artifact-band" aria-labelledby="colors-heading">
          <div className="band-heading">
            <p className="eyebrow">Foundations</p>
            <h2 id="colors-heading">
              <Link href={categoryHref("colors")}>{categoryLabel("colors")}</Link>
            </h2>
            <p>採用した配色の Role と、ライト / ダークの色面一覧。</p>
          </div>
          <div className="home-swatch-row">
            {catalog.schemes.slice(0, 6).map((scheme) => (
              <Link
                href={`/foundations/colors/${scheme.id}`}
                className="home-swatch"
                key={scheme.id}
              >
                <SchemeSwatch color={scheme.light[0]} />
                <span>{scheme.id}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="artifact-band" aria-labelledby="typography-heading">
          <div className="band-heading">
            <p className="eyebrow">Foundations</p>
            <h2 id="typography-heading">
              <Link href={categoryHref("typography")}>{categoryLabel("typography")}</Link>
            </h2>
            <p>Semantic role と primitive token の実寸見本。</p>
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
            <p className="eyebrow">Foundations</p>
            <h2 id="icons-heading">
              <Link href={categoryHref("icons")}>{categoryLabel("icons")}</Link>
            </h2>
            <p>アイコンセットと各バリアントの SVG 一覧。</p>
          </div>
          <SvgGrid groups={iconGroups} showSizeControl={false} />
        </section>

        <section className="artifact-band" aria-labelledby="graphics-heading">
          <div className="band-heading">
            <p className="eyebrow">Foundations</p>
            <h2 id="graphics-heading">
              <Link href={categoryHref("graphics")}>{categoryLabel("graphics")}</Link>
            </h2>
            <p>ロゴと章扉イラストの各バリアント SVG 一覧。</p>
          </div>
          <SvgGrid groups={graphicsGroups} showSizeControl={false} />
        </section>

        <section className="artifact-band" aria-labelledby="components-heading">
          <div className="band-heading">
            <p className="eyebrow">Components</p>
            <h2 id="components-heading">
              <Link href={categoryHref("components")}>{categoryLabel("components")}</Link>
            </h2>
            <p>バリアントと表示幅を切り替えて動作を確認する。</p>
          </div>
          {components && (
            <LivePreview variants={components.liveVariants} title={components.title} />
          )}
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
