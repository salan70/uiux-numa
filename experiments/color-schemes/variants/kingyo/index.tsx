import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `kingyo`: きんぎょ。水の青の地に、金魚の朱を補色で置く。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-kingyo">
      <LandingPage />
    </div>
  );
}
