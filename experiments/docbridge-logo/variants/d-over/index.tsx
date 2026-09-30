import { LogoMock } from "../../shared/LogoMock";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import mark from "./dist/mark.svg?raw";

// `d-over` を DocBridge でロゴが出る面のモックに載せる。
export default function Variant() {
  return <LogoMock mark={mark} />;
}
