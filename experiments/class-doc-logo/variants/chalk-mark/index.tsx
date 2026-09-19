import { Mock } from "./Mock";
import "./mock.css";
import mark from "./dist/mark.svg?raw";

// variant `chalk-mark`: 印と進み。理解に付く印（チェック）を 1 本の筆致として面で描き、
// 左下から右上へ太らせる。垂直の切れ目で 2 つに割り、小さい印 → 大きく伸びる、の順で
// 「回を追って進む」を負の空間に読ませる。具体物を描かない抽象記号の案。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/mark.svg だけ。
export default function Variant() {
  return <Mock mark={mark} />;
}
