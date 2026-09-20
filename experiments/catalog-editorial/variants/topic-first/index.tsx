// 案 topic-first。トピックを入口にする。
// 造形は issue-feature を引き継ぐ（利用者の判断、2026-09-20）。
// 変えるのは情報設計だけで、号や特集といった雑誌の枠組みは使わない。
// 入口は「何を探しているか」の種類にし、token も正本の tokens/ から同じ並びに載せる。
import "../../../../tokens/typography/index.css";
// 書体の素性（名前、版、ウェイト、配布元、ライセンス）の正本は token の README である。
// 画面へ書き写すと、書体を入れ替えたときに 2 か所を直すことになる。
import typographyReadme from "../../../../tokens/typography/README.md?raw";
import "./variant.css";
import { Sheet, longestTitle, shortestTitle, type SheetSpec } from "../../shared/Sheet";
import { useEffect, useRef, useState } from "react";
import { runnerPath, svgsFor, works, worksByUpdated, type Work } from "../../shared/data";
import {
  schemeById,
  schemeVars,
  schemes,
  type Scheme,
  type SchemeColor,
} from "../../shared/schemes";
import {
  contrastRatio,
  formatRatio,
  hexFromCssColor,
  parseCssColor,
  passes,
  relativeLuminance,
} from "../../shared/contrast";
import { tokenFamilies, type Token } from "../../shared/tokens";
import { useScreen, type ScreenApi, type ScreenState } from "../../shared/useScreen";
import { ALL_GUIDELINES, renderInline, type Guideline, type Rule } from "../../shared/guidelines";
import { FIGURE_COMPONENTS } from "./figures";

type TopicId = "colors" | "typography" | "tokens" | "components" | "icons";

type Topic = {
  id: TopicId;
  label: string;
  lead: string;
  /** この topic に入る Experiment の domain。token の topic だけ空にする。 */
  domains: string[];
};

// ナビの正本。種別ではなく「何を探しているか」で分ける。
// 正本の domain は docs/scope.md にある。ここは topic への割り当てだけを持つ。
const TOPICS: Topic[] = [
  { id: "colors", label: "Colors", lead: "役割ごとに決めた色の組。", domains: ["color"] },
  {
    id: "typography",
    label: "Typography",
    lead: "書体と文字の役割。",
    domains: ["typography"],
  },
  { id: "tokens", label: "Tokens", lead: "正本の値そのもの。", domains: [] },
  {
    id: "components",
    label: "Components",
    lead: "入力と操作の部品。",
    domains: ["forms-input-ux"],
  },
  { id: "icons", label: "Icons", lead: "画面で使う記号の組。", domains: ["iconography"] },
];

// Illustrations と Motion は掲載を止める（利用者の判断、2026-09-20）。
// Catalog 本体も同じ日に illustration-svg と animation-motion を退役させている
// （docs/decisions/2026-09-20-catalog-neutral-navigation.md）。
// topic を消すと、その domain の成果物は topicOf が null を返して一覧に出ない。

// 1 つの成果物が複数の domain を持つので、どの topic に入れるかを 1 つに決める。
// 正本（apps/catalog/src/content/category.ts の categoryForExperiment）と同じく、
// 成果物が frontmatter に書いた domain の順で、最初に topic へ当たるものを採る。
// topic の表示順は利用者が挙げた順にしたいので、割り当てとは分ける。
// どの topic にも当たらない domain の成果物は、掲載しない（null を返す）。
function topicOf(work: Work): TopicId | null {
  for (const domain of work.domains) {
    const topic = TOPICS.find((item) => item.domains.includes(domain));
    if (topic) return topic.id;
  }
  return null;
}

function worksIn(id: TopicId): Work[] {
  return worksByUpdated().filter((work) => topicOf(work) === id);
}

function topicById(id: string | null): Topic | undefined {
  return TOPICS.find((topic) => topic.id === id);
}

function dot(date: string): string {
  return date.replaceAll("-", ".");
}

function countOf(topic: Topic): string {
  if (topic.id === "tokens") return `${tokenFamilies.flatMap((f) => f.tokens).length} token`;
  return `${worksIn(topic.id).length} 件`;
}

/* ---- 画面そのものの配色。カタログは正本の配色を着る ---- */

/**
 * 既定の配色。
 * 意図: カタログが固有の色を持たず、正本の配色の 1 つをそのまま着ている状態から始める。
 * 根拠: これまでの --ed-* の値（白練・白鼠・鉛色）は sumi から取ったものなので、
 *       sumi を既定にすると造形を変えずに「配色を着ている」状態へ移せる。
 * 却下: 固有の紅を既定に残す。カタログだけが正本にない色を持つことになり、
 *       配色を切り替えても強調の色だけが変わらない画面になる。
 */
const DEFAULT_SCHEME = "sumi";

type Appearance = "auto" | "light" | "dark";

type Theme = {
  scheme: Scheme;
  /** 利用者が選んだ値。auto は端末の設定に従う。 */
  appearance: Appearance;
  /** 実際に描く明暗。auto を解決したあとの値。 */
  mode: "light" | "dark";
  schemeOptions: Scheme[];
  setScheme: (id: string) => void;
  setAppearance: (value: Appearance) => void;
};

const APPEARANCES: Array<{ id: Appearance; label: string }> = [
  { id: "auto", label: "端末に従う" },
  { id: "light", label: "ライト" },
  { id: "dark", label: "ダーク" },
];

