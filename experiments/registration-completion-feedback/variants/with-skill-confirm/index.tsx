import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `with-skill-confirm`: フォームを残したまま、送信ボタンの直下に完了の確認を載せる。
// 入力した内容は読み取り専用で残り、フォーカスは送信ボタンから動かさない。動きの目的は「フィードバック」。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
// form: 入力中 / pending: 疑似送信中 / done: 確認を載せた状態 / login: 次の操作の行き先（試作の範囲外を示す面）
type Phase = "form" | "pending" | "done" | "login";

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

const ID_PREFIX = "rcf-confirm";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;

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

export default function WithSkillConfirm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。入力中や blur では触らない。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [phase, setPhase] = useState<Phase>("form");

  const summaryRef = useRef<HTMLElement | null>(null);
  const loginHeadingRef = useRef<HTMLHeadingElement | null>(null);
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

  // 疑似送信。途中で variant を切り替えても timer を残さない。
  useEffect(() => {
    if (phase !== "pending") return;
    const timer = window.setTimeout(() => setPhase("done"), PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (phase === "login") loginHeadingRef.current?.focus();
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中と完了後の連打、Enter の連続は無視する。
    if (phase !== "form") return;
    const errors = validate(values);
    if (Object.keys(errors).length === 0) {
      setSubmission({ count: 0, errors: {} });
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

  const reset = () => {
    setValues(INITIAL_VALUES);
    setPhase("form");
  };

  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);
  const pending = phase === "pending";
  const done = phase === "done";

  if (phase === "login") {
    return (
      <div className="rcf-confirm">
        <section className="rcf-confirm-card" aria-labelledby={`${ID_PREFIX}-login-heading`}>
          <h1
            ref={loginHeadingRef}
            id={`${ID_PREFIX}-login-heading`}
            className="rcf-confirm-title"
            tabIndex={-1}
          >
            ログイン
          </h1>
          <p className="rcf-confirm-body">ここから先はログイン画面です。この試作では扱いません。</p>
          <button type="button" className="rcf-confirm-button-secondary" onClick={reset}>
            登録フォームに戻る
          </button>
        </section>
      </div>
    );
  }

  return (
    <div className="rcf-confirm">
      <form className="rcf-confirm-card" noValidate onSubmit={handleSubmit}>
        <h1 className="rcf-confirm-title">アカウント登録</h1>

        {erroredFields.length > 0 && (
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
          return (
            <div key={field.name} className="rcf-confirm-field">
              <label htmlFor={inputId(field.name)} className="rcf-confirm-label">
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
                className="rcf-confirm-input"
                value={values[field.name]}
                readOnly={pending || done}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((prev) => ({ ...prev, [field.name]: next }));
                }}
                aria-invalid={error !== undefined ? true : undefined}
                aria-describedby={error !== undefined ? errorId(field.name) : undefined}
              />
              {error !== undefined && (
                <p id={errorId(field.name)} className="rcf-confirm-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <div className="rcf-confirm-actions">
          {/* disabled にするとフォーカスが外れるため、aria-disabled で送信中と登録済みを伝える。 */}
          <button
            type="submit"
            className="rcf-confirm-button rcf-confirm-submit"
            aria-disabled={pending || done ? true : undefined}
            data-state={pending ? "pending" : done ? "done" : undefined}
          >
            {pending && <span className="rcf-confirm-spinner" aria-hidden="true" />}
            {done && (
              <svg className="rcf-confirm-check" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" pathLength={1} />
              </svg>
            )}
            {pending ? "登録しています…" : done ? "登録しました" : "登録する"}
          </button>

          {/* フォーカスを動かさないので、完了は live region で伝える。操作は region の外に置く。 */}
          <div className="rcf-confirm-result" data-shown={done ? "" : undefined}>
            <div role="status">
              {pending && <p className="rcf-confirm-visually-hidden">登録しています</p>}
              {done && (
                <>
                  <p className="rcf-confirm-result-heading">登録が完了しました</p>
                  <p className="rcf-confirm-body">
                    {values.displayName.trim()} さんのアカウントを作成しました。
                    {values.email.trim()} でログインできます。
                  </p>
                </>
              )}
            </div>
            {done && (
              <button
                type="button"
                className="rcf-confirm-button"
                onClick={() => setPhase("login")}
              >
                ログインへ進む
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
