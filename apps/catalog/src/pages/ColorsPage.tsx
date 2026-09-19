import { useEffect, useState } from "react";
import { SchemeSwatch } from "../components/SchemeSwatch";
import { catalog } from "../content/collect";
import { PREFERENCE_EVENT, readSchemeChoice } from "../theme";

export function ColorsPage() {
  const [selected, setSelected] = useState(readSchemeChoice);
  const current = catalog.schemes.find((scheme) => scheme.id === selected) ?? catalog.schemes[0];

  useEffect(() => {
    const onChange = (event: Event) => {
      const detail = (event as CustomEvent<{ scheme?: string }>).detail;
      if (detail.scheme) setSelected(detail.scheme);
    };
    window.addEventListener(PREFERENCE_EVENT, onChange);
    return () => window.removeEventListener(PREFERENCE_EVENT, onChange);
  }, []);

  return (
    <>
      <div className="page-intro">
        <p className="eyebrow">Colors</p>
        <h1>配色</h1>
        <p className="lede">role ごとの色面と和名を、ライト / ダークで並べる。</p>
      </div>
      {current && (
        <section className="scheme-live" aria-labelledby="scheme-live-heading">
          <p className="eyebrow">selected scheme</p>
          <h2 id="scheme-live-heading">
            {current.id} <span className="meta">（{current.label}）</span>
          </h2>
          <div className="scheme-live-sample">
            <p>現在の配色はサイト全体に反映されている。</p>
            <div className="scheme-live-actions">
              <button type="button">主ボタン</button>
              <span>本文と surface の組み合わせ</span>
            </div>
          </div>
        </section>
      )}
      <div className="scheme-list">
        {catalog.schemes.map((scheme) => (
          <article className="scheme-card" key={scheme.id}>
            <header>
              <h2>
                {scheme.id} <span className="meta">（{scheme.label}）</span>
              </h2>
            </header>
            <div className="scheme-modes">
              <section aria-labelledby={`${scheme.id}-light-heading`}>
                <h3 id={`${scheme.id}-light-heading`}>light</h3>
                <div className="scheme-swatches">
                  {scheme.light.map((color) => (
                    <SchemeSwatch color={color} key={color.cssName} />
                  ))}
                </div>
              </section>
              <section aria-labelledby={`${scheme.id}-dark-heading`}>
                <h3 id={`${scheme.id}-dark-heading`}>dark</h3>
                <div className="scheme-swatches">
                  {scheme.dark.map((color) => (
                    <SchemeSwatch color={color} key={color.cssName} />
                  ))}
                </div>
              </section>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
