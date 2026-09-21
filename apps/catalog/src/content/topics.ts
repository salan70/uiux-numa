// 公開ナビの正本。種別ではなく「何を探しているか」で分ける。
// 正本の domain は docs/scope.md にある。ここは topic への割り当てと URL だけを持つ。
// 判断は docs/decisions/2026-09-20-catalog-topic-first.md に残す。

export type TopicId = "colors" | "typography" | "tokens" | "components" | "icons";

export type Topic = {
  id: TopicId;
  label: string;
  lead: string;
  href: string;
  /** この topic に入る Experiment の domain。token の topic だけ空にする。 */
  domains: string[];
};

// 並びは利用者が挙げた順。割り当ての規則とは分ける。
export const TOPICS: Topic[] = [
  {
    id: "colors",
    label: "Colors",
    lead: "役割ごとに決めた色の組。",
    href: "/foundations/colors",
    domains: ["color"],
  },
  {
    id: "typography",
    label: "Typography",
    lead: "書体と文字の役割。",
    href: "/foundations/typography",
    domains: ["typography"],
  },
  {
    id: "tokens",
    label: "Tokens",
    lead: "正本の値そのもの。",
    href: "/foundations/tokens",
    domains: [],
  },
  {
    id: "components",
    label: "Components",
    lead: "入力と操作の部品。",
    href: "/components",
    domains: ["forms-input-ux"],
  },
  {
    id: "icons",
    label: "Icons",
    lead: "画面で使う記号の組。",
    href: "/foundations/icons",
    domains: ["iconography"],
  },
];

/**
 * 1 つの成果物が複数の domain を持つので、どの topic に入れるかを 1 つに決める。
 * 成果物が frontmatter に書いた domain の順で、最初に topic へ当たるものを採る。
 */
export function topicForExperiment(domains: string[]): TopicId | null {
  for (const domain of domains) {
    const topic = TOPICS.find((item) => item.domains.includes(domain));
    if (topic) return topic.id;
  }
  return null;
}

export function topicById(id: string | null): Topic | undefined {
  if (id === null) return undefined;
  return TOPICS.find((topic) => topic.id === id);
}

export function topicHref(id: TopicId): string {
  const topic = TOPICS.find((item) => item.id === id);
  if (!topic) throw new Error(`Catalog の topic が不正: ${id}`);
  return topic.href;
}

/** 成果物の詳細 URL。topic の下に slug を置く。 */
export function workHref(topic: TopicId, slug: string): string {
  return `${topicHref(topic)}/${slug}`;
}

export function isCurrentPath(href: string, path: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}
