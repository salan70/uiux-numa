export const CATEGORY_RULES = [
  { domain: "color", category: "colors", label: "配色", href: "/foundations/colors" },
  {
    domain: "typography",
    category: "typography",
    label: "文字",
    href: "/foundations/typography",
  },
  { domain: "iconography", category: "icons", label: "アイコン", href: "/foundations/icons" },
  {
    domain: "logo-brand-identity",
    category: "graphics",
    label: "図",
    href: "/foundations/graphics",
  },
  {
    domain: "illustration-svg",
    category: "graphics",
    label: "図",
    href: "/foundations/graphics",
  },
  {
    domain: "forms-input-ux",
    category: "components",
    label: "部品",
    href: "/components",
  },
] as const;

export type CatalogCategory = (typeof CATEGORY_RULES)[number]["category"];

export const CATEGORY_ORDER: CatalogCategory[] = [
  "colors",
  "typography",
  "icons",
  "graphics",
  "components",
];

export type NavItem = {
  href: string;
  label: string;
};

export type NavSection = {
  id: string;
  label: string;
  items: NavItem[];
};

export const NAV_SECTIONS: NavSection[] = [
  {
    id: "guides",
    label: "ガイド",
    items: [
      { href: "/getting-started", label: "はじめに" },
      { href: "/principles", label: "原則" },
    ],
  },
  {
    id: "foundations",
    label: "土台",
    items: [
      { href: "/foundations/colors", label: "配色" },
      { href: "/foundations/typography", label: "文字" },
      { href: "/foundations/icons", label: "アイコン" },
      { href: "/foundations/graphics", label: "図" },
    ],
  },
  {
    id: "components",
    label: "部品",
    items: [{ href: "/components", label: "部品" }],
  },
  {
    id: "info",
    label: "情報",
    items: [
      { href: "/status", label: "ステータス" },
      { href: "/resources", label: "リソース" },
    ],
  },
];

export function categoryForDomains(domains: string[]): CatalogCategory {
  for (const domain of domains) {
    const rule = CATEGORY_RULES.find((item) => item.domain === domain);
    if (rule) return rule.category;
  }
  throw new Error(`対応する Catalog の種別がない: ${domains.join(", ")}`);
}

export function categoryLabel(category: CatalogCategory): string {
  const rule = CATEGORY_RULES.find((item) => item.category === category);
  if (!rule) throw new Error(`Catalog の種別が不正: ${category}`);
  return rule.label;
}

export function categoryHref(category: CatalogCategory): string {
  const rule = CATEGORY_RULES.find((item) => item.category === category);
  if (!rule) throw new Error(`Catalog の種別が不正: ${category}`);
  return rule.href;
}

export function isCurrentPath(href: string, path: string): boolean {
  if (href === "/") return path === "/";
  return path === href || path.startsWith(`${href}/`);
}

export function sitePages(input: {
  schemes: { id: string; label: string }[];
  principles: { slug: string; title: string }[];
  experiments: { slug: string; title: string; category: CatalogCategory }[];
}): NavItem[] {
  const byCategory = (category: CatalogCategory) =>
    input.experiments.filter((item) => item.category === category);
  return [
    { href: "/", label: "トップ" },
    { href: "/getting-started", label: "はじめに" },
    { href: "/principles", label: "原則" },
    ...input.principles.map((item) => ({
      href: `/principles/${item.slug}`,
      label: item.title,
    })),
    { href: "/foundations/colors", label: "配色" },
    ...input.schemes.map((item) => ({
      href: `/foundations/colors/${item.id}`,
      label: item.label,
    })),
    { href: "/foundations/typography", label: "文字" },
    { href: "/foundations/icons", label: "アイコン" },
    ...byCategory("icons").map((item) => ({
      href: `/foundations/icons/${item.slug}`,
      label: item.title,
    })),
    { href: "/foundations/graphics", label: "図" },
    ...byCategory("graphics").map((item) => ({
      href: `/foundations/graphics/${item.slug}`,
      label: item.title,
    })),
    { href: "/components", label: "部品" },
    ...byCategory("components").map((item) => ({
      href: `/components/${item.slug}`,
      label: item.title,
    })),
    { href: "/status", label: "ステータス" },
    { href: "/resources", label: "リソース" },
  ];
}
