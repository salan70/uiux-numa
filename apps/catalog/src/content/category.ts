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
];

export function categoryForDomains(domains: string[]): CatalogCategory | null {
  for (const domain of domains) {
    const rule = CATEGORY_RULES.find((item) => item.domain === domain);
    if (rule) return rule.category;
  }
  return null;
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
