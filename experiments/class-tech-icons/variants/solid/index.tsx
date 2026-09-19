import { Mock } from "./Mock";
import "./mock.css";
import terminal from "./dist/terminal.svg?raw";
import code from "./dist/code.svg?raw";
import branch from "./dist/branch.svg?raw";
import database from "./dist/database.svg?raw";
import api from "./dist/api.svg?raw";
import test from "./dist/test.svg?raw";
import ai from "./dist/ai.svg?raw";
import web from "./dist/web.svg?raw";

// variant `solid`: 線を使わず、塗りのシルエットと負の空間で描く。
// 正の棒は太さ 4（端点と角の半径 2）、切り抜きは幅 2（端点の半径 1）、外形の角丸は 2 で 8 個を統一する。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ terminal, code, branch, database, api, test, ai, web }} />;
}
