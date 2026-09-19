import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import mark from "./dist/mark.svg?raw";

// variant `glyph-c`: 文字を核にする案。class の頭文字 C を、字形をなぞらず角の取れた四角の骨格で組み直す。
// 線幅 6 の単線で描き、腕の先を角の弧の終端で断つことで口を内側より狭くし、負の空間を資料の一枚として読ませる。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/mark.svg だけ。
export default function Variant() {
  return <Mock mark={mark} />;
}
