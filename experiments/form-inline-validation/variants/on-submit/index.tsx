import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "./styles.css";

// variant `on-submit`: 送信時だけ全フィールドを検証し、フォーム先頭のエラー要約と各項目の直下に対処法つきの文言を出す。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

type Field = {
  name: FieldName;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
};

// フォームの並び順。要約のリストもこの順に出す。
const FIELDS: readonly Field[] = [
  { name: "email", label: "メールアドレス", type: "email", autoComplete: "email" },
  { name: "password", label: "パスワード", type: "password", autoComplete: "new-password" },
  { name: "displayName", label: "表示名", type: "text", autoComplete: "nickname" },
];

// 要約リンクの href と input の id を一致させるため、id は固定文字列にする。
const ID_PREFIX = "fiv-on-submit";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };

// 検証規則は全 variant で共通。email は必須で `@` を含む。password は必須で 8 文字以上、英字と数字を含む。表示名は必須で 1〜20 文字。
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

export default function OnSubmitForm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // エラーは送信時にだけ更新する。入力中や blur では触らない。
  // count は同じエラーで再送信したときも要約へフォーカスを戻すために持つ。
  const [submission, setSubmission] = useState<{ count: number; errors: Errors }>({
    count: 0,
    errors: {},
  });
  const [succeeded, setSucceeded] = useState(false);

  const summaryRef = useRef<HTMLElement | null>(null);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    password: null,
    displayName: null,
  });

  // 要約は送信後に初めて描画されるので、描画後にフォーカスを移す。
  useEffect(() => {
    if (submission.count > 0) {
      summaryRef.current?.focus();
    }
  }, [submission]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errors = validate(values);
    if (Object.keys(errors).length === 0) {
      // サーバーなしで疑似的に成功させる。
      setSucceeded(true);
      return;
    }
    setSubmission((prev) => ({ count: prev.count + 1, errors }));
  };

  const focusField = (name: FieldName) => (event: MouseEvent<HTMLAnchorElement>) => {
    // hash を変えると実行基盤の variant 選択が外れるため、既定の遷移は止めてフォーカスだけ移す。
    event.preventDefault();
    inputRefs.current[name]?.focus();
  };

  if (succeeded) {
    return (
      <div className="fiv-on-submit">
        <p role="status" className="fiv-on-submit-success">
          登録が完了しました
        </p>
      </div>
    );
  }

  const { errors } = submission;
  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);

  return (
    <div className="fiv-on-submit">
      <form className="fiv-on-submit-form" noValidate onSubmit={handleSubmit}>
        {erroredFields.length > 0 && (
          // role="alert" は使わず、フォーカス移動で要約を伝える。見出しを名前として関連付ける。
          <section
            ref={summaryRef}
            className="fiv-on-submit-summary"
            tabIndex={-1}
            aria-labelledby={SUMMARY_HEADING_ID}
          >
            <h2 id={SUMMARY_HEADING_ID} className="fiv-on-submit-summary-heading">
              入力内容に {erroredFields.length} 件の問題があります
            </h2>
            <ul className="fiv-on-submit-summary-list">
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
            <div key={field.name} className="fiv-on-submit-field">
              <label htmlFor={inputId(field.name)} className="fiv-on-submit-label">
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
                className="fiv-on-submit-input"
                value={values[field.name]}
                onChange={(event) => {
                  const next = event.target.value;
                  setValues((prev) => ({ ...prev, [field.name]: next }));
                }}
                aria-invalid={error !== undefined ? true : undefined}
                aria-describedby={error !== undefined ? errorId(field.name) : undefined}
              />
              {error !== undefined && (
                <p id={errorId(field.name)} className="fiv-on-submit-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <button type="submit" className="fiv-on-submit-submit">
          登録する
        </button>
      </form>
    </div>
  );
}
