import { Mock } from "../../shared/Mock";

// variant `keycap-squircle`: 超楕円のキーキャップの枠。角丸の正方形と 45° の点を揃え、角の曲率をなめらかにする。
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
