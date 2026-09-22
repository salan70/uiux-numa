// Catalog の UI アイコンの利用画面モック。
// Catalog の実際の 3 か所（ナビの開閉トグル、配色カードの詳細リンク、前後送りの Button）を切り出す。
// アイコンと語の対応は Catalog と同じにする。見せたい都合で対応を崩さない。
// 採用済みの Button（experiments/button の pill-action）をそのまま使い、複製しない。
import { Button } from "../../../button/shared/Button";

type Icons = { detail: string; sidebar: string; arrowPrev: string; arrowNext: string };

// 配布用 SVG を inline に展開する。root に width / height がないので CSS で大きさを与える。
// 同じ asset を 2 回展開すると part-* の id が重複するので、1 画面に 1 回だけ置く。
function Icon({ svg }: { svg: string }) {
  return <span className="cui-icon" aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export function Mock({ icons }: { icons: Icons }) {
  return (
    <div className="cui-mock button-pill-action">
      {/* 1. ナビの開閉トグル。ラベルを置く幅がないので aria-label で名前を与える（ICON-01 の例外）。 */}
      <header className="cui-bar">
        <button type="button" className="cui-toggle" aria-expanded="true" aria-label="ナビを閉じる">
          <Icon svg={icons.sidebar} />
        </button>
        <p className="cui-title">Colors</p>
      </header>

      <main className="cui-main">
        {/* 2. 配色カードの詳細リンク。文字の隣に置き、名前はリンクの aria-label が持つ。 */}
        <section className="cui-card">
          <ul className="cui-swatches">
            <li style={{ background: "#1b3a5c" }} />
            <li style={{ background: "#2f6690" }} />
            <li style={{ background: "#81a4cd" }} />
            <li style={{ background: "#dbe4ee" }} />
          </ul>
          <p className="cui-card-head">
            <span className="cui-card-name">藍染</span>
            <a className="cui-more" href="#aizome" aria-label="藍染 の役割をすべて見る">
              <Icon svg={icons.detail} />
            </a>
          </p>
        </section>

        {/* 3. 前後送り。送り先を方向ではなく配色の名前で示すので、アイコンは補助になる。 */}
        <p className="cui-nav">
          <Button
            appearance="secondary"
            className="cui-step"
            aria-label="前の配色 梅"
            leadingIcon={<Icon svg={icons.arrowPrev} />}
          >
            <span className="cui-step-name">梅</span>
          </Button>
          <span className="cui-count">03 / 10</span>
          <Button
            appearance="secondary"
            className="cui-step"
            aria-label="次の配色 柚子"
            trailingIcon={<Icon svg={icons.arrowNext} />}
          >
            <span className="cui-step-name">柚子</span>
          </Button>
        </p>
      </main>
    </div>
  );
}
