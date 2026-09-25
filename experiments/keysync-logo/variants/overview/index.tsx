import { Overview } from "../../shared/Overview";
import { candidates } from "../../shared/candidates";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";

// 第 1 世代の 10 案を同じ条件で並べる一覧面。系統を選んだ後に削除する。
export default function Variant() {
  return <Overview candidates={candidates} />;
}
