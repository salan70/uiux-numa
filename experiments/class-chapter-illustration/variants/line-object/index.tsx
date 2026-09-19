import { Mock } from "./Mock";
import "./mock.css";
import art from "./dist/chapter.svg?raw";

// variant `line-object`: 線画で対象物だけを描く。場面を作らず、要素を 4 つに絞る。
// 題材は「期待と実際の突き合わせ」。同じ大きさの 2 つが釣り合う形で、一致の確認を示す。
// 線幅 5 は、技術アイコン（viewBox 24、線幅 2）と表示時の実寸を揃えた値。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/chapter.svg だけ。
export default function Variant() {
  return <Mock art={art} />;
}
