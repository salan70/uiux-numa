import { Mock } from "./Mock";
import "./mock.css";
import assign from "./dist/assign.svg?raw";
import deadline from "./dist/deadline.svg?raw";
import progress from "./dist/progress.svg?raw";

// variant `crisp-square`: 定規で引いた事務用品。線幅 2、端点 butt、接合 miter、角丸なし、座標は整数。
// 比喩は机上の道具から選ぶ。担当 = 縦長の名札に頭と肩、期限 = 卓上の暦に印の日、進み具合 = L 字の軸に立つ週ごとの棒。
// 塗りは各 1 か所（頭、印の日、今週の棒）だけに使い、「決まった 1 つ」を示す。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ assign, deadline, progress }} />;
}
