// 技術アイコンの利用画面モック。全 variant で同一の内容にし、差分は index.tsx が渡す SVG だけにする。
// 授業資料サイト（VitePress の既定テーマ風）のページと、Marp のスライド 2 枚を 1 画面に並べる。
// 色は VitePress の既定テーマと、授業資料の刷新計画のトークン（primary #002d62、accent #ce1126）から写している。

export type Icons = {
  terminal: string;
  code: string;
  branch: string;
  database: string;
  api: string;
  test: string;
  ai: string;
  web: string;
};

const topics: { key: keyof Icons; label: string }[] = [
  { key: "terminal", label: "ターミナル" },
  { key: "code", label: "ソースコード" },
  { key: "branch", label: "バージョン管理" },
  { key: "database", label: "データベース" },
  { key: "api", label: "API と通信" },
  { key: "test", label: "テスト" },
  { key: "ai", label: "AI / LLM" },
  { key: "web", label: "ブラウザと Web" },
];

function Icon({ svg, size }: { svg: string; size: 20 | 24 | 32 | 96 }) {
  // 配布用 SVG を inline に展開する。currentColor は親の color を受ける。
  return (
    <span
      className={`ti-icon ti-icon-${size}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Mock({ icons }: { icons: Icons }) {
  return (
    <div className="ti-mock">
      <section className="ti-doc" aria-label="授業資料サイトのページ">
        <aside className="ti-sidebar">
          <p className="ti-sidebar-title">TypeScript</p>
          <ul className="ti-sidebar-list">
            {topics.map((t) => (
              <li key={t.key} className={t.key === "database" ? "ti-current" : undefined}>
                <Icon svg={icons[t.key]} size={20} />
                {t.label}
              </li>
            ))}
          </ul>
        </aside>
        <article className="ti-content">
          <h1>第 6 回 データベースと SQL</h1>
          <h2>
            <Icon svg={icons.database} size={24} />
            今回の目標
          </h2>
          <p>テーブルとレコードの関係を説明できる。SELECT で必要な列と行だけを取り出せる。</p>
          <h2>
            <Icon svg={icons.terminal} size={24} />
            準備
          </h2>
          <p>ターミナルで次のコマンドを実行し、サンプルのデータベースを作る。</p>
          <pre>
            <code>sqlite3 sample.db &lt; seed.sql</code>
          </pre>
          <h2>
            <Icon svg={icons.test} size={24} />
            演習
          </h2>
          <p>合格者リストを取り出す SQL を書き、結果が 3 行になることを確かめる。</p>
        </article>
      </section>

      <section className="ti-slides" aria-label="スライドの例">
        <div className="ti-slide ti-slide-chapter">
          <Icon svg={icons.api} size={96} />
          <p className="ti-slide-kicker">第 3 章</p>
          <p className="ti-slide-title">API と通信</p>
        </div>
        <div className="ti-slide ti-slide-list">
          <p className="ti-slide-heading">今日やること</p>
          <ul>
            <li>
              <Icon svg={icons.branch} size={32} />
              ブランチを切って作業する
            </li>
            <li>
              <Icon svg={icons.code} size={32} />
              関数を 1 つ実装する
            </li>
            <li>
              <Icon svg={icons.ai} size={32} />
              AI にレビューしてもらう
            </li>
            <li>
              <Icon svg={icons.web} size={32} />
              ブラウザで動きを確かめる
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
