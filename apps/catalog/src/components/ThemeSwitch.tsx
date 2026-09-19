import { useEffect, useState } from "react";
import { applyTheme, persistTheme, readThemeChoice, type ThemeChoice } from "../theme";

const choices: { value: ThemeChoice; label: string }[] = [
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
  { value: "system", label: "system" },
];

export function ThemeSwitch() {
  const [choice, setChoice] = useState<ThemeChoice>("system");

  useEffect(() => {
    const next = readThemeChoice();
    setChoice(next);
    applyTheme(next);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemeChoice() === "system") applyTheme("system");
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  return (
    <fieldset className="theme-switch">
      <legend>表示</legend>
      <div className="theme-switch-options">
        {choices.map((item) => (
          <label key={item.value}>
            <input
              type="radio"
              name="theme"
              value={item.value}
              checked={choice === item.value}
              onChange={() => {
                setChoice(item.value);
                persistTheme(item.value);
              }}
            />
            {item.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
