import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `ume`: うめ。紅梅の花と蕾、梅鼠の枝。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-ume">
      <LandingPage />
    </div>
  );
}
