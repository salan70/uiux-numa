import { useId, useState, type CSSProperties } from "react";
import { Collapsible } from "@base-ui/react/collapsible";
import { Drawer } from "@base-ui/react/drawer";
import { Field } from "@base-ui/react/field";
import { Radio } from "@base-ui/react/radio";
import { RadioGroup } from "@base-ui/react/radio-group";
import { Select } from "@base-ui/react/select";
import { Slider } from "@base-ui/react/slider";
import "../../color-schemes/variants/sumi/scheme.css";
import "../../../tokens/space/index.css";
import "../../../tokens/typography/index.css";
import { CopyField } from "./parts/CopyField";
import { useCatalogColors } from "./useCatalogColors";

type Props = {
  variantClass: string;
};

const SCHEMES = [
  { value: "sumi", label: "すみ" },
  { value: "wasabi", label: "わさび" },
  { value: "yuzu", label: "ゆず" },
  { value: "aizome", label: "あいぞめ" },
] as const;

const WIDTHS = [
  { value: "mobile", label: "390px" },
  { value: "desktop", label: "1280px" },
  { value: "fit", label: "全幅" },
] as const;

const ROWS = [
  { name: "accent", value: "#2b2b2b", contrast: "本文 12.4" },
  { name: "focus", value: "#eb6101", contrast: "本文 3.3" },
  { name: "danger", value: "#b7282e", contrast: "本文 5.9" },
] as const;

const NAV = [
  {
    id: "foundations",
    label: "土台",
    items: [
      { href: "#sk-colors", label: "配色", current: true },
      { href: "#sk-type", label: "文字", current: false },
    ],
  },
  {
    id: "components",
    label: "部品",
    items: [
      { href: "#sk-kit", label: "見本", current: false },
      { href: "#sk-form", label: "入力", current: false },
    ],
  },
] as const;

