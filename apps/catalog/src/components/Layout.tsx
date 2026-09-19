import { useEffect, useId, useState, type ReactNode } from "react";
import { SITE_TITLE } from "../site";
import { Link } from "./Link";
import { ThemeSwitch } from "./ThemeSwitch";

const nav = [
  { href: "/", label: "ホーム" },
  { href: "/tokens", label: "Tokens" },
  { href: "/experiments", label: "Experiments" },
  { href: "/principles", label: "原則" },
  { href: "/skills", label: "Skills" },
];

type Props = {
  path: string;
  title: string;
  children: ReactNode;
};

export function Layout({ path, title, children }: Props) {
  const menuId = useId();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        本文へ
      </a>
      <header className="app-header">
        <Link href="/" className="app-wordmark" onNavigate={close}>
          {SITE_TITLE}
        </Link>
        <button
          type="button"
          className="menu-button"
          aria-expanded={open}
          aria-controls={menuId}
          onClick={() => setOpen((value) => !value)}
        >
          {open ? "閉じる" : "メニュー"}
        </button>
      </header>
      <div className="app-body">
        <nav id={menuId} className={open ? "app-nav is-open" : "app-nav"} aria-label="主要領域">
          <p className="nav-kicker">{SITE_TITLE}</p>
          <ul>
            {nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href} current={path === item.href} onNavigate={close}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <ThemeSwitch />
        </nav>
        <main id="main" className="app-main">
          {children}
        </main>
      </div>
    </div>
  );
}
