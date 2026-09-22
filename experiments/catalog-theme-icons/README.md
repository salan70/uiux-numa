---
title: Catalog の配色 / 明暗アイコン
status: decided
role: module
maturity: experimental
created: 2026-09-22
updated: 2026-09-22
sources:
  - catalog-ui-icons
  - color-schemes-material
adopted:
  - tomoe-classic
domains:
  - iconography
  - visual-design
  - consistency
  - accessibility
platforms:
  - web
---

## Problem

現行の `MagatamaIcon` は SVG の JSX 内へ `var(--cat-accent)` を直書きしており、`svg-check` の制約に反する。

「勾玉」は雑談で挙げた例えがそのまま形へ引っ張られたもので、利用者が想定した「円の中を 3 色程度に分ける」比喩ではない。

配色と明暗の選択は Catalog の同じ行に置かれるが、正本 SVG、機械検査、比較シート、利用画面の preview、造形の理由を持っていない。

## Target

Catalog の利用者が、サイドバー下部の配色セレクタと明暗セレクタを 20px で見分ける。

アイコンは操作の名前を代替せず、既存の読み上げ用ラベルと native select を補助する。

## Scope / Domains

対象は `scheme`、`appearance-light`、`appearance-dark`、`appearance-system` の 4 asset とし、変える軸は比喩と境界曲線に限定する。

round 0 で比喩を三つ巴と sun-moon に絞ったため、named variant は `tomoe-classic` だけにする。

## Constraints

- `viewBox="0 0 24 24"`、live area 3..21、円の keyline `cx=cy=12, r=8.25`、線幅 1.5、端点と角は root の `round` で固定する。
- 原本は `fill="none"` / `stroke="currentColor"` の単色線画とし、`appearance-system` の暗部だけ `fill="currentColor"` にする。
- `role="img"` と最初の子 `<title>` を持ち、`<g>`、`var()`、`<text>`、`aria-labelledby` は使わない。
- `.theme__icon svg` が 1.25rem 固定なので最小表示は 20px とし、20px で 4 asset の見かけの重さを揃える。
- 色の塗りは意味を担わない。

`makePalette` と `contrastRatio` を Node から直接呼び、`--cat-surface` に相当する `surface-container` と 10 配色 × light/dark × 3 役割の 60 通りを測り直した。

| 配色      | mode  | primary | secondary | tertiary |
| --------- | ----- | ------: | --------: | -------: |
| wasabi    | light |    1.58 |      4.48 |     6.26 |
| yuzu      | light |    1.47 |      5.85 |     6.65 |
| azuki     | light |    5.12 |      5.46 |     1.68 |
| aizome    | light |    6.21 |      3.09 |     4.45 |
| sumi      | light |   12.34 |      5.05 |     1.68 |
| fuji      | light |    2.26 |      1.56 |     2.93 |
| ume       | light |    4.43 |      5.46 |     2.00 |
| shinbashi | light |    2.00 |      2.05 |     6.64 |
| kingyo    | light |    2.35 |      6.23 |     1.57 |
| tsukiyo   | light |   11.31 |      1.68 |     5.45 |
| wasabi    | dark  |    6.85 |      2.41 |     1.73 |
| yuzu      | dark  |    7.41 |      1.87 |     1.64 |
| azuki     | dark  |    2.19 |      2.05 |     6.66 |
| aizome    | dark  |    1.77 |      3.57 |     2.48 |
| sumi      | dark  |    1.11 |      2.20 |     6.62 |
| fuji      | dark  |    5.03 |      7.32 |     3.89 |
| ume       | dark  |    2.54 |      2.06 |     5.63 |
| shinbashi | dark  |    5.44 |      5.31 |     1.64 |
| kingyo    | dark  |    4.69 |      1.77 |     7.03 |
| tsukiyo   | dark  |    1.01 |      6.68 |     2.05 |

3:1 未満は 29 / 60 で、最悪は `tsukiyo` dark の primary 1.01:1 だった。

`--color-*-container` へ替える案も測定したが、1.5:1 未満が 40 / 60 となり、意味色のコントラスト解決にはならない。

このため、意味は `currentColor` の線が担い、塗りは「いまどの配色を着ているか」の印に落とす。

## Hypothesis

3 領域をそれぞれ閉じた currentColor の線で囲めば、色面が面へ溶けても形を識別でき、単色線画の組としても明暗アイコンと揃う。

## Variants

round 0 で比喩と曲線が決まったため、named variant は 1 本だけにした。

| id              | 仮説                                                         | 変えた軸       | 実装                      |
| --------------- | ------------------------------------------------------------ | -------------- | ------------------------- |
| `tomoe-classic` | 三つ巴の 3 領域と sun-moon の 3 状態が 20px で同じ組に見える | 比喩、境界曲線 | `variants/tomoe-classic/` |

### 造形のパラメータ

1 組で 1 つの値に固定した（`UIFIT-10`）。

