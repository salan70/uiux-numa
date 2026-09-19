import { Collapsible } from "@base-ui/react/collapsible";

const NAV = [
  {
    id: "foundations",
    label: "土台",
    items: [
      { href: "#sk-colors", label: "配色", current: true },
      { href: "#sk-type", label: "文字", current: false },
    ],
  },
  {
    id: "components",
    label: "部品",
    items: [
      { href: "#sk-kit", label: "見本", current: false },
      { href: "#sk-form", label: "入力", current: false },
    ],
  },
] as const;

export function SidebarNav() {
  return (
    <nav className="sk-nav" aria-label="サイト">
      {NAV.map((section) => (
        <Collapsible.Root key={section.id} className="sk-section" defaultOpen>
          <Collapsible.Trigger className="sk-section-trigger">{section.label}</Collapsible.Trigger>
          <Collapsible.Panel className="sk-section-panel" keepMounted>
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} aria-current={item.current ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Collapsible.Panel>
        </Collapsible.Root>
      ))}
    </nav>
  );
}
