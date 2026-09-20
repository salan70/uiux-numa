// 案 index-ledger の色と文字の見本。
// 巻末索引と目次を顔にする。ホストは色も大きさも持たず、利用者が選んだ配色の上に乗る。
import "../../../../tokens/typography/index.css";
import "./variant.css";
import {
  Sheet,
  longestTitle,
  shortestTitle,
  type PaletteEntry,
  type SheetSpec,
} from "../../shared/Sheet";
import { schemeById, schemes } from "../../shared/schemes";
import { works } from "../../shared/data";

// 配色は experiments/color-schemes の正本をそのまま使う。
// この案はホスト固有の色を 1 つも作らない。既定は sumi（文字を主役にする無彩の配色）。
const BASE = schemeById("sumi");

function fromScheme(role: string): { light: string; dark: string } {
  const light = BASE?.light.find((item) => item.role === role)?.value ?? "#ffffff";
  const dark = BASE?.dark.find((item) => item.role === role)?.value ?? "#000000";
  return { light, dark };
}

function schemeName(role: string): string {
  const light = BASE?.light.find((item) => item.role === role)?.name ?? role;
  const dark = BASE?.dark.find((item) => item.role === role)?.name ?? role;
  return light === dark ? light : `${light} / ${dark}`;
}

const PALETTE: PaletteEntry[] = [
  {
    role: "地",
    cssVar: "--color-bg",
    ...fromScheme("bg"),
    reference: `experiments/color-schemes の sumi（${schemeName("bg")}）`,
    intent:
      "ホストは紙の色を選ばない。利用者がヘッダーで選んだ配色をそのまま地にする。既定は sumi で、無彩のまま文字を主役にする。",
  },
  {
    role: "文字",
    cssVar: "--color-text",
    ...fromScheme("text"),
    reference: `同 sumi（${schemeName("text")}）`,
    intent: "索引は読む面である。本文色は配色が保証する 4.5:1 をそのまま使う。",
    check: { against: "--color-bg", minimum: 4.5 },
  },
  {
    role: "補足",
    cssVar: "--color-text-muted",
    ...fromScheme("text-muted"),
    reference: `同 sumi（${schemeName("text-muted")}）`,
    intent:
      "欄外注と metadata はこの 1 色だけで書く。役割ごとに色を増やすと、索引の列が色の縞になる。",
    check: { against: "--color-bg", minimum: 4.5 },
  },
  {
    role: "罫",
    cssVar: "--color-border",
    ...fromScheme("border"),
    reference: `同 sumi（${schemeName("border")}）`,
    intent:
      "行を分けるのは罫 1 本だけ。行の背景を塗ると、14 配色のどれかで必ず濁る。塗らない方が配色をまたいで壊れない。",
  },
  {
    role: "焦点",
    cssVar: "--color-focus",
    ...fromScheme("focus"),
    reference: `同 sumi（${schemeName("focus")}）`,
    intent:
      "使う role は 4 つに絞るが、焦点だけは別に持つ。地と文字だけでは、キーボードの現在地を示せない。",
    check: { against: "--color-bg", minimum: 3 },
  },
];

