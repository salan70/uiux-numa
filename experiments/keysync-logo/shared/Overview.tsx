// 候補を 1 ページに並べる一覧面。比べる候補がなくなったら削除する。
// 1 行 = 1 案。単色の縮小列、黄の箱に入れたヘッダー、多色の明暗、入口の大きさを同じ条件で並べる。
import { Mark } from "./Mark";

export type Candidate = { id: string; family: string; note: string; svg: string };

export function Overview({ candidates }: { candidates: Candidate[] }) {
  let lastFamily = "";
  return (
    <div className="ks-mock ks-overview">
      <p className="ks-overview__lead">
        KeySync のロゴ 第 3 世代。pop-tilt と pop-confetti を合わせた基準と、K と S を読ませる 3
        案。左から 16 / 24 / 32px の単色、ヘッダー（黄の箱）、多色の明暗、入口の大きさ。
      </p>
      <div className="ks-overview__head" aria-hidden="true">
        <span>案</span>
        <span>16 / 24 / 32</span>
        <span>ヘッダー</span>
        <span>多色（明）</span>
        <span>多色（暗）</span>
        <span>入口</span>
      </div>
      {candidates.map((c) => {
        const heading =
          c.family !== lastFamily ? <h2 className="ks-overview__family">{c.family}</h2> : null;
        lastFamily = c.family;
        return (
          <div key={c.id} className="ks-overview__group">
            {heading}
            <div className="ks-overview__row">
              <div className="ks-overview__name">
                <strong>{c.id}</strong>
                <small>{c.note}</small>
              </div>
              <div className="ks-overview__sizes">
                <Mark svg={c.svg} className="ks-mark ks-mark--16" />
                <Mark svg={c.svg} className="ks-mark ks-mark--24" />
                <Mark svg={c.svg} className="ks-mark ks-mark--32" />
              </div>
              <header className="ks-header">
                <span className="ks-logo">
                  <Mark svg={c.svg} className="ks-mark" />
                </span>
                <strong>KeySync</strong>
              </header>
              <span className="ks-overview__cell ks-multi">
                <Mark svg={c.svg} className="ks-mark ks-mark--48" />
                <strong>KeySync</strong>
              </span>
              <span className="ks-overview__cell ks-multi ks-dark">
                <Mark svg={c.svg} className="ks-mark ks-mark--48" />
                <strong>KeySync</strong>
              </span>
              <span className="ks-logo ks-logo--large">
                <Mark svg={c.svg} className="ks-mark" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
