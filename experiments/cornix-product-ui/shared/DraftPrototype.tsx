import { useMemo, useState, type CSSProperties } from "react";
import { makePalette, schemes, type Mode } from "../../color-schemes-material/shared/palettes";
import { Button } from "../../button/shared/Button";
import "./draft.css";

export type DraftDirection = "chromatic-rail-next" | "target-library" | "focus-workbench";
type TargetId = "cornix" | "mac-ansi" | "mac-jis";
type TaskId = "keymap" | "overview" | "behaviors" | "validation";
type SaveState = "saved" | "saving" | "conflict" | "error";

const targets: { id: TargetId; label: string; detail: string }[] = [
  { id: "cornix", label: "Cornix LP", detail: "接続済み · 4 作業" },
  { id: "mac-ansi", label: "Mac ANSI", detail: "ローカル · 2 作業" },
  { id: "mac-jis", label: "Mac JIS", detail: "ローカル · 2 作業" },
];
const tasks: { id: TaskId; label: string; description: string }[] = [
  { id: "keymap", label: "キー割り当て", description: "キーを選び、動作を変更する" },
  { id: "overview", label: "全体マップ", description: "レイヤーと参照関係を見渡す" },
  { id: "behaviors", label: "動作定義", description: "Tap Dance と Combo を管理する" },
  { id: "validation", label: "検証", description: "差分、診断、対象情報を確認する" },
];
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

function canUse(target: TargetId, task: TaskId) {
  return target === "cornix" || task === "keymap" || task === "validation";
}

export function DraftPrototype({ direction }: { direction: DraftDirection }) {
  const query = new URLSearchParams(window.location.search);
  const initialScheme = schemes.some((item) => item.id === query.get("scheme"))
    ? query.get("scheme")!
    : "wasabi";
  const [target, setTarget] = useState<TargetId>("cornix");
  const [task, setTask] = useState<TaskId>("keymap");
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
  const currentTarget = targets.find((item) => item.id === target)!;
  const currentTask = tasks.find((item) => item.id === task)!;

  function selectTarget(value: TargetId) {
    setTarget(value);
    if (!canUse(value, task)) setTask("keymap");
  }

  function pickKey(value: string) {
    setSelectedKey(value);
    setSaveState("saving");
    window.setTimeout(() => setSaveState("saved"), 650);
  }

  return (
    <div className={`cornix-draft cornix-draft--${direction}`} data-theme={mode} style={colorStyle}>
      <a className="draft-skip" href="#draft-main">
        本文へ移動
      </a>
      <DraftHeader
        direction={direction}
        target={target}
        selectTarget={selectTarget}
        schemeId={schemeId}
        setSchemeId={setSchemeId}
        mode={mode}
        setMode={setMode}
      />
      {direction === "focus-workbench" ? null : (
        <DraftNavigation
          direction={direction}
          target={target}
          task={task}
          setTask={setTask}
          selectTarget={selectTarget}
        />
      )}
      <main id="draft-main" className="draft-main">
        <div className="draft-page-head">
          <div>
            <span>
              {currentTarget.label} <b>/</b> {currentTask.label}
            </span>
            <h1>{currentTask.label}</h1>
          </div>
          <p>
            {currentTask.description}。<br />
            変更はローカルに保存してから、必要なときだけ実機へ反映します。
          </p>
        </div>
        {direction === "focus-workbench" ? (
          <DraftTaskBar target={target} task={task} setTask={setTask} />
        ) : null}
        {task === "keymap" ? (
          <DraftEditor
            target={target}
            layer={layer}
            setLayer={setLayer}
            selectedKey={selectedKey}
            pickKey={pickKey}
            saveState={saveState}
            setSaveState={setSaveState}
          />
        ) : null}
        {task === "overview" ? <DraftOverview /> : null}
        {task === "behaviors" ? <DraftBehaviors /> : null}
        {task === "validation" ? <DraftValidation target={target} /> : null}
      </main>
      <DraftStatus
        saveState={saveState}
        setSaveState={setSaveState}
        onApply={() => setApplyOpen(true)}
      />
      {applyOpen ? <DraftApplyDialog onClose={() => setApplyOpen(false)} /> : null}
    </div>
  );
}