| 項目               | 値                                                                               | 参照                  |
| ------------------ | -------------------------------------------------------------------------------- | --------------------- |
| viewBox            | `0 0 24 24`                                                                      | `ICON-04`             |
| 外形               | live area 3..21 の 18×18、円の keyline は `r=8.25`                               | `ICON-04`, `ICON-06`  |
| 線幅               | 1.5、root に 1 回だけ置く                                                        | `ICON-05`             |
| 端点と角           | `round`、root に 1 回だけ置く                                                    | `ICON-07`             |
| 軸に平行な線の中心 | `0.75 + 1.5n` を基本にする                                                       | `ICON-09`             |
| 内側の最小隙間     | 1.5 以上                                                                         | `ICON-08`             |
| 原本の色           | `fill="none"` / `stroke="currentColor"`、system の暗部だけ `fill="currentColor"` | `ICON-10`, `UIFIT-07` |

20px の倍率は 5/6 なので、外縁 `e` を整数ピクセルへ乗せる条件は `e × 5/6 ∈ ℤ`、すなわち `e` が 1.2 の倍数になることだ。

`round-soft` の `0.75 + 1.5n` と両立する外縁は 6 の倍数だけで、live area の外縁 3 と 21 はどちらも整列しない。

この組は曲線が主なので、ピクセル整列より 1 組で格子を共有することを優先した（`ICON-09` の例外、`FORM-11`）。

### 座標の導出

各 source の path の直前へ同じ導出コメントを残した。

#### scheme

| 対象          | 体系     |                                      理論値 |             採用値 |             誤差 | 理由                                   |
| ------------- | -------- | ------------------------------------------: | -----------------: | ---------------: | -------------------------------------- |
| 外周半径      | keyline  |                          9 の外径、`R=8.25` |           `R=8.25` |                0 | 既存 `round-soft` と同じ円の重さにする |
| 120度の外周点 | 正三角形 | `12 + R√3/2 = 19.1447`、`12 + R/2 = 16.125` | `(19.145, 16.125)` | x `+0.0003`、y 0 | 120度対称を小数第3位で残す             |
| 内側の半円    | 作図式   |             `rho=R/2=4.125`、弦 `OP=R=2rho` |        `rho=4.125` |                0 | 古典的な三つ巴の半円を保つ             |

3 path は同じ外周弧と半径 `rho` の半円を巡回させ、要素を増やさず共有境界と外輪を現す。

#### appearance-light

| 対象         | 体系           |                                   理論値 |                        採用値 |         誤差 | 理由                        |
| ------------ | -------------- | ---------------------------------------: | ----------------------------: | -----------: | --------------------------- |
| 日の中心     | 内外比         | `R/2=4.125` に対して視認性を確保する 4.5 |                       `r=4.5` |     `+0.375` | 20px で中心を点へ潰さない   |
| 軸平行の光線 | keyline と線幅 |                     内端 6.75、外端 8.25 | `3.75..5.25` / `18.75..20.25` |            0 | 1.5 幅を 0.75 格子へ置く    |
| 斜め光線     | `8.25/√2`      |                            6.166 / 7.234 |                   6.17 / 7.23 | 最大 `0.004` | 20px で八方向の間隔を揃える |

#### appearance-dark

| 対象   | 体系       |                  理論値 |              採用値 | 誤差 | 理由                                 |
| ------ | ---------- | ----------------------: | ------------------: | ---: | ------------------------------------ |
| 外周弧 | keyline    |                `R=8.25` |            `R=8.25` |    0 | scheme と外周を揃える                |
| 内周弧 | 三日月作図 | `rho=6`、中心 x `15.75` | `rho=6`, `cx=15.75` |    0 | light の日と暗の月を同じ円の系にする |

#### appearance-system

| 対象   | 体系    |   理論値 |   採用値 | 誤差 | 理由                                                               |
| ------ | ------- | -------: | -------: | ---: | ------------------------------------------------------------------ |
| 外周輪 | keyline | `R=8.25` | `r=8.25` |    0 | scheme と識別できる外輪にする                                      |
| 縦分割 | 対称軸  |   `x=12` |   `x=12` |    0 | 11.25 / 12.75 へ丸めると左右が不均等になるため、曲線優先で軸を残す |

### 反復の記録

