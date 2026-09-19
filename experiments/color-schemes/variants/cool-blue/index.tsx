import { LandingPage } from "./LandingPage";
import "./layout.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import "./scheme.css";

// variant `cool-blue`: 青みの無彩色と中彩度の青 1 色。一般的な SaaS の配色を基準として置く。
// LandingPage.tsx と layout.css は全 variant で同一。差分は scheme.css と、配色を有効にするこのクラス名だけ。
export default function Variant() {
  return (
    <div className="cs-cool-blue">
      <LandingPage />
    </div>
  );
}
