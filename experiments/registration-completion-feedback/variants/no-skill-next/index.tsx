import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `no-skill-next`: 登録を「入力 → 完了 → ログイン」の道のりとして見せる。
// 完了面は次に取れる操作を並べ、面は進む向きへ横に送る。戻るときは逆向きに送る。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
// pending は form の面のまま送信中を示す。
type Phase = "editing" | "pending" | "done" | "login";
type Direction = "forward" | "back";

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

const STEPS = ["情報の入力", "登録完了", "ログイン"] as const;

const ID_PREFIX = "rcf-next";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const hintId = (name: FieldName) => `${ID_PREFIX}-${name}-hint`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;
const LOGIN_EMAIL_ID = `${ID_PREFIX}-login-email`;
const LOGIN_PASSWORD_ID = `${ID_PREFIX}-login-password`;
const LOGIN_CAPTION_ID = `${ID_PREFIX}-login-caption`;

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

export default function NoSkillNext() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。count は同じエラーで再送信したときも要約へフォーカスを戻すために持つ。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [view, setView] = useState<{ phase: Phase; direction: Direction }>({
    phase: "editing",
    direction: "forward",
  });
  const [registered, setRegistered] = useState<{ email: string; displayName: string } | null>(null);
  const [loginNoted, setLoginNoted] = useState(false);

  const summaryRef = useRef<HTMLElement | null>(null);
  const faceHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const loginPasswordRef = useRef<HTMLInputElement | null>(null);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    password: null,
    displayName: null,
  });
  // 初回表示ではフォーカスを奪わない。
  const movedRef = useRef(false);

  const { phase, direction } = view;

  useEffect(() => {
    if (submission.count > 0) {
      summaryRef.current?.focus();
    }
  }, [submission]);

  // 疑似送信。途中で variant を離れたらタイマーを捨てる。
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = window.setTimeout(() => {
      setRegistered({ email: values.email.trim(), displayName: values.displayName.trim() });
      // 登録後の面では使わないので、パスワードを状態に残さない。
      setValues((prev) => ({ ...prev, password: "" }));
      setView({ phase: "done", direction: "forward" });
    }, PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase, values]);

  // 面が替わったらフォーカスを新しい面へ移す。ログインは次に打つ欄、それ以外は見出し。
  useEffect(() => {
    if (phase === "pending") return;
    if (!movedRef.current) {
      movedRef.current = phase !== "editing";
      if (!movedRef.current) return;
    }
    if (phase === "login") {
      loginPasswordRef.current?.focus();
    } else if (phase === "done") {
      faceHeadingRef.current?.focus();
    } else {
      inputRefs.current.email?.focus();
    }
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中の連打と Enter の連続は無視する。
    if (phase !== "editing") return;
    const errors = validate(values);
    if (Object.keys(errors).length === 0) {
      setSubmission((prev) => ({ count: prev.count, errors: {} }));
      setView({ phase: "pending", direction: "forward" });
      return;
    }
    setSubmission((prev) => ({ count: prev.count + 1, errors }));
  };

  const focusField = (name: FieldName) => (event: MouseEvent<HTMLAnchorElement>) => {
    // hash を変えると実行基盤の variant 選択が外れるため、既定の遷移は止めてフォーカスだけ移す。
    event.preventDefault();
    inputRefs.current[name]?.focus();
  };

  const registerAnother = () => {
    setValues(INITIAL_VALUES);
    setLoginNoted(false);
    setView({ phase: "editing", direction: "back" });
  };

  const pending = phase === "pending";
  const stepIndex = phase === "login" ? 2 : phase === "done" ? 1 : 0;
  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);
  const faceClass = `rcf-next-face rcf-next-face-${direction}`;

  return (
    <div className="rcf-next">
      <div className="rcf-next-card">
        <ol className="rcf-next-steps" aria-label="登録の進み具合">
          {STEPS.map((step, index) => (
            <li
              key={step}
              className="rcf-next-step"
              data-state={index < stepIndex ? "past" : index === stepIndex ? "current" : "ahead"}
              aria-current={index === stepIndex ? "step" : undefined}
            >
              <span className="rcf-next-step-mark" aria-hidden="true">
                {index < stepIndex ? "✓" : index + 1}
              </span>
              {step}
              {index < stepIndex && <span className="rcf-next-sr-only">（済み）</span>}
            </li>
          ))}
        </ol>

        <div className="rcf-next-stage">
          {phase === "done" && registered !== null && (
            <div key="done" className={faceClass}>
              <h1 ref={faceHeadingRef} tabIndex={-1} className="rcf-next-title">
                登録が完了しました
              </h1>
              <p className="rcf-next-lead">
                {registered.displayName} さんのアカウントを作成しました。
              </p>
              <h2 className="rcf-next-heading">次にできること</h2>
              <ul className="rcf-next-actions">
                <li>
                  <button
                    type="button"
                    className="rcf-next-submit"
                    onClick={() => setView({ phase: "login", direction: "forward" })}
                  >
                    ログインへ進む
                  </button>
                  <p className="rcf-next-caption">
                    <span className="rcf-next-email">{registered.email}</span> でログインします
                  </p>
                </li>
                <li>
                  <button type="button" className="rcf-next-secondary" onClick={registerAnother}>
                    別のアカウントを登録する
                  </button>
                </li>
              </ul>
            </div>
          )}

          {phase === "login" && registered !== null && (
            <div key="login" className={faceClass}>
              <h1 className="rcf-next-title">ログイン</h1>
              <form
                className="rcf-next-form"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  setLoginNoted(true);
                }}
              >
                <div className="rcf-next-field">
                  <label htmlFor={LOGIN_EMAIL_ID} className="rcf-next-label">
                    メールアドレス
                  </label>
                  <p id={LOGIN_CAPTION_ID} className="rcf-next-hint">
                    登録したメールアドレスを入れてあります
                  </p>
                  <input
                    id={LOGIN_EMAIL_ID}
                    type="email"
                    autoComplete="email"
                    className="rcf-next-input"
                    defaultValue={registered.email}
                    aria-describedby={LOGIN_CAPTION_ID}
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
                  />
                </div>
                <button type="submit" className="rcf-next-submit">
                  ログインする
                </button>
                <p role="status" className="rcf-next-caption">
                  {loginNoted ? "デモのため、ログインはここまでです。" : ""}
                </p>
                <button
                  type="button"
                  className="rcf-next-secondary"
                  onClick={() => {
                    setLoginNoted(false);
                    setView({ phase: "done", direction: "back" });
                  }}
                >
                  登録完了に戻る
                </button>
              </form>
            </div>
          )}

          {(phase === "editing" || pending) && (
            <div key="form" className={faceClass}>
              <h1 className="rcf-next-title">アカウント登録</h1>
              <form className="rcf-next-form" noValidate onSubmit={handleSubmit}>
                {erroredFields.length > 0 && (
                  // role="alert" は使わず、フォーカス移動で要約を伝える。
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
                  const describedBy = [
                    field.hint !== undefined ? hintId(field.name) : null,
                    error !== undefined ? errorId(field.name) : null,
                  ]
                    .filter(Boolean)
                    .join(" ");
                  return (
                    <div key={field.name} className="rcf-next-field">
                      <label htmlFor={inputId(field.name)} className="rcf-next-label">
                        {field.label}
                      </label>
                      {field.hint !== undefined && (
                        <p id={hintId(field.name)} className="rcf-next-hint">
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
                        className="rcf-next-input"
                        value={values[field.name]}
                        readOnly={pending}
                        onChange={(event) => {
                          const next = event.target.value;
                          setValues((prev) => ({ ...prev, [field.name]: next }));
                        }}
                        aria-invalid={error !== undefined ? true : undefined}
                        aria-describedby={describedBy === "" ? undefined : describedBy}
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
                  className="rcf-next-submit"
                  aria-disabled={pending ? true : undefined}
                >
                  {pending ? "登録しています…" : "登録する"}
                </button>
                <p role="status" className="rcf-next-sr-only">
                  {pending ? "登録しています" : ""}
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