| round | 観察                                                                                                                                                                                                                              | 変更                                                                                    | 参照                              | 終了理由               |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------- | ---------------------- |
| 0     | `compare-scheme-metaphor.png`、`compare-tomoe-curve.png`、`compare-appearance-metaphor.png` の 20px で、tomoe は円形の外周と 3 領域が読める一方、中心の接続が密集した。sun-moon は日の光線、三日月、system の縦分割が識別できた。 | 利用者が `tomoe`、classic の半径 `R/2=4.125`、`sun-moon` を選んだ。                     | `ICON-02`, `ICON-06`, `FORM-11`   | 利用者の比喩選択で終了 |
| 1     | source の 20 / 24 / 48px シートで、4 asset が同じ 1.5px の線幅と 18 keyline に見え、scheme と system は外輪の有無で識別できる。                                                                                                   | `part-*` の構成を保ったまま、system の外輪を `part-appearance-system-ring` の円にした。 | `ICON-06`, `ICON-07`, `UIFIT-07`  | 指摘なし               |
| 2     | ライトで `currentColor` の輪郭が色を締め付け、20px で中心が潰れて見えた（利用者の指摘）。                                                                                                                                         | 輪郭の色を利用画面でだけ `#fffdf9` 固定にした。SVG は変えていない。                     | `UIFIT-02`, `UIFIT-07`, `ICON-10` | 利用者が F を選んだ    |

### previews

- `previews/compare-scheme-metaphor.png`: round 0 の配色比喩比較。
- `previews/compare-tomoe-curve.png`: round 0 の三つ巴曲線比較。
- `previews/compare-appearance-metaphor.png`: round 0 の明暗比喩比較。
- `previews/compare-divider.png`: round 2 の A / D / E / F と 6 配色の輪郭比較。
- `previews/tomoe-classic-first-sheet.png`: source の 20 / 24 / 48px シート。
- `previews/tomoe-classic-final-sheet.png`: dist の 20 / 24 / 48px シート。
- `previews/tomoe-classic-in-context.png`: 利用画面のモックを実行基盤で撮影したもの。10 配色 × light / dark の 20 セルと、明暗 3 状態の 1 組を 1 枚に収める。

## Evaluation

当たりの悪い 6 配色へ 4 案（A / D / E / F）を並べた。
対象は `wasabi/light`、`yuzu/light`、`fuji/light`、`sumi/light`、`tsukiyo/dark`、`aizome/dark` である。
利用者が F を選んだ。

E は 60 通りで面に対して最小 3.93:1 だった。
最小値は `sumi` dark で測定した。
F は色同士の分離を保った。
ライトの黒い輪郭を消せる点が判断材料になった。

判断材料は、round 0 の 3 枚の比較シートと、20 / 24 / 48px の source と dist のシートである。
`svg-check` / `svg-optimize`、60 通りの測定、20 セルの preview、`compare-divider.png` も使った。

F の preview では、ライトで輪郭が面に溶け、ダークで白い輪が円の外形を面から切り出した。
形の保証は輪郭ではなく、マスの罫線と隣の明暗アイコンとの対比が担う。

未確認の軸は forced-colors の実ブラウザ確認である。
Chrome 以外の描画エンジン、支援技術による読み上げ、色覚特性による 3 色の判別も未確認である。

## Decision

`tomoe-classic` を採用する。
判断者はリポジトリの所有者で、判断日は 2026-09-22 である。
ライトでは `currentColor` の黒い輪が色を締め付け、20px で中心が潰れて見えた。
F は色同士の分離を保ったまま輪を消すため、利用画面の輪郭色を `#fffdf9` に固定する。
SVG の正本と配布用は `stroke="currentColor"` のままにし、Icons ページと forced-colors では輪郭を残す。
形の保証は輪郭ではなく、マスの罫線と隣の明暗アイコンとの対比が担う。

## Rejected reasons

- A（現行の `currentColor` の輪郭）は却下した。
  ライトで黒い輪が色を締め付け、20px で中心が潰れて見えたためである。
- B（領域の隙間 0.75）と C（隙間 1.5）は、20px でほぼ差が出なかったため却下した。作図は `compare-divider.png` の初版で成立を確認したが、効果がなかった。
- B と C は隙間を空けると各領域が自分の輪郭を引き、平行 2 本になって線の量が減らない。
- D（輪郭なし）は却下した。
  `tsukiyo` dark の primary が面に対して 1.01:1 となり、役割色が面に溶けて円が欠けたためである。
- E（輪郭 `--color-outline`）は 60 通りで最小 3.93:1 を確保した。
  灰色の輪が色を鈍らせるため却下した。

## Learnings

色役割のコントラストが不足する多色アイコンでは、塗りへ意味を背負わせない。
意味を currentColor の輪郭へ冗長化すると、単色検査と利用画面の色付けを両立できる。

20px の倍率では、1.2 の倍数と 1.5 の倍数の共通条件が 6 の倍数に狭まる。
曲線が主役の組では、個別のピクセル整列より共有する格子と見かけの重さを優先する。

同じ SVG を 20 セルへ inline 展開すると part ID が衝突する。
Mock の展開時だけセル固有の接頭辞を加え、配布用は `id="part-*"`、Catalog の転記は `class="part-*"` と役割を分ける。

領域の隙間を空けても、各領域が自分の輪郭を引くため平行 2 本になり、線の量は減らない。

## Related patterns / assets

原則候補 [テーマ色の塗りに意味を担わせない](../../docs/principles/theme-color-fill-carries-no-meaning.md) をこの Experiment の Learnings から立てた。
