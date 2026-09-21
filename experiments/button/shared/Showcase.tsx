import { useEffect, useRef, useState } from "react";
import { Button, type ButtonAppearance, type ButtonSize } from "./Button";
import { useCatalogColors } from "./useCatalogColors";

const APPEARANCES: {
  id: ButtonAppearance;
  label: string;
  description: string;
  colorTokens: { surface: string; border: string; text: string };
}[] = [
  {
    id: "primary",
    label: "Primary",
    description: "画面の主な操作",
    colorTokens: {
      surface: "--color-primary",
      border: "--color-primary",
      text: "--color-on-primary",
    },
  },
  {
    id: "secondary",
    label: "Secondary",
    description: "主操作を補う操作",
    colorTokens: {
      surface: "transparent",
      border: "--color-outline",
      text: "--color-on-surface",
    },
  },
  {
    id: "quiet",
    label: "Quiet",
    description: "頻度の低い補助操作",
    colorTokens: {
      surface: "transparent",
      border: "transparent",
      text: "--color-primary-text",
    },
  },
  {
    id: "danger",
    label: "Danger",
    description: "削除など戻せない操作",
    colorTokens: {
      surface: "transparent",
      border: "--color-error",
      text: "--color-error",
    },
  },
];

const SIZE_SPECS: {
  id: ButtonSize;
  label: string;
  height: string;
  paddingInline: string;
  minWidth: string;
}[] = [
  {
    id: "small",
    label: "S",
    height: "--size-control-height-sm",
    paddingInline: "--space-300",
    minWidth: "--size-control-min-width-sm",
  },
  {
    id: "medium",
    label: "M",
    height: "--size-control-height-md",
    paddingInline: "--space-500",
    minWidth: "--size-control-min-width-md",
  },
  {
    id: "large",
    label: "L",
    height: "--size-control-height-lg",
    paddingInline: "--space-600",
    minWidth: "--size-control-min-width-lg",
  },
];

export function Showcase({
  variantClass,
  embedded = false,
}: {
  variantClass: string;
  embedded?: boolean;
}) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const [loading, setLoading] = useState(false);
  const timer = useRef<number | null>(null);
  useCatalogColors(embedded ? null : root);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    [],
  );

  function startLoading() {
    if (loading) return;
    setLoading(true);
    timer.current = window.setTimeout(() => {
      setLoading(false);
      timer.current = null;
    }, 900);
  }

  const Root = embedded ? "div" : "main";

  return (
    <Root
      ref={(node) => setRoot(node)}
      className={`button-showcase ${variantClass}${embedded ? " button-showcase--embedded" : ""}`}
      data-button-showcase
    >
      {embedded ? null : (
        <header className="button-showcase__header">
          <p className="button-showcase__eyebrow">COMPONENT / WEB</p>
          <h1>Button</h1>
          <p>操作の役割と状態を、同じ形の規則で伝える。</p>
        </header>
      )}

      <section aria-labelledby="button-appearances">
        <div className="button-showcase__rows">
          <div className="button-showcase__size-header" aria-label="サイズ仕様">
            <div className="button-showcase__size-title">
              <h2 id="button-appearances">役割とサイズ</h2>
              {/* 項目名は S の左に 1 度だけ出す。読み上げは各サイズの dt が担う。 */}
              <ul className="button-showcase__size-keys" aria-hidden="true">
                <li>高さ</li>
                <li>左右</li>
                <li>最小幅</li>
              </ul>
            </div>
            <div className="button-showcase__size-specs">
              {SIZE_SPECS.map((spec) => (
                <SizeSpec key={spec.id} spec={spec} />
              ))}
            </div>
          </div>
          {APPEARANCES.map((appearance) => (
            <div className="button-showcase__row" key={appearance.id}>
              <div className="button-showcase__role">
                <h3>{appearance.label}</h3>
                <p>{appearance.description}</p>
                <dl
                  className="button-showcase__tokens"
                  aria-label={`${appearance.label} の色 token`}
                >
                  <ColorToken
                    label="面 / 線"
                    values={[appearance.colorTokens.surface, appearance.colorTokens.border]}
                  />
                  <ColorToken label="文字" values={[appearance.colorTokens.text]} />
                </dl>
              </div>
              <div className="button-showcase__sizes">
                {SIZE_SPECS.map((size) => (
                  <div className="button-showcase__size" key={size.id}>
                    <span>{size.label}</span>
                    <Button appearance={appearance.id} size={size.id}>
                      {appearance.id === "danger" ? "削除" : "続ける"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="button-showcase__states" aria-labelledby="button-states">
        <div className="button-showcase__section-head">
          <h2 id="button-states">状態とアイコン</h2>
        </div>
        <div className="button-showcase__examples">
          <Button
            appearance="primary"
            leadingIcon={<SaveIcon />}
            onClick={startLoading}
            loading={loading}
          >
            保存を試す
          </Button>
          <Button appearance="secondary" trailingIcon={<ArrowIcon />}>
            詳細を見る
          </Button>
          <Button appearance="secondary" disabled>
            利用できません
          </Button>
        </div>
      </section>
    </Root>
  );
}

function SizeSpec({ spec }: { spec: (typeof SIZE_SPECS)[number] }) {
  return (
    <div className="button-showcase__size-spec">
      <p>{spec.label}</p>
      <dl>
        <div>
          <dt className="button-showcase__visually-hidden">高さ</dt>
          <dd>{spec.height}</dd>
        </div>
        <div>
          <dt className="button-showcase__visually-hidden">左右</dt>
          <dd>{spec.paddingInline}</dd>
        </div>
        <div>
          <dt className="button-showcase__visually-hidden">最小幅</dt>
          <dd>{spec.minWidth}</dd>
        </div>
      </dl>
      <span aria-hidden="true">
        {spec.height} · {spec.paddingInline} · {spec.minWidth}
      </span>
    </div>
  );
}

function ColorToken({ label, values }: { label: string; values: string[] }) {
  const uniqueValues = [...new Set(values)];

  return (
    <div>
      <dt>{label}</dt>
      <dd>{uniqueValues.join(" / ")}</dd>
    </div>
  );
}

function SaveIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path
        d="M3 2.5h8l2.5 2.5v8.5h-11zM5 2.5v4h6v-4M5 13.5V9h6v4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 16 16" focusable="false">
      <path
        d="M3.5 8h9m-4-4 4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
