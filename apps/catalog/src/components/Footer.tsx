import { GITHUB_REPO, GITHUB_REPO_URL } from "../content/github";

type Props = {
  updated?: string;
};

export function Footer({ updated }: Props) {
  return (
    <footer className="app-footer">
      <p>
        リポジトリ:{" "}
        <a href={GITHUB_REPO_URL} rel="noreferrer">
          {GITHUB_REPO}
        </a>
      </p>
      <p>
        ライセンスは{" "}
        <a href={GITHUB_REPO_URL} rel="noreferrer">
          リポジトリ
        </a>
        を参照する。
      </p>
      {updated ? (
        <p>
          更新日 <time dateTime={updated}>{updated}</time>
        </p>
      ) : null}
    </footer>
  );
}
