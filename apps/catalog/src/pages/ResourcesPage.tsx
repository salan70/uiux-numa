import { GITHUB_REPO_URL, githubBlobUrl } from "../content/github";

export function ResourcesPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">情報</p>
        <h1>リソース</h1>
        <p className="lede">開発者向けのリポジトリ、Skill、token の導入手順。</p>
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
      <section aria-labelledby="svg-skill-heading">
        <h2 id="svg-skill-heading">SVG 制作 Skill</h2>
        <p>
          アイコン、ロゴ、イラストの手順は{" "}
          <a href={githubBlobUrl("skills/crafting-svg/SKILL.md")} rel="noreferrer">
            skills/crafting-svg
          </a>
          にある。
        </p>
      </section>
      <section aria-labelledby="tokens-heading">
        <h2 id="tokens-heading">Typography token の導入</h2>
        <p>
          正本は <code>tokens/typography/typography.tokens.json</code> である。
        </p>
        <p>
          Web 用 CSS は <code>just tokens-build</code> で生成する。
        </p>
        <p>
          利用側は <code>tokens/typography/index.css</code> を読み、semantic の CSS 変数を参照する。
        </p>
      </section>
      <section aria-labelledby="colors-heading">
        <h2 id="colors-heading">配色の導入</h2>
        <p>
          各 variant の <code>scheme.css</code> を読み、
          <code>cs-{"{id}"}</code> クラスで配色を有効にする。
        </p>
      </section>
      <section aria-labelledby="license-heading">
        <h2 id="license-heading">ライセンス</h2>
        <p>ライセンス表記はリポジトリを参照する。</p>
      </section>
    </>
  );
}
