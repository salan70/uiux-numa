// 案 chronicle-column。年表と段組。
// 借りるのは段組の構造だけにする。段抜きの幅がそのまま重要度になる関係を残し、
// 新聞の紙面、二重罫、題字といった印刷の装飾は使わない。
import "../../../../tokens/typography/index.css";
import "./variant.css";
import { useMemo } from "react";
import { Sheet, longestTitle, shortestTitle, type SheetSpec } from "../../shared/Sheet";
import { runnerPath, works, worksByUpdated, type Work } from "../../shared/data";
import { useScreen, type ScreenApi } from "../../shared/useScreen";

const TIMELINE = worksByUpdated();

function dot(date: string): string {
  return date.replaceAll("-", ".");
}

/** 同じ日の更新をまとめる。年表の 1 行は日付である。 */
function days(items: Work[]): Array<{ date: string; works: Work[] }> {
  const byDate = new Map<string, Work[]>();
  for (const work of items) {
    const list = byDate.get(work.updated) ?? [];
    list.push(work);
    byDate.set(work.updated, list);
  }
  return [...byDate.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([date, list]) => ({ date, works: list }));
}

export default function ChronicleColumn() {
  const nav = useScreen("top");
  return (
    <div className="ed-root ed-root--chronicle">
      <a className="skip" href="#ed-main">
        本文へスキップ
      </a>
      <Bar nav={nav} />
      <main className="ed-main" id="ed-main">
        {nav.screen === "top" && <Top nav={nav} />}
        {nav.screen === "list" && <List nav={nav} />}
        {nav.screen === "detail" && <Detail nav={nav} />}
        {nav.screen === "sheet" && <Sheet spec={SPEC} />}
      </main>
    </div>
  );
}

function Bar({ nav }: { nav: ScreenApi }) {
  const items: Array<{ screen: "top" | "list" | "sheet"; label: string }> = [
    { screen: "top", label: "更新" },
    { screen: "list", label: "面" },
    { screen: "sheet", label: "見本" },
  ];
  return (
    <header className="bar">
      <a
        className="bar__name"
        href={nav.hrefFor({ screen: "top", item: null })}
        onClick={(event) => {
          event.preventDefault();
          nav.go({ screen: "top", item: null });
        }}
      >
        UI／UX 沼
      </a>
      <nav className="bar__nav" aria-label="主要">
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
      <p className="bar__meta">
        <span>最終更新 {dot(TIMELINE[0].updated)}</span>
      </p>
    </header>
  );
}

function Live({ work, variant, size }: { work: Work; variant?: string; size?: "lead" | "row" }) {
  const id = variant ?? work.adopted[0] ?? work.variantIds[0];
  return (
    <div className={size === "lead" ? "live live--lead" : "live"}>
      <iframe
        className="live__frame"
        src={runnerPath(work.slug, id)}
        title={`${work.title} の ${id}`}
        loading="lazy"
      />
      <p className="live__caption">
        <span className="live__id">{id}</span>
        <span>{work.variantIds.length} variant</span>
      </p>
    </div>
  );
}

function Tags({ work }: { work: Work }) {
  return (
    <p className="tags">
      <span className="tags__kind">{work.kind}</span>
      <span>{work.role}</span>
      <span>{work.maturity}</span>
    </p>
  );
}

