type Props = {
  variantClass: string;
  variantLabel: string;
};

const notifications = [
  { event: "担当に追加されたとき", channel: "アプリ内とメール", state: "有効" },
  { event: "期限の前日", channel: "アプリ内", state: "有効" },
  { event: "週次まとめ", channel: "メール", state: "停止中" },
] as const;

export function Mock({ variantClass, variantLabel }: Props) {
  return (
    <div className={`pt-page ${variantClass}`}>
      <header className="pt-header">
        <a className="pt-brand" href="#pt-main" aria-label="Hako 設定の本文へ移動">
          <span aria-hidden="true">H</span>
          Hako
        </a>
        <nav aria-label="主要ナビゲーション">
          <a href="#pt-projects">プロジェクト</a>
          <a href="#pt-tasks">タスク</a>
          <a href="#pt-settings" aria-current="page">
            設定
          </a>
        </nav>
      </header>

      <main id="pt-main" className="pt-main">
        <p className="pt-variant">比較案: {variantLabel}</p>
        <div className="pt-title-row">
          <div>
            <h1>通知設定</h1>
            <p className="pt-intro">
              必要な通知だけを受け取れるように、通知する出来事と送信先を選びます。
            </p>
          </div>
          <button type="button" className="pt-button pt-button-primary">
            変更を保存
          </button>
        </div>

        <section className="pt-panel" aria-labelledby="pt-notifications">
          <div className="pt-section-heading">
            <div>
              <h2 id="pt-notifications">通知する出来事</h2>
              <p>重要な更新は既定で有効になっています。</p>
            </div>
            <span className="pt-count">3 件</span>
          </div>

          <div className="pt-table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">出来事</th>
                  <th scope="col">送信先</th>
                  <th scope="col">状態</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr key={notification.event}>
                    <th scope="row">{notification.event}</th>
                    <td>{notification.channel}</td>
                    <td>
                      <span
                        className={`pt-status ${notification.state === "停止中" ? "pt-status-muted" : ""}`}
                      >
                        {notification.state}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="pt-panel" aria-labelledby="pt-delivery">
          <div className="pt-section-heading">
            <div>
              <h2 id="pt-delivery">メールの送信先</h2>
              <p>長いアドレスや説明でも、内容を省略せず確認できることを検証します。</p>
            </div>
          </div>

          <form className="pt-form" onSubmit={(event) => event.preventDefault()}>
            <label htmlFor="pt-email">メールアドレス</label>
            <input id="pt-email" type="email" defaultValue="tetsuooda+notifications@example.com" />
            <p className="pt-help">確認メールを送信し、認証が終わってから通知を開始します。</p>

            <label className="pt-checkbox">
              <input type="checkbox" defaultChecked />
              <span>緊急の更新は、設定した時間帯に関係なく受け取る</span>
            </label>

            <div className="pt-actions">
              <button type="submit" className="pt-button pt-button-primary">
                確認メールを送る
              </button>
              <button type="button" className="pt-button pt-button-secondary">
                変更を取り消す
              </button>
            </div>
          </form>
        </section>

        <p className="pt-updated">最終更新: 2026 年 9 月 19 日 14:32</p>
      </main>
    </div>
  );
}
