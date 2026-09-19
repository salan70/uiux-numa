// 機能アイコンの利用画面モック。全 variant で同一の内容にし、差分は index.tsx が渡す SVG だけにする。
// LP（color-schemes の Hako）の header と機能セクションを切り出し、アプリ内の 16px の利用を 1 枚に加える。
// 色は color-schemes の wasabi（ライト）の役割から mock.css に写している。

type Icons = { assign: string; deadline: string; progress: string };

const features = [
  {
    key: "assign",
    title: "担当を決める",
    body: "タスクごとに担当者を 1 人決められます。誰が進めるかで迷いません。",
  },
  {
    key: "deadline",
    title: "期限を知らせる",
    body: "期限が近いタスクを前日に通知します。気づいたときには遅い、を防ぎます。",
  },
  {
    key: "progress",
    title: "進み具合を見る",
    body: "チーム全体の完了率を週ごとに確認できます。振り返りの材料になります。",
  },
] as const;

const meta = [
  { key: "assign", label: "担当", value: "佐藤" },
  { key: "deadline", label: "期限", value: "9 月 20 日（土）" },
  { key: "progress", label: "進捗", value: "60%" },
] as const;

function Icon({ svg, size }: { svg: string; size: 16 | 24 }) {
  // 配布用 SVG を inline に展開する。currentColor は親の color を受ける。
  return (
    <span
      className={`fi-icon fi-icon-${size}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Mock({ icons }: { icons: Icons }) {
  return (
    <div className="fi-mock">
      <header className="fi-header">
        <div className="fi-container fi-header-inner">
          <p className="fi-logo">
            <span className="fi-logo-mark" aria-hidden="true" />
            Hako
          </p>
          <nav aria-label="ページ内">
            <ul className="fi-nav">
              <li>機能</li>
              <li>料金</li>
              <li>更新情報</li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="fi-section" aria-labelledby="fi-features">
        <div className="fi-container">
          <p className="fi-kicker">機能</p>
          <h2 id="fi-features">Hako でできること</h2>
          <p className="fi-lead">必要な機能だけに絞り、登録した日から使えます。</p>
          <ul className="fi-features">
            {features.map((f) => (
              <li key={f.key} className="fi-feature">
                <span className="fi-feature-icon">
                  <Icon svg={icons[f.key]} size={24} />
                </span>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="fi-section fi-section-app" aria-labelledby="fi-app">
        <div className="fi-container">
          <p className="fi-kicker">アプリ内（16px）</p>
          <h2 id="fi-app" className="fi-visually-hidden">
            タスクの詳細
          </h2>
          <div className="fi-task">
            <p className="fi-task-title">料金表の画像を差し替える</p>
            <dl className="fi-meta">
              {meta.map((m) => (
                <div key={m.key} className="fi-meta-row">
                  <dt>
                    <Icon svg={icons[m.key]} size={16} />
                    {m.label}
                  </dt>
                  <dd>{m.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </div>
  );
}
