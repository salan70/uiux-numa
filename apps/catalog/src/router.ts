import { useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "colors" }
  | { name: "color"; scheme: string }
  | { name: "typography" }
  | { name: "icons" }
  | { name: "icon"; experiment: string }
  | { name: "graphics" }
  | { name: "graphic"; experiment: string }
  | { name: "components" }
  | { name: "component"; experiment: string }
  | { name: "motion" }
  | { name: "motionDetail"; experiment: string }
  | { name: "redirect"; to: string }
  | { name: "notfound" };

export const OLD_PATH_REDIRECTS: Record<string, string> = {
  "/colors": "/foundations/colors",
  "/typography": "/foundations/typography",
  "/icons": "/foundations/icons",
  "/graphics": "/foundations/graphics",
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
  if (normalized === "/foundations/icons") return { name: "icons" };
  const icon = normalized.match(/^\/foundations\/icons\/([a-z0-9-]+)$/);
  if (icon) return { name: "icon", experiment: icon[1] };
  if (normalized === "/foundations/graphics") return { name: "graphics" };
  const graphic = normalized.match(/^\/foundations\/graphics\/([a-z0-9-]+)$/);
  if (graphic) return { name: "graphic", experiment: graphic[1] };
  if (normalized === "/components") return { name: "components" };
  const component = normalized.match(/^\/components\/([a-z0-9-]+)$/);
  if (component) return { name: "component", experiment: component[1] };
  if (normalized === "/motion") return { name: "motion" };
  const motion = normalized.match(/^\/motion\/([a-z0-9-]+)$/);
  if (motion) return { name: "motionDetail", experiment: motion[1] };
  return { name: "notfound" };
}
