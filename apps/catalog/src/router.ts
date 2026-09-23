import { useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "colors" }
  | { name: "color"; scheme: string }
  | { name: "typography" }
  | { name: "typographyDetail"; experiment: string }
  | { name: "tokens" }
  | { name: "icons" }
  | { name: "icon"; experiment: string }
  | { name: "motion" }
  | { name: "motionDetail"; experiment: string }
  | { name: "components" }
  | { name: "component"; slug: string }
  // slug が null のときは先頭の文書へ送る。
  | { name: "guideline"; slug: string | null }
  | { name: "redirect"; to: string }
  | { name: "notfound" };

// Graphics と Illustrations は公開面から外した。
// 404 へ 301 で送っても往復が増えるだけなので、/graphics の転送も置かない。
export const OLD_PATH_REDIRECTS: Record<string, string> = {
  "/colors": "/foundations/colors",
  "/typography": "/foundations/typography",
  "/icons": "/foundations/icons",
};

export function resolvePath(path: string): string {
  const normalized = path.replace(/\/+$/, "") || "/";
  return OLD_PATH_REDIRECTS[normalized] ?? normalized;
}

export function usePathname(): string {
  const [path, setPath] = useState(() => syncLocation());
  useEffect(() => {
    const onChange = () => setPath(syncLocation());
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  return path;
}

function syncLocation(): string {
  const current = window.location.pathname;
  const resolved = resolvePath(current);
  if (current !== resolved) {
    window.history.replaceState({}, "", resolved);
  }
  return resolved;
}

export function navigate(to: string): void {
  if (to === window.location.pathname) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function replaceLocation(to: string): void {
  if (to === window.location.pathname) return;
  window.history.replaceState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function matchRoute(path: string): Route {
  const normalized = path.replace(/\/+$/, "") || "/";
  const redirected = OLD_PATH_REDIRECTS[normalized];
  if (redirected) return { name: "redirect", to: redirected };
  if (normalized === "/") return { name: "home" };
  if (normalized === "/foundations/colors") return { name: "colors" };
  const color = normalized.match(/^\/foundations\/colors\/([a-z0-9-]+)$/);
  if (color) return { name: "color", scheme: color[1] };
  if (normalized === "/foundations/typography") return { name: "typography" };
  const typography = normalized.match(/^\/foundations\/typography\/([a-z0-9-]+)$/);
  if (typography) return { name: "typographyDetail", experiment: typography[1] };
  if (normalized === "/foundations/tokens") return { name: "tokens" };
  if (normalized === "/foundations/icons") return { name: "icons" };
  const icon = normalized.match(/^\/foundations\/icons\/([a-z0-9-]+)$/);
  if (icon) return { name: "icon", experiment: icon[1] };
  if (normalized === "/foundations/motion") return { name: "motion" };
  const motion = normalized.match(/^\/foundations\/motion\/([a-z0-9-]+)$/);
  if (motion) return { name: "motionDetail", experiment: motion[1] };
  if (normalized === "/components") return { name: "components" };
  const component = normalized.match(/^\/components\/([a-z0-9-]+)$/);
  if (component) return { name: "component", slug: component[1] };
  if (normalized === "/guidelines") return { name: "guideline", slug: null };
  const guideline = normalized.match(/^\/guidelines\/([a-z0-9-]+)$/);
  if (guideline) return { name: "guideline", slug: guideline[1] };
  return { name: "notfound" };
}
