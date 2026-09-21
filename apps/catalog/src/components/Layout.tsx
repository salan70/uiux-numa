import { useEffect, useState, type ReactNode } from "react";
import { SITE_TITLE } from "../site";
import { Sidebar, SidebarToggle } from "./Sidebar";

type Props = {
  path: string;
  title: string;
  children: ReactNode;
};

const COLLAPSE_KEY = "catalog.sidebar";

/**
 * 畳んだかどうかを端末に残す。
 * 読めない環境（private window、site data の拒否）では例外を握りつぶし、開いた状態に落とす。
 * ナビが見えている状態が既定で、読めないことを理由に隠さない。
 */
function readCollapsed() {
  try {
    return window.localStorage.getItem(COLLAPSE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

/**
 * 根を横 2 桁にし、左をナビ、右を版面にする。
 * 広い幅ではナビを畳める。図版と標本を全幅で読みたい場面があり、
 * 畳めないと 15rem の桁が常に版面を削っていた。
 * 狭い幅ではナビが上の横帯になる。帯は 1 行しか占めないので畳む対象にしない。
 */
export function Layout({ path, title, children }: Props) {
  const [collapsed, setCollapsed] = useState(readCollapsed);

  useEffect(() => {
    document.title = `${title} · ${SITE_TITLE}`;
  }, [title]);

  const toggle = () => {
    setCollapsed((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(COLLAPSE_KEY, next ? "collapsed" : "open");
      } catch {
        // 残せなくても開閉そのものは効く。
      }
      return next;
    });
  };

  return (
    <div className="app-shell" data-sidebar={collapsed ? "collapsed" : "open"}>
      <a className="skip" href="#main">
        本文へスキップ
      </a>
      <Sidebar path={path} toggle={<SidebarToggle collapsed={collapsed} onToggle={toggle} />} />
      <main className="app-main" id="main">
        {/* 畳んだときの開くボタン。版面の上余白へ絶対配置するので、本文は下へずれない。 */}
        {collapsed && <SidebarToggle collapsed onToggle={toggle} floating />}
        {children}
      </main>
    </div>
  );
}
