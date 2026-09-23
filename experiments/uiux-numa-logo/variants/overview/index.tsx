import { Overview } from "../../shared/Overview";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import nuArches from "../nu-arches/dist/mark.svg?raw";
import nuRound from "../nu-round/dist/mark.svg?raw";
import nuSlant from "../nu-slant/dist/mark.svg?raw";
import nuContrast from "../nu-contrast/dist/mark.svg?raw";
import nuPool from "../nu-pool/dist/mark.svg?raw";
import nuBubble from "../nu-bubble/dist/mark.svg?raw";
import nuGap from "../nu-gap/dist/mark.svg?raw";

// 7 案を 1 ページで比べる。採否の対象にはしない。
export default function Variant() {
  return (
    <Overview
      marks={[
        { id: "nu-arches", label: "基準: 半径 4 と 6 の ∩∪ を 1 本でつないだ nu", svg: nuArches },
        { id: "nu-round", label: "端点を丸めた nu", svg: nuRound },
        { id: "nu-slant", label: "両端を 45° で平行に切った nu", svg: nuSlant },
        { id: "nu-contrast", label: "肩と底を字画の半分に細めた nu", svg: nuContrast },
        { id: "nu-pool", label: "u の窪みに水をためた nu", svg: nuPool },
        { id: "nu-bubble", label: "u の窪みに泡を浮かべた nu", svg: nuBubble },
        { id: "nu-gap", label: "n と u の間に隙間を空けた nu", svg: nuGap },
      ]}
    />
  );
}
