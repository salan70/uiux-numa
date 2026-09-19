import { Link } from "../components/Link";

export function NotFoundPage() {
  return (
    <>
      <h1>ページが見つかりません</h1>
      <p>
        指定された URL の成果物はありません。<Link href="/">ホーム</Link> から移動してください。
      </p>
    </>
  );
}
