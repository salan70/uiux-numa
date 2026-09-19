import { useState } from "react";
import { SPECIMENS, specimenById, type Screen, type Specimen } from "../../specimens";
import "./variant.css";

export default function PlayfulChroma() {
  const [screen, setScreen] = useState<Screen>("home");
  const [activeId, setActiveId] = useState(SPECIMENS[0].id);
  const specimen = specimenById(activeId) ?? SPECIMENS[0];

  function openDetail(id: string) {
    setActiveId(id);
    setScreen("detail");
  }

  return (
    <div className="pc">
      <header className="pc-bar">
        <p className="pc-brand">沼の見本</p>
        <nav aria-label="主要">
          <button
            type="button"
            className={screen === "home" ? "is-on" : ""}
            onClick={() => setScreen("home")}
          >
            入口
          </button>
          <button
            type="button"
            className={screen === "list" ? "is-on" : ""}
            onClick={() => setScreen("list")}
          >
            棚
          </button>
        </nav>
      </header>

      {screen === "home" && (
        <main className="pc-main">
          <h1>触ってから、名前を覚える。</h1>
          <p className="pc-lead">紙は静かにしない。標本が先に色を出す。</p>
          <ul className="pc-cards">
            {SPECIMENS.map((item) => (
              <li key={item.id} data-role={item.role}>
                <button type="button" onClick={() => openDetail(item.id)}>
                  <span className="pc-chip">{item.kind}</span>
                  <strong>{item.title}</strong>
                  <span className="pc-meta">
                    {item.role} · {item.maturity}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "list" && (
        <main className="pc-main">
          <h1>棚</h1>
          <ul className="pc-shelf">
            {SPECIMENS.map((item) => (
              <li key={item.id} data-role={item.role}>
                <button type="button" onClick={() => openDetail(item.id)}>
                  <strong>{item.title}</strong>
                  <span>
                    {item.role} / {item.maturity} / {item.source}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </main>
      )}

      {screen === "detail" && (
        <main className="pc-main">
          <p>
            <button type="button" className="pc-back" onClick={() => setScreen("list")}>
              棚へ戻る
            </button>
          </p>
          <h1>{specimen.title}</h1>
          <Live specimen={specimen} />
          <p className="pc-foot">
            使ってよい印は {specimen.maturity}。由来は {specimen.source}。
          </p>
        </main>
      )}
    </div>
  );
}

function Live({ specimen }: { specimen: Specimen }) {
  const [sent, setSent] = useState(false);
  return (
    <section className="pc-live" data-role={specimen.role} aria-labelledby="pc-live-heading">
      <h2 id="pc-live-heading">いま触れる見本</h2>
      <p className="pc-sample-title">設定</p>
      <p>{specimen.summary}</p>
      <button type="button" onClick={() => setSent((value) => !value)}>
        {sent ? "もとに戻す" : "送信してみる"}
      </button>
      {sent && (
        <p role="status" className="pc-ok">
          届いた。ちょっとした喜び。
        </p>
      )}
    </section>
  );
}
