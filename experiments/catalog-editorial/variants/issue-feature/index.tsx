// 案 issue-feature。号と特集。
// 雑誌から借りるのは構造だけにする。号で時間を区切り、1 号に 1 つだけ特集を立て、
// 非対称の 12 列で主従を決める。紙の質感と印刷の語彙は使わない。
import "../../../../tokens/typography/index.css";
import "./variant.css";
import { useMemo } from "react";
import { Sheet, longestTitle, shortestTitle, type SheetSpec } from "../../shared/Sheet";
import { runnerPath, works, worksByUpdated, type Work } from "../../shared/data";
import { useScreen, type ScreenApi } from "../../shared/useScreen";

// 号は frontmatter の created で機械的に束ねる。Catalog が編集データを持たないため。
type Issue = { no: number; date: string; works: Work[] };

function issues(): Issue[] {
  const byDate = new Map<string, Work[]>();
  for (const work of works) {
    const list = byDate.get(work.created) ?? [];
    list.push(work);
    byDate.set(work.created, list);
  }
  return [...byDate.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, items], index) => ({
      no: index + 1,
      date,
      // 号の中の特集は、その号で最後に更新されたもの。
      works: [...items].sort((a, b) => b.updated.localeCompare(a.updated)),
    }));
}

const ISSUES = issues();
const LATEST = ISSUES[ISSUES.length - 1];

function no(n: number): string {
  return String(n).padStart(2, "0");
}

function dot(date: string): string {
  return date.replaceAll("-", ".");
}

function issueOf(work: Work): Issue | undefined {
  return ISSUES.find((issue) => issue.works.some((item) => item.slug === work.slug));
}

export default function IssueFeature() {
  const nav = useScreen("top");
  return (
    <div className="ed-root ed-root--issue">
      <a className="skip" href="#ed-main">
        本文へスキップ
      </a>
      <Masthead nav={nav} />
      <main className="ed-main" id="ed-main">
        {nav.screen === "top" && <Top nav={nav} />}
        {nav.screen === "list" && <List nav={nav} />}
        {nav.screen === "detail" && <Detail nav={nav} />}
        {nav.screen === "sheet" && <Sheet spec={SPEC} />}
      </main>
    </div>
  );
}

function Masthead({ nav }: { nav: ScreenApi }) {
  const items: Array<{ screen: "top" | "list" | "sheet"; label: string }> = [
    { screen: "top", label: "今号" },
    { screen: "list", label: "索引" },
    { screen: "sheet", label: "見本" },
  ];
  return (
    <header className="masthead">
      <a
        className="masthead__name"
        href={nav.hrefFor({ screen: "top", item: null })}
        onClick={(event) => {
          event.preventDefault();
          nav.go({ screen: "top", item: null });
        }}
      >
        UI／UX 沼
      </a>
      <nav className="masthead__nav" aria-label="主要">
        {items.map((item) => (
          <a
            key={item.screen}
            href={nav.hrefFor({ screen: item.screen, item: null })}
            aria-current={nav.screen === item.screen ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              nav.go({ screen: item.screen, item: null });
            }}
          >
            {item.label}
          </a>
        ))}
      </nav>
      <p className="masthead__meta">
        第 {no(LATEST.no)} 号<span aria-hidden="true">／</span>
        <span>{works.length} 件</span>
      </p>
    </header>
  );
}

function Live({ work, variant, tall }: { work: Work; variant?: string; tall?: boolean }) {
  const id = variant ?? work.adopted[0] ?? work.variantIds[0];
  return (
    <div className={tall ? "live live--tall" : "live"}>
      <iframe
        className="live__frame"
        src={runnerPath(work.slug, id)}
        title={`${work.title} の ${id}`}
        loading="lazy"
      />
      <p className="live__caption">
        <span className="live__id">{id}</span>
        <span>{work.kind}</span>
        <span>{dot(work.updated)}</span>
      </p>
    </div>
  );
}

function Meta({ work }: { work: Work }) {
  return (
    <p className="meta">
      <span>{work.role}</span>
      <span>{work.maturity}</span>
      <span>{work.platforms.join("・")}</span>
      <span>{work.variantIds.length} variant</span>
    </p>
  );
}

