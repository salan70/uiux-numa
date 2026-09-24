import { Mock } from "../../shared/Mock";

// variant `pop-duo`: 線画 ＋ 色の面。骨格の下に置き場所の色の面を 1 つ敷く。意味は輪郭が担う。
// 原本は shared/build-icons.mjs が書き出す。配布用は just svg-optimize の出力。
const files = import.meta.glob<string>("./dist/*.svg", {
  query: "?raw",
  import: "default",
  eager: true,
});
const icons = Object.fromEntries(
  Object.entries(files).map(([path, svg]) => [path.replace(/^\.\/dist\/|\.svg$/g, ""), svg]),
);

export default function Variant() {
  return <Mock icons={icons} />;
}
