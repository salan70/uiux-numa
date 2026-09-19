import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `with-skill-replace`: 送信成功後、同じカードの中でフォームを完了面へ差し替える。
// カードの高さは送信時の実測値で保ち、面だけが入れ替わる。動きの目的は「状態の明示」。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;
// form: 入力中 / pending: 疑似送信中 / done: 完了面 / login: 次の操作の行き先（試作の範囲外を示す面）
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

const ID_PREFIX = "rcf-replace";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };

// 疑似送信の待ち時間と、フォームの退場を待つ時間。退場は styles.css の 150ms に合わせる。
const PENDING_MS = 900;
const LEAVE_MS = 150;

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

export default function WithSkillReplace() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。入力中や blur では触らない。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [phase, setPhase] = useState<Phase>("form");
  // 完了面の入場中だけ、退場するフォームを同じ位置に残す。
  const [formLeaving, setFormLeaving] = useState(false);
  const [cardMinHeight, setCardMinHeight] = useState<number | undefined>(undefined);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement | null>(null);
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
    const timer = window.setTimeout(() => {
      setCardMinHeight(cardRef.current?.offsetHeight);
      setFormLeaving(true);
      setPhase("done");
    }, PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  useEffect(() => {
    if (!formLeaving) return;
    const timer = window.setTimeout(() => setFormLeaving(false), LEAVE_MS);
    return () => window.clearTimeout(timer);
  }, [formLeaving]);

  // フォームが消えるので、フォーカスを完了の見出しへ移す。読み上げもこの移動で伝える。
  useEffect(() => {
    if (phase === "done") doneHeadingRef.current?.focus();
    if (phase === "login") loginHeadingRef.current?.focus();
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中の連打と Enter の連続は無視する。
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
    setFormLeaving(false);
    setCardMinHeight(undefined);
    setPhase("form");
  };

  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);
  const pending = phase === "pending";
  const showForm = phase === "form" || pending || formLeaving;

  return (
    <div className="rcf-replace">
      <div ref={cardRef} className="rcf-replace-card" style={{ minHeight: cardMinHeight }}>
        {showForm && (
          <form
            className="rcf-replace-form"
            noValidate
            onSubmit={handleSubmit}
            data-leaving={formLeaving ? "" : undefined}
            inert={formLeaving}
          >
            <h1 className="rcf-replace-title">アカウント登録</h1>

            {erroredFields.length > 0 && (
              <section
                ref={summaryRef}
                className="rcf-replace-summary"
                tabIndex={-1}
                aria-labelledby={SUMMARY_HEADING_ID}
              >
                <h2 id={SUMMARY_HEADING_ID} className="rcf-replace-summary-heading">
                  入力内容に {erroredFields.length} 件の問題があります
                </h2>
                <ul className="rcf-replace-summary-list">
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
                <div key={field.name} className="rcf-replace-field">
                  <label htmlFor={inputId(field.name)} className="rcf-replace-label">
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
                    className="rcf-replace-input"
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
                    <p id={errorId(field.name)} className="rcf-replace-error">
                      {error}
                    </p>
                  )}
                </div>
              );
            })}

            {/* disabled にするとフォーカスが外れるため、aria-disabled で送信中を伝える。 */}
            <button
              type="submit"
              className="rcf-replace-button"
              aria-disabled={pending ? true : undefined}
              data-pending={pending ? "" : undefined}
            >
              {pending && <span className="rcf-replace-spinner" aria-hidden="true" />}
              {pending ? "登録しています…" : "登録する"}
            </button>
            <p role="status" className="rcf-replace-visually-hidden">
              {pending ? "登録しています" : ""}
            </p>
          </form>
        )}

        {phase === "done" && (
          <section className="rcf-replace-done" aria-labelledby={`${ID_PREFIX}-done-heading`}>
            <svg className="rcf-replace-check" viewBox="0 0 48 48" aria-hidden="true">
              <circle cx="24" cy="24" r="22" />
              <path d="M14 24.5l7 7 13-14" pathLength={1} />
            </svg>
            <h1
              ref={doneHeadingRef}
              id={`${ID_PREFIX}-done-heading`}
              className="rcf-replace-title"
              tabIndex={-1}
            >
              登録が完了しました
            </h1>
            <p className="rcf-replace-body">
              {values.displayName.trim()} さんのアカウントを作成しました。
              <br />
              {values.email.trim()} でログインできます。
            </p>
            <button type="button" className="rcf-replace-button" onClick={() => setPhase("login")}>
              ログインへ進む
            </button>
          </section>
        )}

        {phase === "login" && (
          <section className="rcf-replace-login" aria-labelledby={`${ID_PREFIX}-login-heading`}>
            <h1
              ref={loginHeadingRef}
              id={`${ID_PREFIX}-login-heading`}
              className="rcf-replace-title"
              tabIndex={-1}
            >
              ログイン
            </h1>
            <p className="rcf-replace-body">
              ここから先はログイン画面です。この試作では扱いません。
            </p>
            <button type="button" className="rcf-replace-button-secondary" onClick={reset}>
              登録フォームに戻る
            </button>
          </section>
        )}
      </div>
    </div>
  );
}
