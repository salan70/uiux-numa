import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `sumi`: すみ。和紙と墨の無彩色に、フォーカスだけ落款の朱。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-sumi">
      <LandingPage />
    </div>
  );
}
