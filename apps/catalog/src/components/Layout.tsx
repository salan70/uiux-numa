import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Drawer } from "@base-ui/react/drawer";
import { SITE_TITLE } from "../site";
import { Footer } from "./Footer";
import { Link } from "./Link";
import { PortalContainerProvider } from "./PortalContainer";
import { Sidebar } from "./Sidebar";
import { ThemeSwitch } from "./ThemeSwitch";

type Props = {
  path: string;
  title: string;
  updated?: string;
  children: ReactNode;
};

export function Layout({ path, title, updated, children }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  return (
    <PortalContainerProvider value={rootRef}>
      <div className="app-shell" ref={rootRef}>
        <a className="skip-link" href="#main">
          本文へスキップ
        </a>
        <header className="app-header">
          <Link href="/" className="app-wordmark">
            {SITE_TITLE}
          </Link>
          <div className="header-tools">
            <ThemeSwitch />
            <Drawer.Root open={menuOpen} onOpenChange={setMenuOpen} swipeDirection="right">
              <Drawer.Trigger className="button menu-button">メニュー</Drawer.Trigger>
              <Drawer.Portal container={rootRef}>
                <Drawer.Backdrop className="sidebar-drawer-backdrop" />
                <Drawer.Viewport className="sidebar-drawer-viewport">
                  <Drawer.Popup className="sidebar-drawer" aria-labelledby={menuId}>
                    <Drawer.Content className="sidebar-drawer-panel">
                      <div className="sidebar-drawer-header">
                        <Drawer.Title id={menuId} className="sidebar-drawer-title">
                          メニュー
                        </Drawer.Title>
                        <Drawer.Close className="button button-ghost">閉じる</Drawer.Close>
                      </div>
                      <Drawer.Description className="visually-hidden">
                        種別へ移動できます。
                      </Drawer.Description>
                      <Sidebar path={path} onNavigate={() => setMenuOpen(false)} />
                    </Drawer.Content>
                  </Drawer.Popup>
                </Drawer.Viewport>
              </Drawer.Portal>
            </Drawer.Root>
          </div>
        </header>
        <div className="app-columns">
          <aside className="sidebar-desktop" aria-label="サイト">
            <Sidebar path={path} />
          </aside>
          <div className="app-content">
            <main id="main" className="app-main">
              {children}
              <Footer updated={updated} />
            </main>
          </div>
        </div>
      </div>
    </PortalContainerProvider>
  );
}
