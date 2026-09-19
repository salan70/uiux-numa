import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `no-skill`: 基準。crafting-svg Skill が存在しない時点で、同じ要求文を claude -p に渡して作ったもの。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
