import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import art from "./dist/chapter.svg?raw";

// variant `flat-scene`: 面で場面を描く。検査の途中（済・不具合・未）を 3 行で示し、
// 下地の面 #e7ebf1 を後退させ、焦点の不具合だけを #ce1126 の面で 1 か所に置く。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/chapter.svg だけ。
export default function Variant() {
  return <Mock art={art} />;
}
