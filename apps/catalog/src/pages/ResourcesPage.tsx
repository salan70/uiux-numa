import { GITHUB_REPO_URL } from "../content/github";

export function ResourcesPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">情報</p>
        <h1>リソース</h1>
        <p className="lede">開発者向けのリポジトリと導入の入口。</p>
      </div>
      <section aria-labelledby="repo-heading">
        <h2 id="repo-heading">リポジトリ</h2>
        <p>
          ソースは{" "}
          <a href={GITHUB_REPO_URL} rel="noreferrer">
            {GITHUB_REPO_URL}
          </a>
          にある。
        </p>
      </section>
      <section aria-labelledby="license-heading">
        <h2 id="license-heading">ライセンス</h2>
        <p>ライセンス表記はリポジトリを参照する。</p>
      </section>
    </>
  );
}
