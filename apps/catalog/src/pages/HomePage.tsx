import { Link } from "../components/Link";
import { SchemeSpecimen } from "../components/SchemeSpecimen";
import { categoryHref, categoryLabel, CATEGORY_ORDER } from "../content/category";

export function HomePage() {
  return (
    <>
      <div className="page-intro">
        <h1>UI/UX 沼</h1>
      </div>
      <SchemeSpecimen />
      <ul className="record-list">
        {CATEGORY_ORDER.map((category) => (
          <li key={category}>
            <Link href={categoryHref(category)}>{categoryLabel(category)}</Link>
          </li>
        ))}
      </ul>
    </>
  );
}
