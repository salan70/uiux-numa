import { useId, useState } from "react";

type Props = {
  value: string;
  label: string;
};

export function CopyButton({ value, label }: Props) {
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
      <code>{value}</code>
      <button type="button" className="copy-button" onClick={() => void copy()}>
        コピー
      </button>
      <span id={liveId} className="copy-status" aria-live="polite">
        {message}
      </span>
    </span>
  );
}
