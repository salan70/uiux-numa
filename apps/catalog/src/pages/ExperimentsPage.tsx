import { catalog } from "../content/collect";
import { Link } from "../components/Link";

export function ExperimentsPage() {
  return (
    <>
      <h1>Experiments</h1>
      <p className="lede">課題、判断、preview、live variant を成果として残した記録。</p>
      <ul className="record-list">
        {catalog.experiments.map((item) => (
          <li key={item.slug}>
            <Link href={`/experiments/${item.slug}`}>{item.title}</Link>
            <p>
              {item.status} · {item.domains.join(" / ")} · {item.updated}
            </p>
            <p>{item.problemExcerpt}</p>
          </li>
        ))}
      </ul>
    </>
  );
}
