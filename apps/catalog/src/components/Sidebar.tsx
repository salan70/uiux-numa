import { useState } from "react";
import { NAV_SECTIONS, isCurrentPath } from "../content/category";
import { Link } from "./Link";
import { SearchBox } from "./SearchBox";

const NAV_OPEN_KEY = "uiux-numa-catalog-nav";

type Props = {
  path: string;
  onNavigate?: () => void;
};

export function Sidebar({ path, onNavigate }: Props) {
  const [open, setOpen] = useState(() => readOpenSections(path));

  function toggle(id: string, next: boolean) {
    setOpen((current) => {
      const updated = { ...current, [id]: next };
      persistOpenSections(updated);
      return updated;
    });
  }

  return (
    <div className="sidebar">
      <SearchBox path={path} onNavigate={onNavigate} />
      <nav className="sidebar-nav" aria-label="サイト">
        {NAV_SECTIONS.map((section) => {
          const current = section.items.some((item) => isCurrentPath(item.href, path));
          return (
            <details
              key={section.id}
              className="sidebar-section"
              open={current || open[section.id] !== false}
              onToggle={(event) => toggle(section.id, event.currentTarget.open)}
            >
              <summary>{section.label}</summary>
              <ul>
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      current={isCurrentPath(item.href, path)}
                      onNavigate={onNavigate}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </nav>
    </div>
  );
}

function readOpenSections(path: string): Record<string, boolean> {
  const defaults: Record<string, boolean> = {};
  for (const section of NAV_SECTIONS) {
    defaults[section.id] = true;
    if (section.items.some((item) => isCurrentPath(item.href, path))) {
      defaults[section.id] = true;
    }
  }
  try {
    const stored = sessionStorage.getItem(NAV_OPEN_KEY);
    if (!stored) return defaults;
    return { ...defaults, ...(JSON.parse(stored) as Record<string, boolean>) };
  } catch {
    return defaults;
  }
}

function persistOpenSections(open: Record<string, boolean>): void {
  sessionStorage.setItem(NAV_OPEN_KEY, JSON.stringify(open));
}
