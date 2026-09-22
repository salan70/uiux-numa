import { Overview } from "../../shared/Overview";
import "../../shared/mock.css";
import "../../../../tokens/typography/index.css";
import "../../typography.css";
import reflection from "../reflection/dist/mark.svg?raw";
import wave345 from "../wave-345/dist/mark.svg?raw";
import rippleRings from "../ripple-rings/dist/mark.svg?raw";
import sunkenPair from "../sunken-pair/dist/mark.svg?raw";

// 4 案を 1 ページで比べる。採否の対象にはしない。
export default function Variant() {
  return (
    <Overview
      marks={[
        { id: "reflection", label: "水面に載る実体と、√2 で縮んだ映り込み", svg: reflection },
        { id: "wave-345", label: "半径 3, 4, 5 の半円をつないだ さざ波", svg: wave345 },
        { id: "ripple-rings", label: "隙間を 3 で一定にした 波紋", svg: rippleRings },
        { id: "sunken-pair", label: "幅と同じ丈で、1:2 の深さまで沈む 2 本の柱", svg: sunkenPair },
      ]}
    />
  );
}
