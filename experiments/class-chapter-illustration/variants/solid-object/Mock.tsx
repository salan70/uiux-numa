// スライドの章扉イラストの利用画面モック。全 variant で同一の内容にし、差分は index.tsx が渡す SVG だけにする。
// 投影を想定した章扉のスライド 1 枚と、手元で見る資料ページの図 1 枚を並べる。
// 色は授業資料の刷新計画のトークン（primary #002d62、accent #ce1126）から写している。

function Art({ svg, className }: { svg: string; className: string }) {
  // 配布用 SVG を inline に展開する。currentColor は親の color を受ける。
  return (
    <span className={className} aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
  );
}

export function Mock({ art }: { art: string }) {
  return (
    <div className="ch-mock">
      <div className="ch-slide">
        <div className="ch-slide-text">
          <p className="ch-kicker">第 4 章</p>
          <p className="ch-title">ソフトウェアテスト</p>
          <p className="ch-lead">壊れていないことを、どうやって確かめるか。</p>
        </div>
        <Art svg={art} className="ch-art ch-art-slide" />
      </div>

      <div className="ch-doc">
        <h2>ソフトウェアテストとは</h2>
        <p>
          テストは、書いたコードが期待どおりに動くことを確かめる作業です。
          手で動かして確かめる方法と、確かめる手順自体をコードで書く方法があります。
        </p>
        <figure className="ch-figure">
          <Art svg={art} className="ch-art ch-art-doc" />
          <figcaption>この章で扱う範囲</figcaption>
        </figure>
        <p>この章では、後者の書き方と、どこまで書けば十分かの目安を扱います。</p>
      </div>
    </div>
  );
}
