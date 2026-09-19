import { useEffect, useState } from "react";

export type Route =
  | { name: "home" }
  | { name: "colors" }
  | { name: "typography" }
  | { name: "icons" }
  | { name: "graphics" }
  | { name: "components" }
  | { name: "notfound" };

export function usePathname(): string {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onChange = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onChange);
    return () => window.removeEventListener("popstate", onChange);
  }, []);
  return path;
}

export function navigate(to: string): void {
  if (to === window.location.pathname) return;
  window.history.pushState({}, "", to);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

export function matchRoute(path: string): Route {
  if (path === "/") return { name: "home" };
  if (path === "/colors") return { name: "colors" };
  if (path === "/typography") return { name: "typography" };
  if (path === "/icons") return { name: "icons" };
  if (path === "/graphics") return { name: "graphics" };
  if (path === "/components") return { name: "components" };
  return { name: "notfound" };
}
