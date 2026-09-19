import { useEffect, useState } from "react";
import {
  applyPreferences,
  persistScheme,
  persistTheme,
  readSchemeChoice,
  readThemeChoice,
  type SchemeChoice,
  type ThemeChoice,
} from "../theme";
import { schemes } from "../content/schemes";

const themeChoices: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "システム" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

export function ThemeSwitch() {
  const [theme, setTheme] = useState<ThemeChoice>(() => readThemeChoice());
  const [scheme, setScheme] = useState<SchemeChoice>(() => readSchemeChoice());

  useEffect(() => {
    applyPreferences(theme, scheme);

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => {
      if (readThemeChoice() === "system") applyPreferences("system", readSchemeChoice());
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [scheme, theme]);

  return (
    <div className="theme-switch">
      <label>
        <span>配色</span>
        <select
          value={scheme}
          onChange={(event) => {
            const next = event.target.value as SchemeChoice;
            setScheme(next);
            persistScheme(next);
          }}
        >
          {schemes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.id}
              {item.label === item.id ? "" : `（${item.label}）`}
            </option>
          ))}
        </select>
      </label>
      <label>
        <span>テーマ</span>
        <select
          value={theme}
          onChange={(event) => {
            const next = event.target.value as ThemeChoice;
            setTheme(next);
            persistTheme(next);
          }}
        >
          {themeChoices.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
