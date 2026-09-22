import { LogoMock } from "../../shared/LogoMock";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import mark from "./dist/mark.svg?raw";

// マークの形だけが variant で変わる。モックは shared/ の実装を 4 案で共有する。
export default function Variant() {
  return <LogoMock mark={mark} />;
}
