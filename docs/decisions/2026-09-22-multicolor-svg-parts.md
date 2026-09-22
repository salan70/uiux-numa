# 多色 SVG の part を利用画面で与える

- 状態: Accepted
- 日付: 2026-09-22
- 参照: [Catalog の配色 / 明暗アイコン](../../experiments/catalog-theme-icons/README.md)、[Catalog の UI アイコン](../../experiments/catalog-ui-icons/README.md)、[SVG 制作の実行基盤を決める](2026-09-18-svg-toolchain.md)
- 対象: `experiments/*/variants/*/source/`、`experiments/*/variants/*/dist/`、Catalog の inline SVG 転記

## 背景

Catalog の配色アイコンは 3 色の面を持つが、`makePalette` の 10 配色 × light/dark × 3 役割を `surface-container` と測ると 3:1 未満が 29 / 60 あり、最悪は `tsukiyo` dark の primary 1.01:1 だった。

色の差だけで領域を意味付けすると、面に溶ける配色が生まれる。

## 決定

多色 asset の原本は単色線画にし、色は利用画面が与える。

テーマ色の塗りは意味を担わないため、各領域が `currentColor` の輪郭を持つ構造にする。

配布用 SVG は `id="part-*"` を持ち、Catalog へ転記するときは `class="part-*"` を使う。

多色 asset の輪郭の色は利用画面が決める。
正本は `currentColor` を持ち、色を当てる画面だけが上書きする。

## 却下した案

- 原本にプレースホルダの hex を焼く: 20 セルへ同じ配布用 SVG を展開すると 3 役割 × 20 セルの 60 領域を個別に差し替えられず、`makePalette` の値と一致しない。
- SVG 内で `var()` を使う: `var(--cat-accent)` を含む現行 `MagatamaIcon` は `svg-check` でエラーになり、resvg でも描画できない。
- `--color-*-container` に替える: `surface-container` との測定で 1.5:1 未満が 40 / 60 となり、現在の 29 / 60 未満より悪化する。
- B（領域の隙間 0.75）と C（隙間 1.5）に替える: 20px でほぼ差がなく、各領域の輪郭が平行 2 本になって線の量が減らない。
- D（輪郭なし）にする: `tsukiyo` dark の primary が面に対して 1.01:1 となり、円が欠ける。
- E（輪郭 `--color-outline`）にする: 10 配色 × light / dark の 60 通りで最小 3.93:1 だったが、灰色の輪が色を鈍らせる。

## 影響

原本と配布用は `--mono` で検査でき、線が意味を保持するため色が低コントラストでも形が残る。

Mock はセルごとに色をインラインで与え、展開時だけ part ID をスコープ化するため、20 セルの比較と配布用の正本を同じ機構で扱える。

Catalog 側の転記では ID を共有しないので、配色アイコンと明暗アイコンを同じ文書へ置いても ID が衝突しない。
