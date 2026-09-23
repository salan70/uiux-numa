// 8 案を 1 ページで比べる一覧面。比較案ではないので、採否の対象にしない。
// 一覧面の variant を残す判断は docs/decisions/2026-09-21-prune-decided-experiments.md に従う。
// 同じ行に、実利用の 4 サイズ、サイドバーの lockup、明暗の反転を並べる。
import { Mark, type MarkEntry } from "./Mark";

export function Overview({ marks }: { marks: MarkEntry[] }) {
  return (
    <div className="lg-mock lg-overview">
      <header className="lg-overview__head">
        <h1 className="lg-overview__title">UI/UX NUMA のロゴ 8 案</h1>
        <p className="lg-overview__lead">
          曲線で滑らかに、溶ける気配を軽く入れた 8 案。座標はすべて数式から出している。導出は README
          の表にある。
        </p>
      </header>

      {/* 1. タブの列。16px だけを 8 案ぶん並べ、最小サイズだけで見分けられるかを見る。 */}
      <section className="lg-overview__tabs">
        {marks.map((entry) => (
          <span className="lg-tab" key={entry.id}>
            <Mark svg={entry.svg} className="lg-mark lg-mark--16" />
            <span className="lg-tab__title">UI/UX NUMA</span>
          </span>
        ))}
      </section>

      {/* 2. 案ごとの行。縮小列、lockup、反転を同じ並びで見る。 */}
      {marks.map((entry) => (
        <section className="lg-row" key={entry.id}>
          <h2 className="lg-row__name">{entry.id}</h2>
          <p className="lg-row__note">{entry.label}</p>

          <div className="lg-row__body">
            <span className="lg-row__sizes">
              <Mark svg={entry.svg} className="lg-mark lg-mark--16" />
              <Mark svg={entry.svg} className="lg-mark lg-mark--24" />
              <Mark svg={entry.svg} className="lg-mark lg-mark--32" />
              <Mark svg={entry.svg} className="lg-mark lg-mark--48" />
            </span>

            <span className="lg-row__lockup">
              <Mark svg={entry.svg} className="lg-mark lg-mark--20" />
              <span className="lg-sidebar__name">UI/UX NUMA</span>
            </span>

            <span className="lg-row__tiles">
              <span className="lg-tile lg-tile--light">
                <Mark svg={entry.svg} className="lg-mark lg-mark--32" />
              </span>
              <span className="lg-tile lg-tile--dark">
                <Mark svg={entry.svg} className="lg-mark lg-mark--32" />
              </span>
            </span>
          </div>
        </section>
      ))}

      {/* 3. 見出しの列。サイト最大の面で 8 案を縦に積み、字面との釣り合いを見る。 */}
      <section className="lg-overview__display">
        {marks.map((entry) => (
          <h2 className="lg-display__title" key={entry.id}>
            <Mark svg={entry.svg} className="lg-mark lg-mark--display" />
            <span>UI/UX NUMA</span>
          </h2>
        ))}
      </section>
    </div>
  );
}
