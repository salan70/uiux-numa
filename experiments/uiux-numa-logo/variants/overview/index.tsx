import { Overview } from "../../shared/Overview";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import nMonogram from "../n-monogram/dist/mark.svg?raw";
import nuArches from "../nu-arches/dist/mark.svg?raw";
import nPond from "../n-pond/dist/mark.svg?raw";
import uBasin from "../u-basin/dist/mark.svg?raw";
import cursorN from "../cursor-n/dist/mark.svg?raw";

// 5 案を 1 ページで比べる。採否の対象にはしない。
export default function Variant() {
  return (
    <Overview
      marks={[
        { id: "n-monogram", label: "縦画を 4 ずらした N", svg: nMonogram },
        { id: "nu-arches", label: "半径 4 と 6 の ∩∪ を 1 本でつないだ nu", svg: nuArches },
        { id: "n-pond", label: "脚が沼へ浸かる小文字 n", svg: nPond },
        { id: "u-basin", label: "底に水をためて泡を浮かべた U", svg: uBasin },
        { id: "cursor-n", label: "斜画をポインタにした N", svg: cursorN },
      ]}
    />
  );
}
