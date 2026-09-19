import { useEffect, type ReactNode } from "react";
import { Layout } from "./components/Layout";
import { catalog } from "./content/collect";
import { ColorDetailPage, ColorsPage } from "./pages/ColorsPage";
import { ComponentDetailPage, ComponentsPage } from "./pages/ComponentsPage";
import { GettingStartedPage } from "./pages/GettingStartedPage";
import { GraphicDetailPage, GraphicsPage } from "./pages/GraphicsPage";
import { HomePage } from "./pages/HomePage";
import { IconDetailPage, IconsPage } from "./pages/IconsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrincipleDetailPage, PrinciplesPage } from "./pages/PrinciplesPage";
import { ResourcesPage } from "./pages/ResourcesPage";
import { StatusPage } from "./pages/StatusPage";
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
    return (
      <Layout path={path} title="移動中">
        <p>新しい URL へ移動します。</p>
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
  if (route.name === "getting-started") {
    return { title: "はじめに", body: <GettingStartedPage /> };
  }
  if (route.name === "principles") {
    return {
      title: "原則",
      updated: latestUpdated(catalog.principles.map((item) => item.updated)),
      body: <PrinciplesPage />,
    };
  }
  if (route.name === "principle") {
    const principle = catalog.principles.find((item) => item.slug === route.slug);
    return {
      title: principle?.title ?? "ページが見つかりません",
      updated: principle?.updated,
      body: <PrincipleDetailPage slug={route.slug} />,
    };
  }
  if (route.name === "colors") {
    return {
      title: "Colors",
      updated: experimentUpdated("colors"),
      body: <ColorsPage />,
    };
  }
  if (route.name === "color") {
    return {
      title: route.scheme,
      updated: experimentUpdated("colors"),
      body: <ColorDetailPage scheme={route.scheme} />,
    };
  }
  if (route.name === "typography") {
    return {
      title: "Typography",
      updated: experimentUpdated("typography"),
      body: <TypographyPage />,
    };
  }
  if (route.name === "icons") {
    return {
      title: "Icons",
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
      title: "Graphics",
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
      title: "コンポーネント",
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
  if (route.name === "status") {
    return {
      title: "ステータス",
      updated: latestUpdated(catalog.experiments.map((item) => item.updated)),
      body: <StatusPage />,
    };
  }
  if (route.name === "resources") {
    return { title: "リソース", body: <ResourcesPage /> };
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