export function Kit({ variantClass }: Props) {
  const [root, setRoot] = useState<HTMLDivElement | null>(null);
  const [scheme, setScheme] = useState("sumi");
  const [width, setWidth] = useState<(typeof WIDTHS)[number]["value"]>("fit");
  const widthIndex = WIDTHS.findIndex((item) => item.value === width);
  const formId = useId();
  useCatalogColors(root);

  return (
    <div ref={setRoot} className={`cs-sumi sk-root ${variantClass}`}>
      <header className="sk-header">
        <a className="sk-wordmark" href="#sk-main">
          UI/UX 沼
        </a>
        <div className="sk-header-tools">
          <Drawer.Root swipeDirection="right">
            <Drawer.Trigger className="sk-button sk-menu-button">メニュー</Drawer.Trigger>
            <Drawer.Portal container={root}>
              <Drawer.Backdrop className="sk-drawer-backdrop" />
              <Drawer.Viewport className="sk-drawer-viewport">
                <Drawer.Popup className="sk-drawer-popup">
                  <Drawer.Content className="sk-drawer-content">
                    <div className="sk-drawer-header">
                      <Drawer.Title className="sk-drawer-title">メニュー</Drawer.Title>
                      <Drawer.Close className="sk-button sk-button-ghost">閉じる</Drawer.Close>
                    </div>
                    <Drawer.Description className="sk-live">
                      サイト内の節を開いて移動できます。
                    </Drawer.Description>
                    <SidebarNav />
                  </Drawer.Content>
                </Drawer.Popup>
              </Drawer.Viewport>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
      </header>

      <div className="sk-columns">
        <aside className="sk-sidebar-desktop" aria-label="サイト">
          <SidebarNav />
        </aside>
        <main id="sk-main" className="sk-main">
          <p className="sk-kicker">比較案: {variantClass.replace("sk-", "")}</p>
          <h1>部品の見本</h1>
          <p className="sk-intro">
            Catalog で使う操作部品と面を、同じ内容で 4 案並べます。公開面の CSS はまだ変えません。
          </p>

          <section className="sk-card" id="sk-form" aria-labelledby={`${formId}-heading`}>
            <h2 id={`${formId}-heading`}>操作</h2>
            <form className="sk-form" onSubmit={(event) => event.preventDefault()}>
              <Select.Root
                items={[...SCHEMES]}
                value={scheme}
                onValueChange={(value) => {
                  if (value) setScheme(value);
                }}
              >
                <Select.Label className="sk-label">配色</Select.Label>
                <Select.Trigger className="sk-select-trigger">
                  <Select.Value />
                  <Select.Icon className="sk-select-icon">
                    <svg viewBox="0 0 16 16" aria-hidden="true">
                      <path
                        d="M3.2 5.7 8 10.5l4.8-4.8-1.1-1.1L8 8.3 4.3 4.6z"
                        fill="currentColor"
                      />
                    </svg>
                  </Select.Icon>
                </Select.Trigger>
                <Select.Portal container={root}>
                  <Select.Positioner className="sk-select-positioner" sideOffset={6}>
                    <Select.Popup className="sk-select-popup">
                      <Select.List className="sk-select-list">
                        {SCHEMES.map((item) => (
                          <Select.Item
                            key={item.value}
                            value={item.value}
                            className="sk-select-item"
                          >
                            <Select.ItemText>{item.label}</Select.ItemText>
                          </Select.Item>
                        ))}
                      </Select.List>
                    </Select.Popup>
                  </Select.Positioner>
                </Select.Portal>
              </Select.Root>

              <div className="sk-field">
                <p className="sk-label" id={`${formId}-width`}>
                  表示幅
                </p>
                <RadioGroup
                  aria-labelledby={`${formId}-width`}
                  value={width}
                  onValueChange={(value) => {
                    if (value === "mobile" || value === "desktop" || value === "fit") {
                      setWidth(value);
                    }
                  }}
                  className="sk-segmented"
                  style={
                    {
                      "--sk-index": String(Math.max(widthIndex, 0)),
                      "--sk-count": String(WIDTHS.length),
                    } as CSSProperties
                  }
                >
                  <span className="sk-segmented-thumb" aria-hidden="true" />
                  {WIDTHS.map((item) => (
                    <Radio.Root key={item.value} value={item.value} className="sk-segmented-option">
                      {item.label}
                    </Radio.Root>
                  ))}
                </RadioGroup>
              </div>

              <Slider.Root className="sk-slider" defaultValue={48} min={12} max={96}>
                <div className="sk-slider-head">
                  <Slider.Label className="sk-label">本文サイズ</Slider.Label>
                  <Slider.Value className="sk-slider-value" />
                </div>
                <Slider.Control className="sk-slider-control">
                  <Slider.Track className="sk-slider-track">
                    <Slider.Indicator className="sk-slider-indicator" />
                    <Slider.Thumb aria-label="本文サイズ" className="sk-slider-thumb" />
                  </Slider.Track>
                </Slider.Control>
              </Slider.Root>

              <Field.Root className="sk-field">
                <Field.Label className="sk-label">メモ</Field.Label>
                <Field.Control
                  render={
                    <textarea
                      className="sk-textarea"
                      rows={4}
                      defaultValue="角丸と影は token にせず、案ごとの変数に置きます。"
                    />
                  }
                />
                <Field.Description className="sk-help">
                  長い文でも省略せず、入力欄の高さが先に決まります。
                </Field.Description>
              </Field.Root>

              <div className="sk-actions">
                <button type="submit" className="sk-button sk-button-primary">
                  変更を保存
                </button>
                <button type="button" className="sk-button sk-button-ghost">
                  取り消す
                </button>
              </div>
            </form>
          </section>

          <section className="sk-card" aria-labelledby={`${formId}-table`}>
            <h2 id={`${formId}-table`}>役割色</h2>
            <div className="sk-table-wrap">
              <table className="sk-table">
                <thead>
                  <tr>
                    <th scope="col">役割</th>
                    <th scope="col">値</th>
                    <th scope="col">見本</th>
                  </tr>
                </thead>
                <tbody>
                  {ROWS.map((row) => (
                    <tr key={row.name}>
                      <th scope="row">{row.name}</th>
                      <td>
                        <CopyField value={row.value} label={row.name} />
                      </td>
                      <td>
                        <span className="sk-swatch">
                          <span className={`sk-swatch-chip sk-swatch-${row.name}`} />
                          <span>{row.contrast}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="sk-preview-frame" aria-label="プレビュー枠">
            <p>プレビュー枠。開閉する面は、この枠の外へはみ出しません。</p>
          </section>

          <footer className="sk-footer">
            <p>最終更新: 2026 年 9 月 19 日</p>
          </footer>
        </main>
      </div>
    </div>
  );
}

function SidebarNav() {
  return (
    <nav className="sk-nav" aria-label="サイト">
      {NAV.map((section) => (
        <Collapsible.Root key={section.id} className="sk-section" defaultOpen>
          <Collapsible.Trigger className="sk-section-trigger">{section.label}</Collapsible.Trigger>
          <Collapsible.Panel className="sk-section-panel" keepMounted>
            <ul>
              {section.items.map((item) => (
                <li key={item.href}>
                  <a href={item.href} aria-current={item.current ? "page" : undefined}>
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </Collapsible.Panel>
        </Collapsible.Root>
      ))}
    </nav>
  );
}
