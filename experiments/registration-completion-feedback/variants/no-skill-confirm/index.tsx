import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `no-skill-confirm`: 送信成功後もフォームを残し、エラー要約と同じ位置に完了の確認を載せる。
// 入力した内容は読み取り専用で残し、「この内容で登録された」と見比べられるようにする。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
type Phase = "editing" | "pending" | "done";

type Field = {
  name: FieldName;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
  hint?: string;
};

// フォームの並び順。要約のリストもこの順に出す。
const FIELDS: readonly Field[] = [
  { name: "email", label: "メールアドレス", type: "email", autoComplete: "email" },
  {
    name: "password",
    label: "パスワード",
    type: "password",
    autoComplete: "new-password",
    hint: "8 文字以上で、英字と数字を含めてください",
  },
  { name: "displayName", label: "表示名", type: "text", autoComplete: "nickname" },
];

const ID_PREFIX = "rcf-confirm";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const hintId = (name: FieldName) => `${ID_PREFIX}-${name}-hint`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;
const CONFIRM_HEADING_ID = `${ID_PREFIX}-confirm-heading`;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };

// 疑似送信の待ち時間。実測値ではなく、送信中の状態を観察するための固定値。
const PENDING_MS = 800;

// 検証規則は form-inline-validation の on-submit と同じ。
function validate(values: Values): Errors {
  const errors: Errors = {};

  const email = values.email.trim();
  if (email === "") {
    errors.email = "メールアドレスを入力してください";
  } else if (!email.includes("@")) {
    errors.email = "name@example.com の形式で入力してください";
  }

  const password = values.password;
  if (password === "") {
    errors.password = "パスワードを入力してください";
  } else if (password.length < 8) {
    errors.password = "パスワードは 8 文字以上にしてください";
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    errors.password = "パスワードには英字と数字の両方を含めてください";
  }

  const displayName = values.displayName.trim();
  if (displayName === "") {
    errors.displayName = "表示名を入力してください";
  } else if (displayName.length > 20) {
    errors.displayName = "表示名は 20 文字以内にしてください";
  }

  return errors;
}

function CheckIcon() {
  return (
    <svg className="rcf-confirm-check" viewBox="0 0 48 48" aria-hidden="true">
      <circle className="rcf-confirm-check-ring" cx="24" cy="24" r="21" />
      <path className="rcf-confirm-check-mark" d="M14 24.5l7 7 13-14" pathLength={1} />
    </svg>
  );
}

