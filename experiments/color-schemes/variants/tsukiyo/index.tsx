import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../../../tokens/space/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `tsukiyo`: つきよ。紺青の夜空と、黄金の月。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-tsukiyo">
      <LandingPage />
    </div>
  );
}