const SPEC: SheetSpec = {
  id: "index-ledger",
  title: "索引と目次",
  hypothesis:
    "利用者は探しに来る。巻末索引と目次を顔にすれば、全作品が 1 画面で読め、大きな見出しがなくても順序と量が分かる。",
  paper: "利用者が選んだ配色の紙",
  paletteNote: `ホスト固有の色を 1 つも作らない。experiments/color-schemes の ${schemes.length} 配色から利用者が選び、そのうち 5 role だけを使う。大きさで階層を作らない代わりに、配色をまたいで壊れないことを取る。`,
  palette: PALETTE,
  typeNote:
    "最大を 1.5rem に留める。token の title をそのまま上限にし、それより大きい値を作らない。雑誌らしさは、小さな文字、等幅の数字、リーダー罫、8px の縦の律動で作る。",
  type: [
    {
      name: "題",
      size: "1.5rem",
      weight: 700,
      lineHeight: "1.3",
      tracking: "0em",
      use: "画面に 1 つだけ",
      intent: "token の title と同じ値。Catalog ローカルの display 値を作らない対照案として置く。",
      sample: "索引",
    },
    {
      name: "行",
      size: "1rem",
      weight: 400,
      lineHeight: "1.5",
      tracking: "0em",
      use: "索引の 1 行 1 作品",
      intent:
        "token の ui と同じ値。行は読む対象であると同時に押す対象なので、body の 1.75 ではなく 1.5 にして行数を稼ぐ。",
      sample: longestTitle,
    },
    {
      name: "行の強調",
      size: "1rem",
      weight: 700,
      lineHeight: "1.5",
      tracking: "0em",
      use: "採用済みの作品",
      intent: "サイズを変えず太さだけで差を作る。索引の行の高さを揃えるため。",
      sample: shortestTitle,
    },
    {
      name: "欄外注",
      size: "0.8125rem",
      weight: 400,
      lineHeight: "1.6",
      tracking: "0em",
      use: "role、maturity、platforms",
      intent:
        "本文の右の欄外に置く。学術誌の傍注と同じ扱いにして、metadata を二次情報の位置へ落とす。",
      sample: "module / candidate / web",
    },
    {
      name: "小標識",
      size: "0.6875rem",
      weight: 700,
      lineHeight: "1.5",
      tracking: "0.08em",
      use: "列の見出しと通し番号",
      intent:
        "token の caption より小さい値を 1 つだけ Catalog ローカルで持つ。表の列見出しは、内容より弱くないと列が読めない。",
      sample: "NO.　作品　種別　更新",
    },
    {
      name: "数字",
      size: "1rem",
      weight: 400,
      lineHeight: "1.5",
      tracking: "0.02em",
      use: "日付、通し番号、件数",
      intent: "等幅数字を使う。索引は縦に数字が並ぶ面なので、桁が揃わないと行が波打って見える。",
      sample: "2026-09-19　10 件　54 variant",
    },
  ],
  space: [
    { name: "基準の律動", value: "0.5rem", use: "8px。すべての余白をこの倍数にする" },
    { name: "行の上下", value: "0.75rem", use: "索引 1 行の内側" },
    { name: "欄の間", value: "1.5rem", use: "本文と欄外注の間。token の page-inline と同じ値" },
    { name: "節の間", value: "2.5rem", use: "token の section をそのまま使う" },
  ],
  grid: {
    columns: 3,
    wide: "本文 44rem + 欄外注 14rem。左右は余白",
    narrow: "単段。欄外注は行の下へ畳む",
    intent:
      "多段にしない。索引は上から下へ読む面で、段を作ると視線が戻る。右の欄外注だけを別の欄にして、metadata を本文の流れから外す。",
  },
  parts: <Parts />,
  open: [
    `既定の配色を sumi にするか。${schemes.length} 配色のうち、索引の面に合うものは他にもある。`,
    "使う role を 5 つに絞ってよいか。成功 / 警告 / エラーの意味色を索引で使わない判断になる。",
    "題を 1.5rem に留めてよいか。この案だけが「大きさを使わない」側に立っている。",
  ],
};

function Parts() {
  const rows = works.slice(0, 3);
  return (
    <div className="parts">
      <table className="ledger">
        <thead>
          <tr>
            <th scope="col" className="ledger__no">
              No.
            </th>
            <th scope="col">作品</th>
            <th scope="col">種別</th>
            <th scope="col">役割</th>
            <th scope="col" className="ledger__date">
              更新
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((work, index) => (
            <tr key={work.slug}>
              <td className="ledger__no">{String(index + 1).padStart(2, "0")}</td>
              <th scope="row">
                <a className="ledger__link" href={`#${work.slug}`}>
                  <span className="ledger__title">{work.title}</span>
                  <span className="ledger__leader" aria-hidden="true" />
                </a>
              </th>
              <td>{work.kind}</td>
              <td className="ledger__note">{work.role}</td>
              <td className="ledger__date">{work.updated}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="parts__row">
        <button className="btn" type="button">
          索引を開く
        </button>
        <span className="filter" role="group" aria-label="種別の絞り込み">
          <button className="filter__item" type="button" aria-pressed="true">
            すべて
          </button>
          <button className="filter__item" type="button" aria-pressed="false">
            色
          </button>
          <button className="filter__item" type="button" aria-pressed="false">
            文字
          </button>
        </span>
      </p>
      <p className="marginalia">
        <span className="marginalia__body">本文はこの幅で流し、</span>
        <span className="marginalia__note">metadata は欄外に置く。</span>
      </p>
    </div>
  );
}

/**
 * 選んだ配色の 19 role を CSS へ流し込む。
 * 正本は experiments/color-schemes/variants/<id>/scheme.css で、値はそこから読んだものだけを使う。
 * ライトとダークの切替は prefers-color-scheme に任せ、JS で状態を持たない。
 */
function schemeStyle(): string {
  if (!BASE) return "";
  const declare = (colors: typeof BASE.light) =>
    colors.map((color) => `--color-${color.role}:${color.value};`).join("");
  return [
    `.ed-root--ledger{${declare(BASE.light)}color-scheme:light;}`,
    `@media (prefers-color-scheme:dark){.ed-root--ledger{${declare(BASE.dark)}color-scheme:dark;}}`,
  ].join("");
}

export default function IndexLedger() {
  return (
    <div className="ed-root ed-root--ledger">
      <style>{schemeStyle()}</style>
      <Sheet spec={SPEC} />
    </div>
  );
}
