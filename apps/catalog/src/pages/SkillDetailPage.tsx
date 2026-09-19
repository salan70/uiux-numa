import type { SkillRecord } from "../content/collect";
import { githubBlobUrl } from "../content/github";

export function SkillDetailPage({ skill }: { skill: SkillRecord }) {
  return (
    <>
      <p className="crumb">Skills / {skill.name}</p>
      <h1>{skill.name}</h1>
      <p className="meta">成熟度 {skill.maturity}</p>
      <p className="prose">{skill.description}</p>
      <p>
        <a href={githubBlobUrl(skill.repoPath)}>GitHub の原文</a>
      </p>
      <section aria-labelledby="related-heading">
        <h2 id="related-heading">関連資料</h2>
        <ul>
          {skill.relatedPaths.map((item) => (
            <li key={item.path}>
              <a href={item.url}>{item.path}</a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
