import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type RefObject,
} from "react";
import { Frame } from "../../shared/Frame";
import { HOME_TOPICS, ICON_SVGS, SCHEME_SWATCHES, type HomeTopic } from "../../shared/home";
import { Lockup } from "../../shared/Lockup";
import { PauseButton, useOnScreen, useReducedMotion } from "../../shared/playback";
import "./variant.css";

// 背景に流す語。topic の名前をそのまま使い、飾りの語を新しく作らない。
const WORDS = HOME_TOPICS.map((topic) => topic.label.toUpperCase());

// 段ごとの向き、1 周の秒数、字の塗り。隣り合う段を逆向きにし、周期を揃えない。
const ROWS = [
  { direction: 1, seconds: 38, fill: "outline" },
  { direction: -1, seconds: 30, fill: "solid" },
  { direction: 1, seconds: 44, fill: "outline" },
  { direction: -1, seconds: 34, fill: "outline" },
] as const;

/**
 * 1 段の語の帯。語の並びを 2 回並べ、CSS animation で半分ずらして継ぎ目なく流す。
 * 語の間の区切りはマークの点と同じ色の丸にする。
 */
function WordRow({ index }: { index: number }) {
  const row = ROWS[index];
  // 段ごとに始まりの語をずらし、縦に同じ語が揃わないようにする。
  const words = [...WORDS.slice(index + 1), ...WORDS.slice(0, index + 1)];
  const group = (
    <span className="kt-row__group">
      {words.map((word) => (
        <span className="kt-row__word" key={word}>
          {word}
          <span className="kt-row__dot" />
        </span>
      ))}
    </span>
  );
  return (
    <div
      className={`kt-row kt-row--${row.fill}`}
      style={
        {
          "--row-seconds": `${row.seconds}s`,
          "--row-direction": row.direction === 1 ? "normal" : "reverse",
          "--row-i": index,
        } as CSSProperties
      }
    >
      <div className="kt-row__track">
        {group}
        {group}
      </div>
    </div>
  );
}

/**
 * スクロールの速さで帯を傾ける。止まると傾きは 0 へ戻る。
 * 傾きは各段の要素へ直接書く（親の変数で子の transform を一括駆動しない）。
 */
function useScrollSkew(rows: RefObject<HTMLDivElement | null>, enabled: boolean) {
  useEffect(() => {
    const container = rows.current;
    if (!container || !enabled) return;
    const targets = Array.from(container.querySelectorAll<HTMLElement>(".kt-row"));
    let frame = 0;
    let lastY = window.scrollY;
    let lastT = performance.now();
    let skew = 0;

    const tick = (now: number) => {
      const dt = Math.max(1, now - lastT);
      const velocity = (window.scrollY - lastY) / dt; // px/ms
      lastY = window.scrollY;
      lastT = now;
      // 速さ 1px/ms で 6 度。上限は 10 度にし、字が読めなくなるほど倒さない。
      const target = Math.max(-10, Math.min(10, velocity * 6));
      skew += (target - skew) * 0.18;
      targets.forEach((element, index) => {
        const sign = index % 2 === 0 ? 1 : -1;
        element.style.transform = `skewX(${(skew * sign).toFixed(2)}deg)`;
      });
      if (Math.abs(skew) > 0.02 || Math.abs(target) > 0.02) {
        frame = requestAnimationFrame(tick);
      } else {
        targets.forEach((element) => (element.style.transform = ""));
        frame = 0;
      }
    };

    const onScroll = () => {
      if (frame) return;
      lastY = window.scrollY;
      lastT = performance.now();
      frame = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
      targets.forEach((element) => (element.style.transform = ""));
    };
  }, [rows, enabled]);
}

/** 画面に入ったら 1 回だけ印を立てる。入場の動きはこの印から CSS が始める。 */
function useSeen<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element || seen) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [seen]);
  return [ref, seen];
}

