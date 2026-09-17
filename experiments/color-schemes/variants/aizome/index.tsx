import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `aizome`: あいぞめ。藍白から褐返までの藍の濃淡。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-aizome">
      <LandingPage />
    </div>
  );
}
