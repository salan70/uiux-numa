import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `mono-ink`: 無彩色だけの面と墨色の accent。色相なしで主操作が目立つかと、意味色の際立ちを試す。
// LandingPage.tsx と layout.css は全 variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-mono-ink">
      <LandingPage />
    </div>
  );
}
