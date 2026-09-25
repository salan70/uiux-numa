# SVG の記述規約

このリポジトリで SVG を書くときの規約。対応範囲は `just svg-check` が検査する。

## 対応範囲

- 自己完結した静的 SVG だけを扱う。
- 使わない: `script`、`foreignObject`、animate 系、`image`、`text`、外部参照、`on*` 属性、CSS の `var()`、`@import`、`<style>`。
- 未対応の入力（既存 SVG に上記が含まれる）は、`just svg-check` の出力をそのまま報告し、置き換え案を示す。

## 構造の規約

- root は `xmlns="http://www.w3.org/2000/svg"` と `viewBox` を持ち、固定の `width` と `height` を付けない。
- 単独で意味を持つ SVG は `role="img"` と最初の子 `<title>` で名前を付ける。
- 部分編集の単位には `id="part-<asset>-<role>"` を付ける（例: `part-assign-head`）。asset 名は inline 時の衝突を避けるため。
- 塗りと線は part 要素自身に置く。`<g>` に置くと利用画面の CSS `#part-x { fill: … }` が子の属性に負ける。
- `<defs>` の id には asset 名を含める（例: `hako-grad-1`）。
- 単色のアイコンは `fill` と `stroke` を `currentColor` か `none` だけにする。`stroke-width`、`stroke-linecap`、`stroke-linejoin` は root に 1 回書く。
- 原本のコメントは最適化で消えるので、造形の意図を残してよい。

## 項目

- `SVG-01` 線幅の偶奇で座標の刻みを決める: viewBox は目標の表示サイズと同じ整数にする。偶数幅の線は整数座標、奇数幅の線は 0.5 刻みに置く。viewBox `V` を最小表示サイズ `S` で描くとき、軸に平行な線の外縁 `e` が整数ピクセルに乗る条件は `e × S/V ∈ ℤ`。`V=24` なら `S=16` で 1.5 の倍数、`S=20` で 1.2 の倍数。整列できる値は最小表示サイズごとに解き直す。組の格子（例 `0.75 + 1.5n`）と両立しないときは、どちらを捨てるかを記録する。曲線が主役の組では、整列より格子の共有を優先してよい。
- `SVG-02` 端点と角を明示する: 既定の `miter` は鋭角で `stroke-miterlimit`（既定 4）を超えると bevel に落ちる。cap と join を root で与える。
- `SVG-04` SVGO の既定は id、`<g>`、`role` を消す: `scripts/svgo.config.mjs` は `part-` の保持、id の短縮の停止、`role` の保持を明示する。SVGO の版を更新したら、最適化後に id、`<title>`、`role` の有無を確かめる。
- `SVG-06` 基本図形で下絵を作り、部分ごとに path 化する: `circle`、`rect`、`line`、`polyline`、短い `path` で構図を決め、描画で確かめてから必要な部分だけ path 化する。座標は格子上に置き、自由曲線より円弧を優先する。
- `SVG-07` 反復の間で構造を保つ: `part-*` の id と要素の構成を保ち、変えた部分だけを差分として追う。

## 利用画面への埋め込み（`platforms/web`）

- `index.tsx` は配布用を `import svg from "./dist/x.svg?raw"` で読み、`dangerouslySetInnerHTML` で inline に展開する。
- 大きさは CSS で与える（`.icon svg { width: 24px; height: 24px }`）。
- 色は親の `color` で与える。多色は `#part-x { fill: … }` で上書きする。
- 多色では塗りだけでなく輪郭の色も利用画面が決める。原本は `currentColor` の単色線画のまま残し、色が当たらない場面（一覧画面、forced-colors、シート）でも意味が通る形にする。意味を塗りに担わせない（`docs/principles/theme-color-fill-carries-no-meaning.md`）。
- アプリのコンポーネントへ手で転記するときは `id="part-*"` ではなく `class="part-*"` にする。配布用をそのまま一覧展開する画面と同居すると id が重複する。
