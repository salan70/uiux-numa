import { Mock } from "./Mock";
import "./mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import terminal from "./dist/terminal.svg?raw";
import code from "./dist/code.svg?raw";
import branch from "./dist/branch.svg?raw";
import database from "./dist/database.svg?raw";
import api from "./dist/api.svg?raw";
import test from "./dist/test.svg?raw";
import ai from "./dist/ai.svg?raw";
import web from "./dist/web.svg?raw";

// variant `line-square`: 線画で端点と角を角張らせ、技術資料の精密さを直線と直角で出す。
// 線幅 2、stroke-linecap は butt、stroke-linejoin は miter（どちらも既定値のため配布用では省かれる）、角丸なし、単色（currentColor）。
// 斜線は 45° だけ、座標は整数。塗りは ai の火花 1 か所だけ。
// 丸い形に頼る比喩（地球儀）はこの描き方に合わないため、web はブラウザの窓に、code は波括弧に置き換えた。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ terminal, code, branch, database, api, test, ai, web }} />;
}
