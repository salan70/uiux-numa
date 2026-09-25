import { LogoMock } from "../../shared/LogoMock";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import mark from "./dist/mark.svg?raw";

// 第 2 世代の `pop-tilt` を、KeySync でロゴが出る面のモックに載せる。原本は shared/build-marks.mjs が書き出す。
export default function Variant() {
  return <LogoMock mark={mark} />;
}
