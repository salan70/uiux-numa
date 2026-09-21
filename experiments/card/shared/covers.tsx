import "../../button/shared/button.css";
import "../../button/variants/pill-action/variant.css";
import { Button } from "../../button/shared/Button";
import aiIcon from "../../class-tech-icons/variants/line-round/dist/ai.svg?raw";
import codeIcon from "../../class-tech-icons/variants/line-round/dist/code.svg?raw";
import databaseIcon from "../../class-tech-icons/variants/line-round/dist/database.svg?raw";
import webIcon from "../../class-tech-icons/variants/line-round/dist/web.svg?raw";

// カバーは挿絵を新しく描かず、リポジトリの実物を縮小して置く。
// 色は親の配色、寸法は token、アイコンと Button は採用済みの実装をそのまま使う。

const COLOR_ROLES = [
  "--color-primary",
  "--color-secondary",
  "--color-tertiary",
  "--color-primary-container",
  "--color-surface",
];

export function ColorsCover() {
  return (
    <div className="card-cover-colors">
      {COLOR_ROLES.map((role) => (
        <span key={role} style={{ background: `var(${role})` }} />
      ))}
    </div>
  );
}

export function TypographyCover() {
  return (
    <div className="card-cover-type">
      <span>Aa あ</span>
      <small>LINE Seed JP</small>
    </div>
  );
}

const SPACE_STEPS = ["--space-100", "--space-200", "--space-400", "--space-600", "--space-1000"];

export function TokensCover() {
  return (
    <div className="card-cover-tokens">
      {SPACE_STEPS.map((step) => (
        <span key={step} style={{ inlineSize: `var(${step})`, blockSize: `var(${step})` }} />
      ))}
    </div>
  );
}

const ICONS = [aiIcon, codeIcon, databaseIcon, webIcon];

export function IconsCover() {
  return (
    <div className="card-cover-icons">
      {ICONS.map((svg) => (
        <span key={svg} dangerouslySetInnerHTML={{ __html: svg }} />
      ))}
    </div>
  );
}

export function ComponentsCover() {
  return (
    <div className="card-cover-components button-pill-action">
      <Button appearance="primary" size="small">
        保存
      </Button>
      <Button appearance="secondary" size="small">
        詳細
      </Button>
    </div>
  );
}

export function GuidelinesCover() {
  return (
    <div className="card-cover-text">
      <p>操作の対象、結果、状態を利用者の言葉で伝える。</p>
      <p>文言で迷わせず、最短で目的を達成できるようにする。</p>
    </div>
  );
}
