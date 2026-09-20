import { AssetMeta, experimentMeta } from "../components/AssetMeta";
import { Link } from "../components/Link";
import { LivePreview } from "../components/LivePreview";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { SvgGrid } from "../components/SvgGrid";
import { TokenSample } from "../components/TokenSample";
import {
  CATEGORY_ORDER,
  categoryHref,
  categoryLabel,
  type CatalogCategory,
} from "../content/category";
import { catalog, defaultVariantId } from "../content/collect";
import type { ColorScheme } from "../content/schemes";

export function HomePage() {
  const hero = catalog.experiments.find((item) => item.slug === "product-ui-typography");
  const adopted = hero ? defaultVariantId(hero) : undefined;
  const heroLive = hero
    ? adopted
      ? hero.liveVariants.filter((item) => item.variant === adopted)
      : hero.liveVariants
    : [];

  return (
    <>
      {hero ? (
        <section className="showcase-hero" aria-labelledby="hero-heading">
          <p className="crumb">
            <Link href={categoryHref("typography")}>{categoryLabel("typography")}</Link>
          </p>
          <h1 id="hero-heading">{hero.title}</h1>
          <LivePreview variants={heroLive} defaultVariant={adopted} showHeading={false} />
          <AssetMeta {...experimentMeta(hero)} compact />
        </section>
      ) : (
        <div className="page-intro">
          <h1>UI/UX 沼</h1>
        </div>
      )}
      <nav className="category-index" aria-label="種別">
        {CATEGORY_ORDER.map((category) => (
          <CategoryCard category={category} key={category} />
        ))}
      </nav>
    </>
  );
}

function CategoryCard({ category }: { category: CatalogCategory }) {
  const href = categoryHref(category);
  const label = categoryLabel(category);
  return (
    <article className="category-card">
      <h2>
        <Link href={href}>{label}</Link>
      </h2>
      <CategoryPreview category={category} />
    </article>
  );
}

function CategoryPreview({ category }: { category: CatalogCategory }) {
  if (category === "colors") {
    const scheme = firstAdoptedScheme();
    if (!scheme) return null;
    return (
      <div className="home-swatch-row">
        {scheme.light.slice(0, 6).map((color) => (
          <SchemeSwatch color={color} key={color.cssName} />
        ))}
      </div>
    );
  }
  if (category === "typography") {
    const body = catalog.tokens.find(
      (token) => token.kind === "semantic" && token.name === "typography.body",
    );
    return body ? <TokenSample token={body} /> : null;
  }
  if (category === "icons" || category === "graphics") {
    const experiment = catalog.experiments.find((item) => item.category === category);
    if (!experiment) return null;
    const adopted = defaultVariantId(experiment);
    const groups = catalog.svgs.filter((group) => group.experiment === experiment.slug);
    return (
      <SvgGrid
        groups={adopted ? groups.filter((group) => group.variant === adopted) : groups}
        showSizeControl={false}
        limit={1}
      />
    );
  }
  return (
    <ul className="category-titles">
      {catalog.experiments
        .filter((item) => item.category === category)
        .map((item) => (
          <li key={item.slug}>{item.title}</li>
        ))}
    </ul>
  );
}

function firstAdoptedScheme(): ColorScheme | undefined {
  const experiment = catalog.experiments.find((item) => item.slug === "color-schemes");
  const id = experiment?.adopted[0];
  return id ? catalog.schemes.find((scheme) => scheme.id === id) : catalog.schemes[0];
}
