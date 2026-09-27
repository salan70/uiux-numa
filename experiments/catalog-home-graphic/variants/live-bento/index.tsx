import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Frame } from "../../shared/Frame";
import { HOME_TOPICS, ICON_SVGS, SCHEME_SWATCHES, type HomeTopic } from "../../shared/home";
import { Lockup } from "../../shared/Lockup";
import { PauseButton, useOnScreen, useReducedMotion } from "../../shared/playback";
import "./variant.css";

/**
 * 一定の間隔で 0..count-1 を巡る番号。止めている間と画面外では進めない。
 * 動きを減らす設定では 0 に留める。
 */
function useCycle(count: number, ms: number, running: boolean): number {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => setIndex((value) => (value + 1) % count), ms);
    return () => window.clearInterval(timer);
  }, [count, ms, running]);
  return index;
}

/** 背景色に対して読める字の色を、相対輝度で墨か紙に決める。 */
function textOn(hex: string): string {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.36 ? "#1f1f1f" : "#fffdf9";
}

// ---------- 見本 ----------

function ColorsSpecimen({ running }: { running: boolean }) {
  const focus = useCycle(SCHEME_SWATCHES.length, 1700, running);
  return (
    <div className="lb-colors">
      {SCHEME_SWATCHES.map((scheme, index) => (
        <span
          key={scheme.id}
          className="lb-colors__stripe"
          data-focus={index === focus || undefined}
          style={{ background: scheme.primary, color: textOn(scheme.primary) } as CSSProperties}
        >
          <span className="lb-colors__name">
            {scheme.name}
            <small>{scheme.primary.toUpperCase()}</small>
          </span>
        </span>
      ))}
    </div>
  );
}

const GLYPHS = [
  { glyph: "あ", note: "LINE Seed JP / Bold" },
  { glyph: "Aa", note: "欧文も同じ書体" },
  { glyph: "永", note: "字面は大きめ" },
  { glyph: "88", note: "tabular-nums" },
];

function TypeSpecimen({ running }: { running: boolean }) {
  const index = useCycle(GLYPHS.length, 2400, running);
  return (
    <div className="lb-type">
      <span className="lb-type__guides" aria-hidden="true">
        <span />
        <span />
        <span />
      </span>
      {/* key を替えて入場の動きを毎回やり直す。 */}
      <span className="lb-type__glyph" key={index}>
        {GLYPHS[index].glyph}
      </span>
      <span className="lb-type__note" key={`n${index}`}>
        {GLYPHS[index].note}
      </span>
    </div>
  );
}

const RADII = [
  { name: "radius-xs", value: "0.125rem" },
  { name: "radius-sm", value: "0.375rem" },
  { name: "radius-md", value: "0.625rem" },
  { name: "radius-full", value: "9999px" },
];

function TokensSpecimen({ running }: { running: boolean }) {
  const index = useCycle(RADII.length, 1500, running);
  const radius = RADII[index];
  return (
    <div className="lb-tokens">
      <span className="lb-tokens__shape" style={{ borderRadius: `var(--${radius.name})` }} />
      <span className="lb-tokens__readout">
        <code>--{radius.name}</code>
        <span>{radius.value}</span>
      </span>
      <span className="lb-tokens__steps" aria-hidden="true">
        {RADII.map((item, i) => (
          <span key={item.name} data-on={i === index || undefined} />
        ))}
      </span>
    </div>
  );
}

function ComponentsSpecimen() {
  return (
    <div className="lb-comp">
      <span className="lb-comp__button">
        <span className="lb-comp__label lb-comp__label--idle">保存する</span>
        <span className="lb-comp__label lb-comp__label--busy">
          <span className="lb-comp__spinner" />
          保存中
        </span>
        <span className="lb-comp__label lb-comp__label--done">保存しました</span>
      </span>
      <svg className="lb-comp__cursor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M5 3.5 19 12l-6.2 1.6L9.6 20Z" />
      </svg>
    </div>
  );
}

// 1 つの組（class-tech-icons の line-round）に揃え、線幅と端の規則が同じ字画を並べる。
const ICON_NAMES = ["code", "terminal", "branch", "test", "database", "api", "web", "ai"];

