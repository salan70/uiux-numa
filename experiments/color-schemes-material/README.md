---
title: 役割を絞って組み直す配色
status: decided
role: module
maturity: candidate
created: 2026-09-20
updated: 2026-09-20
platforms:
  - web
domains:
  - color
  - visual-design
  - design-tokens
  - accessibility
sources:
  - docs/records/color-schemes
adopted:
  - wasabi
  - yuzu
  - azuki
  - aizome
  - sumi
  - fuji
  - ume
  - shinbashi
  - kingyo
  - tsukiyo
---

## Problem

既存の配色は `accent` を中心に命名され、色の用途を選ぶときに意味が伝わりにくい。
primary と大きく色相の異なる secondary、tertiary も不足している。

## Target

配色を製品へ取り入れる開発者と、その配色を使う Web 利用者。

## Scope / Domains

既存の和名 10 種を保ち、役割名とカラーコードを組み直す。
primary、secondary、tertiary と面・文字・線・状態色の体系を比較する。
色選定用の見本を作ったうえで、採用後に Catalog へ反映する。
LP への反映は行わない。

## Constraints

- React + TypeScript で実装し、追加の npm 依存を入れない。
- [Material 3 の色の役割](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)から、必要な名前と用途を選ぶ。
- 基準色には伝統色の HEX を使い、container や面は役割に合わせて明度と彩度を調整する。
- ライトとダークで色相の役割を保ち、本文は 4.5:1 以上、線とフォーカスは 3:1 以上を満たす。
- 見本は 390px と 1280px で確認する。
- 色、文字、間隔は本 Experiment 内で揃える。

## Hypothesis

各配色に色相の異なる 3 色を置く。
各テーマの基準色をそのまま使い、派生色の彩度を高める。
必要な役割を 24 色に絞り、用途を選びやすくする。

## Variants

| id          | 仮説                                                | 変えた軸           | 実装                  |
| ----------- | --------------------------------------------------- | ------------------ | --------------------- |
| `overview`  | 10 種を同じ面積で並べると、色相の関係を比較しやすい | 10 配色の一覧      | `variants/overview/`  |
| `wasabi`    | 黄緑・赤紫・藍の組み合わせは清涼で控えめに見える    | 黄緑 / 赤紫 / 藍   | `variants/wasabi/`    |
| `yuzu`      | 黄・緑・紫を組み合わせると明るさと深さを両立できる  | 黄 / 緑 / 紫       | `variants/yuzu/`      |
| `azuki`     | 小豆の赤茶・緑・金は温かく落ち着いた印象になる      | 赤茶 / 緑 / 金     | `variants/azuki/`     |
| `aizome`    | 藍・琥珀・梅紫は落ち着きの中に華やかさを加える      | 藍 / 琥珀 / 梅紫   | `variants/aizome/`    |
| `sumi`      | 赤みの強い筆の色と金泥を添え、墨を主役にする        | 墨 / 猩々緋 / 黄金 | `variants/sumi/`      |
| `fuji`      | 藤紫・若葉・橙は柔らかさと鮮明さを組み合わせる      | 藤紫 / 緑 / 橙     | `variants/fuji/`      |
| `ume`       | 梅紫・深緑・青緑は華やかさを落ち着かせる            | 梅紫 / 緑 / 青緑   | `variants/ume/`       |
| `shinbashi` | 青緑・珊瑚・菫紫は軽快で色相の幅が広い              | 青緑 / 珊瑚 / 菫紫 | `variants/shinbashi/` |
| `kingyo`    | 朱・藍・黄緑は対比が強く、賑やかさを生む            | 朱 / 藍 / 黄緑     | `variants/kingyo/`    |
| `tsukiyo`   | 紺青・金・青緑は夜空を基調にした落ち着きを作る      | 紺青 / 金 / 青緑   | `variants/tsukiyo/`   |

