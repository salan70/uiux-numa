import { Link } from "../components/Link";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { catalog } from "../content/collect";
import { NotFoundPage } from "./NotFoundPage";

export function ColorsPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Foundations</p>
        <h1>Colors</h1>
        <p className="lede">配色を選び、Role ごとの色面と和名をライト / ダークで比較する。</p>
      </div>
      <ul className="scheme-list">
        {catalog.schemes.map((scheme) => (
          <li key={scheme.id}>
            <article className="scheme-card">
              <header>
                <h2>
                  <Link href={`/foundations/colors/${scheme.id}`}>
                    {scheme.id} <span className="meta">（{scheme.label}）</span>
                  </Link>
                </h2>
              </header>
              <div className="home-swatch-row">
                {scheme.light.slice(0, 6).map((color) => (
                  <SchemeSwatch color={color} key={color.cssName} />
                ))}
              </div>
            </article>
          </li>
        ))}
      </ul>
    </>
  );
}

export function ColorDetailPage({ scheme: schemeId }: { scheme: string }) {
  const scheme = catalog.schemes.find((item) => item.id === schemeId);
  if (!scheme) return <NotFoundPage />;
  return (
    <>
      <div className="page-intro">
        <p className="crumb">
          <Link href="/foundations/colors">Colors</Link>
        </p>
        <p className="eyebrow">配色</p>
        <h1>
          {scheme.id} <span className="meta">（{scheme.label}）</span>
        </h1>
      </div>
      <div className="scheme-modes">
        <section aria-labelledby={`${scheme.id}-light-heading`}>
          <h2 id={`${scheme.id}-light-heading`}>Light</h2>
          <div className="scheme-swatches">
            {scheme.light.map((color) => (
              <SchemeSwatch color={color} key={color.cssName} />
            ))}
          </div>
        </section>
        <section aria-labelledby={`${scheme.id}-dark-heading`}>
          <h2 id={`${scheme.id}-dark-heading`}>Dark</h2>
          <div className="scheme-swatches">
            {scheme.dark.map((color) => (
              <SchemeSwatch color={color} key={color.cssName} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