function DraftHeader({
  direction,
  target,
  selectTarget,
  schemeId,
  setSchemeId,
  mode,
  setMode,
}: {
  direction: DraftDirection;
  target: TargetId;
  selectTarget: (value: TargetId) => void;
  schemeId: string;
  setSchemeId: (value: string) => void;
  mode: Mode;
  setMode: (value: Mode) => void;
}) {
  return (
    <header className="draft-header">
      <div className="draft-brand">
        <span aria-hidden="true">芽</span>
        <strong>
          Cornix <small>Bonsai</small>
        </strong>
      </div>
      {direction === "focus-workbench" ? (
        <label className="draft-target-control">
          編集対象
          <select value={target} onChange={(event) => selectTarget(event.target.value as TargetId)}>
            {targets.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="draft-workspace">
        <span>Workspace</span>
        <strong>cornix-lp</strong>
        <code>~/keyboards/cornix</code>
      </div>
      <div className="draft-connection">
        <i aria-hidden="true" />{" "}
        {target === "cornix" ? "Cornix LP に接続済み" : "ローカル設定を編集中"}
      </div>
      <div className="draft-header-actions">
        <Button appearance="quiet" size="small">
          Workspace を開く
        </Button>
        <Button size="small">保存</Button>
      </div>
      <div className="draft-appearance">
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
  );
}

function DraftNavigation({
  direction,
  target,
  task,
  setTask,
  selectTarget,
}: {
  direction: DraftDirection;
  target: TargetId;
  task: TaskId;
  setTask: (value: TaskId) => void;
  selectTarget: (value: TargetId) => void;
}) {
  return (
    <nav className="draft-nav" aria-label="編集対象と作業">
      {direction === "target-library" ? (
        <div className="draft-target-list">
          <p>編集対象</p>
          {targets.map((item) => (
            <button
              className={target === item.id ? "is-active" : ""}
              onClick={() => selectTarget(item.id)}
              key={item.id}
            >
              <strong>{item.label}</strong>
              <small>{item.detail}</small>
            </button>
          ))}
        </div>
      ) : (
        <label className="draft-target-select">
          編集対象
          <select value={target} onChange={(event) => selectTarget(event.target.value as TargetId)}>
            {targets.map((item) => (
              <option value={item.id} key={item.id}>
                {item.label}
              </option>
            ))}
          </select>
        </label>
      )}
      <div className="draft-task-list">
        <p>作業</p>
        {tasks.map((item, index) => {
          const available = canUse(target, item.id);
          return (
            <button
              className={`${task === item.id ? "is-active" : ""} ${available ? "" : "is-disabled"}`}
              type="button"
              aria-disabled={!available}
              aria-describedby={!available ? `draft-reason-${item.id}` : undefined}
              onClick={() => available && setTask(item.id)}
              key={item.id}
            >
              <span>0{index + 1}</span>
              <strong>{item.label}</strong>
              {!available ? (
                <small id={`draft-reason-${item.id}`}>この対象では利用できません</small>
              ) : null}
            </button>
          );
        })}
      </div>
      <button
        className="draft-guide"
        type="button"
        onClick={() =>
          document.getElementById("draft-main")?.scrollIntoView({ behavior: "smooth" })
        }
      >
        使い方を見る
      </button>
    </nav>
  );
}

function DraftTaskBar({
  target,
  task,
  setTask,
}: {
  target: TargetId;
  task: TaskId;
  setTask: (value: TaskId) => void;
}) {
  return (
    <nav className="draft-task-bar" aria-label="作業">
      <span>作業</span>
      {tasks.map((item) => {
        const available = canUse(target, item.id);
        return (
          <button
            className={`${task === item.id ? "is-active" : ""} ${available ? "" : "is-disabled"}`}
            type="button"
            aria-disabled={!available}
            onClick={() => available && setTask(item.id)}
            key={item.id}
          >
            {item.label}
            {!available ? <small className="draft-task-reason">対象外</small> : null}
          </button>
        );
      })}
    </nav>
  );
}

function DraftEditor({
  target,
  layer,
  setLayer,
  selectedKey,
  pickKey,
  saveState,
  setSaveState,
}: {
  target: TargetId;
  layer: string;
  setLayer: (value: string) => void;
  selectedKey: string;
  pickKey: (value: string) => void;
  saveState: SaveState;
  setSaveState: (value: SaveState) => void;
}) {
  return (
    <div className="draft-editor">
      <section className="draft-stage" aria-label="キー配列編集">
        <div className="draft-stage-toolbar">
          <div className="draft-layers">
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
          <Button appearance="secondary" size="small">
            盤面を拡大
          </Button>
        </div>
        <div className="draft-board">
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
        <div className="draft-encoders">
          <span>Encoder 0</span>
          <button>↺ 音量 −</button>
          <button>↻ 音量 ＋</button>
          <span>Encoder 1</span>
          <button>↺ 前へ</button>
          <button>↻ 次へ</button>
        </div>
        <section className="draft-picker">
          <header>
            <div>
              <span>Keycode picker</span>
              <h2>割り当てを選ぶ</h2>
            </div>
            <div>
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
          <div className="draft-picker-grid">
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
      </section>
      <aside className="draft-inspector">
        <div className="draft-inspector-head">
          <span>選択中</span>
          <strong>{selectedKey}</strong>
          <code>{target === "cornix" ? "KC_E" : "key_code::e"}</code>
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
          <input defaultValue={selectedKey} />
        </label>
        <div className={`draft-save draft-save--${saveState}`} aria-live="polite">
          <strong>
            {saveState === "saved"
              ? "ローカル保存済み"
              : saveState === "saving"
                ? "保存中…"
                : saveState === "conflict"
                  ? "外部変更と競合した"
                  : "保存できなかった"}
          </strong>
          <code>{target === "cornix" ? "keymap.yaml" : "mac-keyboard.yaml"}</code>
          {saveState === "error" ? (
            <Button appearance="danger" size="small" onClick={() => setSaveState("saving")}>
              再試行
            </Button>
          ) : null}
        </div>
        <div className="draft-state-demo">
          <span>状態を確認</span>
          <button onClick={() => setSaveState("saved")}>保存済み</button>
          <button onClick={() => setSaveState("conflict")}>競合</button>
          <button onClick={() => setSaveState("error")}>失敗</button>
        </div>
        <p>ここで行うのはファイルへのローカル保存です。実機へ反映する操作ではありません。</p>
      </aside>
    </div>
  );
}

function DraftOverview() {
  return (
    <div className="draft-cards">
      {layers.map((layer, index) => (
        <article key={layer}>
          <header>
            <span>0{index + 1}</span>
            <h2>{layer}</h2>
            <b>{index === 0 ? "基準" : `${index + 2} 参照`}</b>
          </header>
          <div className="draft-mini-board">
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
function DraftBehaviors() {
  return (
    <div className="draft-list">
      {[
        ["Tap Dance 0", "Tap: Esc / Hold: ⌃"],
        ["Combo 1", "J + K → Esc"],
        ["Layer Tap", "Space / Nav"],
      ].map(([title, body], index) => (
        <article key={title}>
          <span>0{index + 1}</span>
          <div>
            <h2>{title}</h2>
            <p>{body}</p>
          </div>
          <Button appearance="secondary" size="small">
            編集
          </Button>
        </article>
      ))}
    </div>
  );
}
function DraftValidation({ target }: { target: TargetId }) {
  return (
    <div className="draft-validation">
      <section>
        <span className="is-ok">✓</span>
        <div>
          <h2>設定ファイル</h2>
          <p>
            {target === "cornix" ? "keymap.yaml" : "mac-keyboard.yaml"}{" "}
            に未保存の変更が3件あります。
          </p>
        </div>
        <Button appearance="secondary" size="small">
          差分を見る
        </Button>
      </section>
      <section>
        <span className="is-warning">!</span>
        <div>
          <h2>検証結果</h2>
          <p>警告 2件。Layer Nav の参照先を確認してください。</p>
        </div>
        <Button appearance="secondary" size="small">
          詳細を見る
        </Button>
      </section>
      <section>
        <span className="is-info">i</span>
        <div>
          <h2>接続対象</h2>
          <p>
            {target === "cornix" ? "Cornix LP · USB接続済み" : "ローカルレイアウト · 実機未接続"}
          </p>
        </div>
        <Button appearance="secondary" size="small">
          対象を確認
        </Button>
      </section>
    </div>
  );
}
function DraftStatus({
  saveState,
  setSaveState,
  onApply,
}: {
  saveState: SaveState;
  setSaveState: (value: SaveState) => void;
  onApply: () => void;
}) {
  return (
    <footer className="draft-status">
      <button className="draft-severity draft-severity--error">
        エラー <b>0</b>
      </button>
      <button className="draft-severity draft-severity--warning">
        警告 <b>2</b>
      </button>
      <span className="draft-status-message">
        {saveState === "saving"
          ? "保存中…"
          : saveState === "saved"
            ? "ローカル保存済み · keymap.yaml"
            : "変更を確認してください · keymap.yaml"}
      </span>
      <Button appearance="secondary" size="small" onClick={() => setSaveState("saved")}>
        保存
      </Button>
      <Button size="small" onClick={onApply}>
        実機へ Apply…
      </Button>
    </footer>
  );
}
function DraftApplyDialog({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  return (
    <div className="draft-modal-backdrop">
      <section
        className="draft-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="draft-apply-title"
      >
        <header>
          <div>
            <span>安全な実機反映</span>
            <h2 id="draft-apply-title">変更を Apply</h2>
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
        <div className="draft-modal-body">
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
          <div>
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
