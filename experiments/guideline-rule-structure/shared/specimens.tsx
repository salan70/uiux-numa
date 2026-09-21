// 規則が参照する標本。正本は apps/catalog/src/components/figures.tsx。
// この Experiment は States & Feedback の Tips だけを扱うので、そこで使う 2 件を写す。
import type { ReactNode } from "react";

function Tabs({ active, rest }: { active: string; rest: string }) {
  return (
    <div className="gr-specimen" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
      <div
        style={{
          padding: "0.25rem 0.5rem",
          borderBottom: "2px solid var(--gr-accent)",
          color: "var(--gr-accent)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        {active}
      </div>
      <div
        style={{
          padding: "0.25rem 0.5rem",
          borderBottom: "2px solid transparent",
          color: "var(--gr-muted)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        {rest}
      </div>
    </div>
  );
}

type Specimens = { bad?: ReactNode; good?: ReactNode };

export const SPECIMENS: Record<string, Specimens> = {
  // 太字で寸法が動く例。選択中だけ太字なので幅が変わる。
  "state-layout-shift": {
    bad: (
      <div className="gr-specimen" style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
        <div
          style={{
            padding: "0.25rem 0.5rem",
            borderBottom: "2px solid var(--gr-accent)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          概要 (74px)
        </div>
        <div
          style={{
            padding: "0.25rem 0.5rem",
            fontWeight: "var(--font-weight-regular)",
            fontSize: "var(--font-size-sm)",
            color: "var(--gr-muted)",
          }}
        >
          設定 (62px)
        </div>
      </div>
    ),
  },
  // 色と線だけで示す例。太さを変えないので幅が動かない。
  "state-stable": {
    good: <Tabs active="概要 (68px)" rest="設定 (68px)" />,
  },
};
