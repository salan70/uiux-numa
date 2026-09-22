import { useEffect, useState } from "react";
import { adoptedSchemes } from "../content/collect";
import {
  applyPreferences,
  persistScheme,
  persistTheme,
  readSchemeChoice,
  readThemeChoice,
  type SchemeChoice,
  type ThemeChoice,
} from "../theme";
import { AppearanceIcon, SchemeIcon } from "./icons";

const APPEARANCES: { value: ThemeChoice; label: string }[] = [
  { value: "system", label: "端末に従う" },
  { value: "light", label: "ライト" },
  { value: "dark", label: "ダーク" },
];

/**
 * 配色と明暗を選ぶ。サイドバーの最下段に置くのは、どの画面からでも切り替えられるようにするためである。
 * 形はアイコンのボタン 2 つにする。
 * 語を出していた頃は 2 行で 7.5rem の枠を 2 つ取り、ナビの列の下半分を選択が占めていた。
 * 押したあとの選択は native の select に任せる。
 * select は面へ透明のまま重ね、見た目はアイコンだけにする。
 * 語は読み上げのために残し、見た目からだけ外す。
 */
export function ThemeControl() {
  const [theme, setTheme] = useState<ThemeChoice>(() => readThemeChoice());
  const [scheme, setScheme] = useState<SchemeChoice>(() => readSchemeChoice());
  const options = adoptedSchemes();

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
    <div className="theme">
      <label className="theme__pick">
        <span className="theme__label">配色</span>
        <span className="theme__icon">
          <SchemeIcon />
        </span>
        <select
          className="theme__native"
          value={scheme}
          onChange={(event) => {
            setScheme(event.target.value);
            persistScheme(event.target.value);
          }}
        >
          {options.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
      <label className="theme__pick">
        <span className="theme__label">テーマ</span>
        <span className="theme__icon">
          <AppearanceIcon value={theme} />
        </span>
        <select
          className="theme__native"
          value={theme}
          onChange={(event) => {
            const next = event.target.value as ThemeChoice;
            setTheme(next);
            persistTheme(next);
          }}
        >
          {APPEARANCES.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
