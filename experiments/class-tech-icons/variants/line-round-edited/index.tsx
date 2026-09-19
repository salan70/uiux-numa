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

// variant `line-round-edited`: 採用した line-round からの派生。部分編集の実証にだけ使い、評価の対象に含めない。
// 形状は branch の part-branch-tip だけを動かし、色は mock.css から part-database-band だけを上書きする。
// Mock.tsx は他 variant と同一。mock.css は色の上書きを 1 規則だけ足している。
export default function Variant() {
  return <Mock icons={{ terminal, code, branch, database, api, test, ai, web }} />;
}
