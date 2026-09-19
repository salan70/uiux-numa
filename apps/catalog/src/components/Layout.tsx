import { useEffect, useId, useRef, type ReactNode } from "react";
import { SITE_TITLE } from "../site";
import { Footer } from "./Footer";
import { Link } from "./Link";
import { PageNav } from "./PageNav";
import { Sidebar } from "./Sidebar";
import { ThemeSwitch } from "./ThemeSwitch";

type Props = {
  path: string;
  title: string;
  updated?: string;
  children: ReactNode;
};

export function Layout({ path, title, updated, children }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const menuId = useId();

  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  function openMenu() {
    dialogRef.current?.showModal();
  }

  function closeMenu() {
    dialogRef.current?.close();
  }

  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        本文へスキップ
      </a>
      <header className="app-header">
        <Link href="/" className="app-wordmark">
          {SITE_TITLE}
        </Link>
        <div className="header-tools">
          <ThemeSwitch />
          <button
            type="button"
            className="button menu-button"
            aria-haspopup="dialog"
            onClick={openMenu}
          >
            メニュー
          </button>
        </div>
      </header>
      <div className="app-columns">
        <aside className="sidebar-desktop" aria-label="サイト">
          <Sidebar path={path} />
        </aside>
        <div className="app-content">
          <main id="main" className="app-main">
            {children}
            <PageNav path={path} />
            <Footer updated={updated} />
          </main>
        </div>
      </div>
      <dialog
        ref={dialogRef}
        id={menuId}
        className="sidebar-drawer"
        aria-label="サイトメニュー"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeMenu();
        }}
      >
        <div className="sidebar-drawer-panel">
          <div className="sidebar-drawer-header">
            <p>メニュー</p>
            <button type="button" className="button button-ghost" onClick={closeMenu}>
              閉じる
            </button>
          </div>
          <Sidebar path={path} onNavigate={closeMenu} />
        </div>
      </dialog>
    </div>
  );
}
