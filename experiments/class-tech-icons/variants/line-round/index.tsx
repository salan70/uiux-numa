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

// variant `line-round`: 線画で端点と角を丸くし、学生向けの親しみやすさを線の丸さで出す。
// 線幅 2、stroke-linecap / stroke-linejoin は root で round、角丸 2、単色（currentColor）。
// 塗りは ai の小さい火花 1 か所だけ。座標は線幅 2 に合わせて整数に置く。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ terminal, code, branch, database, api, test, ai, web }} />;
}
