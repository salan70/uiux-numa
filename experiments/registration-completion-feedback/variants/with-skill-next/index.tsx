import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `with-skill-next`: 完了を「登録 → ログイン → 利用開始」の流れの 1 歩として示し、次の面へ前進する。
// 面は進む向き（右から）に入場する。動きの目的は「空間の連続」。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
// form: 入力中 / pending: 疑似送信中 / done: 完了と次の操作 / login: ログイン / welcome: 利用開始
type Phase = "form" | "pending" | "done" | "login" | "welcome";

type Field = {
  name: FieldName;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
};

const FIELDS: readonly Field[] = [
  { name: "email", label: "メールアドレス", type: "email", autoComplete: "email" },
  { name: "password", label: "パスワード", type: "password", autoComplete: "new-password" },
  { name: "displayName", label: "表示名", type: "text", autoComplete: "nickname" },
];

const STEPS = ["登録", "ログイン", "利用開始"] as const;
const STEP_INDEX: Record<Phase, number> = { form: 0, pending: 0, done: 1, login: 1, welcome: 2 };

const ID_PREFIX = "rcf-next";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;
const VIEW_HEADING_ID = `${ID_PREFIX}-view-heading`;
const LOGIN_PASSWORD_ID = `${ID_PREFIX}-login-password`;
const LOGIN_ERROR_ID = `${ID_PREFIX}-login-password-error`;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };

// 疑似送信の待ち時間。
const PENDING_MS = 900;

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

