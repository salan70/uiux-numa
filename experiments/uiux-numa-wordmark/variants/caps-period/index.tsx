import { WordmarkMock } from "../../shared/WordmarkMock";
import wordmark from "./dist/wordmark.svg?raw";

// 点は句点。最後の A（9 字目）を引き終える少し前に落とす。
export default function Variant() {
  return <WordmarkMock wordmark={wordmark} dotAfter={8} />;
}
