import { useEffect, useState, useSyncExternalStore } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";

function subscribeReduce(onChange: () => void) {
  const query = window.matchMedia(REDUCE);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** 端末の「視差効果を減らす」。変更にも追従する。 */
export function useReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeReduce,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  );
}

/**
 * 要素が画面に入っていて、タブが表に出ているか。
 * 画面外とタブの裏では繰り返しの動きを止め、描画の負荷を残さない。
 */
export function useOnScreen(element: Element | null, rootMargin = "0px"): boolean {
  const [intersecting, setIntersecting] = useState(false);
  const [visible, setVisible] = useState(() => !document.hidden);

  useEffect(() => {
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setIntersecting(entry.isIntersecting), {
      rootMargin,
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, rootMargin]);

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden);
    document.addEventListener("visibilitychange", onChange);
    return () => document.removeEventListener("visibilitychange", onChange);
  }, []);

  return intersecting && visible;
}

/**
 * 繰り返しの動きを止める操作。5 秒を超えて自動で動くものには常に置く（WCAG 2.2.2）。
 * 押し先の寸法は状態で変えず、印と名前だけを替える。
 */
export function PauseButton({
  paused,
  onToggle,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={className}
      aria-pressed={paused}
      aria-label={paused ? "動きを再生する" : "動きを止める"}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        {paused ? <path d="M8.25 6.75v10.5L17.25 12Z" /> : <path d="M9 6.75v10.5m6-10.5v10.5" />}
      </svg>
    </button>
  );
}
