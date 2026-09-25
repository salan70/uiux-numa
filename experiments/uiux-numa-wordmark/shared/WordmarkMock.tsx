import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import mark from "../../uiux-numa-logo/variants/nu-dot/dist/mark.svg?raw";
import "./mock.css";

// 同じ asset を 1 画面に何度も置くので、part-* の id は class へ書き換える（uiux-numa-logo の Mark と同じ扱い）。
const inline = (svg: string) => ({ __html: svg.replaceAll('id="part-', 'class="part-') });

type Props = {
  /** 配布用の wordmark。 */
  wordmark: string;
  /** 点を落とし始める字の番号（0 始まり）。その字を引き終える少し前に落とし始める。 */
  dotAfter: number;
};

/**
 * wordmark をマークと並べ、Catalog でロゴが出る面に置くモック。2 案で同一にし、差は wordmark の SVG だけにする。
 * 動きの有る版と無い版を両方置く。点はどの版でも残す。
 */
export function WordmarkMock({ wordmark, dotAfter }: Props) {
  const [play, setPlay] = useState(0);
  return (
    <main className="wm-mock">
      <section className="wm-sidebar" aria-label="サイドバーの題字">
        <Lockup wordmark={wordmark} dotAfter={dotAfter} />
      </section>

      <section className="wm-hero" aria-label="ホームの大見出し（動きあり）">
        <Lockup key={play} wordmark={wordmark} dotAfter={dotAfter} animated />
        <button type="button" className="wm-replay" onClick={() => setPlay((n) => n + 1)}>
          もう一度再生
        </button>
      </section>

      <section className="wm-hero" aria-label="ホームの大見出し（動きなし）">
        <Lockup wordmark={wordmark} dotAfter={dotAfter} />
      </section>

      <section className="wm-sizes" aria-label="縮小">
        {[16, 24, 48].map((size) => (
          <span key={size} className="wm-size" style={{ "--h": `${size}px` } as CSSProperties}>
            <span className="wm-wordmark" dangerouslySetInnerHTML={inline(wordmark)} />
          </span>
        ))}
      </section>

      <section className="wm-dark" aria-label="暗い面">
        <Lockup wordmark={wordmark} dotAfter={dotAfter} />
      </section>
    </main>
  );
}

/** マーク + wordmark。animated では字を 1 字ずつ引き、点を落とす。 */
function Lockup({ wordmark, dotAfter, animated = false }: Props & { animated?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);

  // 線を引く動きには字ごとの長さが要る。配布用 SVG に pathLength を持たせず、描いたあとに測って変数で渡す。
  useLayoutEffect(() => {
    const root = ref.current;
    if (!root || !animated) return;
    root
      .querySelectorAll<SVGPathElement>(".wm-wordmark path, .wm-mark path")
      .forEach((path, index) => {
        const length = path.getTotalLength();
        path.style.setProperty("--len", String(length));
        path.style.setProperty("--start", String(length + 0.5));
        path.style.setProperty("--i", String(index));
      });
    root.style.setProperty("--dot-after", String(dotAfter));
  }, [animated, dotAfter]);

  return (
    <span ref={ref} className={animated ? "wm-lockup wm-lockup--enter" : "wm-lockup"}>
      <span className="wm-mark" dangerouslySetInnerHTML={inline(mark)} />
      <span className="wm-wordmark" dangerouslySetInnerHTML={inline(wordmark)} />
    </span>
  );
}
