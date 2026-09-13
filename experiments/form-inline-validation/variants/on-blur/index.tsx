import { useRef, useState, type FormEvent } from "react";
import { flushSync } from "react-dom";
import "./styles.css";

// variant `on-blur`: 各フィールドの離脱時に、そのフィールドだけを検証する。
// 文言は事実のみ、feedback はエラーのみ。成功は送信完了の表示だけで伝える。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

type FieldSpec = {
  name: FieldName;
  label: string;
  type: "email" | "password" | "text";
};

// 表示順と検証順を兼ねる。送信時に最初のエラーへフォーカスを移す順序もこれに従う。
const fields: FieldSpec[] = [
  { name: "email", label: "メールアドレス", type: "email" },
  { name: "password", label: "パスワード", type: "password" },
  { name: "displayName", label: "表示名", type: "text" },
];

const initialValues: Values = { email: "", password: "", displayName: "" };

// 検証規則は全 variant で共通。問題がなければ undefined を返す。
function validateField(name: FieldName, value: string): string | undefined {
  // 空白だけの入力は未入力とみなす
  const isBlank = value.trim() === "";
  switch (name) {
    case "email":
      if (isBlank) return "メールアドレスが未入力です";
      if (!value.includes("@")) return "メールアドレスの形式が正しくありません";
      return undefined;
    case "password":
      if (isBlank) return "パスワードが未入力です";
      if (value.length < 8) return "パスワードが 8 文字未満です";
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        return "パスワードに英字と数字の両方が含まれていません";
      }
      return undefined;
    case "displayName":
      if (isBlank) return "表示名が未入力です";
      // サロゲートペアを 1 文字と数えるため、コードポイント単位で長さを取る
      if (Array.from(value).length > 20) return "表示名が 20 文字を超えています";
      return undefined;
  }
}

export default function OnBlurForm() {
  const [values, setValues] = useState<Values>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    password: null,
    displayName: null,
  });

  function handleChange(name: FieldName, value: string) {
    // 入力中は値だけ更新し、エラー文言は触らない
    setValues((prev) => ({ ...prev, [name]: value }));
  }

  function handleBlur(name: FieldName, value: string) {
    // 離脱のたびに再検証し、文言の更新と解消を反映する
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors: Errors = {};
    for (const { name } of fields) {
      nextErrors[name] = validateField(name, values[name]);
    }
    const firstInvalid = fields.find(({ name }) => nextErrors[name] !== undefined);

    if (firstInvalid) {
      // aria-describedby の参照先を先に描画してからフォーカスを移す
      flushSync(() => setErrors(nextErrors));
      inputRefs.current[firstInvalid.name]?.focus();
      return;
    }

    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="fiv-on-blur-root">
        <p role="status" className="fiv-on-blur-status">
          登録が完了しました
        </p>
      </div>
    );
  }

  return (
    <div className="fiv-on-blur-root">
      <form className="fiv-on-blur-form" noValidate onSubmit={handleSubmit}>
        {fields.map(({ name, label, type }) => {
          const inputId = `fiv-on-blur-${name}`;
          const errorId = `${inputId}-error`;
          const error = errors[name];
          return (
            <div key={name} className="fiv-on-blur-field">
              <label htmlFor={inputId} className="fiv-on-blur-label">
                {label}
              </label>
              <input
                ref={(el) => {
                  inputRefs.current[name] = el;
                }}
                id={inputId}
                name={name}
                type={type}
                className="fiv-on-blur-input"
                value={values[name]}
                aria-invalid={error ? "true" : undefined}
                aria-describedby={error ? errorId : undefined}
                onChange={(event) => handleChange(name, event.currentTarget.value)}
                onBlur={(event) => handleBlur(name, event.currentTarget.value)}
              />
              {error && (
                <p id={errorId} className="fiv-on-blur-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}
        <button type="submit" className="fiv-on-blur-submit">
          登録する
        </button>
      </form>
    </div>
  );
}
