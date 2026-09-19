import { Link } from "../components/Link";
import { MarkdownBody } from "../components/MarkdownBody";
import { catalog } from "../content/collect";
import { githubBlobUrl } from "../content/github";
import { NotFoundPage } from "./NotFoundPage";

export function PrinciplesPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">ガイド</p>
        <h1>原則</h1>
        <p className="lede">
          原則は <code>docs/principles/*.md</code> を glob で読む。正本は Catalog に分かれない。
        </p>
      </div>
      <ul className="record-list">
        {catalog.principles.map((principle) => (
          <li key={principle.slug}>
            <Link href={`/principles/${principle.slug}`}>{principle.title}</Link>
            <span className="meta"> {principle.status}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

export function PrincipleDetailPage({ slug }: { slug: string }) {
  const principle = catalog.principles.find((item) => item.slug === slug);
  if (!principle) return <NotFoundPage />;
  return (
    <>
      <div className="page-intro">
        <p className="crumb">
          <Link href="/principles">原則</Link>
        </p>
        <p className="eyebrow">{principle.status}</p>
        <h1>{principle.title}</h1>
        <p className="meta">
          更新日 <time dateTime={principle.updated}>{principle.updated}</time>
        </p>
      </div>
      <MarkdownBody html={principle.bodyHtml} />
      <section aria-labelledby="principle-source-heading">
        <h2 id="principle-source-heading">正本</h2>
        <p>
          <a href={githubBlobUrl(principle.repoPath)} rel="noreferrer">
            {principle.repoPath}
          </a>
        </p>
      </section>
    </>
  );
}
