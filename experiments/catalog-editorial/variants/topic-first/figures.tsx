// 方針ページで規則の意図を伝える図版。
// 正本は Markdown に置かず、見本帳の側で管理する。
// 図版は --ed-* と typography だけで組み、選択中の配色とテーマに追従させる。
import React from "react";
import type { FigureKey } from "../../shared/guidelines";

/** 4 原則: 近接の図版 */
function FigureProximity() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--bad">
        <div className="guide-figure__tag guide-figure__tag--bad">悪い例: 均等な余白</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}
        >
          <div style={{ fontSize: "0.8125rem", color: "var(--ed-muted)" }}>氏名</div>
          <div
            style={{
              padding: "0.375rem 0.5rem",
              border: "1px solid var(--ed-border)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          >
            山田 太郎
          </div>
          <div style={{ fontSize: "0.8125rem", color: "var(--ed-muted)" }}>メールアドレス</div>
          <div
            style={{
              padding: "0.375rem 0.5rem",
              border: "1px solid var(--ed-border)",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
            }}
          >
            taro@example.com
          </div>
        </div>
        <p className="guide-figure__caption">
          ラベルと入力欄の間隔が項目間と同じで、上下の所属が曖昧。
        </p>
      </div>
      <div className="guide-figure__card guide-figure__card--good">
        <div className="guide-figure__tag guide-figure__tag--good">
          良い例: 近接によるグループ化
        </div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ fontSize: "0.8125rem", color: "var(--ed-text)", fontWeight: 500 }}>
              氏名
            </div>
            <div
              style={{
                padding: "0.375rem 0.5rem",
                border: "1px solid var(--ed-border-strong)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            >
              山田 太郎
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            <div style={{ fontSize: "0.8125rem", color: "var(--ed-text)", fontWeight: 500 }}>
              メールアドレス
            </div>
            <div
              style={{
                padding: "0.375rem 0.5rem",
                border: "1px solid var(--ed-border-strong)",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
              }}
            >
              taro@example.com
            </div>
          </div>
        </div>
        <p className="guide-figure__caption">
          ラベルと入力欄を近づけ、項目間を大きく離して所属を明示。
        </p>
      </div>
    </div>
  );
}

/** 4 原則: 整列の図版 */
function FigureAlignment() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--bad">
        <div className="guide-figure__tag guide-figure__tag--bad">悪い例: ガタつく配置</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div
            style={{
              fontSize: "1rem",
              fontWeight: 700,
              marginLeft: "0.5rem",
              color: "var(--ed-text)",
            }}
          >
            設定の確認
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--ed-muted)", marginLeft: "0" }}>
            通知の設定を変更します。
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              marginLeft: "1.25rem",
              padding: "0.25rem 0.75rem",
              background: "var(--ed-surface)",
              border: "1px solid var(--ed-border)",
              borderRadius: "0.375rem",
              fontSize: "0.8125rem",
            }}
          >
            保存する
          </div>
        </div>
        <p className="guide-figure__caption">左端の線が揃っておらず、要素間の関係が読みにくい。</p>
      </div>
      <div className="guide-figure__card guide-figure__card--good">
        <div className="guide-figure__tag guide-figure__tag--good">良い例: 1 本の線に整列</div>
        <div
          className="guide-figure__specimen"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            borderLeft: "1px dashed var(--ed-accent)",
            paddingLeft: "0.5rem",
          }}
        >
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--ed-text)" }}>
            設定の確認
          </div>
          <div style={{ fontSize: "0.875rem", color: "var(--ed-muted)" }}>
            通知の設定を変更します。
          </div>
          <div
            style={{
              alignSelf: "flex-start",
              padding: "0.25rem 0.75rem",
              background: "var(--ed-accent)",
              color: "var(--ed-bg)",
              borderRadius: "0.375rem",
              fontSize: "0.8125rem",
              fontWeight: 500,
            }}
          >
            保存する
          </div>
        </div>
        <p className="guide-figure__caption">
          すべての要素の左端を 1 本の基準線に沿わせて整然と見せる。
        </p>
      </div>
    </div>
  );
}

