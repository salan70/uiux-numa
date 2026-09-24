import { Mock } from "../../shared/Mock";

// variant `keycap-dish-rim`: 超楕円の枠に、天面の皿の縁を淡い線で描く。
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
