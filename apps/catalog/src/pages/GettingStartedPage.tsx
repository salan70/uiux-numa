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
        <p>見た目、情報設計、操作、文章、動き、フィードバック、アクセシビリティを対象にする。</p>
        <p>実験、比較、評価、知識化、再利用までを一貫して扱う。</p>
      </section>
      <section aria-labelledby="layers-heading">
        <h2 id="layers-heading">3 層</h2>
        <p>リポジトリは Lab、Knowledge、Assets の 3 層で構成する。</p>
        <ul>
          <li>
            Lab: 同じ課題に複数案を実装し、比較する。置き場は <code>experiments/</code>。
          </li>
          <li>
            Knowledge: 原則と判断を整理する。置き場は <code>docs/</code>。
          </li>
          <li>
            Assets: 検証済みの token と Skill を置く。置き場は <code>tokens/</code> と{" "}
            <code>skills/</code>。
          </li>
        </ul>
      </section>
      <section aria-labelledby="lifecycle-heading">
        <h2 id="lifecycle-heading">Experiment の循環</h2>
        <p>作る、比較する、評価する、知識化する、再利用する、実プロジェクトで検証する。</p>
        <p>最終判断は人間が行い、採用理由と却下理由を記録する。</p>
      </section>
      <section aria-labelledby="catalog-heading">
        <h2 id="catalog-heading">Catalog の読み方</h2>
        <p>採用案を正として使う。却下案は比較資料である。</p>
        <p>ステータスは採用、却下、検討中を表示する。</p>
        <p>
          原則は <Link href="/principles">原則</Link>、導入手順は{" "}
          <Link href="/resources">リソース</Link>、採否は <Link href="/status">ステータス</Link>{" "}
          を見る。
        </p>
      </section>
    </>
  );
}