function Top({ nav }: { nav: ScreenApi }) {
  const [lead, ...rest] = TIMELINE;
  const grouped = days(rest);
  const open = (slug: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    nav.go({ screen: "detail", item: slug, variant: null });
  };
  return (
    <>
      <section className="lead" aria-labelledby="lead-title">
        <p className="lead__stamp">
          <span className="lead__date">{dot(lead.updated)}</span>
          <span className="lead__now">最新</span>
        </p>
        {/* 段抜きの幅が重要度になる関係を残す。最新だけが全幅を取る。 */}
        <h1 className="lead__title" id="lead-title" tabIndex={-1} data-screen-heading>
          <a href={nav.hrefFor({ screen: "detail", item: lead.slug })} onClick={open(lead.slug)}>
            {lead.title}
          </a>
        </h1>
        <p className="lead__body">{lead.lead}</p>
        <Tags work={lead} />
        <Live work={lead} size="lead" />
      </section>

      <section className="chronicle" aria-labelledby="chronicle-head">
        <h2 className="section-title" id="chronicle-head">
          これまでの更新
        </h2>
        <ol className="days">
          {grouped.map((day) => (
            <li className="day" key={day.date}>
              <p className="day__date">
                <span className="day__dot" aria-hidden="true" />
                {dot(day.date)}
              </p>
              <ul className="entries">
                {day.works.map((work) => (
                  <li className="entry" key={work.slug}>
                    <a
                      className="entry__hit"
                      href={nav.hrefFor({ screen: "detail", item: work.slug })}
                      onClick={open(work.slug)}
                    >
                      <span className="entry__title">{work.title}</span>
                    </a>
                    <Tags work={work} />
                    <Live work={work} />
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
  const shown = nav.filter ? works.filter((item) => item.kind === nav.filter) : TIMELINE;
  return (
    <section className="board" aria-labelledby="board-head">
      <h1 className="section-title" id="board-head" tabIndex={-1} data-screen-heading>
        面
      </h1>
      <div className="tabs" role="group" aria-label="面の絞り込み">
        <button
          type="button"
          className="tabs__item"
          aria-pressed={nav.filter == null}
          onClick={() => nav.go({ filter: null })}
        >
          すべて
        </button>
        {kinds.map((kind) => (
          <button
            key={kind}
            type="button"
            className="tabs__item"
            aria-pressed={nav.filter === kind}
            onClick={() => nav.go({ filter: kind })}
          >
            {kind}
          </button>
        ))}
      </div>
      <table className="board__table">
        <thead>
          <tr>
            <th scope="col">更新</th>
            <th scope="col">作品</th>
            <th scope="col">面</th>
            <th scope="col">前提</th>
            <th scope="col">variant</th>
          </tr>
        </thead>
        <tbody>
          {shown.map((work) => (
            <tr key={work.slug}>
              <td className="board__date">{dot(work.updated)}</td>
              <th scope="row">
                <a
                  href={nav.hrefFor({ screen: "detail", item: work.slug })}
                  onClick={(event) => {
                    event.preventDefault();
                    nav.go({ screen: "detail", item: work.slug, variant: null });
                  }}
                >
                  {work.title}
                </a>
              </th>
              <td>
                <span className="tags__kind">{work.kind}</span>
              </td>
              <td className="board__muted">
                {work.role}／{work.maturity}
              </td>
              <td className="board__num">{work.variantIds.length}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function Detail({ nav }: { nav: ScreenApi }) {
  const work = works.find((item) => item.slug === nav.item) ?? TIMELINE[0];
  const current = nav.variant ?? work.adopted[0] ?? work.variantIds[0];
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
          面
        </a>
        <span aria-hidden="true">／</span>
        <span>{work.kind}</span>
        <span aria-hidden="true">／</span>
        <span>{dot(work.updated)}</span>
      </p>
      <h1 className="detail__title" tabIndex={-1} data-screen-heading>
        {work.title}
      </h1>
      <p className="detail__body">{work.lead}</p>
      <div className="detail__switch">
        <p className="detail__switch-head">variant</p>
        <ul className="switch">
          {work.variantIds.map((id) => (
            <li key={id}>
              <button
                type="button"
                className="switch__item"
                aria-pressed={id === current}
                onClick={() => nav.go({ variant: id })}
              >
                {id}
                {work.adopted.includes(id) && <span className="switch__mark">採用</span>}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <Live work={work} variant={current} size="lead" />
      <dl className="facts">
        <div>
          <dt>役割</dt>
          <dd>{work.role}</dd>
        </div>
        <div>
          <dt>成熟度</dt>
          <dd>{work.maturity}</dd>
        </div>
        <div>
          <dt>対象</dt>
          <dd>{work.platforms.join("・")}</dd>
        </div>
        <div>
          <dt>正本</dt>
          <dd>
            <code>{work.repoPath}</code>
          </dd>
        </div>
      </dl>
    </article>
  );
}

// ---- 色と文字の見本 ----

const SPEC: SheetSpec = {
  id: "chronicle-column",
  title: "年表と段組",
  hypothesis:
    "この沼は研究の記録である。日付順に並べれば更新そのものが内容になり、段抜きの幅がそのまま重要度になる。",
  paper: "無彩の面と強調 1 色",
  paletteNote:
    "面は無彩にし、色は強調の 1 色だけにする。新聞の紙の色を作らず、白と黒に近い値で画面の面として扱う。強調は最新と現在地にだけ使う。",
  palette: [
    {
      role: "地",
      cssVar: "--ed-bg",
      light: "#ffffff",
      dark: "#101014",
      reference: "和色大辞典 白 / 漆黒を面まで落とした値",
      intent:
        "紙の色を作らない。年表は縦に長い面なので、地に色味を入れると下までスクロールしたときに色が溜まって見える。",
    },
    {
      role: "面",
      cssVar: "--ed-surface",
      light: "#f3f3f2",
      dark: "#1a1b22",
      reference: "和色大辞典 白練 / 同系の暗色",
      intent:
        "標本の囲いと表の見出し行。影を使わず明度差 1 段だけで層を作る。年表は要素が多いので、層を 2 段以上作らない。",
    },
    {
      role: "文字",
      cssVar: "--ed-text",
      light: "#0c0c0c",
      dark: "#fbfaf5",
      reference: "和色大辞典 漆黒 / 生成り色",
      intent: "項目が縦に連なる面なので、本文色は最も濃い側に置いて走査しやすくする。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "補足",
      cssVar: "--ed-muted",
      light: "#656765",
      dark: "#b4b4b4",
      reference: "和色大辞典 鈍色 / 薄鼠",
      intent: "日付、role、maturity。無彩にして、強調 1 色との競合を避ける。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "境界",
      cssVar: "--ed-line",
      light: "#dad9d8",
      dark: "#26262c",
      reference: "和色大辞典 白鼠 / 同系の暗色",
      intent:
        "年表の縦線と行の区切り。装飾なので 3:1 を要求しない。濃くすると格子に見え、流れではなく表になる。",
    },
    {
      role: "強い境界",
      cssVar: "--ed-line-strong",
      light: "#7b7c7d",
      dark: "#7b7c7d",
      reference: "和色大辞典 鉛色",
      intent:
        "操作できる部品の輪郭。ライトとダークで同じ値が使える無彩色なので、部品の輪郭は明暗で変えない。",
      check: { against: "--ed-bg", minimum: 3 },
    },
    {
      role: "強調",
      cssVar: "--ed-accent",
      light: "#1e50a2",
      dark: "#89c3eb",
      reference: "和色大辞典 瑠璃色 / 勿忘草色",
      intent:
        "最新の印、現在地、リンク、フォーカス。赤ではなく青にしたのは、年表が警告の面ではなく記録の面だからである。もう 1 案の号と特集は紅を使うので、2 案の性格が色でも分かれる。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
  ],
  typeNote:
    "見出しは 3 階級だけにする。階級が増えるほど、どれが一番かが読めなくなる。段抜きの幅と組み合わせ、大きさと面積の 2 つで重要度を示す。",
  type: [
    {
      name: "最新の見出し",
      size: "clamp(2.25rem, 5vw, 3.5rem)",
      weight: 700,
      lineHeight: "1.15",
      tracking: "-0.02em",
      use: "いちばん新しい 1 件",
      intent:
        "全幅を取る 1 件だけがこの大きさになる。面積と大きさが同時に最大になるので、順序を説明しなくても先頭が読まれる。",
    },
    {
      name: "項目の見出し",
      size: "1.25rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0em",
      use: "年表の各項目",
      intent:
        "token の heading と同じ 1.25rem。最新の 3 分の 1 以下にして、主従を保ったまま行数を稼ぐ。",
      sample: longestTitle,
    },
    {
      name: "節の題",
      size: "1rem",
      weight: 700,
      lineHeight: "1.5",
      tracking: "0.02em",
      use: "これまでの更新、面",
      intent: "節の題は項目より小さくする。年表では節よりも中身の項目が主役である。",
      sample: shortestTitle,
    },
    {
      name: "本文",
      size: "0.9375rem",
      weight: 400,
      lineHeight: "1.8",
      tracking: "0em",
      use: "リードと説明",
      intent:
        "token の body 1rem より 1 段小さい Catalog ローカルの値。項目が縦に連なるので、本文は密度側へ寄せる。",
      sample: "この作品で何を変え、何を採ったかを 2 文で書く。",
    },
    {
      name: "日付",
      size: "0.875rem",
      weight: 700,
      lineHeight: "1.5",
      tracking: "0.06em",
      use: "年表の日付、更新日",
      intent: "等幅数字にする。日付が縦に並ぶ面なので、桁が揃わないと年表の目盛りとして働かない。",
      sample: "2026.09.19",
    },
    {
      name: "標識",
      size: "0.75rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0.12em",
      use: "面、role、maturity",
      intent: "字間を開くのはこの段だけ。和文の字間は開かず、英字の metadata に限る。",
      sample: "MODULE／CANDIDATE",
    },
  ],
  space: [
    { name: "行の内側", value: "0.75rem", use: "項目 1 件の上下" },
    { name: "要素の間", value: "1rem", use: "見出しと本文の間" },
    { name: "面の左右", value: "1.5rem", use: "token の space.page-inline をそのまま使う" },
    { name: "節の間", value: "2.5rem", use: "token の section をそのまま使う" },
    {
      name: "日付の間",
      value: "3.5rem",
      use: "年表の 1 日と次の日の間。ここだけ Catalog ローカルの値",
    },
  ],
  grid: {
    columns: 6,
    wide: "日付の柱 7rem + 項目 6 列。最新が 6 列、他は 3 列",
    narrow: "日付が行の上に載り、項目は 1 列",
    intent:
      "段抜きの幅をそのまま重要度にする。順序ではなく面積で主従を示せるので、日付順に並べたまま最新を立てられる。",
  },
  parts: <Parts />,
  open: [
    "強調を瑠璃色（#1e50a2）にするか。記録の面なので青にしたが、緑や紫も候補になる。",
    "年表の粒度。いまは frontmatter の updated を日付で束ねている。",
    "一覧を表にするか、年表と同じ流れにするか。いまは表にして、面をまたいだ比較をしやすくしている。",
  ],
};

function Parts() {
  return (
    <div className="parts">
      <p className="parts__row">
        <span className="tabs" role="group" aria-label="見本の絞り込み">
          <button className="tabs__item" type="button" aria-pressed="true">
            すべて
          </button>
          <button className="tabs__item" type="button" aria-pressed="false">
            色
          </button>
          <button className="tabs__item" type="button" aria-pressed="false">
            文字
          </button>
        </span>
      </p>
      <p className="parts__row">
        <span className="tags">
          <span className="tags__kind">文字</span>
          <span>foundation</span>
          <span>candidate</span>
        </span>
      </p>
      <ul className="switch">
        <li>
          <button className="switch__item" type="button" aria-pressed="true">
            line-seed-minimal<span className="switch__mark">採用</span>
          </button>
        </li>
        <li>
          <button className="switch__item" type="button" aria-pressed="false">
            current-system
          </button>
        </li>
      </ul>
      <dl className="facts">
        <div>
          <dt>役割</dt>
          <dd>foundation</dd>
        </div>
        <div>
          <dt>成熟度</dt>
          <dd>candidate</dd>
        </div>
      </dl>
    </div>
  );
}
