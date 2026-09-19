import { Link } from "../components/Link";

export function NotFoundPage() {
  return (
    <>
      <h1>ページがない</h1>
      <p>
        指定した URL の記録はない。<Link href="/">ホーム</Link> から選び直す。
      </p>
    </>
  );
}
