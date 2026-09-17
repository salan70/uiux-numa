import { LandingPage } from "./LandingPage";
import "./layout.css";
import "./scheme.css";

// variant `warm-terracotta`: 黄みの生成り色とテラコッタ。落ち着きと親しみを狙い、accent がエラー色に近い条件を試す。
// LandingPage.tsx と layout.css は全 variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-warm-terracotta">
      <LandingPage />
    </div>
  );
}
