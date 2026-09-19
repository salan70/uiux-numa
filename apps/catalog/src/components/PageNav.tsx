import { sitePages } from "../content/category";
import { catalog } from "../content/collect";
import { Link } from "./Link";

type Props = {
  path: string;
};

export function PageNav({ path }: Props) {
  const pages = sitePages({
    schemes: catalog.schemes,
    principles: catalog.principles,
    experiments: catalog.experiments,
  });
  const index = pages.findIndex((item) => item.href === path);
  if (index === -1) return null;
  const prev = pages[index - 1];
  const next = pages[index + 1];
  if (!prev && !next) return null;

  return (
    <nav className="page-nav" aria-label="前後のページ">
      {prev ? (
        <Link href={prev.href} className="page-nav-prev">
          <span className="page-nav-label">前へ</span>
          <span>{prev.label}</span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} className="page-nav-next">
          <span className="page-nav-label">次へ</span>
          <span>{next.label}</span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
