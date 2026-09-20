import { useEffect, type ReactNode } from "react";
import { SITE_TITLE } from "../site";
import { Footer } from "./Footer";
import { Sidebar } from "./Sidebar";

type Props = {
  path: string;
  title: string;
  updated?: string;
  children: ReactNode;
};

/**
 * 根を横 2 桁にし、左をナビ、右を版面にする。
 * 狭い幅ではナビが上の横帯になる。畳む操作を置かないので、現在地を探す操作が要らない。
 */
export function Layout({ path, title, updated, children }: Props) {
  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  return (
    <div className="app-shell">
      <a className="skip" href="#main">
        本文へスキップ
      </a>
      <Sidebar path={path} />
      <main className="app-main" id="main">
        {children}
        <Footer updated={updated} />
      </main>
    </div>
  );
}
