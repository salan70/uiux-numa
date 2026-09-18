import { Mock } from "./Mock";
import "./mock.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `current-feather`: 基準。color-schemes の LP にある既存の Feather 風アイコンを、そのまま SVG ファイルに切り出したもの。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
