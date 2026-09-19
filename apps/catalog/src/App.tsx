import { useEffect } from "react";
import { catalog } from "./content/collect";
import { Layout } from "./components/Layout";
import { ExperimentDetailPage } from "./pages/ExperimentDetailPage";
import { ExperimentsPage } from "./pages/ExperimentsPage";
import { HomePage } from "./pages/HomePage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { PrincipleDetailPage } from "./pages/PrincipleDetailPage";
import { PrinciplesPage } from "./pages/PrinciplesPage";
import { SkillDetailPage } from "./pages/SkillDetailPage";
import { SkillsPage } from "./pages/SkillsPage";
import { TokensPage } from "./pages/TokensPage";
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
      <Layout path={path} title="ホーム">
        <HomePage />
      </Layout>
    );
  }
  if (route.name === "tokens") {
    return (
      <Layout path={path} title="Tokens">
        <TokensPage />
      </Layout>
    );
  }
  if (route.name === "experiments") {
    return (
      <Layout path={path} title="Experiments">
        <ExperimentsPage />
      </Layout>
    );
  }
  if (route.name === "experiment") {
    const experiment = catalog.experiments.find((item) => item.slug === route.slug);
    if (!experiment) {
      return (
        <Layout path={path} title="ページがない">
          <NotFoundPage />
        </Layout>
      );
    }
    return (
      <Layout path="/experiments" title={experiment.title}>
        <ExperimentDetailPage experiment={experiment} />
      </Layout>
    );
  }
  if (route.name === "principles") {
    return (
      <Layout path={path} title="原則">
        <PrinciplesPage />
      </Layout>
    );
  }
  if (route.name === "principle") {
    const principle = catalog.principles.find((item) => item.slug === route.slug);
    if (!principle) {
      return (
        <Layout path={path} title="ページがない">
          <NotFoundPage />
        </Layout>
      );
    }
    return (
      <Layout path="/principles" title={principle.title}>
        <PrincipleDetailPage principle={principle} />
      </Layout>
    );
  }
  if (route.name === "skills") {
    return (
      <Layout path={path} title="Skills">
        <SkillsPage />
      </Layout>
    );
  }
  if (route.name === "skill") {
    const skill = catalog.skills.find((item) => item.name === route.nameValue);
    if (!skill) {
      return (
        <Layout path={path} title="ページがない">
          <NotFoundPage />
        </Layout>
      );
    }
    return (
      <Layout path="/skills" title={skill.name}>
        <SkillDetailPage skill={skill} />
      </Layout>
    );
  }
  return (
    <Layout path={path} title="ページがない">
      <NotFoundPage />
    </Layout>
  );
}
