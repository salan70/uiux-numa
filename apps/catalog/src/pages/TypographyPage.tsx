import { compositeSpec, TokenSample } from "../components/TokenSample";
import { Link } from "../components/Link";
import { catalog } from "../content/collect";
import { TopicScreen } from "../components/TopicScreen";
import { workHref } from "../content/topics";
import { typefaceName } from "../content/typeface";

/** 素の値に入れる字形。仮名・片仮名・漢字・欧字・数字を 1 つずつ並べる。 */
const GLYPHS = "あア亜 Aa 0123";

/** 書体と文字の役割。役割を実寸で組んで見せる。 */
export function TypographyPage() {
  const work = catalog.experiments.find((item) => item.slug === "product-ui-typography");
  const roles =
    catalog.tokenFamilies
      .find((family) => family.id === "typography")
      ?.tokens.filter((token) => token.kind === "semantic") ?? [];
  const name = typefaceName();

  return (
    <TopicScreen id="typography">
      {name && (
        <section className="typeface" aria-labelledby="typeface-head">
          <h2 className="typeface__name" id="typeface-head">
            {name}
          </h2>
          <p className="typeface__glyphs" aria-hidden="true">
            {GLYPHS}
          </p>
        </section>
      )}

      <ol className="roles">
        {roles.map((token) => (
          <li className="role" key={token.name}>
            <div className="role__main">
              <p className="role__name">{token.name.replace("typography.", "")}</p>
              <p className="role__sample">
                <TokenSample token={token} />
              </p>
              <p className="role__desc">{token.description}</p>
            </div>
            <dl className="role__spec">
              {compositeSpec(token.resolvedValue).map((item) => (
                <div className="role__spec-row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
      {work?.topic && (
        <p className="topic-source">
          <Link href={workHref(work.topic, work.slug)}>{work.title}</Link>
        </p>
      )}
    </TopicScreen>
  );
}
