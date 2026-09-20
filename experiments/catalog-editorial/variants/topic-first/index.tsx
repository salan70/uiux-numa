// 案 topic-first。トピックを入口にする。
// 造形は issue-feature を引き継ぐ（利用者の判断、2026-09-20）。
// 変えるのは情報設計だけで、号や特集といった雑誌の枠組みは使わない。
// 入口は「何を探しているか」の種類にし、token も正本の tokens/ から同じ並びに載せる。
import "../../../../tokens/typography/index.css";
import "./variant.css";
import { Sheet, longestTitle, shortestTitle, type SheetSpec } from "../../shared/Sheet";
import { useEffect, useRef, useState } from "react";
import { runnerPath, svgsFor, works, worksByUpdated, type Work } from "../../shared/data";
import { schemes, type Scheme, type SchemeColor } from "../../shared/schemes";
import {
  contrastRatio,
  formatRatio,
  parseCssColor,
  passes,
  relativeLuminance,
} from "../../shared/contrast";
import { tokenFamilies, type Token } from "../../shared/tokens";
import { useScreen, type ScreenApi } from "../../shared/useScreen";

type TopicId =
  | "colors"
  | "typography"
  | "tokens"
  | "components"
  | "icons"
  | "illustrations"
  | "motion";

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
  { id: "colors", label: "配色", lead: "役割ごとに決めた色の組。", domains: ["color"] },
  {
    id: "typography",
    label: "タイポグラフィ",
    lead: "日本語 UI の書体と文字の役割。",
    domains: ["typography"],
  },
  { id: "tokens", label: "トークン", lead: "正本の値そのもの。", domains: [] },
  {
    id: "components",
    label: "コンポーネント",
    lead: "入力と操作の部品。",
    domains: ["forms-input-ux"],
  },
  { id: "icons", label: "アイコン", lead: "画面で使う記号の組。", domains: ["iconography"] },
  {
    id: "illustrations",
    label: "イラスト",
    lead: "マークと挿絵。",
    domains: ["logo-brand-identity", "illustration-svg"],
  },
  {
    id: "motion",
    label: "モーション",
    lead: "遷移と完了のフィードバック。",
    domains: ["animation-motion"],
  },
];

// 1 つの成果物が複数の domain を持つので、どの topic に入れるかを 1 つに決める。
// 正本（apps/catalog/src/content/category.ts の categoryForExperiment）と同じく、
// 成果物が frontmatter に書いた domain の順で、最初に topic へ当たるものを採る。
// topic の表示順は利用者が挙げた順にしたいので、割り当てとは分ける。
// 例: class-doc-logo は logo-brand-identity を先に書いているのでイラストに入る。
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

export default function TopicFirst() {
  const nav = useScreen("top");
  return (
    <div className="ed-root ed-root--topic">
      <a className="skip" href="#ed-main">
        本文へスキップ
      </a>
      <Masthead nav={nav} />
      <main className="ed-main" id="ed-main">
        {nav.screen === "top" && <Top nav={nav} />}
        {nav.screen === "list" && <TopicScreen nav={nav} />}
        {nav.screen === "detail" && <Detail nav={nav} />}
        {nav.screen === "sheet" && <Sheet spec={SPEC} />}
      </main>
    </div>
  );
}