/** 4 原則: 反復の図版 */
function FigureRepetition() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--bad">
        <div className="guide-figure__tag guide-figure__tag--bad">悪い例: 造形の不一致</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
        >
          <div
            style={{
              padding: "0.375rem 0.625rem",
              border: "1px solid var(--ed-border-strong)",
              borderRadius: "0.375rem",
              fontSize: "0.8125rem",
            }}
          >
            配色: sumi
          </div>
          <select
            style={{
              padding: "0.375rem 0.5rem",
              border: "2px solid #999",
              borderRadius: "0px",
              fontSize: "0.8125rem",
              background: "#fff",
              color: "#000",
            }}
          >
            <option>OS既定矢印</option>
          </select>
        </div>
        <p className="guide-figure__caption">
          OS 既定の矢印や角丸 0px が混ざり、デザインの文法が崩れる。
        </p>
      </div>
      <div className="guide-figure__card guide-figure__card--good">
        <div className="guide-figure__tag guide-figure__tag--good">良い例: 造形と部品の反復</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}
        >
          <div
            style={{
              padding: "0.375rem 0.625rem",
              border: "1px solid var(--ed-border-strong)",
              borderRadius: "0.375rem",
              fontSize: "0.8125rem",
              color: "var(--ed-text)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <span>配色: sumi</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
          <div
            style={{
              padding: "0.375rem 0.625rem",
              border: "1px solid var(--ed-border-strong)",
              borderRadius: "0.375rem",
              fontSize: "0.8125rem",
              color: "var(--ed-text)",
              display: "flex",
              alignItems: "center",
              gap: "0.375rem",
            }}
          >
            <span>テーマ: ライト</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M4 6l4 4 4-4" />
            </svg>
          </div>
        </div>
        <p className="guide-figure__caption">
          角丸 0.375rem、ヘアライン、線画の山形を揃えて一貫性を保つ。
        </p>
      </div>
    </div>
  );
}

/** 4 原則: 対比の図版 */
function FigureContrast() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--bad">
        <div className="guide-figure__tag guide-figure__tag--bad">悪い例: 見本と説明が同化</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}
        >
          <div style={{ fontSize: "0.875rem", color: "var(--ed-text)" }}>見出しの文字階梯</div>
          <div style={{ fontSize: "0.875rem", color: "var(--ed-text)" }}>
            見出しには font-size-lg を使用します
          </div>
        </div>
        <p className="guide-figure__caption">
          見本と説明が同じ色・同じ太さで並び、どちらが見本か読めない。
        </p>
      </div>
      <div className="guide-figure__card guide-figure__card--good">
        <div className="guide-figure__tag guide-figure__tag--good">
          良い例: 罫と階層による明確な対比
        </div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <div style={{ fontSize: "1.25rem", fontWeight: 700, color: "var(--ed-text)" }}>
            見出しの文字階梯
          </div>
          <div
            style={{
              borderLeft: "2px solid var(--ed-border-strong)",
              paddingLeft: "0.5rem",
              fontSize: "0.8125rem",
              color: "var(--ed-muted)",
            }}
          >
            見出しには font-size-lg（1.25rem）を使用します
          </div>
        </div>
        <p className="guide-figure__caption">
          説明に縦罫を引き文字を落とし、見本は素のまま立たせて対比を作る。
        </p>
      </div>
    </div>
  );
}

/** 状態とフィードバック: 幅が動く例 */
function FigureStateLayoutShift() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--bad">
        <div className="guide-figure__tag guide-figure__tag--bad">悪い例: 太字で寸法が動く</div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <div
            style={{
              padding: "0.25rem 0.5rem",
              borderBottom: "2px solid var(--ed-accent)",
              fontWeight: 700,
              fontSize: "0.875rem",
            }}
          >
            概要 (74px)
          </div>
          <div
            style={{
              padding: "0.25rem 0.5rem",
              fontWeight: 400,
              fontSize: "0.875rem",
              color: "var(--ed-muted)",
            }}
          >
            設定 (62px)
          </div>
        </div>
        <p className="guide-figure__caption">
          現在地を太字にするとタブの幅が伸び縮みし、隣の要素が押し出される。
        </p>
      </div>
    </div>
  );
}

/** 状態とフィードバック: 動かない例 */
function FigureStateStable() {
  return (
    <div className="guide-figure__grid">
      <div className="guide-figure__card guide-figure__card--good">
        <div className="guide-figure__tag guide-figure__tag--good">
          良い例: 色・面・線で示し寸法固定
        </div>
        <div
          className="guide-figure__specimen"
          style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}
        >
          <div
            style={{
              padding: "0.25rem 0.5rem",
              borderBottom: "2px solid var(--ed-accent)",
              color: "var(--ed-accent)",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            概要 (68px)
          </div>
          <div
            style={{
              padding: "0.25rem 0.5rem",
              borderBottom: "2px solid transparent",
              color: "var(--ed-muted)",
              fontWeight: 500,
              fontSize: "0.875rem",
            }}
          >
            設定 (68px)
          </div>
        </div>
        <p className="guide-figure__caption">
          太さを変えず、色と下線だけで現在地を示すためレイアウトが動かない。
        </p>
      </div>
    </div>
  );
}

// キーの正本は shared/guidelines.ts。図版を足し忘れると型検査が落ちる。
export const FIGURE_COMPONENTS: Record<FigureKey, React.ComponentType> = {
  proximity: FigureProximity,
  alignment: FigureAlignment,
  repetition: FigureRepetition,
  contrast: FigureContrast,
  "state-layout-shift": FigureStateLayoutShift,
  "state-stable": FigureStateStable,
};