/** 行の右に出す、topic の中身を 1 つの図にした見本。行が選ばれると差し込まれる。 */
function Specimen({ topic }: { topic: HomeTopic }): ReactNode {
  switch (topic.id) {
    case "colors":
      return (
        <span className="kt-spec kt-spec--colors">
          {SCHEME_SWATCHES.map((scheme, index) => (
            <span
              key={scheme.id}
              style={{ background: scheme.primary, "--s": index } as CSSProperties}
            />
          ))}
        </span>
      );
    case "typography":
      return <span className="kt-spec kt-spec--type">あA</span>;
    case "tokens":
      return (
        <span className="kt-spec kt-spec--tokens">
          {["var(--radius-xs)", "var(--radius-sm)", "var(--radius-md)", "var(--radius-full)"].map(
            (radius, index) => (
              <span key={radius} style={{ borderRadius: radius, "--s": index } as CSSProperties} />
            ),
          )}
        </span>
      );
    case "components":
      return (
        <span className="kt-spec kt-spec--components">
          <span>保存する</span>
        </span>
      );
    case "icons":
      return (
        <span className="kt-spec kt-spec--icons">
          {["code", "check", "terminal", "scheme"].map((name, index) => {
            const icon = ICON_SVGS.find((item) => item.name === name);
            return icon ? (
              <span
                key={name}
                style={{ "--s": index } as CSSProperties}
                dangerouslySetInnerHTML={{ __html: icon.svg }}
              />
            ) : null;
          })}
        </span>
      );
    case "motion":
      return (
        <span className="kt-spec kt-spec--motion">
          <span className="kt-spec__track">
            <span className="kt-spec__ball" />
          </span>
        </span>
      );
  }
}

function IndexRow({ topic, index }: { topic: HomeTopic; index: number }) {
  const [ref, seen] = useSeen<HTMLLIElement>();
  return (
    <li
      ref={ref}
      className="kt-index__item"
      data-seen={seen || undefined}
      style={{ "--i": index } as CSSProperties}
    >
      <a className="kt-index__link" href={topic.href}>
        <span className="kt-index__num" aria-hidden="true">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="kt-index__mask">
          <span className="kt-index__label">{topic.label}</span>
        </span>
        <span className="kt-index__meta">
          <span className="kt-index__lead">{topic.lead}</span>
          <span className="kt-index__count">{topic.count}</span>
        </span>
        <span className="kt-index__spec" aria-hidden="true">
          <Specimen topic={topic} />
        </span>
      </a>
    </li>
  );
}

/**
 * 大きな字の帯が斜めに流れる地の上に lockup を刷り、下に topic の索引を大きな字で並べる。
 * 図は字そのもので作り、色は墨と点の赤の 2 つに絞る。
 */
export default function Variant() {
  const reduce = useReducedMotion();
  const [paused, setPaused] = useState(false);
  const rowsRef = useRef<HTMLDivElement>(null);
  const [hero, setHero] = useState<HTMLElement | null>(null);
  const onScreen = useOnScreen(hero);
  useScrollSkew(rowsRef, !reduce && !paused);

  return (
    <Frame variantClass="kt">
      <div>
        <section
          className="kt-hero"
          ref={setHero}
          aria-labelledby="kt-title"
          data-paused={paused || !onScreen || undefined}
        >
          <div className="kt-rows" ref={rowsRef} aria-hidden="true">
            {ROWS.map((_, index) => (
              <WordRow key={index} index={index} />
            ))}
          </div>

          <div className="kt-plate">
            <h1 className="kt-title" id="kt-title">
              <Lockup className="kt-lockup" rings />
              <span className="hg-label">UI/UX NUMA</span>
            </h1>
            <p className="kt-tagline">
              <span>UI/UX とプロダクト体験を、</span>
              <span>AI エージェントと探索する。</span>
            </p>
          </div>

          <div className="kt-hero__foot">
            <span className="kt-scroll" aria-hidden="true">
              SCROLL
              <span className="kt-scroll__line" />
            </span>
            {!reduce && (
              <PauseButton
                className="hg-pause"
                paused={paused}
                onToggle={() => setPaused((value) => !value)}
              />
            )}
          </div>
        </section>

        <section className="kt-index" aria-labelledby="kt-works">
          <h2 className="kt-index__head" id="kt-works">
            WORKS
            <span className="kt-index__total">{HOME_TOPICS.length} topics</span>
          </h2>
          <ol className="kt-index__list">
            {HOME_TOPICS.map((topic, index) => (
              <IndexRow key={topic.id} topic={topic} index={index} />
            ))}
          </ol>
        </section>
      </div>
    </Frame>
  );
}
