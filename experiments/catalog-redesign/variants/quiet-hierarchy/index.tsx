import { useState } from "react";
import { SPECIMENS, specimenById, type Screen, type Specimen } from "../../specimens";
import "./variant.css";

export default function QuietHierarchy() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeId, setActiveId] = useState(SPECIMENS[0].id);
  const specimen = specimenById(activeId) ?? SPECIMENS[0];

  function openDetail(id: string) {
    setActiveId(id);
    setScreen("detail");
  }

  return (
    <div className="qh">
      <header className="qh-bar">
        <p className="qh-brand">UI/UX 沼</p>
        <nav aria-label="主要">
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
      </header>

      {screen === "home" && (
        <main className="qh-main">
          <p className="qh-kicker">成果物を、ひとつずつ。</p>
          <h1>{SPECIMENS[0].title}</h1>
          <Live specimen={SPECIMENS[0]} large />
          <ul className="qh-more">
            {SPECIMENS.slice(1).map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => openDetail(item.id)}>
                  {item.title}
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "list" && (
        <main className="qh-main">
          <h1>一覧</h1>
          <ul className="qh-index">
            {SPECIMENS.map((item) => (
              <li key={item.id}>
                <button type="button" onClick={() => openDetail(item.id)}>
                  <span className="qh-kind">{item.kind}</span>
                  <strong>{item.title}</strong>
                  <span>
                    {item.role} · {item.maturity}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "detail" && (
        <main className="qh-main">
          <p className="qh-crumb">
            <button type="button" onClick={() => setScreen("list")}>
              一覧
            </button>
          </p>
          <h1>{specimen.title}</h1>
          <Live specimen={specimen} large />
          <p className="qh-note">
            {specimen.role} / {specimen.maturity} / {specimen.platforms.join(", ")} /{" "}
            {specimen.source}
          </p>
        </main>
      )}
    </div>
  );
}

function Live({ specimen, large }: { specimen: Specimen; large?: boolean }) {
  const [sent, setSent] = useState(false);
  return (
    <section className={large ? "qh-live is-large" : "qh-live"} aria-labelledby="qh-live-heading">
      <h2 id="qh-live-heading">{specimen.kind}</h2>
      <p className="qh-sample-title">設定</p>
      <p>{specimen.summary}</p>
      <button type="button" onClick={() => setSent((value) => !value)}>
        {sent ? "戻す" : "送信して確かめる"}
      </button>
      {sent && (
        <p role="status" className="qh-ok">
          完了しました。
        </p>
      )}
    </section>
  );
}
