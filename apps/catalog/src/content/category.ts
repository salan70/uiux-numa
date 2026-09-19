export const CATEGORY_RULES = [
  { domain: "color", category: "colors", label: "Colors", href: "/colors" },
  { domain: "typography", category: "typography", label: "Typography", href: "/typography" },
  { domain: "iconography", category: "icons", label: "Icons", href: "/icons" },
  { domain: "logo-brand-identity", category: "graphics", label: "Graphics", href: "/graphics" },
  { domain: "illustration-svg", category: "graphics", label: "Graphics", href: "/graphics" },
  { domain: "forms-input-ux", category: "components", label: "Components", href: "/components" },
] as const;

export type CatalogCategory = (typeof CATEGORY_RULES)[number]["category"];

export const CATEGORY_ORDER: CatalogCategory[] = [
  "colors",
  "typography",
  "icons",
  "graphics",
  "components",
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
