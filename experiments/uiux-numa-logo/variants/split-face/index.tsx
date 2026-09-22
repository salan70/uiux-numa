import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import mark from "./dist/mark.svg?raw";

// マークの形だけが variant で変わる。Mock と mock.css は 3 案で同一にする。
export default function Variant() {
  return <Mock mark={mark} />;
}
