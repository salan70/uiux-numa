import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { ColorsPage } from "./pages/ColorsPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { GraphicsPage } from "./pages/GraphicsPage";
import { HomePage } from "./pages/HomePage";
import { IconsPage } from "./pages/IconsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TypographyPage } from "./pages/TypographyPage";
import { matchRoute, usePathname } from "./router";
import { shouldNoindex } from "./theme";

export function App() {
  const path = usePathname();
  const route = matchRoute(path);

  useEffect(() => {
    if (!shouldNoindex()) return;
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.setAttribute("name", "robots");
      document.head.append(robots);
    }
    robots.setAttribute("content", "noindex, nofollow");
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  if (route.name === "home") {
    return (
      <Layout path={path} title="成果物の見本帳">
        <HomePage />
      </Layout>
    );
  }
  if (route.name === "colors") {
    return (
      <Layout path={path} title="Colors">
        <ColorsPage />
      </Layout>
    );
  }
  if (route.name === "typography") {
    return (
      <Layout path={path} title="Typography">
        <TypographyPage />
      </Layout>
    );
  }
  if (route.name === "icons") {
    return (
      <Layout path={path} title="Icons">
        <IconsPage />
      </Layout>
    );
  }
  if (route.name === "graphics") {
    return (
      <Layout path={path} title="Graphics">
        <GraphicsPage />
      </Layout>
    );
  }
  if (route.name === "components") {
    return (
      <Layout path={path} title="Components">
        <ComponentsPage />
      </Layout>
    );
  }
  return (
    <Layout path={path} title="ページがない">
      <NotFoundPage />
    </Layout>
  );
}
