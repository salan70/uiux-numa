import { useEffect, useState } from "react";

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

export function matchRoute(
  path: string,
):
  | { name: "home" }
  | { name: "tokens" }
  | { name: "experiments" }
  | { name: "experiment"; slug: string }
  | { name: "principles" }
  | { name: "principle"; slug: string }
  | { name: "skills" }
  | { name: "skill"; nameValue: string }
  | { name: "notfound" } {
  if (path === "/") return { name: "home" };
  if (path === "/tokens") return { name: "tokens" };
  if (path === "/experiments") return { name: "experiments" };
  const experiment = path.match(/^\/experiments\/([a-z0-9-]+)$/);
  if (experiment) return { name: "experiment", slug: experiment[1] };
  if (path === "/principles") return { name: "principles" };
  const principle = path.match(/^\/principles\/([a-z0-9-]+)$/);
  if (principle) return { name: "principle", slug: principle[1] };
  if (path === "/skills") return { name: "skills" };
  const skill = path.match(/^\/skills\/([a-z0-9-]+)$/);
  if (skill) return { name: "skill", nameValue: skill[1] };
  return { name: "notfound" };
}
