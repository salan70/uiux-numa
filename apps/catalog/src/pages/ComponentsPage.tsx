import "../../../../experiments/button/shared/button.css";
import "../../../../experiments/button/variants/pill-action/variant.css";
import { Showcase } from "../../../../experiments/button/shared/Showcase";
import { TopicScreen } from "../components/TopicScreen";
import { catalog } from "../content/collect";

/** Button の採用実装を topic の本文へ直接表示する。 */
export function ComponentsPage() {
  const button = catalog.experiments.find((work) => work.slug === "button");

  return (
    <TopicScreen id="components">
      {button ? (
        <section className="component-work" aria-labelledby="component-button-title">
          <div className="work-head">
            <h2 className="work-head__title" id="component-button-title">
              Button
            </h2>
          </div>
          <Showcase variantClass="button-pill-action" embedded />
        </section>
      ) : (
        <p className="empty">まだ成果物がない。</p>
      )}
    </TopicScreen>
  );
}
