import { NAV_ITEMS, isCurrentPath } from "../content/category";
import { Link } from "./Link";

type Props = {
  path: string;
  onNavigate?: () => void;
};

export function Sidebar({ path, onNavigate }: Props) {
  return (
    <nav className="sidebar sidebar-nav" aria-label="サイト">
      <ul>
        {NAV_ITEMS.map((item) => (
          <li key={item.href}>
            <Link href={item.href} current={isCurrentPath(item.href, path)} onNavigate={onNavigate}>
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
