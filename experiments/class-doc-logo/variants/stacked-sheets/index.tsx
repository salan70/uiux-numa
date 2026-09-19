import { Mock } from "./Mock";
import "./mock.css";
import mark from "./dist/mark.svg?raw";

// variant `stacked-sheets`: 回を重ねて積み上がる資料を、重なった 2 枚の紙で表す。
// 前の 1 枚を面で描き、後ろの 1 枚は前の紙を太らせた形で削って残る帯（幅 4、隙間 2）だけを見せる。
// 採用済みの技術アイコン（線幅 2、丸い端点）とは技法で差を付け、角丸 2 で「丸い」語彙だけを共有する。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/mark.svg だけ。
export default function Variant() {
  return <Mock mark={mark} />;
}
