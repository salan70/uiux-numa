// 1 案を KeySync の利用画面で見るモック。本体でロゴが出る面だけを切り出す。
// 寸法は KeySync の実値から写す（src/ui/styles/tokens/layout.css の --size-logo 2.25rem、--size-logo-large 4rem）。
// 本体のロゴは黄のキーキャップ型の箱（.logo）に入る。単色版はその箱の中に置き、多色版は箱なしで置く。
import { Mark } from "./Mark";

export function LogoMock({ mark }: { mark: string }) {
  return (
    <div className="ks-mock">
      {/* 1. ブラウザのタブ。favicon が 16px で出る、最小かつ最も頻度の高い面。 */}
      <div className="ks-tab">
        <Mark svg={mark} className="ks-mark ks-mark--16" />
        <span className="ks-tab__title">KeySync</span>
        <span className="ks-tab__close" aria-hidden="true">
          ×
        </span>
      </div>

      {/* 2. ヘッダー。左が現行の黄の箱に単色、右が箱なしの多色。 */}
      <div className="ks-headers">
        <header className="ks-header">
          <span className="ks-logo">
            <Mark svg={mark} className="ks-mark" />
          </span>
          <span>
            <strong>KeySync</strong>
            <small>build 17fd920 · 9/25 10:24</small>
          </span>
        </header>
        <header className="ks-header ks-multi">
          <Mark svg={mark} className="ks-mark ks-mark--28" />
          <span>
            <strong>KeySync</strong>
            <small>build 17fd920 · 9/25 10:24</small>
          </span>
        </header>
      </div>

      {/* 3. workspace の入口。本体で最も大きくロゴが出る面。 */}
      <div className="ks-gates">
        <section className="ks-gate">
          <span className="ks-logo ks-logo--large">
            <Mark svg={mark} className="ks-mark" />
          </span>
          <h1>workspace を開く</h1>
        </section>
        <section className="ks-gate ks-multi">
          <Mark svg={mark} className="ks-mark ks-mark--64" />
          <h1>workspace を開く</h1>
        </section>
        <section className="ks-gate ks-multi ks-dark">
          <Mark svg={mark} className="ks-mark ks-mark--64" />
          <h1>workspace を開く</h1>
        </section>
      </div>

      {/* 4. 単体の縮小列。16 は最小、32 は favicon の基準（LOGO-07）。 */}
      <section className="ks-sizes">
        <span className="ks-sizes__label">16 / 24 / 32 / 48</span>
        <Mark svg={mark} className="ks-mark ks-mark--16" />
        <Mark svg={mark} className="ks-mark ks-mark--24" />
        <Mark svg={mark} className="ks-mark ks-mark--32" />
        <Mark svg={mark} className="ks-mark ks-mark--48" />
        <span className="ks-sizes__dark">
          <Mark svg={mark} className="ks-mark ks-mark--16" />
          <Mark svg={mark} className="ks-mark ks-mark--24" />
          <Mark svg={mark} className="ks-mark ks-mark--32" />
          <Mark svg={mark} className="ks-mark ks-mark--48" />
        </span>
      </section>
    </div>
  );
}
