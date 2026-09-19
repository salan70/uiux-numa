import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `with-skill`: Skill `crafting-svg` の手順で、no-skill と同じ要求文から作ったもの。線幅 1.5 の線（器）に塗り（決まったもの）を 1 つ置く。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
