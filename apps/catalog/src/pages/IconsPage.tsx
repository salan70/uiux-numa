import { ExperimentPage } from "../components/ExperimentPage";
import { catalog } from "../content/collect";
import { ExperimentListPage } from "./ExperimentListPage";
import { NotFoundPage } from "./NotFoundPage";

export function IconsPage() {
  return <ExperimentListPage category="icons" />;
}

export function IconDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "icons" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="svg" />;
}