/** 端末の明暗設定。auto のときだけ使う。 */
function useSystemDark(): boolean {
  const [dark, setDark] = useState(
    () => typeof matchMedia === "function" && matchMedia("(prefers-color-scheme: dark)").matches,
  );
  useEffect(() => {
    if (typeof matchMedia !== "function") return;
    const query = matchMedia("(prefers-color-scheme: dark)");
    const update = () => setDark(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return dark;
}

/**
 * 画面の配色を 1 か所で持つ。
 * 配色トピックの標本だけでなく、カタログ自身の面にも同じ値を当てる。
 * 選べる配色は採用したものに限る。却下した配色でカタログを組んでも判断の材料にならない。
 */
function useTheme(): Theme {
  const [id, setScheme] = useState(DEFAULT_SCHEME);
  const [appearance, setAppearance] = useState<Appearance>("auto");
  const systemDark = useSystemDark();
  const schemeOptions = adoptedSchemes();
  const scheme = schemeById(id) ?? schemeOptions[0] ?? schemes[0];
  const mode = appearance === "auto" ? (systemDark ? "dark" : "light") : appearance;
  return { scheme, appearance, mode, schemeOptions, setScheme, setAppearance };
}

/**
 * 却下した配色は出さない（利用者の判断、2026-09-20）。
 * 使える配色だけを並べたほうが、選ぶ面として迷いがない。
 * 却下した 4 案は experiments/color-schemes の記録に残っている。
 */
function adoptedSchemes(): Scheme[] {
  const adopted = works.find((item) => item.slug === "color-schemes")?.adopted ?? [];
  return adopted.length > 0 ? schemes.filter((item) => adopted.includes(item.id)) : schemes;
}

export default function TopicFirst() {
  const nav = useScreen("top");
  const theme = useTheme();
  return (
    <div
      className="ed-root ed-root--topic"
      style={
        {
          ...schemeVars(theme.scheme, theme.mode),
          colorScheme: theme.mode,
        } as React.CSSProperties
      }
    >
      <a className="skip" href="#ed-main">
        本文へスキップ
      </a>
      <Sidebar nav={nav} theme={theme} />
      <main className="ed-main" id="ed-main">
        {nav.screen === "top" && <Top nav={nav} />}
        {nav.screen === "list" && <TopicScreen nav={nav} theme={theme} />}
        {nav.screen === "detail" && <Detail nav={nav} />}
        {nav.screen === "sheet" && <Sheet spec={SPEC} />}
        {nav.screen === "guide" && <GuideScreen nav={nav} />}
      </main>
    </div>
  );
}

/**
 * 勾玉。配色を選ぶボタンの面に置く。
 * 形は太玉（頭）から尾へ細る曲がり玉で、頭に穴を 1 つ開ける。
 * 面は選択中の配色の accent を当てる。何色を着ているかを、名前ではなく色そのもので示す。
 */
function MagatamaIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="var(--ed-accent)"
        d="M12 2.5a9.5 9.5 0 0 1 0 19 4.75 4.75 0 0 1 0-9.5 4.75 4.75 0 0 0 0-9.5Z"
      />
      <circle cx="11.2" cy="16.6" r="1.7" fill="var(--ed-surface)" />
    </svg>
  );
}

/** 明暗の 3 状態。端末に従うは半分だけ塗った円、ライトは日、ダークは月。 */
function AppearanceIcon({ value }: { value: Appearance }) {
  const common = {
    viewBox: "0 0 24 24",
    "aria-hidden": true,
    focusable: "false" as const,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  if (value === "light") {
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="4.25" />
        <path d="M12 3v2.25M12 18.75V21M3 12h2.25M18.75 12H21M5.6 5.6l1.6 1.6M16.8 16.8l1.6 1.6M18.4 5.6l-1.6 1.6M7.2 16.8l-1.6 1.6" />
      </svg>
    );
  }
  if (value === "dark") {
    return (
      <svg {...common}>
        <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="8.25" />
      <path d="M12 3.75a8.25 8.25 0 0 1 0 16.5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * 配色と明暗を選ぶ。サイドバーの最下段に置くのは、どの画面からでも切り替えられるようにするためである。
 * 形はアイコンのボタン 2 つにする（利用者の判断、2026-09-20）。
 * 語を出していた頃は 2 行で 7.5rem の枠を 2 つ取り、ナビの列の下半分を選択が占めていた。
 * 押したあとの選択は native の select に任せる。
 * 10 配色と 3 状態をボタンの並びで出すと、また同じ面積を取り戻すことになる。
 * select は面へ透明のまま重ね、見た目はアイコンだけにする。
 * 語は読み上げのために残し、見た目からだけ外す。
 */
function ThemeControl({ theme }: { theme: Theme }) {
  return (
    <div className="theme">
      <label className="theme__pick">
        <span className="theme__label">配色</span>
        <span className="theme__icon">
          <MagatamaIcon />
        </span>
        <select
          className="theme__native"
          value={theme.scheme.id}
          onChange={(event) => theme.setScheme(event.target.value)}
        >
          {theme.schemeOptions.map((scheme) => (
            <option key={scheme.id} value={scheme.id}>
              {scheme.label}
            </option>
          ))}
        </select>
      </label>
      <label className="theme__pick">
        <span className="theme__label">テーマ</span>
        <span className="theme__icon">
          <AppearanceIcon value={theme.appearance} />
        </span>
        <select
          className="theme__native"
          value={theme.appearance}
          onChange={(event) => theme.setAppearance(event.target.value as Appearance)}
        >
          {APPEARANCES.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}

/**
 * サイドバーのナビの正本。成果物と方針の 2 群にし、子をその下に常に開いて並べる。
 * 横帯では 13 面が 390 幅で 3 段に折り返すため畳む必要があったが、
 * 縦に置けば全件を一度に出せる。現在地を探す操作が要らなくなる。
 * 群の見出しは遷移しない。遷移するのは子のリンクである。
 */
type NavGroupId = "works" | "guide";

type NavChild = { key: string; label: string; to: Partial<ScreenState> };

const NAV_GROUPS: { id: NavGroupId; label: string; children: NavChild[] }[] = [
  {
    id: "works",
    label: "Works",
    children: TOPICS.map((topic) => ({
      key: topic.id,
      label: topic.label,
      to: { screen: "list", filter: topic.id, item: null },
    })),
  },
  {
    id: "guide",
    label: "Guidelines",
    children: ALL_GUIDELINES.map((guideline) => ({
      key: guideline.slug,
      label: guideline.title,
      to: { screen: "guide", item: guideline.slug, filter: null },
    })),
  },
];

/**
 * 現在地の子を返す。親の下線と子の aria-current の両方がこの 1 か所を見る。
 * 方針は item なしでも先頭の文書を描くので、判定もその fallback に合わせる。
 */
function currentChildKey(nav: ScreenApi, id: NavGroupId): string | null {
  if (id === "works") return nav.screen === "list" ? nav.filter : null;
  if (nav.screen !== "guide") return null;
  return nav.item ?? ALL_GUIDELINES[0]?.slug ?? null;
}

function Sidebar({ nav, theme }: { nav: ScreenApi; theme: Theme }) {
  return (
    <div className="sidebar">
      <a
        className="sidebar__name"
        href={nav.hrefFor({ screen: "top", item: null, filter: null })}
        onClick={(event) => {
          event.preventDefault();
          nav.go({ screen: "top", item: null, filter: null });
        }}
      >
        UI／UX 沼
      </a>
      <nav className="sidebar__nav" aria-label="主ナビゲーション">
        {NAV_GROUPS.map((group) => {
          const currentKey = currentChildKey(nav, group.id);
          return (
            <section className="sidebar__group" key={group.id}>
              <h2 className="sidebar__heading" id={`nav-${group.id}`}>
                {group.label}
              </h2>
              <ul className="sidebar__list" aria-labelledby={`nav-${group.id}`}>
                {group.children.map((child) => (
                  <li key={child.key}>
                    <a
                      className="sidebar__link"
                      href={nav.hrefFor(child.to)}
                      aria-current={child.key === currentKey ? "page" : undefined}
                      onClick={(event) => {
                        event.preventDefault();
                        nav.go(child.to);
                      }}
                    >
                      {child.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
        <section className="sidebar__group">
          <ul className="sidebar__list">
            <li>
              <a
                className="sidebar__link sidebar__link--lone"
                href={nav.hrefFor({ screen: "sheet", item: null, filter: null })}
                aria-current={nav.screen === "sheet" ? "page" : undefined}
                onClick={(event) => {
                  event.preventDefault();
                  nav.go({ screen: "sheet", item: null, filter: null });
                }}
              >
                Specimens
              </a>
            </li>
          </ul>
        </section>
      </nav>
      <ThemeControl theme={theme} />
    </div>
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
  const hero = worksByUpdated()[0];
  const openTopic = (id: TopicId) => (event: React.MouseEvent) => {
    event.preventDefault();
    nav.go({ screen: "list", filter: id, item: null });
  };
  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <p className="hero__kicker">
          <span className="hero__topic">{topicById(topicOf(hero) ?? "")?.label ?? "成果物"}</span>
          <span>最終更新 {dot(hero.updated)}</span>
        </p>
        <h1 className="hero__title" id="hero-title" tabIndex={-1} data-screen-heading>
          {hero.title}
        </h1>
        <p className="hero__lead">{hero.lead}</p>
        <div className="hero__live">
          <Live work={hero} tall />
        </div>
        <div className="hero__side">
          <Meta work={hero} />
          <p className="hero__action">
            <a
              className="btn"
              href={nav.hrefFor({ screen: "detail", item: hero.slug })}
              onClick={(event) => {
                event.preventDefault();
                nav.go({ screen: "detail", item: hero.slug, variant: null });
              }}
            >
              この成果物を開く
            </a>
          </p>
        </div>
      </section>

      <section className="topics" aria-labelledby="topics-head">
        <h2 className="section-title" id="topics-head">
          トピック
        </h2>
        <ul className="topic-list">
          {TOPICS.map((topic) => {
            const sample = topic.id === "tokens" ? null : worksIn(topic.id)[0];
            return (
              <li className="topic" key={topic.id}>
                <a
                  className="topic__hit"
                  href={nav.hrefFor({ screen: "list", filter: topic.id, item: null })}
                  onClick={openTopic(topic.id)}
                >
                  <span className="topic__label">{topic.label}</span>
                  <span className="topic__count">{countOf(topic)}</span>
                </a>
                <p className="topic__lead">{topic.lead}</p>
                {sample ? (
                  <Live work={sample} />
                ) : (
                  <div className="token-strip">
                    {tokenFamilies.map((family) => (
                      <p className="token-strip__row" key={family.id}>
                        <span className="token-strip__name">{family.label}</span>
                        <span className="token-strip__count">{family.tokens.length}</span>
                      </p>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}

function TopicScreen({ nav, theme }: { nav: ScreenApi; theme: Theme }) {
  const topic = topicById(nav.filter) ?? TOPICS[0];
  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {topic.label}
      </h1>
      <p className="index__lead">{topic.lead}</p>
      <TopicBody topic={topic} nav={nav} theme={theme} />
    </section>
  );
}

/**
 * トピックの画面は中身そのものを出す。
 * 一覧を挟んで詳細へ送ると、成果物を見るまでに 2 回押すことになる。
 * 中身の形は topic ごとに違うので、描き分けはここで持つ。
 */
function TopicBody({ topic, nav, theme }: { topic: Topic; nav: ScreenApi; theme: Theme }) {
  if (topic.id === "tokens") return <TokenTables />;
  if (topic.id === "colors") return <ColorsTopic mode={theme.mode} />;
  if (topic.id === "typography") return <TypographyTopic nav={nav} />;
  if (topic.id === "icons") return <SvgTopic topic={topic} nav={nav} />;
  return <LiveTopic topic={topic} nav={nav} />;
}

/** 成果物の題名と、正本へ辿る道。中身の上に 1 行だけ置く。 */
function WorkHead({ work, nav }: { work: Work; nav: ScreenApi }) {
  return (
    <div className="work-head">
      <h2 className="work-head__title">{work.title}</h2>
      <p className="work-head__meta">
        <a
          href={nav.hrefFor({ screen: "detail", item: work.slug })}
          onClick={(event) => {
            event.preventDefault();
            nav.go({ screen: "detail", item: work.slug, variant: null });
          }}
        >
          詳細
        </a>
        <span>{work.role}</span>
        <span>{work.maturity}</span>
        <span>{dot(work.updated)}</span>
      </p>
    </div>
  );
}

/** variant を切り替える帯。トピックの画面の中で完結させる。 */
function VariantChips({
  work,
  current,
  onSelect,
}: {
  work: Work;
  current: string;
  onSelect: (id: string) => void;
}) {
  if (work.variantIds.length < 2) return null;
  return (
    <ul className="variants variants--row">
      {work.variantIds.map((id) => (
        <li key={id}>
          <button
            type="button"
            className="variants__item"
            aria-pressed={id === current}
            onClick={() => onSelect(id)}
          >
            <span className="variants__id">{id}</span>
            {work.adopted.includes(id) && <span className="variants__mark">採用</span>}
          </button>
        </li>
      ))}
    </ul>
  );
}

function defaultVariant(work: Work): string {
  return work.adopted[0] ?? work.variantIds[0];
}

/* ---- 配色。coolors のパレットカードを参考にする ---- */

/**
 * カードの帯に出す役割と、その並び。配色ごとに値が変わる役割だけを出す（利用者の判断、2026-09-20）。
 * 文字、線、地、意味色は 14 案すべてで同じ値なので、並べてもカードの差にならない。
 * 差になるのは accent 系と focus、on-accent の 6 役割だけで、配色の性格もここに出る。
 * 同じ値の役割は 1 本にまとめ、役割名をスラッシュで並べる。
 * aizome のように accent と accent-strong と focus が同じ値の配色があり、分けると同じ帯が 3 本並ぶ。
 * まとめれば色の面は重複せず、その配色が 1 色を 3 役に当てていることも読める。
 * まとめた結果、本数は 6 本以下で配色ごとに変わる。
 * 共通の役割も含めた全 19 役割はポップアップで見せる。
 */
const CARD_ROLES = [
  "accent",
  "accent-hover",
  "accent-strong",
  "accent-subtle",
  "focus",
  "on-accent",
];

/** 展開したときに見せる全役割の並び。役割の意味で束ねる。 */
const ROLE_GROUPS: Array<{ label: string; roles: string[] }> = [
  { label: "面", roles: ["bg", "bg-subtle", "surface"] },
  { label: "線", roles: ["border", "border-strong", "focus"] },
  { label: "文字", roles: ["text", "text-muted"] },
  {
    label: "強調",
    roles: ["accent", "accent-hover", "accent-strong", "accent-subtle", "on-accent"],
  },
  {
    label: "意味",
    roles: ["success", "success-subtle", "warning", "warning-subtle", "danger", "danger-subtle"],
  },
];

/** コントラストを確かめる主要な組み合わせ。正本は apps/catalog/src/content/contrast.ts。 */
const CONTRAST_PAIRS: Array<{ fg: string; bg: string; minimum: 4.5 | 3 }> = [
  { fg: "text", bg: "bg", minimum: 4.5 },
  { fg: "text-muted", bg: "bg", minimum: 4.5 },
  { fg: "on-accent", bg: "accent", minimum: 4.5 },
  { fg: "border-strong", bg: "bg", minimum: 3 },
  { fg: "focus", bg: "bg", minimum: 3 },
];

/** 表示するカラーコードは # に統一する。oklch のまま出すと、配色ごとに記法が混ざって読み比べられない。 */
function hexOf(value: string): string {
  try {
    return hexFromCssColor(value);
  } catch {
    return value;
  }
}

/**
 * 和名コメントが無い色に当てる名。
 * 役割名をそのまま出すと、帯が指しているものが色ではなく役割になる。
 * 語彙は増やさず、無彩は白から黒までの 8 段、有彩は色相の基本名に濃淡を 1 つ付けるだけにする。
 */
const NEUTRAL_NAMES: Array<{ min: number; name: string }> = [
  { min: 0.97, name: "白" },
  { min: 0.925, name: "白練" },
  { min: 0.8, name: "白鼠" },
  { min: 0.63, name: "銀鼠" },
  { min: 0.46, name: "鼠" },
  { min: 0.29, name: "灰" },
  { min: 0.13, name: "墨" },
  { min: 0, name: "黒" },
];

const HUE_NAMES: Array<{ max: number; name: string }> = [
  { max: 14, name: "赤" },
  { max: 45, name: "橙" },
  { max: 70, name: "黄" },
  { max: 95, name: "黄緑" },
  { max: 155, name: "緑" },
  { max: 195, name: "青緑" },
  { max: 235, name: "青" },
  { max: 258, name: "藍" },
  { max: 310, name: "紫" },
  { max: 345, name: "桃" },
  { max: 360, name: "赤" },
];

function derivedName(value: string): string {
  let hue = 0;
  let saturation = 0;
  let lightness = 0;
  try {
    [hue, saturation, lightness] = toHsl(parseCssColor(value));
  } catch {
    return value;
  }
  if (saturation < 0.08) {
    return NEUTRAL_NAMES.find((step) => lightness >= step.min)?.name ?? "黒";
  }
  const name = HUE_NAMES.find((step) => hue < step.max)?.name ?? "赤";
  if (lightness >= 0.8) return `淡${name}`;
  if (lightness <= 0.22) return `深${name}`;
  return name;
}

/** 色相、彩度、明度。色名を決めるためだけに使う。 */
function toHsl({ r, g, b }: { r: number; g: number; b: number }): [number, number, number] {
  const red = r / 255;
  const green = g / 255;
  const blue = b / 255;
  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  const span = max - min;
  if (span === 0) return [0, 0, lightness];
  const saturation = span / (1 - Math.abs(2 * lightness - 1));
  const hue =
    max === red
      ? 60 * (((green - blue) / span) % 6)
      : max === green
        ? 60 * ((blue - red) / span + 2)
        : 60 * ((red - green) / span + 4);
  return [(hue + 360) % 360, saturation, lightness];
}

/** 帯に出す色の名。正本の行末コメントがあればそれを使い、無ければ値から決める。 */
function colorLabel(color: SchemeColor): string {
  return color.name === color.role ? derivedName(color.value) : color.name;
}

/**
 * 配色の名に当てる文字色。
 * その配色の色を使い、地（bg）に対して読めない値だけ順に次の候補へ落とす。
 * 新しい色は作らない。候補がどれも足りなければ、比が最大の候補を使う。
 */
function schemeInk(scheme: Scheme, mode: "light" | "dark", roles: string[], minimum: 4.5 | 3) {
  const paper = colorOf(scheme, mode, "bg")?.value ?? (mode === "dark" ? "#000000" : "#ffffff");
  let best = "";
  let bestRatio = -1;
  for (const role of roles) {
    const value = colorOf(scheme, mode, role)?.value;
    if (!value) continue;
    let ratio = 0;
    try {
      ratio = contrastRatio(value, paper);
    } catch {
      continue;
    }
    if (passes(ratio, minimum)) return value;
    if (ratio > bestRatio) {
      best = value;
      bestRatio = ratio;
    }
  }
  return best || undefined;
}

/** 名は主色。20px の太字なので 3:1 を満たせばよい。 */
function labelInk(scheme: Scheme, mode: "light" | "dark"): string | undefined {
  return schemeInk(scheme, mode, ["accent", "accent-strong", "accent-hover", "text"], 3);
}

/** id は副となる色。12px なので 4.5:1 を求める。 */
function codeInk(scheme: Scheme, mode: "light" | "dark"): string | undefined {
  return schemeInk(scheme, mode, ["accent-hover", "accent-strong", "accent", "text-muted"], 4.5);
}

/** 帯の上に置く文字の色。新しい色を作らず、その帯の明るさで黒か白を選ぶ。 */
function inkOn(value: string): string {
  try {
    return relativeLuminance(parseCssColor(value)) > 0.45 ? "#0c0c0c" : "#ffffff";
  } catch {
    return "#0c0c0c";
  }
}

function colorOf(scheme: Scheme, mode: "light" | "dark", role: string): SchemeColor | undefined {
  return scheme[mode].find((item) => item.role === role);
}

/** 帯 1 本。同じ値の役割はここでまとまる。 */
type Band = { value: string; name: string; roles: string[] };

function mergeRoles(scheme: Scheme, mode: "light" | "dark", roles: string[]): Band[] {
  const out: Band[] = [];
  const byValue = new Map<string, Band>();
  for (const role of roles) {
    const color = colorOf(scheme, mode, role);
    if (!color) continue;
    const found = byValue.get(color.value);
    if (found) {
      found.roles.push(role);
      continue;
    }
    const band: Band = { value: color.value, name: colorLabel(color), roles: [role] };
    byValue.set(color.value, band);
    out.push(band);
  }
  return out;
}

function cardColors(scheme: Scheme, mode: "light" | "dark"): Band[] {
  return mergeRoles(scheme, mode, CARD_ROLES);
}

/**
 * 大きな帯は 2 段にして、カードより多くの役割を出す。
 * 上段は主役と文字、下段は面と線と意味色。カードで外した役割もここで見られる。
 * accent、text、bg だけ幅を 2 倍にする。配色の性格を決める 3 色なので、
 * 大きさでも他と区別する。
 */
const HERO_ROWS: string[][] = [
  ["accent", "accent-hover", "accent-strong", "accent-subtle", "on-accent", "text", "text-muted"],
  [
    "bg",
    "bg-subtle",
    "surface",
    "border",
    "border-strong",
    "focus",
    "success",
    "warning",
    "danger",
  ],
];

const HERO_WEIGHT: Record<string, number> = { accent: 2, text: 2, bg: 2 };

function heroWeight(band: Band): number {
  return Math.max(...band.roles.map((role) => HERO_WEIGHT[role] ?? 1));
}

/** hex をコピーする。clipboard が無い環境でも落とさない。 */
function useCopy(): { copied: string | null; copy: (value: string) => void } {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (value: string) => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(value))
      .catch(() => setCopied(null));
  };
  return { copied, copy };
}

/**
 * 詳細を開く印。
 * 線幅、端点、live area を 1 値に固定する規則は docs/principles/icon-set-consistency-by-few-parameters.md に従う。
 * 24 の viewBox、線幅 1.5、端点は丸、live area の余白は 2。
 */
function DetailIcon() {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.25" />
      <circle cx="12" cy="7.75" r="0.75" className="icon__dot" />
    </svg>
  );
}

// 明暗の切替は題字の選択に一本化した。
// 配色トピックだけに切替を置くと、同じ操作が画面の 2 か所にあり、
// どちらがカタログ自身の見え方を変えるのか読めない。
function ColorsTopic({ mode }: { mode: "light" | "dark" }) {
  const [open, setOpen] = useState<string | null>(null);
  const { copied, copy } = useCopy();
  const shown = adoptedSchemes();

  return (
    <div className="topic-body">
      <Feature mode={mode} shown={shown} copy={copy} />

      <div className="palette-browse">
        <ul className="palettes">
          {shown.map((scheme) => (
            <li className="palette" key={scheme.id}>
              <ul className="bands">
                {cardColors(scheme, mode).map((band) => (
                  <li className="band" key={band.value} style={{ background: band.value }}>
                    <button
                      type="button"
                      className="band__hit"
                      style={{ color: inkOn(band.value) }}
                      onClick={() => copy(hexOf(band.value))}
                    >
                      <span className="band__info">
                        <span className="band__hex">{hexOf(band.value)}</span>
                        <span className="band__role">{band.roles.join(" / ")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="palette__head">
                <p className="palette__name">
                  <span className="palette__label" style={{ color: labelInk(scheme, mode) }}>
                    {scheme.label}
                  </span>
                  <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
                </p>
                <button
                  type="button"
                  className="palette__more"
                  aria-haspopup="dialog"
                  aria-label={`${scheme.label} の役割をすべて見る`}
                  onClick={() => setOpen(scheme.id)}
                >
                  <DetailIcon />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <p className="copied" role="status">
          {copied ? `${copied} をコピーした。` : ""}
        </p>
      </div>

      <SchemeDialog
        scheme={shown.find((item) => item.id === open)}
        mode={mode}
        copy={copy}
        onClose={() => setOpen(null)}
      />
    </div>
  );
}

/**
 * 1 配色を全幅で見せる帯。前後のボタンで送る。
 * カードの展開とは連動させない。連動させると、画面外の帯が変わって変化が見えない。
 */
function Feature({
  mode,
  shown,
  copy,
}: {
  mode: "light" | "dark";
  shown: Scheme[];
  copy: (value: string) => void;
}) {
  const [index, setIndex] = useState(0);
  const scheme = shown[index] ?? shown[0];
  const at = (step: number) => (index + step + shown.length) % shown.length;
  const move = (step: number) => setIndex(at(step));
  const prev = shown[at(-1)];
  const next = shown[at(1)];

  return (
    <section className="feature" aria-labelledby="feature-name">
      <div className="feature__bands">
        {HERO_ROWS.map((roles, row) => (
          <ul className="feature__row" key={row}>
            {mergeRoles(scheme, mode, roles).map((band) => (
              <li
                className="feature__band"
                key={band.value}
                style={{ background: band.value, flexGrow: heroWeight(band) }}
              >
                <button
                  type="button"
                  className="feature__hit"
                  style={{ color: inkOn(band.value) }}
                  onClick={() => copy(hexOf(band.value))}
                >
                  <span className="feature__hex">{hexOf(band.value)}</span>
                  <span className="feature__role">{band.roles.join(" / ")}</span>
                  <span className="feature__jp">{band.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ))}
      </div>
      <div className="feature__head">
        <p className="feature__name" id="feature-name">
          <span className="feature__label" style={{ color: labelInk(scheme, mode) }}>
            {scheme.label}
          </span>
          <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
        </p>
        {/* 送り先が何かを、方向ではなく配色の名前で示す。 */}
        <p className="feature__nav">
          <button
            type="button"
            className="feature__step"
            aria-label={`前の配色 ${prev.label}`}
            onClick={() => move(-1)}
          >
            <span aria-hidden="true">←</span>
            <span className="feature__step-name">{prev.label}</span>
          </button>
          {/* 桁数を揃える。1 / 10 と 10 / 10 で幅が変わると、両隣のボタンが動く。 */}
          <span className="feature__count">
            {String(index + 1).padStart(String(shown.length).length, "0")} / {shown.length}
          </span>
          <button
            type="button"
            className="feature__step"
            aria-label={`次の配色 ${next.label}`}
            onClick={() => move(1)}
          >
            <span className="feature__step-name">{next.label}</span>
            <span aria-hidden="true">→</span>
          </button>
        </p>
      </div>
    </section>
  );
}

/**
 * 詳細のポップアップ。
 * <dialog> の showModal に任せると、Esc、背景の不活性化、focus の閉じ込めが既定で付く。
 * 自前で作ると、この 3 つを再実装することになる。
 */
function SchemeDialog({
  scheme,
  mode,
  copy,
  onClose,
}: {
  scheme: Scheme | undefined;
  mode: "light" | "dark";
  copy: (value: string) => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (scheme && !dialog.open) dialog.showModal();
    if (!scheme && dialog.open) dialog.close();
  }, [scheme]);

  return (
    <dialog
      className="sheet-dialog"
      ref={ref}
      aria-labelledby="dialog-name"
      onClose={onClose}
      // 背景を押しても閉じる。dialog 自身が背景の当たり判定になる。
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      {scheme && (
        <div className="sheet-dialog__body">
          <div className="sheet-dialog__head">
            <p className="sheet-dialog__name" id="dialog-name">
              <span className="sheet-dialog__label" style={{ color: labelInk(scheme, mode) }}>
                {scheme.label}
              </span>
              <code style={{ color: codeInk(scheme, mode) }}>{scheme.id}</code>
            </p>
            <button
              type="button"
              className="sheet-dialog__close"
              onClick={() => ref.current?.close()}
            >
              閉じる
            </button>
          </div>
          <SchemeDetail scheme={scheme} mode={mode} copy={copy} />
        </div>
      )}
    </dialog>
  );
}

/** ポップアップの中身。19 役割すべてと、主要な組み合わせのコントラスト。 */
function SchemeDetail({
  scheme,
  mode,
  copy,
}: {
  scheme: Scheme;
  mode: "light" | "dark";
  copy: (value: string) => void;
}) {
  return (
    <div className="detail-panel">
      {ROLE_GROUPS.map((group) => (
        <div className="role-group" key={group.label}>
          <p className="role-group__label">{group.label}</p>
          <ul className="role-list">
            {group.roles.flatMap((role) => {
              const color = colorOf(scheme, mode, role);
              if (!color) return [];
              return [
                <li className="role-item" key={role}>
                  <button
                    type="button"
                    className="role-item__hit"
                    onClick={() => copy(hexOf(color.value))}
                  >
                    <span className="role-item__chip" style={{ background: color.value }} />
                    <span className="role-item__role">{role}</span>
                    <span className="role-item__jp">{colorLabel(color)}</span>
                    <span className="role-item__hex">{hexOf(color.value)}</span>
                  </button>
                </li>,
              ];
            })}
          </ul>
        </div>
      ))}

      <div className="role-group">
        <p className="role-group__label">コントラスト</p>
        <ul className="ratios">
          {CONTRAST_PAIRS.flatMap((pair) => {
            const fg = colorOf(scheme, mode, pair.fg);
            const bg = colorOf(scheme, mode, pair.bg);
            if (!fg || !bg) return [];
            const ratio = contrastRatio(fg.value, bg.value);
            const ok = passes(ratio, pair.minimum);
            return [
              <li className="ratio" key={`${pair.fg}-${pair.bg}`} data-pass={ok}>
                <span className="ratio__pair">
                  {pair.fg} 対 {pair.bg}
                </span>
                <span className="ratio__value">{formatRatio(ratio)}</span>
                <span className="ratio__min">{pair.minimum}:1</span>
                <span className="ratio__mark">{ok ? "合格" : "不足"}</span>
              </li>,
            ];
          })}
        </ul>
      </div>

      <div className="role-group">
        <p className="role-group__label">組んだところ</p>
        <SchemeSpecimen scheme={scheme} mode={mode} />
      </div>
    </div>
  );
}

/** 配色を当てた小さな標本。色の一覧だけでは、組んだときの見え方が分からない。 */
function SchemeSpecimen({ scheme, mode }: { scheme: Scheme; mode: "light" | "dark" }) {
  const vars: Record<string, string> = {};
  for (const color of scheme[mode]) vars[`--cs-${color.role}`] = color.value;
  return (
    <div className="specimen" style={vars as React.CSSProperties}>
      <p className="specimen__title">日本語プロダクト UI</p>
      <p className="specimen__body">この配色で本文を組むと、こう見える。</p>
      <p className="specimen__row">
        <span className="specimen__btn">主ボタン</span>
        <span className="specimen__btn specimen__btn--quiet">副ボタン</span>
      </p>
      <p className="specimen__field">入力欄</p>
    </div>
  );
}

/**
 * composite な token を項目名つきの組にする。
 * 値だけを並べていたときは「1.5rem 700 行 1.3 字間 0px」となり、
 * どの数が何を指すのかが、行 と 字間 の 2 つ以外は読めなかった。
 * 書体は画面の先頭にも出すが、役割ごとにも出す（利用者の判断、2026-09-20）。
 * この画面の役割は 6 つしかないので、役割ごとの組が 4 行だと token の表より薄くなる。
 */
function compositeSpec(value: Token["value"]): Array<{ label: string; value: string }> {
  if (typeof value === "string") return [{ label: "値", value }];
  const out: Array<{ label: string; value: string }> = [];
  const family = value["fontFamily"];
  if (family) out.push({ label: "書体", value: primaryFamily(family) });
  if (value["fontSize"]) out.push({ label: "大きさ", value: value["fontSize"] });
  if (value["fontWeight"]) out.push({ label: "太さ", value: value["fontWeight"] });
  if (value["lineHeight"]) out.push({ label: "行間", value: value["lineHeight"] });
  if (value["letterSpacing"]) out.push({ label: "字間", value: value["letterSpacing"] });
  return out;
}

/** 指定の先頭だけを出す。以降は書体が無いときの代替なので、見本を組んだ書体ではない。 */
function primaryFamily(stack: string): string {
  return (
    stack
      .split(",")[0]
      ?.replace(/^["']|["']$/g, "")
      .trim() ?? stack
  );
}

/* ---- タイポグラフィ。役割を実寸で組む ---- */

/**
 * 書体の名前。正本は tokens/typography/README.md の採用範囲である。
 * 画面へ書き写すと、書体を入れ替えたときに 2 か所を直すことになる。
 * 読めなかったときは出さない。README の書き方が変わっても画面は壊れない。
 */
function typefaceName(): string | undefined {
  return typographyReadme.match(/書体は\s*(.+?)\s*の\s*.+?\s*を使う。/)?.[1];
}

/**
 * 書体そのものを先に出す。
 * 役割の見本だけでは、どの書体で組んであるのかが画面から分からなかった。
 * 出すのは名前と字形だけにする。ライセンスや配布元は token の README で読む。
 */
function TypefaceHead({ name }: { name?: string }) {
  if (!name) return null;
  return (
    <section className="typeface" aria-labelledby="typeface-head">
      <h2 className="typeface__name" id="typeface-head">
        {name}
      </h2>
      <p className="typeface__glyphs" aria-hidden="true">
        {GLYPHS}
      </p>
    </section>
  );
}

function TypographyTopic({ nav }: { nav: ScreenApi }) {
  const work = works.find((item) => item.slug === "product-ui-typography");
  const roles =
    tokenFamilies
      .find((family) => family.id === "typography")
      ?.tokens.filter((token) => token.kind === "semantic") ?? [];
  return (
    <div className="topic-body">
      <TypefaceHead name={typefaceName()} />

      <ol className="roles">
        {roles.map((token) => (
          <li className="role" key={token.path}>
            <div className="role__main">
              <p className="role__name">{token.path.replace("typography.", "")}</p>
              <p className="role__sample">
                <TokenSample token={token} />
              </p>
              <p className="role__desc">{token.description}</p>
            </div>
            <dl className="role__spec">
              {compositeSpec(token.value).map((item) => (
                <div className="role__spec-row" key={item.label}>
                  <dt>{item.label}</dt>
                  <dd>{item.value}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ol>
      {work && (
        <p className="topic-source">
          <a
            href={nav.hrefFor({ screen: "detail", item: work.slug })}
            onClick={(event) => {
              event.preventDefault();
              nav.go({ screen: "detail", item: work.slug, variant: null });
            }}
          >
            {work.title}
          </a>
        </p>
      )}
    </div>
  );
}

/* ---- アイコン。SVG そのものを並べる ---- */

function SvgTopic({ topic, nav }: { topic: Topic; nav: ScreenApi }) {
  const list = worksIn(topic.id);
  if (list.length === 0) return <p className="empty">まだ成果物がない。</p>;
  return (
    <div className="topic-body">
      {list.map((work) => (
        <SvgWork key={work.slug} work={work} nav={nav} />
      ))}
    </div>
  );
}

function SvgWork({ work, nav }: { work: Work; nav: ScreenApi }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  const assets = svgsFor(work.slug, current);
  return (
    <div className="work">
      <WorkHead work={work} nav={nav} />
      <VariantChips work={work} current={current} onSelect={setCurrent} />
      {assets.length === 0 ? (
        <p className="empty">この variant に配布用の SVG がない。</p>
      ) : (
        <ul className="svg-grid">
          {assets.map((asset) => (
            <li className="svg-cell" key={asset.name}>
              <span className="svg-cell__art" dangerouslySetInnerHTML={{ __html: asset.source }} />
              <span className="svg-cell__name">{asset.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ---- 部品と動き。live 標本を大きく出す ---- */

function LiveTopic({ topic, nav }: { topic: Topic; nav: ScreenApi }) {
  const list = worksIn(topic.id);
  if (list.length === 0) return <p className="empty">まだ成果物がない。</p>;
  return (
    <div className="topic-body">
      {list.map((work) => (
        <LiveWork key={work.slug} work={work} nav={nav} />
      ))}
    </div>
  );
}

function LiveWork({ work, nav }: { work: Work; nav: ScreenApi }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  return (
    <div className="work">
      <WorkHead work={work} nav={nav} />
      <VariantChips work={work} current={current} onSelect={setCurrent} />
      <LiveBlock work={work} variant={current} />
    </div>
  );
}

function LiveBlock({ work, variant }: { work: Work; variant?: string }) {
  const id = variant ?? defaultVariant(work);
  return (
    <div className="live live--tall">
      <iframe
        className="live__frame"
        src={runnerPath(work.slug, id)}
        title={`${work.title} の ${id}`}
        loading="lazy"
      />
      <p className="live__caption">
        <span className="live__id">{id}</span>
        <span>{work.platforms.join("・")}</span>
      </p>
    </div>
  );
}

/** DTCG の dimension は {value, unit} で持つ。読むときは 1.5rem の形に戻す。 */
function tokenText(value: Token["value"]): string {
  if (typeof value === "string") return value;
  if ("value" in value && "unit" in value) return `${value["value"]}${value["unit"]}`;
  return Object.entries(value)
    .map(([key, item]) => `${key}: ${typeof item === "string" ? item : String(item)}`)
    .join(" / ");
}

/**
 * token を実際に当てた見本を描く。値だけでは字面と大きさが判断できないため。
 * 文字に関係しない token（余白）は、文字ではなく長さの帯で見せる。
 */
/**
 * 役割の token に入れる文。
 * その役割で実際に書く文を入れる。字形の羅列（あAaＡ 日本語 UI）では、
 * 役割ごとの文の長さと行数が出ないため、組んだときの見え方が判断できない。
 * body だけ複数行にしてあるのは、行間の値が 1 行では確かめられないからである。
 * 文面は正本の $description に書いた用途から取り、説明と食い違わないようにした。
 * どの役割も 1 つの文にする。値を並べた断片（「更新日 2026.09.19 ／ 全 6 役割」）は、
 * 何を言っているのか読めず、見本としても字面の長さが役割と結び付かない。
 */
const ROLE_SAMPLES: Record<string, string> = {
  "typography.title": "文字の役割を決める",
  "typography.heading": "本文と見出しの組み方",
  "typography.body":
    "読む人が迷わないように、行の長さと行間を先に決める。日本語は字面が詰まるので、欧文より行間を広く取る。",
  "typography.ui": "この書体は 2 つのウェイトを持つ",
  "typography.control": "この成果物を開く",
  "typography.caption": "文字の値は tokens/typography が正本",
};

/**
 * 素の値に入れる文字。
 * font.size や font.weight は役割を持たないので、意味のある文は当てられない。
 * 仮名・片仮名・漢字・欧字・数字を 1 つずつ並べ、字形と太さの差だけを見る並びにする。
 */
const GLYPHS = "あア亜 Aa 0123";

function TokenSample({ token }: { token: Token }) {
  const value = token.value;

  if (typeof value !== "string" && "fontSize" in value) {
    return (
      <span
        className="token-table__sample"
        style={{
          fontFamily: value["fontFamily"],
          fontSize: value["fontSize"],
          fontWeight: value["fontWeight"],
          letterSpacing: value["letterSpacing"],
          lineHeight: value["lineHeight"],
        }}
      >
        {ROLE_SAMPLES[token.path] ?? GLYPHS}
      </span>
    );
  }

  const text = tokenText(value);

  if (token.path.startsWith("space.")) {
    return <span className="token-table__bar" style={{ inlineSize: text }} aria-hidden="true" />;
  }
  if (token.path.startsWith("font.size.")) {
    return (
      <span className="token-table__sample" style={{ fontSize: text }}>
        {GLYPHS}
      </span>
    );
  }
  if (token.path.startsWith("font.weight.")) {
    return (
      <span className="token-table__sample" style={{ fontWeight: Number(text) }}>
        {GLYPHS}
      </span>
    );
  }
  if (token.path.startsWith("font.family.")) {
    return (
      <span className="token-table__sample" style={{ fontFamily: text }}>
        {GLYPHS}
      </span>
    );
  }
  if (token.path.startsWith("font.lineHeight.") || token.path.includes("line-height")) {
    return (
      <span className="token-table__sample" style={{ lineHeight: text }}>
        行間を確かめる 2 行の
        <br />
        見本の文字である
      </span>
    );
  }
  return <span className="ed-sheet__dash">—</span>;
}

function TokenTables() {
  return (
    <div className="token-families">
      {tokenFamilies.map((family) => (
        <section className="token-family" key={family.id} aria-labelledby={`tf-${family.id}`}>
          <h2 className="token-family__head" id={`tf-${family.id}`}>
            {family.label}
          </h2>
          <p className="meta">
            {family.role && <span>{family.role}</span>}
            {family.maturity && <span>{family.maturity}</span>}
            <span>{family.tokens.length} token</span>
          </p>
          <p className="token-family__source">
            正本は <code>{family.sourcePath}</code>
          </p>
          <div className="token-table-wrap">
            <table className="token-table">
              <thead>
                <tr>
                  <th scope="col">名前</th>
                  <th scope="col">値</th>
                  <th scope="col">見本</th>
                  <th scope="col">説明</th>
                </tr>
              </thead>
              <tbody>
                {family.tokens.map((token) => (
                  <tr key={token.path}>
                    <th scope="row">
                      <code>{token.cssName}</code>
                      <span className="token-table__kind">{token.kind}</span>
                    </th>
                    <td className="token-table__value">{tokenText(token.value)}</td>
                    <td>
                      <TokenSample token={token} />
                    </td>
                    <td className="token-table__desc">{token.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  );
}

function Detail({ nav }: { nav: ScreenApi }) {
  const work = works.find((item) => item.slug === nav.item) ?? works[0];
  const current = nav.variant ?? work.adopted[0] ?? work.variantIds[0];
  const topic = topicById(topicOf(work) ?? "");
  return (
    <article className="detail">
      <p className="detail__crumb">
        {topic && (
          <a
            href={nav.hrefFor({ screen: "list", filter: topic.id, item: null })}
            onClick={(event) => {
              event.preventDefault();
              nav.go({ screen: "list", filter: topic.id, item: null });
            }}
          >
            {topic.label}
          </a>
        )}
        <span aria-hidden="true">／</span>
        <span>{dot(work.updated)}</span>
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

// ---- 色と文字の見本。造形は issue-feature から引き継ぐ ----

const SPEC: SheetSpec = {
  id: "topic-first",
  title: "トピックが入口",
  hypothesis:
    "利用者は「配色を見たい」「token の値を知りたい」と考えて来る。入口をその種類に合わせれば、号や日付という編集の枠組みを挟まずに目的へ届く。",
  paper: "無彩の面と強調 1 色",
  paletteNote:
    "配色と文字は issue-feature の決定をそのまま引き継ぐ。面は無彩にし、色は強調の 1 色だけにする。変えたのは情報設計だけである。",
  palette: [
    {
      role: "地",
      cssVar: "--ed-bg",
      light: "#ffffff",
      dark: "#0d0d0f",
      reference: "和色大辞典 白 / 漆黒を面まで落とした値",
      intent:
        "紙の色を作らない。白と、黒に沈めた面の 2 つだけを持ち、成果物の色が乗る土台に徹する。",
    },
    {
      role: "面",
      cssVar: "--ed-surface",
      light: "#f3f3f2",
      dark: "#1a1a1d",
      reference: "和色大辞典 白練 / 同系の暗色",
      intent: "標本の囲いと側柱に使う 1 段の差。影を使わず明度差だけで層を作る。",
    },
    {
      role: "文字",
      cssVar: "--ed-text",
      light: "#0c0c0c",
      dark: "#fffffb",
      reference: "和色大辞典 漆黒 / 卯の花色",
      intent: "見出しを 6rem まで開くので、文字色は最も濃い側に置く。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "補足",
      cssVar: "--ed-muted",
      light: "#656765",
      dark: "#91989f",
      reference: "和色大辞典 鈍色 / 銀鼠",
      intent: "リード、metadata、キャプション。本文の半分の強さに置く。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
    {
      role: "境界",
      cssVar: "--ed-line",
      light: "#dad9d8",
      dark: "#2a2a2e",
      reference: "和色大辞典 白鼠 / 同系の暗色",
      intent: "区切りのヘアライン。装飾なので 3:1 を要求しない。",
    },
    {
      role: "強い境界",
      cssVar: "--ed-line-strong",
      light: "#7b7c7d",
      dark: "#7b7c7d",
      reference: "和色大辞典 鉛色",
      intent: "操作できる部品の輪郭。ライトとダークで同じ値を使う。",
      check: { against: "--ed-bg", minimum: 3 },
    },
    {
      role: "強調",
      cssVar: "--ed-accent",
      light: "#c9171e",
      dark: "#e87a90",
      reference: "和色大辞典 紅 / 紅梅色",
      intent:
        "強調は 1 色だけ。現在地、リンク、フォーカスをこの色に担わせる。トピックのナビでは、いま見ているトピックの下線がこの色になる。",
      check: { against: "--ed-bg", minimum: 4.5 },
    },
  ],
  typeNote:
    "issue-feature の階梯を引き継ぐ。ウェイトは 400 と 700 しかないので、サイズの対比で階層を作る。トピックの名前は本文と同じ 1rem に置き、ナビが見出しより強くならないようにする。",
  type: [
    {
      name: "主題",
      size: "clamp(2.625rem, 7vw, 6rem)",
      weight: 700,
      lineHeight: "1.06",
      tracking: "-0.03em",
      use: "トップの 1 件、詳細の題名",
      intent:
        "下限 2.625rem は、実データ最長の 18 字が 390 幅で 3 行に収まる上限。上限 6rem は 1280 幅の 7 列に 10 字が収まる値。",
    },
    {
      name: "トピックの題",
      size: "2rem",
      weight: 700,
      lineHeight: "1.2",
      tracking: "-0.02em",
      use: "トピックの画面の題名",
      intent:
        "主題の 3 分の 1。トピックは入口であって主役ではないので、成果物の題名より小さくする。",
      sample: "コンポーネント",
    },
    {
      name: "節の題",
      size: "1.5rem",
      weight: 700,
      lineHeight: "1.3",
      tracking: "-0.01em",
      use: "トピック一覧、token の族",
      intent: "token の title と同じ 1.5rem。共通の値で表せるものは新しい値を作らない。",
      sample: shortestTitle,
    },
    {
      name: "項目",
      size: "1.125rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0em",
      use: "一覧の題名",
      intent: "一覧は数が増える。行の高さを揃えたいので、題名はこの 1 段だけにする。",
      sample: longestTitle,
    },
    {
      name: "本文",
      size: "1rem",
      weight: 400,
      lineHeight: "1.75",
      tracking: "0em",
      use: "リード、トピックの説明、ナビ",
      intent:
        "token の body をそのまま使う。ナビもこの段に置き、トピックの名前が見出しより強くならないようにする。",
      sample: "配色 / タイポグラフィ / トークン / コンポーネント",
    },
    {
      name: "標識",
      size: "0.75rem",
      weight: 700,
      lineHeight: "1.4",
      tracking: "0.12em",
      use: "role、maturity、日付、件数、token 名",
      intent: "字間を開くのはこの段だけ。英字と数字の metadata に限る。等幅数字で桁を揃える。",
      sample: "FOUNDATION／CANDIDATE／2026.09.19",
    },
  ],
  space: [
    { name: "行間の 1 単位", value: "0.5rem", use: "ラベルと値の間" },
    { name: "要素の間", value: "1rem", use: "見出しとリードの間" },
    { name: "面の左右", value: "1.5rem", use: "token の space.page-inline をそのまま使う" },
    { name: "節の間", value: "2.5rem", use: "token の space.section をそのまま使う" },
    { name: "区画の間", value: "5rem", use: "トップの 1 件とトピック一覧の間" },
  ],
  grid: {
    columns: 12,
    wide: "12 列 / 溝 24px。主題が 7 列、側柱が 5 列。トピック一覧は 3 列",
    narrow: "4 列 / 溝 16px。主題が全幅、トピック一覧は 1 列",
    intent:
      "7 対 5 の非対称は issue-feature から引き継ぐ。トピック一覧だけは 3 列の等分にする。入口は 7 つとも同じ重さなので、ここで主従を作らない。",
  },
  parts: <Parts />,
  open: [
    "トピックを 7 つにしてよいか。配色、タイポグラフィ、トークン、コンポーネントに加えて、アイコン、イラスト、モーションを足した。足さないと該当する成果物に辿り着けない。",
    "トークンの画面を表にしてよいか。いまは名前、値、見本、説明の 4 列で、composite な token は実スタイルで字面を出している。",
    "トップに 1 件を大きく出すか。いまは最終更新の 1 件を出しているが、トピック一覧だけにする案もある。",
  ],
};

function Parts() {
  return (
    <div className="parts">
      <p className="parts__row">
        <button className="btn" type="button">
          この成果物を開く
        </button>
        <button className="btn btn--quiet" type="button">
          一覧へ戻る
        </button>
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

// 索引から規則へ送る。動きを減らす設定では滑らせず、移動先へ focus も移す。
function goToRule(domId: string) {
  const target = document.getElementById(domId);
  if (!target) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  target.focus();
}

/**
 * 規則の 1 層。コアと Tips は同じ形で描く。違うのは層の名と並び順だけである。
 * 形を変えると、同じ書式の規則が別物に見える。
 */
function RuleLayer({
  id,
  title,
  lead,
  rules,
  nav,
}: {
  id: string;
  title: string;
  lead: string;
  rules: Rule[];
  nav: ScreenApi;
}) {
  return (
    <section className="guide-block" aria-labelledby={`guide-${id}-head`}>
      <div className="work-head">
        <h2 className="work-head__title" id={`guide-${id}-head`}>
          {title}
        </h2>
        <p className="work-head__meta">{rules.length} 件</p>
      </div>
      <p className="guide-layer__lead">{lead}</p>
      <div className="guide-rules">
        {rules.map((rule, idx) => {
          const Figure = rule.figureKey ? FIGURE_COMPONENTS[rule.figureKey] : null;
          return (
            <article key={idx} id={`rule-${id}-${idx}`} className="guide-rule" tabIndex={-1}>
              <h3 className="guide-rule__title">{rule.title}</h3>
              {Figure && (
                <div className="guide-rule__figure">
                  <Figure />
                </div>
              )}
              <div className="guide-rule__rationale">{renderInline(rule.rationale)}</div>
              <div className="guide-examples">
                <div className="guide-example guide-example--bad">
                  <div className="guide-example__header">
                    <span className="guide-example__tag guide-example__tag--bad">悪い例</span>
                  </div>
                  <div className="guide-example__body">{renderInline(rule.bad)}</div>
                </div>
                <div className="guide-example guide-example--good">
                  <div className="guide-example__header">
                    <span className="guide-example__tag guide-example__tag--good">良い例</span>
                  </div>
                  <div className="guide-example__body">{renderInline(rule.good)}</div>
                </div>
              </div>
              {rule.exception && (
                <div className="guide-rule__exception">
                  <span className="guide-rule__exception-label">例外:</span>
                  {renderInline(rule.exception)}
                </div>
              )}
              {(rule.experiment || rule.source) && (
                <div className="guide-rule__origins">
                  {rule.experiment && (
                    <span className="guide-rule__origin-item">
                      <span className="guide-rule__origin-label">実験:</span>
                      {renderExperimentLink(rule.experiment, nav)}
                    </span>
                  )}
                  {rule.source && (
                    <span className="guide-rule__origin-item">
                      <span className="guide-rule__origin-label">出典:</span>
                      <a
                        href={rule.source.url}
                        className="guide-link"
                        target={rule.source.url.startsWith("http") ? "_blank" : undefined}
                        rel={rule.source.url.startsWith("http") ? "noreferrer" : undefined}
                      >
                        {rule.source.text}
                      </a>
                    </span>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}

const LAYERS = [
  { id: "core", title: "コア", lead: "この主題で守る土台。場面によらず効く。" },
  { id: "tips", title: "Tips", lead: "コアを個別の場面へ当てたもの。場面が変われば入れ替わる。" },
] as const;

function GuideScreen({ nav }: { nav: ScreenApi }) {
  const guidelines = ALL_GUIDELINES;
  // item なしの URL でも画面が空にならないよう、先頭の文書へ落とす。
  // URL は書き換えない。描画後に URL が変わると、戻る操作と撮影の再現性が落ちる。
  const guideline = guidelines.find((item) => item.slug === nav.item) ?? guidelines[0];

  if (!guideline) {
    return (
      <section className="index">
        <p className="empty">方針の文書が読み込めなかった。</p>
      </section>
    );
  }

  const layers = LAYERS.map((layer) => ({
    ...layer,
    rules: layer.id === "core" ? guideline.core : guideline.tips,
  }));

  return (
    <section className="index" aria-labelledby="index-head">
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {guideline.title}
      </h1>
      <p className="index__lead">{guideline.summary}</p>

      <div className="guide-layout">
        <div className="guide-layout__main">
          <section className="guide-block" aria-labelledby="guide-about">
            <div className="work-head">
              <h2 className="work-head__title" id="guide-about">
                この方針について
              </h2>
            </div>
            <dl className="guide-facts">
              <dt>目的</dt>
              <dd>{guideline.purpose}</dd>
              <dt>適用範囲</dt>
              <dd>{guideline.scope}</dd>
            </dl>
          </section>

          {layers.map((layer) => (
            <RuleLayer key={layer.id} {...layer} nav={nav} />
          ))}

          <section className="guide-block" aria-labelledby="guide-checklist-head">
            <div className="work-head">
              <h2 className="work-head__title" id="guide-checklist-head">
                確認項目
              </h2>
            </div>
            <ul className="guide-checklist">
              {guideline.checklist.map((item, idx) => (
                <li key={idx} className="guide-checklist__item">
                  <span className="guide-checklist__icon" aria-hidden="true" />
                  <span>{renderInline(item)}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="guide-block" aria-labelledby="guide-sources-head">
            <div className="work-head">
              <h2 className="work-head__title" id="guide-sources-head">
                出典
              </h2>
            </div>
            <ul className="guide-sources">
              {guideline.sources.map((src, idx) => (
                <li key={idx} className="guide-sources__item">
                  {src.url ? (
                    <a href={src.url} className="guide-link" target="_blank" rel="noreferrer">
                      {src.text}
                    </a>
                  ) : (
                    <span className="guide-strong">{src.text}</span>
                  )}
                  {src.description && <span>: {src.description}</span>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* 索引は本文の右へ置く。読んでいる途中でも規則の全体が見える。 */}
        <aside className="guide-aside" aria-labelledby="guide-toc-head">
          <div className="guide-aside__inner">
            <h2 className="guide-aside__title" id="guide-toc-head">
              規則の索引
            </h2>
            {layers.map((layer) => (
              <nav
                className="guide-aside__layer"
                key={layer.id}
                aria-label={`${layer.title}の索引`}
              >
                <p className="guide-aside__layer-name">{layer.title}</p>
                <ul className="guide-aside__list">
                  {layer.rules.map((rule, idx) => (
                    <li key={idx}>
                      <a
                        className="guide-aside__link"
                        href={`#rule-${layer.id}-${idx}`}
                        onClick={(event) => {
                          event.preventDefault();
                          goToRule(`rule-${layer.id}-${idx}`);
                        }}
                      >
                        {rule.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

function renderExperimentLink(exp: { text: string; url: string }, nav: ScreenApi) {
  const match = exp.url.match(/experiments\/([a-z0-9-]+)/);
  const expSlug = match ? match[1] : null;
  const targetWork = expSlug ? works.find((w) => w.slug === expSlug) : null;
  if (targetWork && targetWork.variantIds.length > 0) {
    const variantId = targetWork.adopted[0] ?? targetWork.variantIds[0];
    return (
      <a
        href={nav.hrefFor({ screen: "detail", item: targetWork.slug, variant: variantId })}
        className="guide-link"
        onClick={(e) => {
          e.preventDefault();
          nav.go({ screen: "detail", item: targetWork.slug, variant: variantId });
        }}
      >
        {exp.text}
      </a>
    );
  }
  const githubUrl = exp.url.startsWith("http")
    ? exp.url
    : `https://github.com/salan70/uiux-numa/blob/main/${exp.url.replace(/^(\.\.\/)+/, "")}`;
  return (
    <a href={githubUrl} className="guide-link" target="_blank" rel="noreferrer">
      {exp.text}
    </a>
  );
}
