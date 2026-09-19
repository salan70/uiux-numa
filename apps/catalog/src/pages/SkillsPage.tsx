import { catalog } from "../content/collect";
import { Link } from "../components/Link";

export function SkillsPage() {
  return (
    <>
      <h1>Skills</h1>
      <p className="lede">UI/UX 固有 Skill の概要。手順の正本は GitHub にある。</p>
      <ul className="record-list">
        {catalog.skills.map((item) => (
          <li key={item.name}>
            <Link href={`/skills/${item.name}`}>{item.name}</Link>
            <p>
              {item.maturity} · {item.description}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}
