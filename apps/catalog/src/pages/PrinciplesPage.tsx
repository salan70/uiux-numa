import { catalog } from "../content/collect";
import { Link } from "../components/Link";

export function PrinciplesPage() {
  return (
    <>
      <h1>原則</h1>
      <p className="lede">Experiment から抽出した仮説。採否の正本は GitHub の記録にある。</p>
      <ul className="record-list">
        {catalog.principles.map((item) => (
          <li key={item.slug}>
            <Link href={`/principles/${item.slug}`}>{item.title}</Link>
            <p>
              {item.status} · {item.updated}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
