import { useEffect, useId, useRef, type ReactNode } from "react";
import { SITE_TITLE } from "../site";
import { Footer } from "./Footer";
import { Link } from "./Link";
import { PageNav } from "./PageNav";
import { PageToc } from "./PageToc";
import { Sidebar } from "./Sidebar";

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
        <button type="button" className="menu-button" aria-haspopup="dialog" onClick={openMenu}>
          メニュー
        </button>
      </header>
      <div className="app-columns">
        <aside className="sidebar-desktop" aria-label="サイト">
          <Sidebar path={path} />
        </aside>
        <div className="app-content">
          <main id="main" className="app-main">
            {children}
            <PageNav path={path} />
          </main>
          <Footer updated={updated} />
        </div>
        <aside className="toc-column">
          <PageToc path={path} />
        </aside>
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
            <button type="button" onClick={closeMenu}>
              閉じる
            </button>
          </div>
          <Sidebar path={path} onNavigate={closeMenu} />
        </div>
      </dialog>
    </div>
  );
}
