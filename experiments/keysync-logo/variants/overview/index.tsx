import { Overview } from "../../shared/Overview";
import { candidates } from "../../shared/candidates";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";

// 候補を同じ条件で並べる一覧面。採用後に削除する。
export default function Variant() {
  return <Overview candidates={candidates} />;
}
