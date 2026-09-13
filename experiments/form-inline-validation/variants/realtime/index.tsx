import { useRef, useState, type ChangeEvent, type FormEvent, type RefObject } from "react";
import "./styles.css";

// variant `realtime`
// 検証タイミング: 各フィールドは最初の blur までは検証せず、以降は入力のたびに検証して文言を即時に更新する。
// 文言: 対処法つき。feedback: エラーと成功の両方を表示する。

const FIELD_ORDER = ["email", "password", "displayName"] as const;
type FieldName = (typeof FIELD_ORDER)[number];

const LABELS: Record<FieldName, string> = {
  email: "メールアドレス",
  password: "パスワード",
  displayName: "表示名",
};

const INPUT_TYPES: Record<FieldName, "email" | "password" | "text"> = {
  email: "email",
  password: "password",
  displayName: "text",
};

const SUCCESS_MESSAGE = "問題ありません";

// 検証規則は Brief の Constraints に従う。戻り値 null は有効を表す。
const VALIDATORS: Record<FieldName, (value: string) => string | null> = {
  email: (value) => {
    if (value === "") return "メールアドレスを入力してください";
    if (!value.includes("@")) return "name@example.com の形式で入力してください";
    return null;
  },
  password: (value) => {
    if (value === "") return "パスワードを入力してください";
    if (value.length < 8) return "パスワードは 8 文字以上にしてください";
    if (!/[A-Za-z]/.test(value) || !/[0-9]/.test(value)) {
      return "パスワードには英字と数字の両方を含めてください";
    }
    return null;
  },
  displayName: (value) => {
    if (value === "") return "表示名を入力してください";
    if (value.length > 20) return "表示名は 20 文字以内にしてください";
    return null;
  },
};

type Values = Record<FieldName, string>;
type Touched = Record<FieldName, boolean>;

const INITIAL_VALUES: Values = { email: "", password: "", displayName: "" };
const UNTOUCHED: Touched = { email: false, password: false, displayName: false };
const ALL_TOUCHED: Touched = { email: true, password: true, displayName: true };

// 検証後にフィールド直下へ出す状態文言。エラーがなければ成功文言。
function statusMessage(name: FieldName, value: string): string {
  return VALIDATORS[name](value) ?? SUCCESS_MESSAGE;
}

export default function RealtimeValidationForm() {
  const [values, setValues] = useState<Values>(INITIAL_VALUES);
  // 最初の blur を経たフィールド。true になって以降は onChange でも検証する。
  const [touched, setTouched] = useState<Touched>(UNTOUCHED);
  const [submitted, setSubmitted] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const lastAnnouncementRef = useRef("");
  const inputRefs: Record<FieldName, RefObject<HTMLInputElement | null>> = {
    email: useRef<HTMLInputElement>(null),
    password: useRef<HTMLInputElement>(null),
    displayName: useRef<HTMLInputElement>(null),
  };

  // live region へ通知する。同じ文言の連続通知は抑止する。
  const announce = (text: string) => {
    if (text === lastAnnouncementRef.current) return;
    lastAnnouncementRef.current = text;
    setAnnouncement(text);
  };

  const handleChange = (name: FieldName) => (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setValues((prev) => ({ ...prev, [name]: next }));
    // 最初の blur 前は検証しない
    if (!touched[name]) return;
    const before = statusMessage(name, values[name]);
    const after = statusMessage(name, next);
    if (after !== before) announce(`${LABELS[name]}: ${after}`);
  };

  const handleBlur = (name: FieldName) => () => {
    // 2 回目以降の blur は onChange で検証済みのため何もしない
    if (touched[name]) return;
    setTouched((prev) => ({ ...prev, [name]: true }));
    announce(`${LABELS[name]}: ${statusMessage(name, values[name])}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // 検証済みのフィールドは onChange で文言が最新のため、状態が変わるのは未検証のフィールドだけ
    const newlyValidated = FIELD_ORDER.filter((name) => !touched[name]);
    setTouched(ALL_TOUCHED);

    const firstInvalid = FIELD_ORDER.find((name) => VALIDATORS[name](values[name]) !== null);
    if (firstInvalid === undefined) {
      setSubmitted(true);
      return;
    }

    inputRefs[firstInvalid].current?.focus();
    if (newlyValidated.length > 0) {
      announce(
        newlyValidated
          .map((name) => `${LABELS[name]}: ${statusMessage(name, values[name])}`)
          .join("。"),
      );
    }
  };

  if (submitted) {
    return (
      <div className="fiv-realtime">
        <p role="status">登録が完了しました</p>
      </div>
    );
  }

  return (
    <div className="fiv-realtime">
      <form className="fiv-realtime-form" noValidate onSubmit={handleSubmit}>
        {FIELD_ORDER.map((name) => {
          const inputId = `fiv-realtime-${name}`;
          const messageId = `${inputId}-message`;
          const error = touched[name] ? VALIDATORS[name](values[name]) : null;
          const isInvalid = error !== null;
          const message = touched[name] ? (error ?? SUCCESS_MESSAGE) : null;
          return (
            <div key={name} className="fiv-realtime-field">
              <label htmlFor={inputId} className="fiv-realtime-label">
                {LABELS[name]}
              </label>
              <input
                ref={inputRefs[name]}
                id={inputId}
                name={name}
                type={INPUT_TYPES[name]}
                className="fiv-realtime-input"
                value={values[name]}
                onChange={handleChange(name)}
                onBlur={handleBlur(name)}
                aria-invalid={isInvalid ? "true" : undefined}
                aria-describedby={message === null ? undefined : messageId}
              />
              {message !== null && (
                // key に文言を使い、切り替え時に要素を作り直して表示アニメーションを再生する
                <p
                  key={message}
                  id={messageId}
                  className={`fiv-realtime-message ${
                    isInvalid ? "fiv-realtime-message--error" : "fiv-realtime-message--valid"
                  }`}
                >
                  {!isInvalid && (
                    <span className="fiv-realtime-check" aria-hidden="true">
                      ✓
                    </span>
                  )}
                  {message}
                </p>
              )}
            </div>
          );
        })}
        <button type="submit" className="fiv-realtime-submit">
          登録する
        </button>
        {/* 状態が変わったフィールドの「ラベル: 文言」を支援技術へ通知する。視覚的には非表示。 */}
        <p role="status" aria-live="polite" className="fiv-realtime-visually-hidden">
          {announcement}
        </p>
      </form>
    </div>
  );
}
