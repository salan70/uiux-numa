---
title: 役割を絞って組み直す配色
status: decided
role: module
maturity: candidate
created: 2026-09-20
updated: 2026-09-24
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
  - pop-toy
---

## Problem

既存の配色は `accent` を中心に命名され、色の用途を選ぶときに意味が伝わりにくい。
primary と大きく色相の異なる secondary、tertiary も不足している。

## Target

配色を製品へ取り入れる開発者と、その配色を使う Web 利用者。

## Scope / Domains

既存の和名 10 種を保ち、役割名とカラーコードを組み直す。
キーキャップの配色から採った `pop-toy` を 11 種目として加える。
primary、secondary、tertiary と面・文字・線・状態色の体系を比較する。
色選定用の見本を作ったうえで、採用後に Catalog へ反映する。
LP への反映は行わない。

## Constraints

- React + TypeScript で実装し、追加の npm 依存を入れない。
- [Material 3 の色の役割](https://github.com/material-components/material-web/blob/main/docs/theming/color.md)から、必要な名前と用途を選ぶ。
- 基準色には伝統色の HEX を使い、container や面は役割に合わせて明度と彩度を調整する。
- `pop-toy` だけは伝統色でなく、キーキャップの採取色を基準色にする。
- ライトとダークで色相の役割を保ち、本文は 4.5:1 以上、線とフォーカスは 3:1 以上を満たす。
- 見本は 390px と 1280px で確認する。
- 色、文字、間隔は本 Experiment 内で揃える。

## Hypothesis

各配色に色相の異なる 3 色を置く。
各テーマの基準色をそのまま使い、派生色の彩度を高める。
必要な役割を 24 色に絞り、用途を選びやすくする。

## Variants

| id          | 仮説                                                           | 変えた軸             | 実装                  |
| ----------- | -------------------------------------------------------------- | -------------------- | --------------------- |
| `overview`  | 11 種を同じ面積で並べると、色相の関係を比較しやすい            | 11 配色の一覧        | `variants/overview/`  |
| `wasabi`    | 黄緑・赤紫・藍の組み合わせは清涼で控えめに見える               | 黄緑 / 赤紫 / 藍     | `variants/wasabi/`    |
| `yuzu`      | 黄・緑・紫を組み合わせると明るさと深さを両立できる             | 黄 / 緑 / 紫         | `variants/yuzu/`      |
| `azuki`     | 小豆の赤茶・緑・金は温かく落ち着いた印象になる                 | 赤茶 / 緑 / 金       | `variants/azuki/`     |
| `aizome`    | 藍・琥珀・梅紫は落ち着きの中に華やかさを加える                 | 藍 / 琥珀 / 梅紫     | `variants/aizome/`    |
| `sumi`      | 赤みの強い筆の色と金泥を添え、墨を主役にする                   | 墨 / 猩々緋 / 黄金   | `variants/sumi/`      |
| `fuji`      | 藤紫・若葉・橙は柔らかさと鮮明さを組み合わせる                 | 藤紫 / 緑 / 橙       | `variants/fuji/`      |
| `ume`       | 梅紫・深緑・青緑は華やかさを落ち着かせる                       | 梅紫 / 緑 / 青緑     | `variants/ume/`       |
| `shinbashi` | 青緑・珊瑚・菫紫は軽快で色相の幅が広い                         | 青緑 / 珊瑚 / 菫紫   | `variants/shinbashi/` |
| `kingyo`    | 朱・藍・黄緑は対比が強く、賑やかさを生む                       | 朱 / 藍 / 黄緑       | `variants/kingyo/`    |
| `tsukiyo`   | 紺青・金・青緑は夜空を基調にした落ち着きを作る                 | 紺青 / 金 / 青緑     | `variants/tsukiyo/`   |
| `pop-toy`   | 灰の筐体に黄・青・赤橙のキーを置くと、玩具のような明るさが出る | 黄 / 青 / 赤橙 ＋ 灰 | `variants/pop-toy/`   |

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

状態色は全配色で共通の値にせず、配色の基準色から計算する。
共通の値では、配色ごとの色相と鮮やかさから浮く。
計算は OKLCH で行い、次の 3 つを決める。

- 色相は基準の色相（success 150°、warning 80°、error 27°）を、配色の主な色相へ差の半分だけ回す。上限は 10° とする。
- 明度は 3 色を同じ L に揃え、3 色すべてが surface と surface-variant に 4.5:1 を満たす範囲で面に最も近い値にする。
- 彩度は、その明度と色相で sRGB が出せる最大彩度に、基準色 3 色の相対彩度の平均を掛ける。

色相の回し方は Material Color Utilities の harmonize（差の半分、上限 15°）に倣う。
上限を 10° に下げたのは、回した後も error と warning の色相を 30° 以上離すためである。
主な色相は primary とし、primary が無彩のすみは secondary の深緋を使う。
明度を揃えると、1 色だけが明るく目立つことがない。
面に最も近い明度を選ぶと、コントラストを満たす範囲で彩度が最大になる。

Catalog への割り当ては用途で分ける。
塗り面は `primary` と `on-primary`、面の上の文字と色付き罫線は `primary-text`、focus ring は `focus` にする。
Catalog 側の判断は [Catalog の配色を 24 役割にする ADR](../../docs/decisions/2026-09-20-catalog-material-color-roles.md) に残す。

2026-09-24 に利用者が `pop-toy` を 11 種目として採用した。
色は Cornix Bonsai の `src/ui/styles/tokens/color.css` にあるキーキャップの採取色から採った。
Cornix Bonsai の UI を刷新するための配色で、uiux-numa の配色としても使う。
役割は次のように当てた。

- primary は最も大きいキーの黄 `#fac400` にする。選択と主操作を示す。
- secondary は Enter の青 `#4078e0` にする。
- tertiary はノブの赤橙 `#f37252` にする。
- 緑のキーは使わず、緑は success に任せる。強調色と良し悪しの色を分けるためである（原則候補「良し悪しの色に画面の強調色を借りない」）。
- 面と線の色相は灰のキー `#9ea19f` から取る。

面と線を primary の色相で染める規則のままだと、ダークの面が黄に寄って茶色がかる。
灰の筐体の冷たさを残すため、`Scheme` に任意の `neutral` seed を足した。
`neutral` を持たない既存 10 種の生成結果は変わらない。
黄の塗りは白の面に対して 1.61:1 しかないため、塗りだけで状態を示さず、輪郭か文字を添える。

## Rejected reasons

固定色、逆色、面の細かな段階など、Material 3 の全役割を採る案は見送った。
色を選ぶ段階では使い分けが伝わりにくく、役割一覧を増やすためである。
状態色は成功、警告、エラーの 3 色に絞り、専用の面色と文字色を設けない。
状態色の明度を primary-text に揃える案は見送った。
ダークでは primary-text の L が 0.9 前後になり、error が淡い桃色になって赤と読めなくなる。
状態色ごとに彩度が最大になる明度を選ぶ案も見送った。
ダークの success が L 0.88 の蛍光緑になり、3 色の中で 1 色だけが目立つ。
harmonize の上限 15° をそのまま使う案も見送った。
藍や紺青の配色で warning が 95° まで回って黄緑に寄り、藤紫の配色では 65° まで下がって error の橙に近づく。
すみで朱色と新橋色を組み合わせる案も見送った。
新橋色が墨のモチーフと結び付きにくく、別のテーマのように見えるためである。
当初の朱色 `#eb6101` は橙味が強く、習字の赤筆には合わないと判断した。
猩々緋 `#e2041b` は鮮やかすぎたため、secondary を深緋 `#c9171e` に調整した。

`pop-toy` の比較では、次の 2 案を見送った。

- tertiary を緑の Esc キーにする案。Cornix の現行と同じ割り当てだが、緑が success と並ぶと区別しにくい。
- primary を青の Enter キーにする案。文字と focus は最も読みやすいが、黄が主役になる玩具らしさが弱まる。

ダークでは、暗い配色のキー（暗い黄、橙、ミント）に基準色を替える案も見送った。
基準色をライトとダークで共通にする、この体系の規則から外れるためである。

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
