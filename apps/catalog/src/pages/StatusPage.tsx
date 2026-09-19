import { Link } from "../components/Link";
import { StatusBadge, experimentStatusLabel } from "../components/StatusBadge";
import { categoryHref, categoryLabel } from "../content/category";
import { catalog } from "../content/collect";

export function StatusPage() {
  return (
    <>
      <div className="page-intro">
        <h1>ステータス</h1>
        <p className="lede">成果物の採否と更新日である。</p>
      </div>
      <div className="token-table-wrap">
        <table className="token-table status-table">
          <caption>成果物のステータス</caption>
          <colgroup>
            <col className="status-col-name" />
            <col className="status-col-kind" />
            <col className="status-col-status" />
            <col className="status-col-adopted" />
            <col className="status-col-updated" />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">名前</th>
              <th scope="col">種別</th>
              <th scope="col">ステータス</th>
              <th scope="col">採用案</th>
              <th scope="col">更新日</th>
            </tr>
          </thead>
          <tbody>
            {catalog.experiments.map((experiment) => {
              const status = experimentStatusLabel(experiment);
              return (
                <tr key={experiment.slug}>
                  <th scope="row">
                    <Link href={detailHref(experiment.category, experiment.slug)}>
                      {experiment.title}
                    </Link>
                  </th>
                  <td>{categoryLabel(experiment.category)}</td>
                  <td>
                    <StatusBadge status={status} />
                  </td>
                  <td>{experiment.adopted.length > 0 ? experiment.adopted.join(", ") : "—"}</td>
                  <td>
                    <time dateTime={experiment.updated}>{experiment.updated}</time>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

function detailHref(category: string, slug: string): string {
  if (category === "colors") return categoryHref("colors");
  if (category === "typography") return categoryHref("typography");
  if (category === "icons") return `/foundations/icons/${slug}`;
  if (category === "graphics") return `/foundations/graphics/${slug}`;
  return `/components/${slug}`;
}
