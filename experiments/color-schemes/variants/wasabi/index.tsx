import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `wasabi`: わさび。すりおろした身の淡い黄緑と、根茎の皮の深い青緑。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-wasabi">
      <LandingPage />
    </div>
  );
}
