import { catalog } from "../content/collect";
import { Link } from "../components/Link";

export function HomePage() {
  const recent = [
    ...catalog.experiments.map((item) => ({
      href: `/experiments/${item.slug}`,
      title: item.title,
      kind: "Experiment",
      updated: item.updated,
    })),
    ...catalog.principles.map((item) => ({
      href: `/principles/${item.slug}`,
      title: item.title,
      kind: "原則",
      updated: item.updated,
    })),
  ]
    .sort((a, b) => b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title))
    .slice(0, 6);

  const highlights = catalog.experiments
    .filter((item) => item.status === "decided")
    .sort((a, b) => b.updated.localeCompare(a.updated));

  return (
    <>
      <h1>UI/UX 沼</h1>
      <p className="lede">
        Tokens、Experiments、原則、Skills の成果を閲覧する。詳細の正本は GitHub の記録にある。
      </p>
      <ul className="count-grid">
        <li>
          <Link href="/tokens">
            <strong>{catalog.tokens.length}</strong>
            <span>token</span>
          </Link>
        </li>
        <li>
          <Link href="/experiments">
            <strong>{catalog.experiments.length}</strong>
            <span>Experiment</span>
          </Link>
        </li>
        <li>
          <span>
            <strong>{catalog.previews.length}</strong>
            <span>preview</span>
          </span>
        </li>
        <li>
          <span>
            <strong>{catalog.liveVariants.length}</strong>
            <span>live variant</span>
          </span>
        </li>
        <li>
          <Link href="/principles">
            <strong>{catalog.principles.length}</strong>
            <span>原則</span>
          </Link>
        </li>
        <li>
          <Link href="/skills">
            <strong>{catalog.skills.length}</strong>
            <span>Skill</span>
          </Link>
        </li>
      </ul>
      <section aria-labelledby="recent-heading">
        <h2 id="recent-heading">最近の更新</h2>
        <ul className="record-list">
          {recent.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>{item.title}</Link>
              <p>
                {item.kind} · {item.updated}
              </p>
            </li>
          ))}
        </ul>
      </section>
      <section aria-labelledby="highlight-heading">
        <h2 id="highlight-heading">主要成果</h2>
        <ul className="record-list">
          <li>
            <Link href="/tokens">Typography tokens</Link>
            <p>primitive 10 と semantic 6 の foundation</p>
          </li>
          {highlights.map((item) => (
            <li key={item.slug}>
              <Link href={`/experiments/${item.slug}`}>{item.title}</Link>
              <p>{item.decisionExcerpt}</p>
            </li>
          ))}
          {catalog.principles.map((item) => (
            <li key={item.slug}>
              <Link href={`/principles/${item.slug}`}>{item.title}</Link>
              <p>status {item.status}</p>
            </li>
          ))}
          {catalog.skills.map((item) => (
            <li key={item.name}>
              <Link href={`/skills/${item.name}`}>{item.name}</Link>
              <p>{item.description}</p>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