function IconsSpecimen() {
  const ref = useRef<HTMLDivElement>(null);
  // 配布用 SVG には pathLength が無いので、線を引く動きのために差し込む。
  useLayoutEffect(() => {
    ref.current?.querySelectorAll("path, circle, rect").forEach((shape) => {
      shape.setAttribute("pathLength", "1");
    });
  }, []);
  const icons = ICON_NAMES.flatMap((name) =>
    ICON_SVGS.filter((icon) => icon.name === name).slice(0, 1),
  );
  return (
    <div className="lb-icons" ref={ref}>
      {icons.map((icon, index) => (
        <span
          key={icon.name}
          className="lb-icons__icon"
          style={{ "--k": index } as CSSProperties}
          dangerouslySetInnerHTML={{ __html: icon.svg }}
        />
      ))}
    </div>
  );
}

function MotionSpecimen() {
  return (
    <div className="lb-motion">
      {[
        { name: "linear", className: "lb-motion__ball--linear" },
        { name: "easing-entrance", className: "lb-motion__ball--entrance" },
      ].map((lane) => (
        <span className="lb-motion__lane" key={lane.name}>
          <code>{lane.name}</code>
          <span className="lb-motion__track">
            <span className={`lb-motion__ball ${lane.className}`} />
          </span>
        </span>
      ))}
    </div>
  );
}

function specimenFor(topic: HomeTopic, running: boolean): ReactNode {
  switch (topic.id) {
    case "colors":
      return <ColorsSpecimen running={running} />;
    case "typography":
      return <TypeSpecimen running={running} />;
    case "tokens":
      return <TokensSpecimen running={running} />;
    case "components":
      return <ComponentsSpecimen />;
    case "icons":
      return <IconsSpecimen />;
    case "motion":
      return <MotionSpecimen />;
  }
}

function Cell({ topic, index, running }: { topic: HomeTopic; index: number; running: boolean }) {
  return (
    <li className={`lb-cell lb-cell--${topic.id}`} style={{ "--i": index + 1 } as CSSProperties}>
      <a className="lb-cell__link" href={topic.href}>
        <span className="lb-cell__stage" aria-hidden="true">
          {specimenFor(topic, running)}
        </span>
        <span className="lb-cell__caption">
          <span className="lb-cell__label">{topic.label}</span>
          <span className="lb-cell__lead">{topic.lead}</span>
          <span className="lb-cell__count">{topic.count}</span>
        </span>
      </a>
    </li>
  );
}

/**
 * 1 枚の格子に、題字の面と 6 つの topic の面を詰める。
 * 各面では、その topic の成果物そのもの（配色、書体、token、部品、アイコン、曲線）が短い周期で動き続ける。
 * 飾りの絵を描かず、成果物の実物を動かして見せる。
 */
export default function Variant() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const [grid, setGrid] = useState<HTMLElement | null>(null);
  const onScreen = useOnScreen(grid);
  const running = onScreen && !paused && !reduce;

  return (
    <Frame variantClass="lb">
      <section
        className="lb-page"
        ref={setGrid}
        aria-labelledby="lb-title"
        data-paused={!running || undefined}
      >
        <div className="lb-grid">
          <div className="lb-cell lb-cell--hero" style={{ "--i": 0 } as CSSProperties}>
            <div className="lb-hero">
              <h1 className="lb-hero__title" id="lb-title">
                <Lockup className="lb-lockup" />
                {/* 句点の位置から広がる波紋。位置は lockup の座標から求めている（variant.css）。 */}
                <svg className="lb-hero__ripples" aria-hidden="true" focusable="false">
                  <circle />
                  <circle />
                  <circle />
                </svg>
                <span className="hg-label">UI/UX NUMA</span>
              </h1>
              <p className="lb-hero__tagline">
                UI/UX とプロダクト体験を、AI エージェントと探索する。
              </p>
              <div className="lb-hero__foot">
                <p className="lb-hero__works" aria-hidden="true">
                  WORKS <span>{HOME_TOPICS.length}</span>
                </p>
                {!reduce && (
                  <PauseButton
                    className="hg-pause lb-pause"
                    paused={paused}
                    onToggle={() => setPaused((value) => !value)}
                  />
                )}
              </div>
            </div>
          </div>
          <h2 className="hg-label">WORKS</h2>
          {/* 題字の面と同じ格子に並べるため、一覧の箱は display: contents にする。 */}
          <ul className="lb-list">
            {HOME_TOPICS.map((topic, index) => (
              <Cell key={topic.id} topic={topic} index={index} running={running} />
            ))}
          </ul>
        </div>
      </section>
    </Frame>
  );
}
