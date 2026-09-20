import { useState } from "react";

/** hex をコピーする。clipboard が無い環境でも落とさない。 */
export function useCopy(): { copied: string | null; copy: (value: string) => void } {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = (value: string) => {
    void navigator.clipboard
      ?.writeText(value)
      .then(() => setCopied(value))
      .catch(() => setCopied(null));
  };
  return { copied, copy };
}
