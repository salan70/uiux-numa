import { useState, type MouseEvent, type ReactNode } from "react";
import "../../card/shared/card.css";
import "../../card/variants/zoom-cover/variant.css";
import "../../color-schemes-material/variants/sumi/scheme.css";
import { useCatalogColors } from "../../button/shared/useCatalogColors";
import { TOPIC_LINKS } from "./tiles";
import "./tiles.css";

/**
 * 3 案で共通のトップの版面。サイト名、1 行のリード、トピックの入口を持ち、
 * 案ごとに違うのは children に渡すギャラリーだけにする。
 * 単体表示は無彩の sumi を代替配色にし、タイルの色を面より先に立たせる。
 * Catalog の中では Catalog の配色と light / dark を継承する。
 * タイルの Card には、Catalog と同じく採用 variant の zoom-cover を効かせる。
 */
export function GalleryFrame({
  variantClass,
  toolbar,
  children,
}: {
  variantClass: string;
  /** 見出しの右に置く操作。流れる帯の一時停止などに使う。 */
  toolbar?: ReactNode;
  children: ReactNode;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  useCatalogColors(root);

  // 見本のリンクは移動させず、押した先だけを表示する。
  function openLink(event: MouseEvent<HTMLElement>) {
    const link = (event.target as Element).closest("a");
    if (!link) return;
    event.preventDefault();
    setOpened(`${link.textContent}（${link.getAttribute("href")}）`);
  }

  return (
    <main
      ref={setRoot}
      className={`gallery cs-sumi card-zoom-cover ${variantClass}`}
      onClick={openLink}
    >
      <header className="gallery__header">
        <div className="gallery__heading">
          <h1 className="gallery__title">UI/UX 沼</h1>
          <p className="gallery__lead">
            R&D で作った配色、文字、token、アイコン、部品と、その方針。
          </p>
        </div>
        {toolbar ? <div className="gallery__toolbar">{toolbar}</div> : null}
      </header>

      {/* 押した結果の行は常に 1 行分の高さを持たせ、表示の有無で下を動かさない。 */}
      <p className="gallery__status" aria-live="polite">
        {opened ? `開いた: ${opened}` : "タイルを押すと、開く先をここに出す。"}
      </p>

      <div className="gallery__stage">{children}</div>

      <nav className="gallery__topics" aria-label="トピック">
        <ul>
          {TOPIC_LINKS.map((topic) => (
            <li key={topic.href}>
              <a href={topic.href}>
                <span>{topic.label}</span>
                {topic.count !== null ? (
                  <span className="gallery__count">{topic.count}</span>
                ) : null}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </main>
  );
}
