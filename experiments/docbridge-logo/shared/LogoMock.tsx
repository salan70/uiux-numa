// 1 案を DocBridge でロゴが出る面のモックに載せる。利用者が選んだ使い先は GitHub README のヘッダと favicon / npm のアイコン。
// 文字は HTML テキストで組む（<text> を使わない）。
import { Mark } from "./Mark";

const surfaces = ["light", "dark"] as const;

export function LogoMock({ mark }: { mark: string }) {
  return (
    <div className="db-mock">
      {/* 1. ブラウザのタブ。favicon が 16px で出る、最小の面。 */}
      <div className="db-tabs">
        {surfaces.map((surface) => (
          <div key={surface} className={`db-tab db-${surface}`}>
            <Mark svg={mark} className="db-mark db-mark--16" />
            <span className="db-tab__title">salan70/docbridge</span>
          </div>
        ))}
      </div>

      {/* 2. GitHub README のヘッダ。マークと wordmark の横組み。 */}
      <div className="db-readmes">
        {surfaces.map((surface) => (
          <article key={surface} className={`db-readme db-${surface}`}>
            {/* 桁の下端を wordmark の baseline に、図形の高さ（箱の 1/2）を cap height に合わせる。 */}
            <header className="db-lockup">
              <Mark svg={mark} className="db-mark db-mark--lockup" />
              <span className="db-wordmark">DocBridge</span>
            </header>
            <p>
              DocBridge keeps Markdown documentation and the code that implements it linked in both
              directions.
            </p>
            <pre>npm install --save-dev docbridge</pre>
          </article>
        ))}
      </div>

      {/* 3. npm や GitHub の avatar。角丸の正方形に大きく置く。 */}
      <div className="db-tiles">
        {surfaces.map((surface) => (
          <span key={surface} className={`db-tile db-${surface}`}>
            <Mark svg={mark} className="db-mark db-mark--64" />
          </span>
        ))}
      </div>

      {/* 4. 単体の縮小列。16 は最小、32 は favicon の基準（LOGO-07）。 */}
      <section className="db-sizes">
        {surfaces.map((surface) => (
          <span key={surface} className={`db-sizes__row db-${surface}`}>
            <Mark svg={mark} className="db-mark db-mark--16" />
            <Mark svg={mark} className="db-mark db-mark--24" />
            <Mark svg={mark} className="db-mark db-mark--32" />
            <Mark svg={mark} className="db-mark db-mark--48" />
          </span>
        ))}
      </section>
    </div>
  );
}
