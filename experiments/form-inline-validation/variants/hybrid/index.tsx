import { useEffect, useRef, useState, type FormEvent, type MouseEvent } from "react";
import "./styles.css";

// variant `hybrid`: 最初の送信までは検証せず、送信時に全フィールドを検証してフォーム先頭の要約と各項目の直下に対処法つきの文言を出す。
// 送信を 1 回でも行った後は、各フィールドの blur 時にそのフィールドだけを再検証し、文言と要約を即時に更新する。入力中は更新しない。

type FieldName = "email" | "password" | "displayName";
type Values = Record<FieldName, string>;
type Errors = Partial<Record<FieldName, string>>;

type FieldSpec = {
  name: FieldName;
  label: string;
  type: "email" | "password" | "text";
  autoComplete: string;
};

// 表示順と検証順を兼ねる。要約のリストもこの順に出す。
const FIELDS: readonly FieldSpec[] = [
  { name: "email", label: "メールアドレス", type: "email", autoComplete: "email" },
  { name: "password", label: "パスワード", type: "password", autoComplete: "new-password" },
  { name: "displayName", label: "表示名", type: "text", autoComplete: "nickname" },
];

// 要約リンクの href と input の id を一致させるため、id は固定文字列にする。
const ID_PREFIX = "fiv-hybrid";
const inputId = (name: FieldName) => `${ID_PREFIX}-${name}`;
const errorId = (name: FieldName) => `${ID_PREFIX}-${name}-error`;
const SUMMARY_HEADING_ID = `${ID_PREFIX}-summary-heading`;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };

// 検証規則は全 variant で共通。問題がなければ undefined を返す。
function validateField(name: FieldName, value: string): string | undefined {
  switch (name) {
    case "email": {
      const email = value.trim();
      if (email === "") return "メールアドレスを入力してください";
      if (!email.includes("@")) return "name@example.com の形式で入力してください";
      return undefined;
    }
    case "password":
      // password は空白も文字として扱うため trim しない
      if (value === "") return "パスワードを入力してください";
      if (value.length < 8) return "パスワードは 8 文字以上にしてください";
      if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
        return "パスワードには英字と数字の両方を含めてください";
      }
      return undefined;
    case "displayName":
      if (value.trim() === "") return "表示名を入力してください";
      // サロゲートペアを 1 文字と数えるため、コードポイント単位で長さを取る
      if (Array.from(value).length > 20) return "表示名は 20 文字以内にしてください";
      return undefined;
  }
}

// 全フィールドを検証し、エラーのあるフィールドだけを持つオブジェクトを返す。
function validateAll(values: Values): Errors {
  const errors: Errors = {};
  for (const { name } of FIELDS) {
    const error = validateField(name, values[name]);
    if (error !== undefined) errors[name] = error;
  }
  return errors;
}

export default function HybridForm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  const [errors, setErrors] = useState<Errors>({});
  // エラーありで送信した回数。0 の間は blur でも検証しない。
  // 同じエラーで再送信したときも要約へフォーカスを戻すため、真偽値ではなく回数で持つ。
  const [submitCount, setSubmitCount] = useState(0);
  const [succeeded, setSucceeded] = useState(false);

  const summaryRef = useRef<HTMLElement | null>(null);
  const successRef = useRef<HTMLParagraphElement | null>(null);
  const inputRefs = useRef<Record<FieldName, HTMLInputElement | null>>({
    email: null,
    password: null,
    displayName: null,
  });

  // 要約は送信後に初めて描画されるので、描画後にフォーカスを移す。blur の再検証では動かさない。
  useEffect(() => {
    if (submitCount > 0) {
      summaryRef.current?.focus();
    }
  }, [submitCount]);

  // 送信ボタンが消えてフォーカスが body に落ちないよう、完了文の描画後にフォーカスを移す。
  useEffect(() => {
    if (succeeded) {
      successRef.current?.focus();
    }
  }, [succeeded]);

  const handleChange = (name: FieldName, value: string) => {
    // 入力中は値だけ更新し、文言と要約は触らない
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleBlur = (name: FieldName, value: string) => {
    // 最初の送信までは検証しない
    if (submitCount === 0) return;
    const error = validateField(name, value);
    setErrors((prev) => {
      const next = { ...prev };
      if (error === undefined) {
        delete next[name];
      } else {
        next[name] = error;
      }
      return next;
    });
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateAll(values);
    if (Object.keys(nextErrors).length === 0) {
      // サーバーなしで疑似的に成功させる
      setSucceeded(true);
      return;
    }
    setErrors(nextErrors);
    setSubmitCount((prev) => prev + 1);
  };

  const focusField = (name: FieldName) => (event: MouseEvent<HTMLAnchorElement>) => {
    // hash を変えると実行基盤の variant 選択が外れるため、既定の遷移は止めてフォーカスだけ移す。
    // Enter でもリンクの click が発火するため、この handler で両方を扱う。
    event.preventDefault();
    inputRefs.current[name]?.focus();
  };

  if (succeeded) {
    return (
      <div className="fiv-hybrid-root">
        <p ref={successRef} role="status" tabIndex={-1} className="fiv-hybrid-success">
          登録が完了しました
        </p>
      </div>
    );
  }

  const erroredFields = FIELDS.filter((field) => errors[field.name] !== undefined);

  return (
    <div className="fiv-hybrid-root">
      <form className="fiv-hybrid-form" noValidate onSubmit={handleSubmit}>
        {erroredFields.length > 0 && (
          // role="alert" は使わず、フォーカス移動で要約を伝える。見出しを名前として関連付ける。
          <section
            ref={summaryRef}
            className="fiv-hybrid-summary"
            tabIndex={-1}
            aria-labelledby={SUMMARY_HEADING_ID}
          >
            <h2 id={SUMMARY_HEADING_ID} className="fiv-hybrid-summary-heading">
              入力内容に {erroredFields.length} 件の問題があります
            </h2>
            <ul className="fiv-hybrid-summary-list">
              {erroredFields.map((field) => (
                <li key={field.name}>
                  <a
                    href={`#${inputId(field.name)}`}
                    className="fiv-hybrid-summary-link"
                    onClick={focusField(field.name)}
                  >
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
            <div key={field.name} className="fiv-hybrid-field">
              <label htmlFor={inputId(field.name)} className="fiv-hybrid-label">
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
                className="fiv-hybrid-input"
                value={values[field.name]}
                onChange={(event) => handleChange(field.name, event.currentTarget.value)}
                onBlur={(event) => handleBlur(field.name, event.currentTarget.value)}
                aria-invalid={error !== undefined ? "true" : undefined}
                aria-describedby={error !== undefined ? errorId(field.name) : undefined}
              />
              {error !== undefined && (
                <p id={errorId(field.name)} className="fiv-hybrid-error">
                  {error}
                </p>
              )}
            </div>
          );
        })}

        <button type="submit" className="fiv-hybrid-submit">
          登録する
        </button>
      </form>
    </div>
  );
}
