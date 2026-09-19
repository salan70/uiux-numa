import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `principle-applied`: 原則候補「組の一貫性は少数のパラメータで縛る」の手順に厳密に従って作ったもの。比喩は with-skill と同じで、語彙は線画 1 つ、線幅 2、端点と角は root で 1 回、live area の padding 2、座標は整数だけ。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
