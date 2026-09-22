import { Mock } from "./Mock";
import "./mock.css";
import arrowNext from "./dist/arrow-next.svg?raw";
import arrowPrev from "./dist/arrow-prev.svg?raw";
import detail from "./dist/detail.svg?raw";
import sidebar from "./dist/sidebar.svg?raw";

// variant `round-soft`: 線幅 1.5、丸い端点、外形 18 の線画 1 案。
// 座標は 0.75 格子の上で、黄金比と keyline から導いた。導出は source/*.svg のコメントと README の表にある。
export default function Variant() {
  return <Mock icons={{ detail, sidebar, arrowPrev, arrowNext }} />;
}
