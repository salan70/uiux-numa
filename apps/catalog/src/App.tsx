import { useEffect, type ReactNode } from "react";
import { Layout } from "./components/Layout";
import { catalog } from "./content/collect";
import { ColorDetailPage, ColorsPage } from "./pages/ColorsPage";
import { ComponentDetailPage, ComponentsPage } from "./pages/ComponentsPage";
import { GraphicDetailPage, GraphicsPage } from "./pages/GraphicsPage";
import { HomePage } from "./pages/HomePage";
import { IconDetailPage, IconsPage } from "./pages/IconsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TypographyPage } from "./pages/TypographyPage";
import { matchRoute, replaceLocation, usePathname } from "./router";
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
    if (route.name === "redirect") replaceLocation(route.to);
  }, [route]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  if (route.name === "redirect") {
    const page = pageForRoute(matchRoute(route.to));
    return (
      <Layout path={route.to} title={page.title} updated={page.updated}>
        {page.body}
      </Layout>
    );
  }

  const page = pageForRoute(route);
  return (
    <Layout path={path} title={page.title} updated={page.updated}>
      {page.body}
    </Layout>
  );
}

function pageForRoute(route: ReturnType<typeof matchRoute>): {
  title: string;
  updated?: string;
  body: ReactNode;
} {
  if (route.name === "home") {
    return {
      title: "トップ",
      updated: latestUpdated(catalog.experiments.map((item) => item.updated)),
      body: <HomePage />,
    };
  }
  if (route.name === "colors") {
    return {
      title: "配色",
      updated: experimentUpdated("colors"),
      body: <ColorsPage />,
    };
  }
  if (route.name === "color") {
    const scheme = catalog.schemes.find((item) => item.id === route.scheme);
    return {
      title: scheme?.label ?? route.scheme,
      updated: experimentUpdated("colors"),
      body: <ColorDetailPage scheme={route.scheme} />,
    };
  }
  if (route.name === "typography") {
    return {
      title: "文字",
      updated: experimentUpdated("typography"),
      body: <TypographyPage />,
    };
  }
  if (route.name === "icons") {
    return {
      title: "アイコン",
      updated: latestUpdated(
        catalog.experiments.filter((item) => item.category === "icons").map((item) => item.updated),
      ),
      body: <IconsPage />,
    };
  }
  if (route.name === "icon") {
    const experiment = catalog.experiments.find((item) => item.slug === route.experiment);
    return {
      title: experiment?.title ?? "ページが見つかりません",
      updated: experiment?.updated,
      body: <IconDetailPage experiment={route.experiment} />,
    };
  }
  if (route.name === "graphics") {
    return {
      title: "図",
      updated: latestUpdated(
        catalog.experiments
          .filter((item) => item.category === "graphics")
          .map((item) => item.updated),
      ),
      body: <GraphicsPage />,
    };
  }
  if (route.name === "graphic") {
    const experiment = catalog.experiments.find((item) => item.slug === route.experiment);
    return {
      title: experiment?.title ?? "ページが見つかりません",
      updated: experiment?.updated,
      body: <GraphicDetailPage experiment={route.experiment} />,
    };
  }
  if (route.name === "components") {
    return {
      title: "部品",
      updated: experimentUpdated("components"),
      body: <ComponentsPage />,
    };
  }
  if (route.name === "component") {
    const experiment = catalog.experiments.find((item) => item.slug === route.experiment);
    return {
      title: experiment?.title ?? "ページが見つかりません",
      updated: experiment?.updated,
      body: <ComponentDetailPage experiment={route.experiment} />,
    };
  }
  return { title: "ページが見つかりません", body: <NotFoundPage /> };
}

function experimentUpdated(category: string): string | undefined {
  return latestUpdated(
    catalog.experiments.filter((item) => item.category === category).map((item) => item.updated),
  );
}

function latestUpdated(dates: string[]): string | undefined {
  return [...dates].sort().at(-1);
}
