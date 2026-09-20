// 案 spread-plate の色と文字の見本。
// 図録の見開き。1 作品に 1 見開きを与え、ホストは無彩のマットに徹して、色は作品だけが持つ。
import "../../../../tokens/typography/index.css";
import "./variant.css";
import { Sheet, longestTitle, shortestTitle, type SheetSpec } from "../../shared/Sheet";

const SPEC: SheetSpec = {
  id: "spread-plate",
  title: "1 作品 1 見開き",
  hypothesis:
    "図録のように 1 作品へ 1 見開きを与えれば、標本が画面で最大になり、ホストは作品の額縁に徹することができる。",
  paper: "無彩のマット board",
  paletteNote:
    "ホストは差し色を持たない。色を持つのは作品だけで、配色切替は図版の面にだけ効かせる。地とマットの 2 段の白で奥行きを作り、線は 1 本の灰だけにする。",
  palette: [
    {
      role: "地",
      cssVar: "--ed-ground",
      light: "#f3f3f2",
      dark: "#17171a",
      reference: "和色大辞典 白練 / 夜の展示室は白練の明度を落とした値",
      intent:
        "展示室の壁にあたる面。わずかに灰を入れて、この上に置く図版の白が浮くようにする。純白にすると図版と地が同化する。",
    },
    {
      role: "マット",
      cssVar: "--ed-plate",
      light: "#fffffb",
      dark: "#202024",
      reference: "和色大辞典 胡粉色",
      intent:
        "図版を載せる台紙。地より 1 段明るくし、影を使わずに奥行きを作る。影は使わない方が、どの配色の作品を載せても濁らない。",
    },
    {
      role: "墨",
      cssVar: "--ed-ink",
      light: "#2b2b2b",
      dark: "#f3f3f2",
      reference: "和色大辞典 墨 / 白練",
      intent:
        "図録の解説は黒で組む。差し色を持たない案なので、強調はすべて太さと大きさで行い、色は増やさない。",
      check: { against: "--ed-ground", minimum: 4.5 },
    },
    {
      role: "解説",
      cssVar: "--ed-muted",
      light: "#5a5359",
      dark: "#b4b4b4",
      reference: "和色大辞典 石板色 / 薄鼠",
      intent:
        "キャプションと metadata。石板色はわずかに紫が入り、純灰より紙の上で沈む。図版の邪魔をしない弱さを狙う。",
      check: { against: "--ed-ground", minimum: 4.5 },
    },
    {
      role: "罫",
      cssVar: "--ed-rule",
      light: "#7d7d7d",
      dark: "#949495",
      reference: "和色大辞典 灰色 / 鼠色",
      intent:
        "線は 1 本だけ。図版の縁と、見開きの中央にだけ引く。3:1 を満たす濃さにして、額縁として確実に見えるようにする。",
      check: { against: "--ed-ground", minimum: 3 },
    },
  ],
  typeNote:
    "和文は LINE Seed JP のまま。数字と英字だけセリフ体に替えるのがこの案の軸である。400 と 700 しかない和文に、細いセリフの数字を対比として足す。下の見本は仮に系統書体で組んでいる。実際に載せる書体は決めてほしい。",
  type: [
    {
      name: "図版番号",
      size: "3rem",
      weight: 400,
      lineHeight: "1",
      tracking: "0.02em",
      use: "見開きの通し番号",
      intent:
        "ここだけ欧文セリフにする。和文と同じ書体で数字を組むと、番号が題名と同じ層に見えて、図版の識別子として働かない。",
      sample: "Plate 07",
    },
    {
      name: "題",
      size: "1.75rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0em",
      use: "作品の題名",
      intent:
        "主役は図版なので、題名は大きくしない。token の title 1.5rem をわずかに超える値に留め、図版より前に出ないようにする。",
      sample: longestTitle,
    },
    {
      name: "副題",
      size: "1.0625rem",
      weight: 700,
      lineHeight: "1.5",
      tracking: "0em",
      use: "variant の名前",
      intent: "題名の 6 割。同じ見開きの中で 2 番目に読む対象であることだけを示す。",
      sample: shortestTitle,
    },
    {
      name: "解説",
      size: "0.9375rem",
      weight: 400,
      lineHeight: "1.9",
      tracking: "0em",
      use: "作品の説明",
      intent:
        "本文 1rem より 1 段小さくし、行間を 1.9 まで開く。図録の解説文は、量より読みやすさを取る。",
      sample: "この作品で変えた軸と、採否の理由を短く書く。",
    },
    {
      name: "キャプション",
      size: "0.8125rem",
      weight: 400,
      lineHeight: "1.6",
      tracking: "0.02em",
      use: "図版の下の注記",
      intent: "図版に密着する文字。解説よりさらに弱くして、図版の縁を乱さない。",
      sample: "product-ui-typography / line-seed-minimal　表示幅 1280",
    },
    {
      name: "銘板",
      size: "0.75rem",
      weight: 400,
      lineHeight: "1.5",
      tracking: "0.1em",
      use: "role、maturity、日付",
      intent:
        "美術館の銘板にあたる。欧文セリフで組み、字間を開く。和文の metadata はここに混ぜない。",
      sample: "FOUNDATION · CANDIDATE · 2026 09 19",
    },
  ],
  space: [
    { name: "図版の内マット", value: "2rem", use: "図版と台紙の縁の間" },
    { name: "解説の行頭", value: "1.5rem", use: "token の page-inline と同じ値" },
    { name: "節の間", value: "2.5rem", use: "token の section をそのまま使う" },
    { name: "見開きの間", value: "8rem", use: "次の作品との間。ここだけ Catalog ローカルの値" },
  ],
  grid: {
    columns: 12,
    wide: "左面 5 列が文字、右面 7 列が図版。作品ごとに左右を入れ替える",
    narrow: "図版、文字の順に縦積み",
    intent:
      "図版を広い側に置く。左右を交互にするのは、同じ配置が続くと見開きの区切りが消え、縦に流れる一覧に戻るため。",
  },
  parts: <Parts />,
  open: [
    "欧文セリフを足してよいか。足すと docs/decisions/2026-09-19-typography-foundation.md の「LINE Seed で和欧を揃える」判断を、Catalog の display 用途に限って覆すことになる。",
    "足す場合の書体。self-host できる OFL の可変セリフから選ぶ。候補は Fraunces（彫りが深く雑誌的）、Newsreader（新聞由来で癖が少ない）、Source Serif 4（中庸で本文にも耐える）。下の見本は系統書体の仮組みで、実物ではない。",
    "足さない場合。数字も LINE Seed のまま組み、対比を大きさだけで作る案に変える。",
  ],
};

