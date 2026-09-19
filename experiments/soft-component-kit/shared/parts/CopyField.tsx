import { useId, useState } from "react";

type Props = {
  value: string;
  label: string;
};

export function CopyField({ value, label }: Props) {
  const liveId = useId();
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setMessage(`${label}をコピーしました`);
    } catch {
      setCopied(false);
      setMessage("コピーできませんでした");
    }
    window.setTimeout(() => {
      setCopied(false);
      setMessage("");
    }, 2000);
  }

  return (
    <span className="sk-copy">
      <code>{value}</code>
      <button
        type="button"
        className="sk-button sk-button-ghost sk-copy-button"
        onClick={() => void copy()}
        aria-describedby={liveId}
      >
        {copied ? <CheckIcon /> : <CopyIcon />}
        <span className="sk-copy-label">{copied ? "完了" : "コピー"}</span>
      </button>
      <span id={liveId} className="sk-live" aria-live="polite">
        {message}
      </span>
    </span>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <rect
        x="5.5"
        y="5.5"
        width="8"
        height="8"
        rx="1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M10.5 5.5V3.8A1.3 1.3 0 0 0 9.2 2.5H3.8A1.3 1.3 0 0 0 2.5 3.8v5.4A1.3 1.3 0 0 0 3.8 10.5H5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.2 8.2 6.4 11.4 12.8 4.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
