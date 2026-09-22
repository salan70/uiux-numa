import { Mock } from "./Mock";
import "./mock.css";

// 配布用 SVG と同じ四つの asset を Mock に渡す。色の差し替えは利用画面側に閉じる。
import appearanceDark from "./dist/appearance-dark.svg?raw";
import appearanceLight from "./dist/appearance-light.svg?raw";
import appearanceSystem from "./dist/appearance-system.svg?raw";
import scheme from "./dist/scheme.svg?raw";

// variant `tomoe-classic`: 三つ巴の古典作図と sun-moon の組。
export default function Variant() {
  return <Mock icons={{ scheme, appearanceLight, appearanceDark, appearanceSystem }} />;
}
