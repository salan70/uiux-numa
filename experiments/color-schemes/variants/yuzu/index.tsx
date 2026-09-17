import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `yuzu`: ゆず。熟した果皮の黄、白いわた、葉の緑。
// LandingPage.tsx と layout.css は和名の variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-yuzu">
      <LandingPage />
    </div>
  );
}
