import { Link } from "../components/Link";

export function GettingStartedPage() {
  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">ガイド</p>
        <h1>はじめに</h1>
        <p className="lede">UI/UX 沼は、実験から得た成果を公開するデザインシステムサイトである。</p>
      </div>
      <section aria-labelledby="purpose-heading">
        <h2 id="purpose-heading">目的</h2>
        <p>
          見た目、情報設計、操作、文章、動き、フィードバック、アクセシビリティを対象に実験する。
          成果を個人開発へ再利用できる形に育てる。
        </p>
      </section>
      <section aria-labelledby="structure-heading">
        <h2 id="structure-heading">構成</h2>
        <p>リポジトリは Lab、Knowledge、Assets の 3 層で構成する。</p>
        <ul>
          <li>
            Lab: 同じ課題に複数案を実装する。置き場は <code>experiments/</code> である。
          </li>
          <li>
            Knowledge: 原則と判断を整理する。置き場は <code>docs/</code> である。
          </li>
          <li>Assets: 検証済みの token と Skill を置く。</li>
        </ul>
      </section>
      <section aria-labelledby="usage-heading">
        <h2 id="usage-heading">使い方</h2>
        <p>
          Foundations と Components では採用案を正として使う。却下案は比較資料として残してある。
        </p>
        <p>
          原則の一覧は <Link href="/principles">原則</Link>、導入手順は{" "}
          <Link href="/resources">リソース</Link> を見る。
        </p>
      </section>
    </>
  );
}