function Parts() {
  return (
    <div className="parts">
      <figure className="plate">
        <div className="plate__mat">
          <div className="plate__work" aria-hidden="true" />
        </div>
        <figcaption className="plate__caption">
          <span className="plate__no">Plate 07</span>
          <span>{longestTitle}</span>
        </figcaption>
      </figure>
      <p className="parts__row">
        <button className="btn" type="button">
          次の見開き
        </button>
        <button className="btn btn--quiet" type="button">
          目次
        </button>
        <span className="gauge" role="group" aria-label="表示幅">
          <button className="gauge__item" type="button" aria-pressed="false">
            390
          </button>
          <button className="gauge__item" type="button" aria-pressed="true">
            1280
          </button>
          <button className="gauge__item" type="button" aria-pressed="false">
            全幅
          </button>
        </span>
      </p>
      <p className="parts__row">
        <span className="plaque">FOUNDATION · CANDIDATE · WEB</span>
      </p>
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Plate</th>
            <th scope="col">作品</th>
            <th scope="col">variant</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="table__no">07</td>
            <td>{longestTitle}</td>
            <td>hairline-float</td>
          </tr>
          <tr>
            <td className="table__no">08</td>
            <td>{shortestTitle}</td>
            <td>line-round</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export default function SpreadPlate() {
  return (
    <div className="ed-root ed-root--plate">
      <Sheet spec={SPEC} />
    </div>
  );
}
