import { useMemo, useState, type CSSProperties } from "react";
import { makePalette, schemes, type Mode } from "../../color-schemes-material/shared/palettes";
import { Button } from "../../button/shared/Button";
import "./prototype.css";

export type CornixDirection = "chromatic-rail" | "layer-stage" | "editorial-console";
type Tab = "Keymap" | "Mac" | "Overview" | "Behaviors" | "References";
type SaveState = "saved" | "saving" | "conflict" | "error";

const tabs: Tab[] = ["Keymap", "Mac", "Overview", "Behaviors", "References"];
const layers = ["Base", "Num", "Nav", "Sym"];
const keys = [
  "Esc",
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "⌫",
  "Tab",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ";",
  "'",
  "⇧",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  ",",
  ".",
  "/",
  "⏎",
  "⌃",
  "⌥",
  "⌘",
  "英数",
  "Num",
  "Space",
  "Nav",
  "かな",
  "←",
  "→",
];
const pickerKeys = [
  "Esc",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "⌫",
  "Tab",
  "Q",
  "W",
  "E",
  "R",
  "T",
  "Y",
  "U",
  "I",
  "O",
  "P",
  "⏎",
  "⌃",
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ";",
  "'",
  "⇧",
  "Z",
  "X",
  "C",
  "V",
  "B",
  "N",
  "M",
  ",",
  ".",
  "/",
  "Space",
];