function Top({ nav }: { nav: ScreenApi }) {
  const [feature, ...rest] = LATEST.works;
  const back = [...ISSUES].reverse().slice(1);
  return (
    <>
      <section className="cover" aria-labelledby="cover-title">
        <p className="cover__no">
          <span className="cover__no-num">{no(LATEST.no)}</span>
          <span className="cover__no-label">号</span>
          <span className="cover__date">{dot(LATEST.date)}</span>
        </p>
        <h1 className="cover__title" id="cover-title" tabIndex={-1} data-screen-heading>
          {feature.title}
        </h1>
        <p className="cover__lead">{feature.lead}</p>
        <div className="cover__live">
          <Live work={feature} tall />
        </div>
        <div className="cover__side">
          <Meta work={feature} />
          <p className="cover__action">
            <a
              className="btn"
              href={nav.hrefFor({ screen: "detail", item: feature.slug })}
              onClick={(event) => {
                event.preventDefault();
                nav.go({ screen: "detail", item: feature.slug, variant: null });
              }}
            >
              この特集を開く
            </a>
          </p>
          {rest.length > 0 && (
            <>
              <h2 className="cover__side-head">同じ号</h2>
              <ul className="stack">
                {rest.map((work) => (
                  <li key={work.slug}>
                    <a
                      href={nav.hrefFor({ screen: "detail", item: work.slug })}
                      onClick={(event) => {
                        event.preventDefault();
                        nav.go({ screen: "detail", item: work.slug, variant: null });
                      }}
                    >
                      <span className="stack__title">{work.title}</span>
                      <span className="stack__kind">{work.kind}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </section>

      <section className="back" aria-labelledby="back-head">
        <h2 className="section-head" id="back-head">
          バックナンバー
        </h2>
        <ol className="back__list">
          {back.map((issue) => (
            <li className="back__item" key={issue.no}>
              <p className="back__no">{no(issue.no)}</p>
              <p className="back__date">{dot(issue.date)}</p>
              <ul className="stack">
                {issue.works.map((work) => (
                  <li key={work.slug}>
                    <a
                      href={nav.hrefFor({ screen: "detail", item: work.slug })}
                      onClick={(event) => {
                        event.preventDefault();
                        nav.go({ screen: "detail", item: work.slug, variant: null });
                      }}
                    >
                      <span className="stack__title">{work.title}</span>
                      <span className="stack__kind">{work.kind}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function List({ nav }: { nav: ScreenApi }) {
  const kinds = useMemo(() => [...new Set(works.map((item) => item.kind))], []);
  const shown = nav.filter ? works.filter((item) => item.kind === nav.filter) : worksByUpdated();
  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        索引
      </h1>
      <div className="filters" role="group" aria-label="種別の絞り込み">
        <button
          type="button"
          className="filters__item"
          aria-pressed={nav.filter == null}
          onClick={() => nav.go({ filter: null })}
        >
          すべて
        </button>
        {kinds.map((kind) => (
          <button
            key={kind}
            type="button"
            className="filters__item"
            aria-pressed={nav.filter === kind}
            onClick={() => nav.go({ filter: kind })}
          >
            {kind}
          </button>
        ))}
      </div>
      <ul className="cards">
        {shown.map((work) => (
          <li className="card" key={work.slug}>
            <a
              className="card__hit"
              href={nav.hrefFor({ screen: "detail", item: work.slug })}
              onClick={(event) => {
                event.preventDefault();
                nav.go({ screen: "detail", item: work.slug, variant: null });
              }}
            >
              <span className="card__title">{work.title}</span>
            </a>
            <Live work={work} />
            <Meta work={work} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function Detail({ nav }: { nav: ScreenApi }) {
  const work = works.find((item) => item.slug === nav.item) ?? works[0];
  const current = nav.variant ?? work.adopted[0] ?? work.variantIds[0];
  const issue = issueOf(work);
  return (
    <article className="detail">
      <p className="detail__crumb">
        <a
          href={nav.hrefFor({ screen: "list", item: null })}
          onClick={(event) => {
            event.preventDefault();
            nav.go({ screen: "list", item: null });
          }}
        >
          索引
        </a>
        <span aria-hidden="true">／</span>
        {issue && <span>第 {no(issue.no)} 号</span>}
      </p>
      <h1 className="detail__title" tabIndex={-1} data-screen-heading>
        {work.title}
      </h1>
      <p className="detail__lead">{work.lead}</p>
      <div className="detail__live">
        <Live work={work} variant={current} tall />
      </div>
      <div className="detail__side">
        <h2 className="detail__side-head">variant</h2>
        <ul className="variants">
          {work.variantIds.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="variants__item"
                aria-pressed={id === current}
                onClick={() => nav.go({ variant: id })}
              >
                <span className="variants__id">{id}</span>
                {work.adopted.includes(id) && <span className="variants__mark">採用</span>}
              </button>
            </li>
          ))}
        </ul>
        <h2 className="detail__side-head">前提</h2>
        <Meta work={work} />
        <p className="detail__source">
          正本は <code>{work.repoPath}</code>
        </p>
      </div>
    </article>
  );
}

// ---- 色と文字の見本 ----

const SPEC: SheetSpec = {
  id: "issue-feature",
  title: "号と特集",
  hypothesis:
    "「号」で時間を区切り、1 号に 1 つだけ特集を立てれば、均一な格子を使わずに主役が決まる。",
  paper: "無彩の面と強調 1 色",
  paletteNote:
    "面は無彩にし、色は強調の 1 色だけにする。紙の色を作らず、白と黒に近い値で画面の面として扱う。強調は操作できる場所と現在地にだけ使い、成果物の色と競合させない。",
  palette: [
    {
      role: "地",
      cssVar: "--ed-bg",
      light: "#ffffff",
      dark: "#0d0d0f",
      reference: "和色大辞典 白 / 漆黒を面まで落とした値",
      intent:
        "紙の色を作らない。象牙や生成りに寄せると印刷物の模写になる。白と、黒に沈めた面の 2 つだけを持ち、成果物の色が乗る土台に徹する。",
    },
    {
      role: "面",
      cssVar: "--ed-surface",
      light: "#f3f3f2",
      dark: "#1a1a1d",
      reference: "和色大辞典 白練 / 同系の暗色",
      intent:
        "標本の囲いと側柱に使う 1 段の差。影を使わず明度差だけで層を作る。影は成果物の色を濁らせる。",
    },
    {
      role: "文字",
      cssVar: "--ed-text",
      light: "#0c0c0c",
      dark: "#fffffb",
      reference: "和色大辞典 漆黒 / 卯の花色",
      intent:
        "見出しを 7rem まで開くので、文字色は最も濃い側に置く。大きな面積の黒が灰色に見えないようにする。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "補足",
      cssVar: "--ed-muted",
      light: "#656765",
      dark: "#91989f",
      reference: "和色大辞典 鈍色 / 銀鼠",
      intent: "リード、metadata、キャプション。本文の半分の強さに置き、無彩のまま濁らせない。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "境界",
      cssVar: "--ed-line",
      light: "#dad9d8",
      dark: "#2a2a2e",
      reference: "和色大辞典 白鼠 / 同系の暗色",
      intent:
        "区切りのヘアライン。装飾なので 3:1 を要求しない。区切りの意味は余白と文字の階層が担う。",
    },
    {
      role: "強い境界",
      cssVar: "--ed-line-strong",
      light: "#7b7c7d",
      dark: "#7b7c7d",
      reference: "和色大辞典 鉛色",
      intent:
        "操作できる部品の輪郭。ライトとダークで同じ値が使える数少ない無彩色なので、部品の輪郭だけは明暗で変えない。",
      check: { against: "--ed-bg", minimum: 3 },
    },
    {
      role: "強調",
      cssVar: "--ed-accent",
      light: "#c9171e",
      dark: "#e87a90",
      reference: "和色大辞典 紅 / 紅梅色",
      intent:
        "強調は 1 色だけ。現在地、リンク、フォーカスをこの色に担わせ、赤が出たら操作できる、と読めるようにする。面には塗らない。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
  ],
  typeNote:
    "ウェイトは 400 と 700 しかない。太さで階層を作れないので、サイズの対比で作る。最大と本文の比を 7 倍まで開き、中間段を置かない。",
  type: [
    {
      name: "号数",
      size: "clamp(3.5rem, 10vw, 8rem)",
      weight: 700,
      lineHeight: "0.85",
      tracking: "-0.04em",
      use: "今号の番号",
      intent: "数字は読む対象ではなく、いまどこを見ているかの標識として働く。",
      sample: "05",
    },
    {
      name: "特集見出し",
      size: "clamp(2.625rem, 7vw, 6rem)",
      weight: 700,
      lineHeight: "1.06",
      tracking: "-0.03em",
      use: "特集 1 件の題名",
      intent:
        "下限 2.625rem は、実データ最長の 18 字が 390 幅で 3 行に収まる上限。上限 6rem は 1280 幅の 7 列に 10 字が収まる値。",
    },
    {
      name: "節の題",
      size: "1.5rem",
      weight: 700,
      lineHeight: "1.3",
      tracking: "-0.01em",
      use: "索引、バックナンバー",
      intent: "token の title と同じ 1.5rem。共通の値で表せるものは新しい値を作らない。",
      sample: shortestTitle,
    },
    {
      name: "項目",
      size: "1.125rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0em",
      use: "一覧の題名、同じ号の作品",
      intent: "一覧は数が増える。行の高さを揃えたいので、題名はこの 1 段だけにする。",
      sample: longestTitle,
    },
    {
      name: "本文",
      size: "1rem",
      weight: 400,
      lineHeight: "1.75",
      tracking: "0em",
      use: "リードと説明",
      intent: "token の body をそのまま使う。行長は 34〜38 字に収める。",
      sample: "この号で扱う成果物と、選んだ理由を短く書く。",
    },
    {
      name: "標識",
      size: "0.75rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0.12em",
      use: "role、maturity、日付、variant 名",
      intent:
        "字間を開くのはこの段だけ。和文の字間を開くと読みにくいので、英字と数字の metadata に限る。等幅数字で桁を揃える。",
      sample: "FOUNDATION／CANDIDATE／2026.09.19",
    },
  ],
  space: [
    { name: "行間の 1 単位", value: "0.5rem", use: "ラベルと値の間" },
    { name: "要素の間", value: "1rem", use: "見出しとリードの間" },
    { name: "面の左右", value: "1.5rem", use: "token の space.page-inline をそのまま使う" },
    { name: "節の間", value: "2.5rem", use: "token の space.section をそのまま使う" },
    { name: "区画の間", value: "5rem", use: "表紙と索引の間。ここだけ Catalog ローカルの値" },
  ],
  grid: {
    columns: 12,
    wide: "12 列 / 溝 24px。特集が 7 列、側柱が 5 列",
    narrow: "4 列 / 溝 16px。特集が全幅、側柱はその下",
    intent:
      "7 対 5 の非対称にする。6 対 6 にすると左右が釣り合い、均一な格子へ戻る。どちらが主かを列幅そのもので示す。",
  },
  parts: <Parts />,
  open: [
    "強調を紅（#c9171e）にするか。もっと沈めた色にも、逆に猩々緋まで上げることもできる。",
    "号の束ね方。いまは frontmatter の created を日付で束ねて 5 号になる。",
    "索引で live 標本を全件に出すか。件数が増えると重くなるので、遅延読込にしている。",
  ],
};

function Parts() {
  return (
    <div className="parts">
      <p className="parts__row">
        <button className="btn" type="button">
          この特集を開く
        </button>
        <button className="btn btn--quiet" type="button">
          バックナンバー
        </button>
      </p>
      <p className="parts__row">
        <span className="filters" role="group" aria-label="見本の絞り込み">
          <button className="filters__item" type="button" aria-pressed="true">
            すべて
          </button>
          <button className="filters__item" type="button" aria-pressed="false">
            色
          </button>
          <button className="filters__item" type="button" aria-pressed="false">
            文字
          </button>
        </span>
      </p>
      <p className="parts__row">
        <span className="meta">
          <span>foundation</span>
          <span>candidate</span>
          <span>web</span>
        </span>
      </p>
      <ul className="variants variants--row">
        <li>
          <button className="variants__item" type="button" aria-pressed="true">
            <span className="variants__id">line-seed-minimal</span>
            <span className="variants__mark">採用</span>
          </button>
        </li>
        <li>
          <button className="variants__item" type="button" aria-pressed="false">
            <span className="variants__id">current-system</span>
          </button>
        </li>
      </ul>
    </div>
  );
}
