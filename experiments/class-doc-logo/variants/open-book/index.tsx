import { Mock } from "./Mock";
import "./mock.css";
import mark from "./dist/mark.svg?raw";

// variant `open-book`: 学ぶ行為の道具として、開いた本を正面から面で描く。
// 既製の左右対称な book アイコンを避け、右ページだけを高く起こした非対称と、
// 背へ向かって細くなる楔の負の空間（中央の縦線を引かない見開き）で固有性を作る。
// 面で描く点は stacked-sheets と共通だが、比喩（学ぶ行為 / 積み上がる資料）と
// 負の空間の作り方（楔を抜く / 太らせた形で削る）と角の扱い（上角は尖らせる / 全周角丸）で分ける。
// Mock.tsx と mock.css は全 variant で同一。差分は dist/mark.svg だけ。
export default function Variant() {
  return <Mock mark={mark} />;
}
