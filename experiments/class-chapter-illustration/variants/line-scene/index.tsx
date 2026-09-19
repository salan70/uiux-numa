import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import art from "./dist/chapter.svg?raw";

// variant `line-scene`: 仮置き。制作後に説明を書き換える。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/chapter.svg だけ。
export default function Variant() {
  return <Mock art={art} />;
}
