import { ExperimentPage } from "../components/ExperimentPage";
import { catalog } from "../content/collect";
import { ExperimentListPage } from "./ExperimentListPage";
import { NotFoundPage } from "./NotFoundPage";

export function ComponentsPage() {
  return <ExperimentListPage category="components" />;
}

export function ComponentDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "components" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="live" />;
}
