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
 * 公開面から外した domain。
 * この domain を 1 つでも持つ成果物は掲載しない。
 * TOPICS から外すだけでは足りない。class-doc-logo のように別の domain も持つ成果物が、
 * 次の domain へ流れて無関係な topic に入ってしまう。
 */
const RETIRED_DOMAINS = new Set(["logo-brand-identity", "illustration-svg", "animation-motion"]);

/** Catalog 自身の設計を比べる Experiment は公開ナビに出さない。比較記録として metadata だけ集める。 */
export const UNCATEGORIZED_SLUGS = new Set([
  "catalog-redesign",
  "catalog-editorial",
  "guideline-rule-structure",
]);

/**
 * 後継の Experiment へ置き換えた成果物。判断の経緯を残すため削除はせず、公開面からだけ外す。
 * color-schemes は color-schemes-material の 24 役割へ置き換えた。
 */
export const SUPERSEDED_SLUGS = new Set(["color-schemes"]);

/**
 * 1 つの成果物が複数の domain を持つので、どの topic に入れるかを 1 つに決める。
 * 成果物が frontmatter に書いた domain の順で、最初に topic へ当たるものを採る。
 */
export function topicForExperiment(slug: string, domains: string[]): TopicId | null {
  if (UNCATEGORIZED_SLUGS.has(slug)) return null;
  if (SUPERSEDED_SLUGS.has(slug)) return null;
  if (domains.some((domain) => RETIRED_DOMAINS.has(domain))) return null;
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
