import type { ReactNode } from "react";
import { ALL_GUIDELINES } from "../content/guidelines";
import { isCurrentPath, TOPICS } from "../content/topics";
import { Link } from "./Link";
import { LogoMark, SidebarIcon, Wordmark } from "./icons";
import { ThemeControl } from "./ThemeControl";

type NavGroup = {
  id: string;
  label: string;
  children: { key: string; label: string; href: string }[];
};

/**
 * ナビの正本。成果物と方針の 2 群にし、子をその下に常に開いて並べる。
 * 横帯では 11 面が 390 幅で折り返すため畳む必要があったが、縦に置けば全件を一度に出せる。
 * 群の見出しは遷移しない。遷移するのは子のリンクである。
 */
const NAV_GROUPS: NavGroup[] = [
  {
    id: "works",
    label: "Works",
    children: TOPICS.map((topic) => ({
      key: topic.id,
      label: topic.label,
      href: topic.href,
    })),
  },
  {
    id: "guide",
    label: "Guidelines",
    children: ALL_GUIDELINES.map((guideline) => ({
      key: guideline.slug,
      label: guideline.title,
      href: `/guidelines/${guideline.slug}`,
    })),
  },
];

/**
 * ナビを畳むボタン。
 * 開閉で形も寸法も変えない。文言と aria-expanded だけが変わる。
 * floating は畳んだときの置き場で、版面の上余白へ絶対配置する。
 */
export function SidebarToggle({
  collapsed,
  onToggle,
  floating,
}: {
  collapsed: boolean;
  onToggle: () => void;
  floating?: boolean;
}) {
  return (
    <button
      type="button"
      className={floating ? "sidebar-toggle sidebar-toggle--floating" : "sidebar-toggle"}
      aria-expanded={!collapsed}
      aria-controls="sidebar"
      aria-label={collapsed ? "ナビを開く" : "ナビを閉じる"}
      onClick={onToggle}
    >
      <SidebarIcon />
    </button>
  );
}

export function Sidebar({
  path,
  onNavigate,
  toggle,
}: {
  path: string;
  onNavigate?: () => void;
  toggle?: ReactNode;
}) {
  return (
    <div className="sidebar" id="sidebar">
      <div className="sidebar__head">
        <Link href="/" className="sidebar__name" onNavigate={onNavigate}>
          <LogoMark />
          <Wordmark />
          <span className="logo-label">UI/UX NUMA</span>
        </Link>
        {toggle}
      </div>
      <nav className="sidebar__nav" aria-label="主ナビゲーション">
        {NAV_GROUPS.map((group) => (
          <section className="sidebar__group" key={group.id}>
            <h2 className="sidebar__heading" id={`nav-${group.id}`}>
              {group.label}
            </h2>
            <ul className="sidebar__list" aria-labelledby={`nav-${group.id}`}>
              {group.children.map((child) => (
                <li key={child.key}>
                  <Link
                    href={child.href}
                    className="sidebar__link"
                    current={isCurrentPath(child.href, path)}
                    onNavigate={onNavigate}
                  >
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </nav>
      <ThemeControl />
    </div>
  );
}
