import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "../../../../tokens/typography/index.css";
import "./styles.css";

// variant `no-skill-replace`: 送信成功後、同じカードの中でフォームを完了面へ差し替える。
// カードの位置と大きさを保ち、「いま送ったフォームが完了に変わった」と読めるようにする。

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

const ID_PREFIX = "rcf-replace";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const hintId = (name: FieldName) => `${ID_PREFIX}-${name}-hint`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;

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
    <svg className="rcf-replace-check" viewBox="0 0 48 48" aria-hidden="true">
      <circle className="rcf-replace-check-ring" cx="24" cy="24" r="21" />
      <path className="rcf-replace-check-mark" d="M14 24.5l7 7 13-14" pathLength={1} />
    </svg>
  );
}

export default function NoSkillReplace() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。count は同じエラーで再送信したときも要約へフォーカスを戻すために持つ。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [phase, setPhase] = useState<Phase>("editing");
  // 差し替えの前後でカードの高さを保つため、成功直前の高さを控える。
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const [loginNoted, setLoginNoted] = useState(false);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const summaryRef = useRef<HTMLElement | null>(null);
  const doneHeadingRef = useRef<HTMLHeadingElement | null>(null);
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
    const timer = window.setTimeout(() => {
      setCardHeight(cardRef.current?.offsetHeight ?? null);
      // 完了面では使わないので、パスワードを状態に残さない。
      setValues((prev) => ({ ...prev, password: "" }));
      setPhase("done");
    }, PENDING_MS);
    return () => window.clearTimeout(timer);
  }, [phase]);

  // フォームが消えるので、フォーカスを完了の見出しへ移す。読み上げもここから始まる。
  useEffect(() => {
    if (phase === "done") {
      doneHeadingRef.current?.focus();
    }
  }, [phase]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 送信中の連打と Enter の連続は無視する。
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
  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);

  return (
    <div className="rcf-replace">
      <div
        ref={cardRef}
        className="rcf-replace-card"
        style={phase === "done" && cardHeight !== null ? { minBlockSize: cardHeight } : undefined}
      >
        {phase === "done" ? (
          <div className="rcf-replace-done">
            <CheckIcon />
            <h1 ref={doneHeadingRef} tabIndex={-1} className="rcf-replace-title">
              登録が完了しました
            </h1>
            <p className="rcf-replace-lead">
              {values.displayName.trim()} さん、ようこそ。
              <br />
              <span className="rcf-replace-email">{values.email.trim()}</span> で登録しました。
            </p>
            <button
              type="button"
              className="rcf-replace-submit"
              onClick={() => setLoginNoted(true)}
            >
              ログインへ進む
            </button>
            <p role="status" className="rcf-replace-note">
              {loginNoted ? "デモのため、ログイン画面への移動はここまでです。" : ""}
            </p>
          </div>
        ) : (
          <>
            <h1 className="rcf-replace-title">アカウント登録</h1>
            <form className="rcf-replace-form" noValidate onSubmit={handleSubmit}>
              {erroredFields.length > 0 && (
                // role="alert" は使わず、フォーカス移動で要約を伝える。
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
                const describedBy = [
                  field.hint !== undefined ? hintId(field.name) : null,
                  error !== undefined ? errorId(field.name) : null,
                ]
                  .filter(Boolean)
                  .join(" ");
                return (
                  <div key={field.name} className="rcf-replace-field">
                    <label htmlFor={inputId(field.name)} className="rcf-replace-label">
                      {field.label}
                    </label>
                    {field.hint !== undefined && (
                      <p id={hintId(field.name)} className="rcf-replace-hint">
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
                      className="rcf-replace-input"
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
                className="rcf-replace-submit"
                aria-disabled={pending ? true : undefined}
              >
                {pending ? "登録しています…" : "登録する"}
              </button>
              <p role="status" className="rcf-replace-sr-only">
                {pending ? "登録しています" : ""}
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
