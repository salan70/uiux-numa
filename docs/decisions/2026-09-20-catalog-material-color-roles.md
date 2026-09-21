# Catalog の配色を 24 役割にする

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [役割を絞って組み直す配色](../../experiments/color-schemes-material/README.md)、[Catalog の面を無彩色にし、公開カテゴリを絞る](2026-09-20-catalog-neutral-navigation.md)、[Catalog を成果物の visual showcase にする](2026-09-20-catalog-visual-showcase.md)
- 置き換え: [無彩色ナビの ADR](2026-09-20-catalog-neutral-navigation.md) の「背景、surface、本文、通常の罫線は白黒を基準にする」条項

## 背景

Catalog は `experiments/color-schemes` の 19 役割を読んでいた。
この体系は `accent` を中心に命名され、色の用途を選ぶときに意味が伝わらない。
primary と色相の異なる secondary、tertiary も持たない。

`experiments/color-schemes-material` で役割を組み直した。
Material 3 から必要な名前だけを採り、primary / secondary / tertiary と面・線・状態の 24 役割にした。
面と本文の色も、全 scheme 共通の無彩色ではなく、テーマの色相へ低彩度で寄せる。

旧体系の `accent` は、塗り面の背景色と、面の上に置く文字色の両方を兼ねていた。
新体系の `primary` は `on-primary` との 4.5:1 しか保証しない。
わさびの萌黄 `#aacf53` のように明るい基準色は、白い面の上では本文として読めない。

## 決定

- Catalog の配色の正本を `experiments/color-schemes-material` の 24 役割にする。
- 値は `shared/palettes.ts` から `variants/<id>/scheme.css` を生成して渡す。生成は `just schemes-build`、検査は `just schemes-check`。
- CSS 変数名は `--color-<役割名>` に統一する。Experiment の見本も同じ名前を使う。
- 面と本文の彩度は抑えるが、無彩色には固定しない。テーマの色相へ寄せる。
- Catalog の `--cat-*` は、色の用途ごとに参照先を分ける。
  - 塗り面は `--color-primary`、その上の文字は `--color-on-primary`。
  - 面の上に置く色付きの文字と罫線は `--color-primary-text`。4 つの面すべてに 4.5:1 を満たす。
  - focus ring は `--color-focus`。面に対して 3:1 を満たす。
- `experiments/color-schemes` は削除せず、公開 Catalog から外す。`SUPERSEDED_SLUGS` で止める。

## 理由

役割名から用途が読める。
`accent-hover` や `accent-subtle` は、どの面の上で使うのかが名前から決まらなかった。

塗り面と文字で必要なコントラストが違うことを、役割の数で表せる。
1 つの役割に両方を兼ねさせると、どちらかの配色で必ず読めない組み合わせが出る。

低彩度の面は、テーマの違いを出しつつ成果物より前に出ない。
完全な無彩色にすると、配色を切り替えても Catalog の面が変わらず、切替の意味が弱くなる。

生成した CSS を Git に残すと、派生色の変化を差分で読める。
`palettes.ts` を直接読むと値がビルド時にしか存在せず、色が変わったことに気付けない。

## 却下した案

- 文字も無彩色のままにする: 配色を切り替えても Catalog の見た目がほぼ変わらない。
- `primary-container` の帯で強調を代用する: 色付きのリンクと見出しを諦めることになる。
- `focus` を文字にも使う: 3:1 保証なので本文に足りない。
- `palettes.ts` を Catalog から直接 import する: 公開サイトが Experiment の TypeScript へ直接依存し、値が Git 上で読めない。
- `tokens/color` を新設して正本を昇格させる: 色を token の正本にするかは別の判断で、本 ADR の範囲を超える。
- `experiments/color-schemes` を削除する: R&D の記録と、19 役割を選んだ経緯が失われる。

## 影響

Colors トピックには `color-schemes-material` だけが並ぶ。
配色の詳細は 24 役割とコントラスト表を出す。
Catalog 自身の面、リンク、ボタン、focus ring は選んだ配色で変わる。
既定は `sumi` のまま維持する。
保存済みの色は役割名が変わるため、`uiux-numa-catalog-colors` の保存キーを `-v2` へ上げて捨てる。
`experiments/color-schemes` の preview と scheme.css は研究用資産として残す。