テーマの基準色と HEX は `shared/palettes.ts` に置く。
基準色はライト・ダークで共通にし、container、面、文字色はモードに合わせて作る。
3 系統に基準色、文字色、container、container 上の文字色を用意する。
背景、面、面の変化、文字、補助文字、線、フォーカスには 8 色を使う。
主色には、面の上に置く文字と色付き罫線のための `primary-text` も持たせる。
`primary` は `on-primary` との 4.5:1 しか保証せず、面に対して読める保証がないためである。
成功、警告、エラーには状態を示す 3 色を使う。
色の HEX 表示はコピー操作にも使える。
伝統色の名称と HEX は[和色大辞典](https://www.colordic.org/w)を出典にする。
不易朱液は黒の上でも鮮明に発色する ([不易朱液](https://www.fueki.co.jp/products/stationery/calligraphy.php))。
朱墨には赤味寄りと黄味寄りがある ([赤口と黄口の区別](https://www.naraya-honpo.shop/sumi-kinoshitashousendo))。

すみの secondary は、橙味の強い朱色を避ける。
赤みを保ちながら少し暗い深緋 `#c9171e` を画面上の近似色にする ([和色大辞典](https://www.colordic.org/w))。
朱液の実際の発色は顔料、紙、表示環境で変わるため、この HEX は特定製品を測色した値ではない。

一覧と「すみ」のライト・ダークの表示を保存している。
個別の配色は Web runner から選べる。

- [10 種一覧 / 1280px](previews/overview-1280-light.png)
- [10 種一覧 / 390px](previews/overview-390-light.png)
- [すみ / ライト](previews/sumi-1280-light.png)
- [すみ / ダーク](previews/sumi-1280-dark.png)

## Evaluation

`docs/evaluation/review.md` の多観点評価は行っていない。
10 テーマをライト・ダークで表示し、一覧と「すみ」の見本を目視した。
全 20 パレットの本文、補助文字、線、フォーカス、状態色は生成時にコントラストを検査する。
Catalog への反映後は `just catalog-test` が同じ組み合わせを再検査する。

## Decision

10 テーマすべてを採用し、24 役割の体系を配色の正本にする。
`docs/records/color-schemes`（削除済みの記録） の 19 役割を置き換える。
旧 Experiment は判断の経緯として残し、公開 Catalog からは案内しない。

Catalog は `variants/<id>/scheme.css` を読む。
このファイルは `shared/palettes.ts` からの生成物で、`just schemes-build` が作る。
派生色は HSL 演算とコントラスト探索で決まるため、値を Git に残さないと差分が読めない。

Catalog への割り当ては用途で分ける。
塗り面は `primary` と `on-primary`、面の上の文字と色付き罫線は `primary-text`、focus ring は `focus` にする。
Catalog 側の判断は [Catalog の配色を 24 役割にする ADR](../../docs/decisions/2026-09-20-catalog-material-color-roles.md) に残す。

## Rejected reasons

固定色、逆色、面の細かな段階など、Material 3 の全役割を採る案は見送った。
色を選ぶ段階では使い分けが伝わりにくく、役割一覧を増やすためである。
状態色は成功、警告、エラーの 3 色に絞り、専用の面色と文字色を設けない。
すみで朱色と新橋色を組み合わせる案も見送った。
新橋色が墨のモチーフと結び付きにくく、別のテーマのように見えるためである。
当初の朱色 `#eb6101` は橙味が強く、習字の赤筆には合わないと判断した。
猩々緋 `#e2041b` は鮮やかすぎたため、secondary を深緋 `#c9171e` に調整した。

## Learnings

テーマごとの基準色を保つと、ライト・ダークをまたいでも色の名前と見た目が結び付く。
24 色でも主色、副色、第 3 色を使い分けられる。
面や文字に加え、線やフォーカス、状態色も示せる。

塗り面の主色と、面の上に置く文字の色は別の役割にする必要がある。
当初は `primary` の 23 役割で足りると考えたが、`primary` が保証するのは `on-primary` との 4.5:1 だけである。
わさびの萌黄 `#aacf53` のように明るい基準色は、白い面の上では本文として読めない。
`focus` は 3:1 保証なので本文には使えない。
色相と彩度を `primary` のまま、4 つの面すべてに 4.5:1 を満たす明度へ寄せた `primary-text` を足した。

## Related patterns / assets

なし
