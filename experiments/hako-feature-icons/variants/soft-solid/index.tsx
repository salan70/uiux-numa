import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `soft-solid`: 面と負の空間で描く。線を使わず、塗りのシルエットと隙間（頭と肩、鐘と舌、円グラフの欠け）で意味を伝える。
// 外形の角丸 2、内側の角丸 1、塗りの面積を 3 個で揃える。比喩は人物 + チェック、鐘 + 舌、欠けた円グラフ。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
