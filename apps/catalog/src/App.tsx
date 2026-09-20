import { useEffect, type ReactNode } from "react";
import { Layout } from "./components/Layout";
import { catalog } from "./content/collect";
import { ALL_GUIDELINES } from "./content/guidelines";
import { ColorsPage } from "./pages/ColorsPage";
import { ComponentsPage } from "./pages/ComponentsPage";
import { DetailPage } from "./pages/DetailPage";
import { GuidelinesPage } from "./pages/GuidelinesPage";
import { HomePage } from "./pages/HomePage";
import { IconsPage } from "./pages/IconsPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { TokensPage } from "./pages/TokensPage";
import { TypographyPage } from "./pages/TypographyPage";
import { matchRoute, replaceLocation, usePathname, type Route } from "./router";
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
    // 文書を指していない /guidelines は先頭の文書へ送る。同じ中身の URL を 2 つ作らない。
    if (route.name === "guideline" && route.slug === null && ALL_GUIDELINES[0]) {
      replaceLocation(`/guidelines/${ALL_GUIDELINES[0].slug}`);
    }
  }, [route]);

  // 先頭へ戻すのは画面が変わったときだけにする。
  // path をそのまま見ると、配色のダイアログを開閉するたびにページが飛ぶ。
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [screenKey(route, path)]);

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

function pageForRoute(route: Route): {
  title: string;
  updated?: string;
  body: ReactNode;
} {
  if (route.name === "home") {
    return {
      title: "Home",
      updated: latestUpdated(catalog.experiments.map((item) => item.updated)),
      body: <HomePage />,
    };
  }
  if (route.name === "colors" || route.name === "color") {
    const scheme = route.name === "color" ? route.scheme : null;
    const label = scheme
      ? (catalog.schemes.find((item) => item.id === scheme)?.label ?? scheme)
      : "Colors";
    return {
      title: label,
      updated: topicUpdated("colors"),
      body: <ColorsPage openScheme={scheme} />,
    };
  }
  if (route.name === "typography") {
    return {
      title: "Typography",
      updated: topicUpdated("typography"),
      body: <TypographyPage />,
    };
  }
  if (route.name === "tokens") {
    return {
      title: "Tokens",
      body: <TokensPage />,
    };
  }
  if (route.name === "icons") {
    return {
      title: "Icons",
      updated: topicUpdated("icons"),
      body: <IconsPage />,
    };
  }
  if (route.name === "components") {
    return {
      title: "Components",
      updated: topicUpdated("components"),
      body: <ComponentsPage />,
    };
  }
  if (route.name === "icon" || route.name === "component" || route.name === "typographyDetail") {
    const experiment = catalog.experiments.find((item) => item.slug === route.experiment);
    return {
      title: experiment?.title ?? "ページが見つかりません",
      updated: experiment?.updated,
      body: <DetailPage slug={route.experiment} />,
    };
  }
  if (route.name === "guideline") {
    const slug = route.slug ?? ALL_GUIDELINES[0]?.slug;
    const guideline = ALL_GUIDELINES.find((item) => item.slug === slug);
    return {
      title: guideline?.title ?? "ページが見つかりません",
      body: slug ? <GuidelinesPage slug={slug} /> : <NotFoundPage />,
    };
  }
  return { title: "ページが見つかりません", body: <NotFoundPage /> };
}

/**
 * 先頭へ戻す単位。
 * 配色の詳細は一覧の上にダイアログを重ねるだけなので、一覧と同じ画面として扱う。
 */
function screenKey(route: Route, path: string): string {
  if (route.name === "color") return "/foundations/colors";
  return path;
}

function topicUpdated(topic: string): string | undefined {
  return latestUpdated(
    catalog.experiments.filter((item) => item.topic === topic).map((item) => item.updated),
  );
}

function latestUpdated(dates: string[]): string | undefined {
  return [...dates].sort().at(-1);
}
