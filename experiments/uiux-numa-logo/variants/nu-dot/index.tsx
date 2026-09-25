import { LogoMock } from "../../shared/LogoMock";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import mark from "./dist/mark.svg?raw";

// 採用した nu-dot を、Catalog でロゴが出る面のモックに載せる。
export default function Variant() {
  return <LogoMock mark={mark} />;
}