export default function NoSkillConfirm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。count は同じエラーで再送信したときも要約へフォーカスを戻すために持つ。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [phase, setPhase] = useState<Phase>("editing");
  const [loginNoted, setLoginNoted] = useState(false);

  const summaryRef = useRef<HTMLElement | null>(null);
  const confirmRef = useRef<HTMLElement | null>(null);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    password: null,
    displayName: null,
  });

  useEffect(() => {
    if (submission.count > 0) {
      summaryRef.current?.focus();
    }
  }, [submission]);

  // 疑似送信。途中で variant を離れたらタイマーを捨てる。
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = window.setTimeout(() => setPhase("done"), PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // 確認はボタンから離れた上端に出るので、エラー要約と同じくフォーカス移動で伝える。
  useEffect(() => {
    if (phase === "done") {
      confirmRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中の連打と、登録済みでの再送信は無視する。
    if (phase !== "editing") return;
    const errors = validate(values);
    if (Object.keys(errors).length === 0) {
      setSubmission((prev) => ({ count: prev.count, errors: {} }));
      setPhase("pending");
      return;
    }
    setSubmission((prev) => ({ count: prev.count + 1, errors }));
  };

  const focusField = (name: FieldName) => (event: MouseEvent<HTMLAnchorElement>) => {
    // hash を変えると実行基盤の variant 選択が外れるため、既定の遷移は止めてフォーカスだけ移す。
    event.preventDefault();
    inputRefs.current[name]?.focus();
  };

  const pending = phase === "pending";
  const done = phase === "done";
  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);

  return (
    <div className="rcf-confirm">
      <div className="rcf-confirm-card">
        <h1 className="rcf-confirm-title">アカウント登録</h1>
        <form className="rcf-confirm-form" noValidate onSubmit={handleSubmit}>
          {done && (
            <section
              ref={confirmRef}
              className="rcf-confirm-banner"
              tabIndex={-1}
              aria-labelledby={CONFIRM_HEADING_ID}
            >
              {/* 高さの展開で切り抜くのは内側だけにし、外側のフォーカスリングを残す。 */}
              <div className="rcf-confirm-banner-clip">
                <div className="rcf-confirm-banner-body">
                  <CheckIcon />
                  <div>
                    <h2 id={CONFIRM_HEADING_ID} className="rcf-confirm-banner-heading">
                      登録が完了しました
                    </h2>
                    <p className="rcf-confirm-banner-text">
                      下の内容で登録しました。続けてログインできます。
                    </p>
                    <button
                      type="button"
                      className="rcf-confirm-submit"
                      onClick={() => setLoginNoted(true)}
                    >
                      ログインへ進む
                    </button>
                    <p role="status" className="rcf-confirm-note">
                      {loginNoted ? "デモのため、ログイン画面への移動はここまでです。" : ""}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {erroredFields.length > 0 && (
            // role="alert" は使わず、フォーカス移動で要約を伝える。
            <section
              ref={summaryRef}
              className="rcf-confirm-summary"
              tabIndex={-1}
              aria-labelledby={SUMMARY_HEADING_ID}
            >
              <h2 id={SUMMARY_HEADING_ID} className="rcf-confirm-summary-heading">
                入力内容に {erroredFields.length} 件の問題があります
              </h2>
              <ul className="rcf-confirm-summary-list">
                {erroredFields.map((field) => (
                  <li key={field.name}>
                    <a href={`#${inputId(field.name)}`} onClick={focusField(field.name)}>
                      {errors[field.name]}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {FIELDS.map((field) => {
            const error = errors[field.name];
            // 登録後は規則の補足が不要になるので hint を外す。
            const showHint = field.hint !== undefined && !done;
            const describedBy = [
              showHint ? hintId(field.name) : null,
              error !== undefined ? errorId(field.name) : null,
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div key={field.name} className="rcf-confirm-field">
                <label htmlFor={inputId(field.name)} className="rcf-confirm-label">
                  {field.label}
                </label>
                {showHint && (
                  <p id={hintId(field.name)} className="rcf-confirm-hint">
                    {field.hint}
                  </p>
                )}
                <input
                  ref={(element) => {
                    inputRefs.current[field.name] = element;
                  }}
                  id={inputId(field.name)}
                  name={field.name}
                  type={field.type}
                  autoComplete={field.autoComplete}
                  className="rcf-confirm-input"
                  value={values[field.name]}
                  readOnly={pending || done}
                  onChange={(event) => {
                    const next = event.target.value;
                    setValues((prev) => ({ ...prev, [field.name]: next }));
                  }}
                  aria-invalid={error !== undefined ? true : undefined}
                  aria-describedby={describedBy === "" ? undefined : describedBy}
                />
                {error !== undefined && (
                  <p id={errorId(field.name)} className="rcf-confirm-error">
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {done ? (
            // 送信ボタンがあった場所に結果を残し、もう押す必要がないことを示す。
            <p className="rcf-confirm-registered">登録済み</p>
          ) : (
            // disabled にするとフォーカスが外れるため、aria-disabled で送信中を伝える。
            <button
              type="submit"
              className="rcf-confirm-submit"
              aria-disabled={pending ? true : undefined}
            >
              {pending ? "登録しています…" : "登録する"}
            </button>
          )}
          <p role="status" className="rcf-confirm-sr-only">
            {pending ? "登録しています" : ""}
          </p>
        </form>
      </div>
    </div>
  );
}
