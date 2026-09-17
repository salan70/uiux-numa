import { useState, type FormEvent, type MouseEvent } from "react";

// 配色の比較に使う LP。全 variant で同一の内容にし、variant ごとの差は scheme.css だけにする。
// 色は scheme.css が定義する役割（--color-*）だけを layout.css から参照する。

// 実行基盤は URL の hash で variant を選ぶため、ページ内リンクは hash を変えずに移動する。
function jumpTo(event: MouseEvent<HTMLAnchorElement>, id: string) {
  event.preventDefault();
  const target = document.getElementById(id);
  target?.scrollIntoView();
  target?.focus({ preventScroll: true });
}

const tasks = [
  { title: "LP の文言を確定する", owner: "佐藤", status: "完了", tone: "success" },
  { title: "料金表の画像を差し替える", owner: "鈴木", status: "期限間近", tone: "warning" },
  { title: "問い合わせフォームを直す", owner: "高橋", status: "遅延", tone: "danger" },
  { title: "リリースノートを書く", owner: "田中", status: "未着手", tone: "neutral" },
] as const;

const features = [
  {
    title: "担当を決める",
    body: "タスクごとに担当者を 1 人決められます。誰が進めるかで迷いません。",
    icon: <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0" />,
  },
  {
    title: "期限を知らせる",
    body: "期限が近いタスクを前日に通知します。気づいたときには遅い、を防ぎます。",
    icon: <path d="M6 16V11a6 6 0 1 1 12 0v5l2 2H4l2-2Zm4 4h4" />,
  },
  {
    title: "進み具合を見る",
    body: "チーム全体の完了率を週ごとに確認できます。振り返りの材料になります。",
    icon: <path d="M4 20V10m6 10V4m6 16v-7m4 7H2" />,
  },
];

export function LandingPage() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
  }

  return (
    <div className="cs-lp">
      <header className="cs-header">
        <div className="cs-container cs-header-inner">
          <p className="cs-logo">
            <span className="cs-logo-mark" aria-hidden="true" />
            Hako
          </p>
          <nav aria-label="ページ内">
            <ul className="cs-nav">
              <li>
                <a href="#cs-features" onClick={(e) => jumpTo(e, "cs-features")}>
                  機能
                </a>
              </li>
              <li>
                <a href="#cs-pricing" onClick={(e) => jumpTo(e, "cs-pricing")}>
                  料金
                </a>
              </li>
              <li>
                <a href="#cs-signup" onClick={(e) => jumpTo(e, "cs-signup")}>
                  更新情報
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="cs-hero" aria-labelledby="cs-hero-title">
        <div className="cs-container cs-hero-inner">
          <div>
            <p className="cs-eyebrow">ベータ版を公開しました</p>
            <h1 id="cs-hero-title">チームのやることを、ひとつの箱に。</h1>
            <p className="cs-lead">
              Hako
              は小さなチームのためのタスク共有アプリです。担当と期限が一目で分かり、抜け漏れを防ぎます。
            </p>
            <div className="cs-actions">
              <a
                className="cs-button cs-button-primary"
                href="#cs-signup"
                onClick={(e) => jumpTo(e, "cs-signup")}
              >
                無料で始める
              </a>
              <a
                className="cs-button cs-button-secondary"
                href="#cs-features"
                onClick={(e) => jumpTo(e, "cs-features")}
              >
                機能を見る
              </a>
            </div>
            <p className="cs-note">クレジットカードの登録は不要です。</p>
          </div>

          <figure className="cs-mock">
            <div className="cs-mock-window">
              <div className="cs-mock-head">
                <p className="cs-mock-title">今週のタスク</p>
                <p className="cs-mock-progress-label">進捗 60%</p>
              </div>
              <div className="cs-progress" aria-hidden="true">
                <div className="cs-progress-bar" />
              </div>
              <ul className="cs-tasks">
                {tasks.map((task) => (
                  <li key={task.title} className="cs-task">
                    <div>
                      <p className="cs-task-title">{task.title}</p>
                      <p className="cs-task-owner">担当: {task.owner}</p>
                    </div>
                    <span className={`cs-chip cs-chip-${task.tone}`}>{task.status}</span>
                  </li>
                ))}
              </ul>
            </div>
            <figcaption className="cs-mock-caption">Hako の画面の例</figcaption>
          </figure>
        </div>
      </section>

      <section className="cs-section cs-section-subtle" aria-labelledby="cs-features">
        <div className="cs-container">
          <p className="cs-kicker">機能</p>
          <h2 id="cs-features" tabIndex={-1}>
            Hako でできること
          </h2>
          <p className="cs-section-lead">必要な機能だけに絞り、登録した日から使えます。</p>
          <ul className="cs-features">
            {features.map((feature) => (
              <li key={feature.title} className="cs-feature">
                <span className="cs-feature-icon" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {feature.icon}
                  </svg>
                </span>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="cs-section" aria-label="利用者の声">
        <div className="cs-container">
          <figure className="cs-quote">
            <blockquote>
              <p>会議で「あれはどうなった？」と聞くことがなくなりました。</p>
            </blockquote>
            <figcaption>デザイン事務所の代表</figcaption>
          </figure>
        </div>
      </section>

      <section className="cs-section cs-section-subtle" aria-labelledby="cs-pricing">
        <div className="cs-container">
          <p className="cs-kicker">料金</p>
          <h2 id="cs-pricing" tabIndex={-1}>
            チームの人数に合わせて選べます
          </h2>
          <div className="cs-plans">
            <article className="cs-plan" aria-labelledby="cs-plan-free">
              <h3 id="cs-plan-free">フリー</h3>
              <p className="cs-price">
                0 円<small> / 月</small>
              </p>
              <ul>
                <li>メンバー 3 人まで</li>
                <li>タスク数は無制限</li>
              </ul>
              <a
                className="cs-button cs-button-secondary"
                href="#cs-signup"
                onClick={(e) => jumpTo(e, "cs-signup")}
              >
                フリーで始める
              </a>
            </article>
            <article className="cs-plan cs-plan-featured" aria-labelledby="cs-plan-team">
              <h3 id="cs-plan-team">
                チーム<span className="cs-badge">おすすめ</span>
              </h3>
              <p className="cs-price">
                600 円<small> / 人・月</small>
              </p>
              <ul>
                <li>メンバー数は無制限</li>
                <li>期限の通知と週ごとの完了率</li>
              </ul>
              <a
                className="cs-button cs-button-primary"
                href="#cs-signup"
                onClick={(e) => jumpTo(e, "cs-signup")}
              >
                チームで始める
              </a>
            </article>
          </div>
        </div>
      </section>

      <section className="cs-section" aria-labelledby="cs-signup">
        <div className="cs-container">
          <p className="cs-kicker">更新情報</p>
          <h2 id="cs-signup" tabIndex={-1}>
            正式版の公開をお知らせします
          </h2>
          <form className="cs-signup-form" onSubmit={handleSubmit}>
            <div className="cs-field">
              <label htmlFor="cs-email">メールアドレス</label>
              <input
                id="cs-email"
                className="cs-input"
                type="email"
                name="email"
                autoComplete="email"
                required
              />
            </div>
            <button className="cs-button cs-button-primary" type="submit">
              登録する
            </button>
          </form>
          <p className="cs-help">月に 1 回までお送りします。</p>
          <p className="cs-status" role="status">
            {submitted ? "登録を受け付けました。" : ""}
          </p>
        </div>
      </section>

      <footer className="cs-footer">
        <div className="cs-container">
          <p>© 2026 Hako。この画面は配色を比較するための例です。</p>
        </div>
      </footer>
    </div>
  );
}
