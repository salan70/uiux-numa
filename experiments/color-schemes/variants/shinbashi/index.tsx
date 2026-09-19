import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `shinbashi`: しんばし。明治の新橋で流行った鮮やかな新橋色と、平らな白い面。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-shinbashi">
      <LandingPage />
    </div>
  );
}