export function CornixPrototype({ direction }: { direction: CornixDirection }) {
  const query = new URLSearchParams(window.location.search);
  const initialScheme = schemes.some((item) => item.id === query.get("scheme"))
    ? query.get("scheme")!
    : "wasabi";
  const [tab, setTab] = useState<Tab>("Keymap");
  const [layer, setLayer] = useState("Base");
  const [selectedKey, setSelectedKey] = useState("E");
  const [schemeId, setSchemeId] = useState(initialScheme);
  const [mode, setMode] = useState<Mode>(query.get("theme") === "dark" ? "dark" : "light");
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [applyOpen, setApplyOpen] = useState(false);
  const scheme = schemes.find((item) => item.id === schemeId) ?? schemes[0]!;
  const palette = useMemo(() => makePalette(scheme, mode), [scheme, mode]);
  const colorStyle = Object.fromEntries(
    Object.entries(palette).map(([name, value]) => [`--color-${name}`, value]),
  ) as CSSProperties;

  function pickKey(value: string) {
    setSelectedKey(value);
    setSaveState("saving");
    window.setTimeout(() => setSaveState("saved"), 650);
  }

  return (
    <div
      className={`cornix-prototype cornix-prototype--${direction}`}
      data-theme={mode}
      style={colorStyle}
    >
      <a className="cornix-skip" href="#cornix-main">
        本文へ移動
      </a>
      <header className="cornix-header">
        <div className="cornix-brand">
          <span className="cornix-brand__mark" aria-hidden="true">
            芽
          </span>
          <span>
            <strong>Cornix</strong>
            <small>Bonsai</small>
          </span>
        </div>
        <div className="cornix-workspace">
          <span>Workspace</span>
          <strong>cornix-lp</strong>
          <code>~/keyboards/cornix</code>
        </div>
        <div className="cornix-connection">
          <i aria-hidden="true" /> Cornix LP に接続済み
        </div>
        <div className="cornix-appearance">
          <label>
            配色
            <select value={schemeId} onChange={(event) => setSchemeId(event.target.value)}>
              {schemes.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            明暗
            <select value={mode} onChange={(event) => setMode(event.target.value as Mode)}>
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
            </select>
          </label>
        </div>
      </header>

      <nav className="cornix-nav" aria-label="編集画面">
        <p>編集</p>
        {tabs.map((item, index) => (
          <button
            className={tab === item ? "is-active" : ""}
            onClick={() => setTab(item)}
            aria-current={tab === item ? "page" : undefined}
            key={item}
          >
            <span>0{index + 1}</span>
            {item}
          </button>
        ))}
        <div className="cornix-nav__tools">
          <button>Workspace を開く</button>
          <button>実機から再読込</button>
          <button>backup から復元</button>
        </div>
      </nav>

      <main id="cornix-main" className="cornix-main">
        <div className="cornix-page-head">
          <div>
            <span>編集中</span>
            <h1>{tab}</h1>
          </div>
          <p>
            {tab === "Keymap"
              ? "キーを選び、割り当てを変える。"
              : tab === "Mac"
                ? "macOS の物理キーを割り当てる。"
                : `${tab} の情報を確認する。`}
          </p>
        </div>
        {tab === "Keymap" || tab === "Mac" ? (
          <Editor
            tab={tab}
            layer={layer}
            setLayer={setLayer}
            selectedKey={selectedKey}
            pickKey={pickKey}
            saveState={saveState}
            setSaveState={setSaveState}
          />
        ) : tab === "Overview" ? (
          <Overview />
        ) : (
          <ReferencePage tab={tab} />
        )}
      </main>

      <footer className="cornix-status">
        <button className="cornix-severity cornix-severity--error">
          エラー <b>0</b>
        </button>
        <button className="cornix-severity cornix-severity--warning">
          警告 <b>2</b>
        </button>
        <button className="cornix-severity">
          情報 <b>5</b>
        </button>
        <span className="cornix-status__message">ローカル編集 3 件 · keymap.yaml</span>
        <Button appearance="secondary" size="small">
          差分を見る
        </Button>
        <Button size="small" onClick={() => setApplyOpen(true)}>
          実機へ Apply…
        </Button>
      </footer>
      {applyOpen ? <ApplyDialog onClose={() => setApplyOpen(false)} /> : null}
    </div>
  );
}

function Editor({
  tab,
  layer,
  setLayer,
  selectedKey,
  pickKey,
  saveState,
  setSaveState,
}: {
  tab: "Keymap" | "Mac";
  layer: string;
  setLayer: (value: string) => void;
  selectedKey: string;
  pickKey: (value: string) => void;
  saveState: SaveState;
  setSaveState: (value: SaveState) => void;
}) {
  return (
    <div className="cornix-editor">
      <section className="cornix-stage" aria-label={`${tab} 盤面`}>
        <div className="cornix-layers">
          <span>Layer</span>
          {layers.map((item) => (
            <button
              className={layer === item ? "is-active" : ""}
              onClick={() => setLayer(item)}
              key={item}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="cornix-board">
          {keys.map((key, index) => (
            <button
              className={`${selectedKey === key ? "is-selected" : ""} ${[4, 16, 28, 40].includes(index) ? "is-layer" : ""}`}
              onClick={() => pickKey(key)}
              key={`${key}-${index}`}
            >
              <b>{key}</b>
              {[4, 16, 28, 40].includes(index) ? <small>Hold · Nav</small> : null}
            </button>
          ))}
        </div>
        <div className="cornix-encoders">
          <span>Encoder 0</span>
          <button>↺ 音量 −</button>
          <button>↻ 音量 ＋</button>
          <span>Encoder 1</span>
          <button>↺ 前へ</button>
          <button>↻ 次へ</button>
        </div>
        <KeyPicker selectedKey={selectedKey} pickKey={pickKey} />
      </section>
      <aside className="cornix-inspector">
        <div className="cornix-inspector__head">
          <span>選択中</span>
          <strong>{selectedKey}</strong>
          <code>{tab === "Mac" ? "key_code::e" : "KC_E"}</code>
        </div>
        <label>
          動作
          <select defaultValue="basic">
            <option value="basic">通常キー</option>
            <option>Layer Tap</option>
            <option>Modifier Tap</option>
          </select>
        </label>
        <label>
          表示名
          <input defaultValue={selectedKey === "E" ? "E" : selectedKey} />
        </label>
        <div className={`cornix-save cornix-save--${saveState}`} aria-live="polite">
          <span>
            {saveState === "saved"
              ? "ローカル保存済み"
              : saveState === "saving"
                ? "保存中…"
                : saveState === "conflict"
                  ? "外部変更と競合した"
                  : "保存できなかった"}
          </span>
          <code>{tab === "Mac" ? "mac-keyboard.ansi.yaml" : "keymap.yaml"}</code>
          {saveState === "error" ? (
            <Button appearance="danger" size="small" onClick={() => setSaveState("saving")}>
              再試行
            </Button>
          ) : null}
        </div>
        <div className="cornix-state-demo">
          <span>状態を確認</span>
          <button onClick={() => setSaveState("saved")}>保存済み</button>
          <button onClick={() => setSaveState("conflict")}>競合</button>
          <button onClick={() => setSaveState("error")}>失敗</button>
        </div>
        <p className="cornix-apply-note">
          ここで行うのはファイルへのローカル保存です。実機へ反映する操作ではありません。
        </p>
      </aside>
    </div>
  );
}

function KeyPicker({
  selectedKey,
  pickKey,
}: {
  selectedKey: string;
  pickKey: (value: string) => void;
}) {
  return (
    <section className="cornix-picker">
      <header>
        <div>
          <span>Keycode picker</span>
          <h2>割り当てを選ぶ</h2>
        </div>
        <div className="cornix-picker__target">
          <button className="is-active">
            キー全体 <b>{selectedKey}</b>
          </button>
          <button>
            Tap <b>{selectedKey}</b>
          </button>
          <button>
            Hold <b>—</b>
          </button>
        </div>
      </header>
      <div className="cornix-picker__grid">
        {pickerKeys.map((key, index) => (
          <button
            className={selectedKey === key ? "is-selected" : ""}
            onClick={() => pickKey(key)}
            key={`${key}-${index}`}
          >
            {key}
          </button>
        ))}
      </div>
    </section>
  );
}

function Overview() {
  return (
    <div className="cornix-overview">
      {layers.map((layer, index) => (
        <article key={layer}>
          <header>
            <span>0{index}</span>
            <h2>{layer}</h2>
            <b>{index === 0 ? "基準" : `${index + 2} 参照`}</b>
          </header>
          <div className="cornix-mini-board">
            {keys.slice(0, 24).map((key, keyIndex) => (
              <i
                className={keyIndex % (index + 4) === 0 ? "is-accent" : ""}
                key={`${key}-${keyIndex}`}
              >
                {key}
              </i>
            ))}
          </div>
          <p>{index === 0 ? "すべての編集の入口" : `${layers[0]} から ${layer} へ移動`}</p>
        </article>
      ))}
    </div>
  );
}

function ReferencePage({ tab }: { tab: "Behaviors" | "References" }) {
  const rows =
    tab === "Behaviors"
      ? [
          ["Tap Dance 0", "Tap: Esc / Hold: ⌃"],
          ["Combo 1", "J + K → Esc"],
          ["Layer Tap", "Space / Nav"],
        ]
      : [
          ["Base", "Num、Nav、Sym を参照"],
          ["Nav", "Base へ戻る"],
          ["Sym", "Num を参照"],
        ];
  return (
    <div className="cornix-reference">
      {rows.map(([title, body], index) => (
        <section key={title}>
          <span>0{index + 1}</span>
          <h2>{title}</h2>
          <p>{body}</p>
          <Button appearance="secondary" size="small">
            詳細を見る
          </Button>
        </section>
      ))}
    </div>
  );
}

function ApplyDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="cornix-modal-backdrop" role="presentation">
      <section
        className="cornix-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="apply-title"
      >
        <header>
          <div>
            <span>安全な実機反映</span>
            <h2 id="apply-title">変更を Apply</h2>
          </div>
          <button onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </header>
        <ol>
          {["Backup", "差分", "確認", "書込", "結果"].map((item, index) => (
            <li
              className={step === index + 1 ? "is-active" : step > index + 1 ? "is-done" : ""}
              key={item}
            >
              <b>{index + 1}</b>
              {item}
            </li>
          ))}
        </ol>
        <div className="cornix-modal__body">
          <span>STEP 0{step}</span>
          <h3>
            {step === 1
              ? "現在の実機状態を読む"
              : step === 2
                ? "3 件の差分を確認する"
                : step === 3
                  ? "書き込む内容を承認する"
                  : step === 4
                    ? "実機へ書き込み、再読込する"
                    : "実機への反映を確認した"}
          </h3>
          <p>電源を切っても設定が残ることは、この操作だけでは確認できません。</p>
          <div className="cornix-diff">
            <b>Layer Base · E</b>
            <code>KC_E → KC_Q</code>
          </div>
        </div>
        <footer>
          <Button appearance="secondary" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={() => (step < 5 ? setStep(step + 1) : onClose())}>
            {step < 5 ? "次へ" : "完了"}
          </Button>
        </footer>
      </section>
    </div>
  );
}
