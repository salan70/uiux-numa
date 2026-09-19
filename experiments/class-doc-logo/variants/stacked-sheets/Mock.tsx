// 授業資料サイトのシンボルマークの利用画面モック。全 variant で同一の内容にし、差分は index.tsx が渡す SVG だけにする。
// ブラウザのタブ（favicon 16px）、サイトの header（24px と wordmark）、スライドの隅（32px）、
// 明暗の単色と反転のタイル（64px）を 1 枚に並べる。
// 色は VitePress の既定テーマと、授業資料の刷新計画のトークン（primary #002d62、accent #ce1126）から写している。

function Mark({ svg, size }: { svg: string; size: 16 | 24 | 32 | 64 }) {
  // 配布用 SVG を inline に展開する。currentColor は親の color を受ける。
  return (
    <span
      className={`cl-mark cl-mark-${size}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

export function Mock({ mark }: { mark: string }) {
  return (
    <div className="cl-mock">
      <div className="cl-tabbar" aria-label="ブラウザのタブの例">
        <div className="cl-tab cl-tab-active">
          <Mark svg={mark} size={16} />
          <span>第 6 回 データベースと SQL｜授業資料</span>
        </div>
        <div className="cl-tab">
          <span className="cl-tab-dot" />
          <span>TypeScript ドキュメント</span>
        </div>
        <div className="cl-tab">
          <span className="cl-tab-dot" />
          <span>GitHub</span>
        </div>
      </div>

      <header className="cl-header">
        <div className="cl-container cl-header-inner">
          <p className="cl-logo">
            <Mark svg={mark} size={24} />
            授業資料
          </p>
          <nav aria-label="サイト">
            <ul className="cl-nav">
              <li>2025 年度</li>
              <li>2026 年度</li>
              <li>検索</li>
            </ul>
          </nav>
        </div>
      </header>

      <section className="cl-section">
        <div className="cl-container cl-grid">
          <div className="cl-cell">
            <p className="cl-label">スライドの隅（32px）</p>
            <div className="cl-slide">
              <p className="cl-slide-kicker">第 3 章</p>
              <p className="cl-slide-title">API と通信</p>
              <span className="cl-slide-mark">
                <Mark svg={mark} size={32} />
              </span>
            </div>
          </div>
          <div className="cl-cell">
            <p className="cl-label">単色（16px と 32px）と反転のタイル</p>
            <div className="cl-swatches">
              <span className="cl-mono cl-mono-light">
                <Mark svg={mark} size={32} />
                <Mark svg={mark} size={16} />
              </span>
              <span className="cl-mono cl-mono-dark">
                <Mark svg={mark} size={32} />
                <Mark svg={mark} size={16} />
              </span>
              <span className="cl-tile">
                <Mark svg={mark} size={32} />
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
