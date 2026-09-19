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

// variant `duotone`: 線幅 2 の線画に、accent（#ce1126）の塗りを 1 か所だけ置いた 2 色。
// 線は currentColor で文字色を継承し、accent は各アイコンの意味の要点（カーソル、分岐点、レスポンス、火花など）に置く。
// 利用画面から色を変える場合は #part-<icon>-accent を CSS で上書きする。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/ の SVG だけ。
export default function Variant() {
  return <Mock icons={{ terminal, code, branch, database, api, test, ai, web }} />;
}