function Masthead({ nav }: { nav: ScreenApi }) {
  const current = nav.screen === "list" ? nav.filter : null;
  return (
    <header className="masthead">
      <a
        className="masthead__name"
        href={nav.hrefFor({ screen: "top", item: null, filter: null })}
        onClick={(event) => {
          event.preventDefault();
          nav.go({ screen: "top", item: null, filter: null });
        }}
      >
        UI／UX 沼
      </a>
      <nav className="masthead__nav" aria-label="トピック">
        {TOPICS.map((topic) => (
          <a
            key={topic.id}
            href={nav.hrefFor({ screen: "list", filter: topic.id, item: null })}
            aria-current={current === topic.id ? "page" : undefined}
            onClick={(event) => {
              event.preventDefault();
              nav.go({ screen: "list", filter: topic.id, item: null });
            }}
          >
            {topic.label}
          </a>
        ))}
      </nav>
      <a
        className="masthead__sheet"
        href={nav.hrefFor({ screen: "sheet", item: null, filter: null })}
        aria-current={nav.screen === "sheet" ? "page" : undefined}
        onClick={(event) => {
          event.preventDefault();
          nav.go({ screen: "sheet", item: null, filter: null });
        }}
      >
        見本
      </a>
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

function TopicScreen({ nav }: { nav: ScreenApi }) {
  const topic = topicById(nav.filter) ?? TOPICS[0];
  return (
    <section className="index" aria-labelledby="index-head">
      <p className="index__kicker">トピック</p>
      <h1 className="section-title" id="index-head" tabIndex={-1} data-screen-heading>
        {topic.label}
      </h1>
      <p className="index__lead">{topic.lead}</p>
      <TopicBody topic={topic} nav={nav} />
    </section>
  );
}

/**
 * トピックの画面は中身そのものを出す。
 * 一覧を挟んで詳細へ送ると、成果物を見るまでに 2 回押すことになる。
 * 中身の形は topic ごとに違うので、描き分けはここで持つ。
 */
function TopicBody({ topic, nav }: { topic: Topic; nav: ScreenApi }) {
  if (topic.id === "tokens") return <TokenTables />;
  if (topic.id === "colors") return <ColorsTopic />;
  if (topic.id === "typography") return <TypographyTopic nav={nav} />;
  if (topic.id === "icons" || topic.id === "illustrations") {
    return <SvgTopic topic={topic} nav={nav} />;
  }
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
 * カードの帯に出す役割と、その並び。最大 7 本にする（利用者の判断、2026-09-20）。
 * 左の 4 本は accent 系で、主役の色とその変化を並べる。
 * 残る 3 本は文字、線、地から 1 つずつ取り、明度の幅を最大にする。
 * text-muted と bg-subtle を外したのは、text と bg に近い明度の帯が隣に並ぶためである。
 * 意味色（success / warning / danger）は配色をまたいでほぼ共通なので、出しても差にならない。
 * 同じ値の役割は 1 本にまとめ、役割名をスラッシュで並べる。
 * aizome のように accent と accent-strong が同じ値の配色があり、分けると同じ帯が 2 本並ぶ。
 * まとめれば色の面は重複せず、その配色が 1 色を 2 役に当てていることも読める。
 * まとめた結果、本数は 7 本以下で配色ごとに変わる。
 * 外した役割はポップアップで見せる。
 */
const CARD_ROLES = [
  "accent",
  "accent-hover",
  "accent-strong",
  "accent-subtle",
  "text",
  "border-strong",
  "bg",
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

function cardColors(scheme: Scheme, mode: "light" | "dark"): Band[] {
  const out: Band[] = [];
  const byValue = new Map<string, Band>();
  for (const role of CARD_ROLES) {
    const color = colorOf(scheme, mode, role);
    if (!color) continue;
    const found = byValue.get(color.value);
    if (found) {
      found.roles.push(role);
      continue;
    }
    const band: Band = { value: color.value, name: color.name, roles: [role] };
    byValue.set(color.value, band);
    out.push(band);
  }
  return out;
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

function ColorsTopic() {
  const [mode, setMode] = useState<"light" | "dark">("light");
  const [open, setOpen] = useState<string | null>(null);
  const { copied, copy } = useCopy();
  // 却下した配色は出さない（利用者の判断、2026-09-20）。
  // 使える配色だけを並べたほうが、選ぶ面として迷いがない。
  // 却下した 4 案は experiments/color-schemes の記録に残っている。
  const adopted = works.find((item) => item.slug === "color-schemes")?.adopted ?? [];
  const shown = adopted.length > 0 ? schemes.filter((item) => adopted.includes(item.id)) : schemes;

  return (
    <div className="topic-body">
      <Feature mode={mode} shown={shown} copy={copy} />

      <div className="palette-browse">
        <div className="palette-bar">
          <div className="mode" role="group" aria-label="明暗">
            <button
              type="button"
              className="mode__item"
              aria-pressed={mode === "light"}
              onClick={() => setMode("light")}
            >
              ライト
            </button>
            <button
              type="button"
              className="mode__item"
              aria-pressed={mode === "dark"}
              onClick={() => setMode("dark")}
            >
              ダーク
            </button>
          </div>
          <p className="palette-bar__note">帯を押すと hex をコピーする。</p>
        </div>

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
                      onClick={() => copy(band.value)}
                    >
                      <span className="band__info">
                        <span className="band__hex">{band.value}</span>
                        <span className="band__role">{band.roles.join(" / ")}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
              <div className="palette__head">
                <p className="palette__name">
                  <span className="palette__label">{scheme.label}</span>
                  <code>{scheme.id}</code>
                </p>
                <button
                  type="button"
                  className="palette__more"
                  aria-haspopup="dialog"
                  onClick={() => setOpen(scheme.id)}
                >
                  役割をすべて見る
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
  const move = (step: number) =>
    setIndex((current) => (current + step + shown.length) % shown.length);

  return (
    <section className="feature" aria-labelledby="feature-name">
      <ul className="feature__bands">
        {cardColors(scheme, mode).map((band) => (
          <li className="feature__band" key={band.value} style={{ background: band.value }}>
            <button
              type="button"
              className="feature__hit"
              style={{ color: inkOn(band.value) }}
              onClick={() => copy(band.value)}
            >
              <span className="feature__hex">{band.value}</span>
              <span className="feature__role">{band.roles.join(" / ")}</span>
              <span className="feature__jp">{band.name}</span>
            </button>
          </li>
        ))}
      </ul>
      <div className="feature__head">
        <p className="feature__name" id="feature-name">
          <span className="feature__label">{scheme.label}</span>
          <code>{scheme.id}</code>
        </p>
        <p className="feature__nav">
          <button type="button" className="feature__step" onClick={() => move(-1)}>
            前の配色
          </button>
          <span className="feature__count">
            {index + 1} / {shown.length}
          </span>
          <button type="button" className="feature__step" onClick={() => move(1)}>
            次の配色
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
              <span className="sheet-dialog__label">{scheme.label}</span>
              <code>{scheme.id}</code>
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
                    onClick={() => copy(color.value)}
                  >
                    <span className="role-item__chip" style={{ background: color.value }} />
                    <span className="role-item__role">{role}</span>
                    <span className="role-item__jp">{color.name}</span>
                    <span className="role-item__hex">{color.value}</span>
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
 * composite な token の要点だけを並べる。
 * 書体名は全役割で同じなので出さない。出すと 1 行が長くなり、役割ごとの差が読めない。
 */
function compositeMeta(value: Token["value"]): string[] {
  if (typeof value === "string") return [value];
  const out: string[] = [];
  if (value["fontSize"]) out.push(value["fontSize"]);
  if (value["fontWeight"]) out.push(value["fontWeight"]);
  if (value["lineHeight"]) out.push(`行 ${value["lineHeight"]}`);
  if (value["letterSpacing"]) out.push(`字間 ${value["letterSpacing"]}`);
  return out;
}

/* ---- タイポグラフィ。役割を実寸で組む ---- */

function TypographyTopic({ nav }: { nav: ScreenApi }) {
  const work = works.find((item) => item.slug === "product-ui-typography");
  const roles =
    tokenFamilies
      .find((family) => family.id === "typography")
      ?.tokens.filter((token) => token.kind === "semantic") ?? [];
  return (
    <div className="topic-body">
      <ol className="roles">
        {roles.map((token) => (
          <li className="role" key={token.path}>
            <p className="role__meta">
              <span className="role__name">{token.path.replace("typography.", "")}</span>
              {compositeMeta(token.value).map((item) => (
                <span key={item}>{item}</span>
              ))}
            </p>
            <p className="role__sample">
              <TokenSample token={token} />
            </p>
            <p className="role__desc">{token.description}</p>
          </li>
        ))}
      </ol>
      {work && (
        <div className="work">
          <WorkHead work={work} nav={nav} />
          <LiveBlock work={work} />
        </div>
      )}
    </div>
  );
}

/* ---- アイコンと図。SVG そのものを並べる ---- */

function SvgTopic({ topic, nav }: { topic: Topic; nav: ScreenApi }) {
  const list = worksIn(topic.id);
  if (list.length === 0) return <p className="empty">まだ成果物がない。</p>;
  return (
    <div className="topic-body">
      {list.map((work) => (
        <SvgWork key={work.slug} work={work} nav={nav} large={topic.id === "illustrations"} />
      ))}
    </div>
  );
}

function SvgWork({ work, nav, large }: { work: Work; nav: ScreenApi; large: boolean }) {
  const [current, setCurrent] = useState(defaultVariant(work));
  const assets = svgsFor(work.slug, current);
  return (
    <div className="work">
      <WorkHead work={work} nav={nav} />
      <VariantChips work={work} current={current} onSelect={setCurrent} />
      {assets.length === 0 ? (
        <p className="empty">この variant に配布用の SVG がない。</p>
      ) : (
        <ul className={large ? "svg-grid svg-grid--large" : "svg-grid"}>
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
        あAaＡ 日本語 UI
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
        あAaＡ 日本語
      </span>
    );
  }
  if (token.path.startsWith("font.weight.")) {
    return (
      <span className="token-table__sample" style={{ fontWeight: Number(text) }}>
        あAaＡ 日本語 UI
      </span>
    );
  }
  if (token.path.startsWith("font.family.")) {
    return (
      <span className="token-table__sample" style={{ fontFamily: text }}>
        あAaＡ 日本語 UI
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
