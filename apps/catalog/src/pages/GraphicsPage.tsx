import { ExperimentPage } from "../components/ExperimentPage";
import { catalog } from "../content/collect";
import { ExperimentListPage } from "./ExperimentListPage";
import { NotFoundPage } from "./NotFoundPage";

export function GraphicsPage() {
  return <ExperimentListPage category="graphics" />;
}

export function GraphicDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "graphics" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="svg" />;
}
