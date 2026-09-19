import { useId, useState } from "react";

type Props = {
  value: string;
  label: string;
  showValue?: boolean;
};

export function CopyButton({ value, label, showValue = true }: Props) {
  const liveId = useId();
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setMessage(`${label}をコピーしました`);
    } catch {
      setMessage("コピーできませんでした");
    }
    window.setTimeout(() => setMessage(""), 2000);
  }

  return (
    <span className="copy-field">
      {showValue ? <code>{value}</code> : null}
      <button type="button" className="copy-button" onClick={() => void copy()}>
        コピー
      </button>
      <span id={liveId} className="copy-status" aria-live="polite">
        {message}
      </span>
    </span>
  );
}
