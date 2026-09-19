import { useEffect, useState } from "react";

type Heading = {
  id: string;
  text: string;
  level: 2 | 3;
};

type Props = {
  path: string;
};

export function PageToc({ path }: Props) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [active, setActive] = useState("");

  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    const nodes = [...main.querySelectorAll("h2, h3")];
    const items: Heading[] = nodes.map((node, index) => {
      if (!node.id) node.id = `section-${index + 1}`;
      return {
        id: node.id,
        text: node.textContent?.trim() ?? "",
        level: node.tagName === "H2" ? 2 : 3,
      };
    });
    setHeadings(items);
    setActive(items[0]?.id ?? "");

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: [0, 1] },
    );
    for (const node of nodes) observer.observe(node);
    return () => observer.disconnect();
  }, [path]);

  if (headings.length === 0) return null;

  return (
    <nav className="page-toc" aria-label="このページの目次">
      <h2 className="page-toc-title">このページの目次</h2>
      <ol>
        {headings.map((heading) => (
          <li key={heading.id} className={heading.level === 3 ? "toc-h3" : "toc-h2"}>
            <a
              href={`#${heading.id}`}
              aria-current={active === heading.id ? "location" : undefined}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
