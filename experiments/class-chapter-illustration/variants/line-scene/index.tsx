import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import art from "./dist/chapter.svg?raw";

// Mock.tsx と mock.css は全 variant で同一。差分は dist/chapter.svg だけ。
export default function Variant() {
  return <Mock art={art} />;
}