export default function WithSkillNext() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。入力中や blur では触らない。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [phase, setPhase] = useState<Phase>("form");
  // 入場の向き。進むときは右から、最初へ戻るときは左から入る。初回の描画では動かさない。
  const [direction, setDirection] = useState<"forward" | "back" | undefined>(undefined);
  const [loginPassword, setLoginPassword] = useState("");
  const [loginAttempt, setLoginAttempt] = useState<{ count: number; error?: string }>({ count: 0 });

  const summaryRef = useRef<HTMLElement | null>(null);
  const viewHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);
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

  useEffect(() => {
    if (loginAttempt.count > 0) {
      loginPasswordRef.current?.focus();
    }
  }, [loginAttempt]);

  // 疑似送信。途中で variant を切り替えても timer を残さない。
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = window.setTimeout(() => setPhase("done"), PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // 面が変わるたびに、フォーカスを新しい面の見出しへ移す。読み上げもこの移動で伝える。
  // 初回の描画と、同じ面のままの form → pending では移さない。
  const shownView = useRef<Phase>("form");
  useEffect(() => {
    const view = phase === "pending" ? "form" : phase;
    if (shownView.current === view) return;
    shownView.current = view;
    viewHeadingRef.current?.focus();
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中の連打と Enter の連続は無視する。
    if (phase !== "form") return;
    const errors = validate(values);
    if (Object.keys(errors).length === 0) {
      setSubmission({ count: 0, errors: {} });
      setDirection("forward");
      setPhase("pending");
      return;
    }
    setSubmission((prev) => ({ count: prev.count + 1, errors }));
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (loginPassword === "") {
      setLoginAttempt((prev) => ({ count: prev.count + 1, error: "パスワードを入力してください" }));
      return;
    }
    if (loginPassword !== values.password) {
      setLoginAttempt((prev) => ({
        count: prev.count + 1,
        error: "パスワードが違います。登録したパスワードを入力してください",
      }));
      return;
    }
    setPhase("welcome");
  };

  const focusField = (name: FieldName) => (event: MouseEvent<HTMLAnchorElement>) => {
    // hash を変えると実行基盤の variant 選択が外れるため、既定の遷移は止めてフォーカスだけ移す。
    event.preventDefault();
    inputRefs.current[name]?.focus();
  };

  const reset = () => {
    setValues(INITIAL_VALUES);
    setLoginPassword("");
    setLoginAttempt({ count: 0 });
    setDirection("back");
    setPhase("form");
  };

  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);
  const pending = phase === "pending";
  const stepIndex = STEP_INDEX[phase];
  // pending は form と同じ面なので、key を分けず入場を再生しない。
  const viewKey = pending ? "form" : phase;

  return (
    <div className="rcf-next">
      <div className="rcf-next-card">
        <ol className="rcf-next-steps" aria-label="利用開始までの流れ">
          {STEPS.map((step, index) => {
            const state = index < stepIndex ? "done" : index === stepIndex ? "current" : "todo";
            return (
              <li
                key={step}
                className="rcf-next-step"
                data-state={state}
                aria-current={state === "current" ? "step" : undefined}
              >
                <span className="rcf-next-step-marker" aria-hidden="true">
                  {state === "done" ? (
                    <svg viewBox="0 0 24 24">
                      <path d="M6 12.5l4 4 8-9" pathLength={1} />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </span>
                {step}
                {state === "done" && <span className="rcf-next-visually-hidden">（完了）</span>}
              </li>
            );
          })}
        </ol>

        <div key={viewKey} className="rcf-next-view" data-direction={direction}>
          {(phase === "form" || pending) && (
            <form className="rcf-next-form" noValidate onSubmit={handleSubmit}>
              <h1 ref={viewHeadingRef} className="rcf-next-title" tabIndex={-1}>
                アカウント登録
              </h1>

              {erroredFields.length > 0 && (
                <section
                  ref={summaryRef}
                  className="rcf-next-summary"
                  tabIndex={-1}
                  aria-labelledby={SUMMARY_HEADING_ID}
                >
                  <h2 id={SUMMARY_HEADING_ID} className="rcf-next-summary-heading">
                    入力内容に {erroredFields.length} 件の問題があります
                  </h2>
                  <ul className="rcf-next-summary-list">
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
                return (
                  <div key={field.name} className="rcf-next-field">
                    <label htmlFor={inputId(field.name)} className="rcf-next-label">
                      {field.label}
                    </label>
                    <input
                      ref={(element) => {
                        inputRefs.current[field.name] = element;
                      }}
                      id={inputId(field.name)}
                      name={field.name}
                      type={field.type}
                      autoComplete={field.autoComplete}
                      className="rcf-next-input"
                      value={values[field.name]}
                      readOnly={pending}
                      onChange={(event) => {
                        const next = event.target.value;
                        setValues((prev) => ({ ...prev, [field.name]: next }));
                      }}
                      aria-invalid={error !== undefined ? true : undefined}
                      aria-describedby={error !== undefined ? errorId(field.name) : undefined}
                    />
                    {error !== undefined && (
                      <p id={errorId(field.name)} className="rcf-next-error">
                        {error}
                      </p>
                    )}
                  </div>
                );
              })}

              {/* disabled にするとフォーカスが外れるため、aria-disabled で送信中を伝える。 */}
              <button
                type="submit"
                className="rcf-next-button"
                aria-disabled={pending ? true : undefined}
              >
                {pending && <span className="rcf-next-spinner" aria-hidden="true" />}
                {pending ? "登録しています…" : "登録する"}
              </button>
              <p role="status" className="rcf-next-visually-hidden">
                {pending ? "登録しています" : ""}
              </p>
            </form>
          )}

          {phase === "done" && (
            <section className="rcf-next-panel" aria-labelledby={VIEW_HEADING_ID}>
              <h1
                ref={viewHeadingRef}
                id={VIEW_HEADING_ID}
                className="rcf-next-title"
                tabIndex={-1}
              >
                登録が完了しました
              </h1>
              <p className="rcf-next-body">
                {values.displayName.trim()} さんのアカウントを作成しました。次はログインです。
              </p>
              <button
                type="button"
                className="rcf-next-button"
                onClick={() => {
                  setDirection("forward");
                  setPhase("login");
                }}
              >
                ログインへ進む
                <span aria-hidden="true">→</span>
              </button>
              <details className="rcf-next-details">
                <summary>登録内容を確認する</summary>
                <dl>
                  <dt>メールアドレス</dt>
                  <dd>{values.email.trim()}</dd>
                  <dt>表示名</dt>
                  <dd>{values.displayName.trim()}</dd>
                </dl>
              </details>
            </section>
          )}

          {phase === "login" && (
            <form className="rcf-next-form" noValidate onSubmit={handleLogin}>
              <h1 ref={viewHeadingRef} className="rcf-next-title" tabIndex={-1}>
                ログイン
              </h1>
              <p className="rcf-next-body">登録したメールアドレスを入力済みです。</p>
              <div className="rcf-next-field">
                <label htmlFor={`${ID_PREFIX}-login-email`} className="rcf-next-label">
                  メールアドレス
                </label>
                <input
                  id={`${ID_PREFIX}-login-email`}
                  type="email"
                  autoComplete="email"
                  className="rcf-next-input"
                  value={values.email.trim()}
                  readOnly
                />
              </div>
              <div className="rcf-next-field">
                <label htmlFor={LOGIN_PASSWORD_ID} className="rcf-next-label">
                  パスワード
                </label>
                <input
                  ref={loginPasswordRef}
                  id={LOGIN_PASSWORD_ID}
                  type="password"
                  autoComplete="current-password"
                  className="rcf-next-input"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  aria-invalid={loginAttempt.error !== undefined ? true : undefined}
                  aria-describedby={loginAttempt.error !== undefined ? LOGIN_ERROR_ID : undefined}
                />
                {loginAttempt.error !== undefined && (
                  <p id={LOGIN_ERROR_ID} className="rcf-next-error">
                    {loginAttempt.error}
                  </p>
                )}
              </div>
              <button type="submit" className="rcf-next-button">
                ログインする
              </button>
            </form>
          )}

          {phase === "welcome" && (
            <section className="rcf-next-panel" aria-labelledby={VIEW_HEADING_ID}>
              <h1
                ref={viewHeadingRef}
                id={VIEW_HEADING_ID}
                className="rcf-next-title"
                tabIndex={-1}
              >
                ようこそ、{values.displayName.trim()} さん
              </h1>
              <p className="rcf-next-body">ログインしました。試作はここまでです。</p>
              <button type="button" className="rcf-next-button-secondary" onClick={reset}>
                最初の登録フォームに戻る
              </button>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
