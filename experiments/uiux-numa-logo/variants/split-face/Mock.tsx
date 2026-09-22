// UI/UX NUMA のロゴの利用画面モック。
// Catalog で実際にロゴが出る面だけを切り出す。タブ 16px、サイドバー題字、ホーム大見出し、favicon 32px、反転。
// 3 variant で同一にする。差分は dist/mark.svg だけである。
// lockup は形式 A（マーク + LINE Seed JP の HTML テキスト）で統一する。形式 B の比較はマークの選定後に行う。

// 配布用 SVG を inline に展開する。root に width / height がないので CSS で大きさを与える。
// 同じ asset を 1 画面に何度も置くので、part-* の id は class へ書き換える。
// Catalog 本体（apps/catalog/src/components/icons.tsx）と同じ扱いである。
function Mark({ svg, className }: { svg: string; className: string }) {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svg.replaceAll('id="part-', 'class="part-') }}
    />
  );
}

export function Mock({ mark }: { mark: string }) {
  return (
    <div className="lg-mock">
      {/* 1. ブラウザのタブ。favicon が 16px で出る、最小かつ最も頻度の高い面。 */}
      <div className="lg-tab">
        <Mark svg={mark} className="lg-mark lg-mark--16" />
        <span className="lg-tab__title">UI/UX NUMA</span>
        <span className="lg-tab__close" aria-hidden="true">
          ×
        </span>
      </div>

      <div className="lg-panes">
        {/* 2. サイドバー題字。幅 15rem、題字は 1rem / 700 / 0.02em（catalog.css の .sidebar__name）。 */}
        <aside className="lg-sidebar">
          <p className="lg-sidebar__head">
            <Mark svg={mark} className="lg-mark lg-mark--20" />
            <span className="lg-sidebar__name">UI/UX NUMA</span>
          </p>
          <nav className="lg-nav" aria-label="サンプル">
            <span className="lg-nav__group">WORKS</span>
            <span className="lg-nav__item">Colors</span>
            <span className="lg-nav__item">Typography</span>
            <span className="lg-nav__item">Tokens</span>
          </nav>
        </aside>

        {/* 3. ホーム大見出し。サイト最大の面。字は clamp(2.625rem, 7vw, 6rem) / 700 / -0.03em。 */}
        <main className="lg-home">
          <h1 className="lg-home__title">
            <Mark svg={mark} className="lg-mark lg-mark--display" />
            <span>UI/UX NUMA</span>
          </h1>
          <p className="lg-home__lead">採用した配色、文字、SVG、コンポーネントを正として掲載する。</p>
        </main>
      </div>

      {/* 4. 単体の縮小列。16 は最小、32 は favicon の基準（LOGO-07）。 */}
      <section className="lg-sizes">
        <span className="lg-sizes__label">16 / 24 / 32 / 48</span>
        <Mark svg={mark} className="lg-mark lg-mark--16" />
        <Mark svg={mark} className="lg-mark lg-mark--24" />
        <Mark svg={mark} className="lg-mark lg-mark--32" />
        <Mark svg={mark} className="lg-mark lg-mark--48" />
      </section>

      {/* 5. 反転。暗い面に置いても成立するかを見る。白黒 1 色で設計する段階の確認（LOGO-07）。 */}
      <section className="lg-invert">
        <span className="lg-tile lg-tile--light">
          <Mark svg={mark} className="lg-mark lg-mark--32" />
        </span>
        <span className="lg-tile lg-tile--dark">
          <Mark svg={mark} className="lg-mark lg-mark--32" />
        </span>
      </section>
    </div>
  );
}
