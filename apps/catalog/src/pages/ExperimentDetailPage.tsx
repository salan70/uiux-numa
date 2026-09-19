import { LivePreview } from "../components/LivePreview";
import { PreviewGallery } from "../components/PreviewGallery";
import type { ExperimentRecord } from "../content/collect";
import { githubBlobUrl } from "../content/github";

export function ExperimentDetailPage({ experiment }: { experiment: ExperimentRecord }) {
  return (
    <>
      <p className="crumb">Experiments / {experiment.slug}</p>
      <h1>{experiment.title}</h1>
      <p className="meta">
        {experiment.status} · {experiment.domains.join(" / ")} · 更新 {experiment.updated}
      </p>
      <p>
        <a href={githubBlobUrl(experiment.repoPath)}>GitHub の原文</a>
      </p>
      <section aria-labelledby="problem-heading">
        <h2 id="problem-heading">Problem</h2>
        <p className="prose">{experiment.problemExcerpt}</p>
      </section>
      <section aria-labelledby="decision-heading">
        <h2 id="decision-heading">Decision</h2>
        <p className="prose">{experiment.decisionExcerpt}</p>
      </section>
      <PreviewGallery previews={experiment.previews} />
      <LivePreview variants={experiment.liveVariants} />
    </>
  );
}
