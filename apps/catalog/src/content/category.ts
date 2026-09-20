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
    domain: "animation-motion",
    category: "motion",
    label: "動き",
    href: "/motion",
  },
  {
    domain: "forms-input-ux",
    category: "components",
    label: "UI",
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
  "motion",
];

// Catalog 自身の設計を比べる Experiment は公開ナビに出さない。比較記録として metadata だけ集める。
export const UNCATEGORIZED_SLUGS = new Set(["catalog-redesign", "catalog-editorial"]);

export type NavItem = {
  href: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "トップ" },
  ...CATEGORY_ORDER.map((category) => ({
    href: categoryHref(category),
    label: categoryLabel(category),
  })),
];

export function categoryForDomains(domains: string[]): CatalogCategory | null {
  for (const domain of domains) {
    const rule = CATEGORY_RULES.find((item) => item.domain === domain);
    if (rule) return rule.category;
  }
  return null;
}

export function categoryForExperiment(slug: string, domains: string[]): CatalogCategory | null {
  if (UNCATEGORIZED_SLUGS.has(slug)) return null;
  return categoryForDomains(domains);
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
