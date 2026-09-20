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
import { SelectField } from "./SelectField";

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
      <SelectField
        label="Colors"
        value={scheme}
        options={schemes.map((item) => ({
          value: item.id,
          label: item.label === item.id ? item.id : `${item.id}（${item.label}）`,
        }))}
        onChange={(next) => {
          setScheme(next);
          persistScheme(next);
        }}
      />
      <SelectField
        label="テーマ"
        value={theme}
        options={themeChoices}
        onChange={(next) => {
          setTheme(next);
          persistTheme(next);
        }}
      />
    </div>
  );
}
