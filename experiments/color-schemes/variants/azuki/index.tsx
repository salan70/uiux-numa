import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../../../tokens/space/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `azuki`: あずき。炊いた小豆の赤茶と、餡を包む生地の卵色。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-azuki">
      <LandingPage />
    </div>
  );
}
