import { ExperimentPage } from "../components/ExperimentPage";
import { catalog } from "../content/collect";
import { ExperimentListPage } from "./ExperimentListPage";
import { NotFoundPage } from "./NotFoundPage";

export function MotionPage() {
  return <ExperimentListPage category="motion" />;
}

export function MotionDetailPage({ experiment: slug }: { experiment: string }) {
  const experiment = catalog.experiments.find(
    (item) => item.category === "motion" && item.slug === slug,
  );
  if (!experiment) return <NotFoundPage />;
  return <ExperimentPage experiment={experiment} kind="live" />;
}
