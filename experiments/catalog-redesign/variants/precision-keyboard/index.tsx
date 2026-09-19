import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { SPECIMENS, specimenById, type Screen, type Specimen } from "../../specimens";
import "./variant.css";

export default function PrecisionKeyboard() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeId, setActiveId] = useState(SPECIMENS[0].id);
  const [query, setQuery] = useState("");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const searchRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SPECIMENS;
    return SPECIMENS.filter((item) =>
      `${item.title} ${item.kind} ${item.role} ${item.source}`.toLowerCase().includes(q),
    );
  }, [query]);

  useEffect(() => {
    setCursor(0);
  }, [query, paletteOpen]);

  useEffect(() => {
    const onWindow = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onWindow);
    return () => window.removeEventListener("keydown", onWindow);
  }, []);

  function openDetail(id: string) {
    setActiveId(id);
    setScreen("detail");
    setPaletteOpen(false);
  }

  function onListKey(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((value) => Math.min(value + 1, filtered.length - 1));
    }
    if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((value) => Math.max(value - 1, 0));
    }
    if (event.key === "Enter" && filtered[cursor]) openDetail(filtered[cursor].id);
    if (event.key === "Escape") {
      if (paletteOpen) setPaletteOpen(false);
      else if (screen !== "home") setScreen("home");
    }
  }

  const specimen = specimenById(activeId) ?? SPECIMENS[0];

  return (
    <div className="pk" onKeyDown={onListKey}>
      <header className="pk-bar">
        <p className="pk-brand">UI/UX 沼</p>
        <nav className="pk-nav" aria-label="主要">
          <button
            type="button"
            className={screen === "home" ? "is-on" : ""}
            onClick={() => setScreen("home")}
          >
            トップ
          </button>
          <button
            type="button"
            className={screen === "list" ? "is-on" : ""}
            onClick={() => setScreen("list")}
          >
            一覧
          </button>
        </nav>
        <button type="button" className="pk-kbtn" onClick={() => setPaletteOpen(true)}>
          検索
          <kbd>⌘K</kbd>
        </button>
      </header>

      {screen === "home" && (
        <main className="pk-main">
          <h1>成果物へ、キー 1 つ。</h1>
          <p className="pk-lead">コマンドで絞り、標本を触る。説明は後回し。</p>
          <ul className="pk-rows" role="listbox" aria-label="標本">
            {SPECIMENS.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={cursor === index}
                  className={cursor === index ? "is-on" : ""}
                  onClick={() => openDetail(item.id)}
                  onMouseEnter={() => setCursor(index)}
                >
                  <span className="pk-kind">{item.kind}</span>
                  <span>{item.title}</span>
                  <span className="pk-meta">
                    {item.role} · {item.maturity}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "list" && (
        <main className="pk-main">
          <h1>一覧</h1>
          <label className="pk-filter">
            絞り込み
            <input
              ref={searchRef}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              autoComplete="off"
            />
          </label>
          <ul className="pk-rows" role="listbox" aria-label="絞り込み結果">
            {filtered.map((item, index) => (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  aria-selected={cursor === index}
                  className={cursor === index ? "is-on" : ""}
                  onClick={() => openDetail(item.id)}
                >
                  <span className="pk-kind">{item.kind}</span>
                  <span>{item.title}</span>
                  <span className="pk-meta">
                    {item.role} · {item.maturity}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "detail" && (
        <main className="pk-main">
          <p className="pk-crumb">
            <button type="button" onClick={() => setScreen("list")}>
              一覧
            </button>
            <span aria-hidden="true"> / </span>
            {specimen.title}
          </p>
          <h1>{specimen.title}</h1>
          <Live specimen={specimen} />
          <dl className="pk-dl">
            <div>
              <dt>role</dt>
              <dd>{specimen.role}</dd>
            </div>
            <div>
              <dt>maturity</dt>
              <dd>{specimen.maturity}</dd>
            </div>
            <div>
              <dt>platform</dt>
              <dd>{specimen.platforms.join(", ")}</dd>
            </div>
            <div>
              <dt>source</dt>
              <dd>{specimen.source}</dd>
            </div>
          </dl>
        </main>
      )}

      {paletteOpen && (
        <div
          className="pk-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pk-palette-title"
        >
          <div className="pk-palette">
            <h2 id="pk-palette-title">コマンド</h2>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="標本、role、source"
              autoFocus
              aria-label="コマンド検索"
            />
            <ul role="listbox" aria-label="候補">
              {filtered.map((item, index) => (
                <li key={item.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={cursor === index}
                    className={cursor === index ? "is-on" : ""}
                    onClick={() => openDetail(item.id)}
                  >
                    {item.title}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function Live({ specimen }: { specimen: Specimen }) {
  const [sent, setSent] = useState(false);
  return (
    <section className="pk-live" aria-labelledby="pk-live-heading">
      <h2 id="pk-live-heading">Live specimen</h2>
      <p className="pk-kind">{specimen.kind}</p>
      <div className="pk-type" data-specimen={specimen.id}>
        <p className="pk-sample-title">設定</p>
        <p className="pk-sample-body">{specimen.summary}</p>
        <button type="button" onClick={() => setSent((value) => !value)}>
          {sent ? "戻す" : "送信して確かめる"}
        </button>
        {sent && (
          <p className="pk-ok" role="status">
            完了。次はメールを確認してください。
          </p>
        )}
      </div>
    </section>
  );
}
