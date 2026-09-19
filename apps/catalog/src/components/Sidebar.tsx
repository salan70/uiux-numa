import { NAV_SECTIONS, isCurrentPath } from "../content/category";
import { Link } from "./Link";
import { SearchBox } from "./SearchBox";
import { ThemeSwitch } from "./ThemeSwitch";

type Props = {
  path: string;
  onNavigate?: () => void;
};

export function Sidebar({ path, onNavigate }: Props) {
  return (
    <div className="sidebar">
      <SearchBox onNavigate={onNavigate} />
      <nav className="sidebar-nav" aria-label="サイト">
        {NAV_SECTIONS.map((section) => {
          const open = section.items.some((item) => isCurrentPath(item.href, path));
          return (
            <details
              key={`${section.id}-${path}`}
              className="sidebar-section"
              open={open ? true : undefined}
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
      <div className="sidebar-tools">
        <ThemeSwitch />
      </div>
    </div>
  );
}
