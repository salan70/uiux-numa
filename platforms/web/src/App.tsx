import { lazy, Suspense, useEffect, useMemo, useState, type ComponentType } from "react";

// 実行基盤の責務は experiments/<slug>/variants/<id>/index.tsx を列挙して描画することだけ。
// URL の hash `#<slug>/<id>` で variant を選ぶ。`?bare` を付けると一覧を隠し、preview 撮影に使う。
const modules = import.meta.glob<{ default: ComponentType }>(
  "../../../experiments/*/variants/*/index.tsx",
);

type Entry = { key: string; experiment: string; variant: string };

const entries: Entry[] = Object.keys(modules)
  .flatMap((key) => {
    const m = key.match(/experiments\/([^/]+)\/variants\/([^/]+)\/index\.tsx$/);
    return m ? [{ key, experiment: m[1], variant: m[2] }] : [];
  })
  .sort((a, b) => a.key.localeCompare(b.key));

function useHash(): string {
  const [hash, setHash] = useState(() => window.location.hash.slice(1));
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.slice(1));
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

export function App() {
  const hash = useHash();
  const bare = new URLSearchParams(window.location.search).has("bare");
  const selected = entries.find((e) => `${e.experiment}/${e.variant}` === hash);
  const Variant = useMemo(() => (selected ? lazy(modules[selected.key]) : null), [selected]);

  return (
    <>
      {!bare && (
        <nav className="runner-nav" aria-label="variant 一覧">
          <ul>
            {entries.map((e) => (
              <li key={e.key}>
                <a
                  href={`#${e.experiment}/${e.variant}`}
                  aria-current={selected?.key === e.key ? "page" : undefined}
                >
                  {e.experiment} / {e.variant}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
      <main className="runner-main">
        {Variant ? (
          <Suspense fallback={<p>読み込み中</p>}>
            <Variant />
          </Suspense>
        ) : (
          <p>variant を選択してください。</p>
        )}
      </main>
    </>
  );
}
