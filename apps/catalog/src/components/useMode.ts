import { useEffect, useState } from "react";
import { PREFERENCE_EVENT } from "../theme";

/** いま描いている明暗。theme.ts が :root へ立てた値を読む。 */
export function useMode(): "light" | "dark" {
  const [mode, setMode] = useState(currentMode);
  useEffect(() => {
    const update = () => setMode(currentMode());
    window.addEventListener(PREFERENCE_EVENT, update);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", update);
    return () => {
      window.removeEventListener(PREFERENCE_EVENT, update);
      media.removeEventListener("change", update);
    };
  }, []);
  return mode;
}

function currentMode(): "light" | "dark" {
  return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}
