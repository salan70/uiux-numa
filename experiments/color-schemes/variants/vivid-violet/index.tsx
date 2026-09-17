import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `vivid-violet`: accent の色相で色付けした面と高彩度の紫。印象の強さと、高彩度でのコントラスト確保を試す。
// LandingPage.tsx と layout.css は全 variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-vivid-violet">
      <LandingPage />
    </div>
  );
}
