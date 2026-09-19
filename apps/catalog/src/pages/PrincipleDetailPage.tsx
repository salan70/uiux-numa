import { Link } from "../components/Link";
import type { PrincipleRecord } from "../content/collect";
import { excerpt } from "../content/extractSection";
import { githubBlobUrl } from "../content/github";

export function PrincipleDetailPage({ principle }: { principle: PrincipleRecord }) {
  return (
    <>
      <p className="crumb">原則 / {principle.slug}</p>
      <h1>{principle.title}</h1>
      <p className="meta">
        {principle.status} · 更新 {principle.updated}
      </p>
      <p>
        <a href={githubBlobUrl(principle.repoPath)}>GitHub の原文</a>
      </p>
      <section aria-labelledby="hypothesis-heading">
        <h2 id="hypothesis-heading">仮説</h2>
        <p className="prose">{excerpt(principle.hypothesis)}</p>
      </section>
      <section aria-labelledby="decision-heading">
        <h2 id="decision-heading">判断</h2>
        <p className="prose">{excerpt(principle.decision)}</p>
      </section>
      <section aria-labelledby="source-heading">
        <h2 id="source-heading">由来 Experiment</h2>
        <ul>
          {principle.sourceExperiments.map((slug) => (
            <li key={slug}>
              <Link href={`/experiments/${slug}`}>{slug}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
