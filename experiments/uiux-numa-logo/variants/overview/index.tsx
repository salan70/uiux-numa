import { Overview } from "../../shared/Overview";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import nuArches from "../nu-arches/dist/mark.svg?raw";
import nuRound from "../nu-round/dist/mark.svg?raw";
import meltBulb from "../melt-bulb/dist/mark.svg?raw";
import meltDrip from "../melt-drip/dist/mark.svg?raw";
import meltSag from "../melt-sag/dist/mark.svg?raw";
import meltFlow from "../melt-flow/dist/mark.svg?raw";
import meltFlowBulb from "../melt-flow-bulb/dist/mark.svg?raw";
import meltPuddle from "../melt-puddle/dist/mark.svg?raw";

// 8 案を 1 ページで比べる。採否の対象にはしない。
export default function Variant() {
  return (
    <Overview
      marks={[
        { id: "nu-arches", label: "基準: 半径 4 と 6 の ∩∪ を 1 本でつないだ nu", svg: nuArches },
        { id: "nu-round", label: "基準: 端点を丸めた nu。melt 系の骨格", svg: nuRound },
        { id: "melt-bulb", label: "左の脚の端が溶けて玉になる", svg: meltBulb },
        { id: "melt-drip", label: "u の底から滴が垂れる", svg: meltDrip },
        { id: "melt-sag", label: "肩が平たく、底が下へ伸びる", svg: meltSag },
        { id: "melt-flow", label: "直線をなくし、曲線だけでつなぐ", svg: meltFlow },
        { id: "melt-flow-bulb", label: "曲線だけでつなぎ、端が溶けて玉になる", svg: meltFlowBulb },
        { id: "melt-puddle", label: "左の脚が底で水たまりに広がる", svg: meltPuddle },
      ]}
    />
  );
}
