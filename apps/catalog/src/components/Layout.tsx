import { useEffect, type ReactNode } from "react";
import { categoryHref, categoryLabel, CATEGORY_ORDER } from "../content/category";
import { SITE_TITLE } from "../site";
import { Link } from "./Link";
import { ThemeSwitch } from "./ThemeSwitch";

type Props = {
  path: string;
  title: string;
  children: ReactNode;
};

export function Layout({ path, title, children }: Props) {
  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        本文へスキップ
      </a>
      <header className="app-header">
        <Link href="/" className="app-wordmark">
          {SITE_TITLE}
        </Link>
        <nav className="app-nav" aria-label="成果物の種別">
          <ul>
            {CATEGORY_ORDER.map((category) => {
              const href = categoryHref(category);
              return (
                <li key={category}>
                  <Link href={href} current={path === href}>
                    {categoryLabel(category)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="app-tools">
          <ThemeSwitch />
        </div>
      </header>
      <main id="main" className="app-main">
        {children}
      </main>
    </div>
  );
}
