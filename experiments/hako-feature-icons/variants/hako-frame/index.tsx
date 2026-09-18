import { Mock } from "./Mock";
import "./mock.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `hako-frame`: プロダクト名 Hako にちなみ、3 個が同じ「上が開いた箱」（外形 18×10、底の角丸 2）を共有する。
// 意味の要素は箱の口から上へ出す。担当は箱の中の人（塗りの頭と肩の弧）、期限は箱に入る「!」（棒と塗りの点）、
// 進捗は箱の中のチェック（長い画が縁を越えて上へ抜ける）。線幅 2、round の端点と接合、塗りは 1 アイコンに 1 か所まで。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
