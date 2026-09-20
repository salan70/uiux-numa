import { ExperimentCard } from "../components/ExperimentCard";
import { categoryLabel, type CatalogCategory } from "../content/category";
import { catalog } from "../content/collect";
import { experimentKind } from "../components/ExperimentPage";

type Props = {
  category: CatalogCategory;
};

export function ExperimentListPage({ category }: Props) {
  const experiments = catalog.experiments.filter((item) => item.category === category);
  const kind = experimentKind(category);
  return (
    <>
      <div className="page-intro">
        <h1>{categoryLabel(category)}</h1>
      </div>
      <ul className="experiment-index">
        {experiments.map((experiment) => (
          <li key={experiment.slug}>
            <ExperimentCard experiment={experiment} category={category} kind={kind} />
          </li>
        ))}
      </ul>
    </>
  );
}
