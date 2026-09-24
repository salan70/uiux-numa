# Catalog の配色を 24 役割にする

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [役割を絞って組み直す配色](../../experiments/color-schemes-material/README.md)、[Catalog の面を無彩色にし、公開カテゴリを絞る](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-20-catalog-neutral-navigation.md)、[Catalog を成果物の visual showcase にする](2026-09-20-catalog-visual-showcase.md)
- 置き換え: [無彩色ナビの ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-20-catalog-neutral-navigation.md) の「背景、surface、本文、通常の罫線は白黒を基準にする」条項
- 置き換え: 2026-09-21。Experiment を残す、写しを凍結するという条項は [削除の ADR](2026-09-21-prune-decided-experiments.md) が置き換える。
- 追記: 2026-09-21。色付き面上の暗い文字色を黒にし、on-color の明度差を広げる。
- 追記: 2026-09-21。金魚の primary を明るく鮮やかな朱色へ調整し、黒系文字を読みやすくする。

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
きんぎょでは primary を深い朱色 `#a84300` から鮮やかな朱色 `#ff7600` へ再調整し、暖色寄りの黒 `#120d09` を on-primary にする。
新しい色相は従来の朱色 `#eb6101` に近く、金魚らしい朱を保つ。
`#ff7600` と `#120d09` のコントラスト比は 7.21:1 である。
鮮やかな橙 `#eb6101` 上の白系文字は 3.31:1、暖色寄りの暗色 `#120d09` は 5.74:1 だったが、後者は実画面でまだ読みにくいという判断を受けた。
いったん採用した `#a84300` と白系文字は 5.96:1 だったが、画面上で黒を読みやすくする方向へ再調整した。
全 10 配色の light / dark で `on-primary` を監査し、明るい primary には `#120d09`、暗い primary には `#fffdf9` を使う。
20 組の最小はうめの 4.99:1 で、すべて 4.5:1 以上である。

生成した CSS を Git に残すと、派生色の変化を差分で読める。
`palettes.ts` を直接読むと値がビルド時にしか存在せず、色が変わったことに気付けない。

## 却下した案

- 文字も無彩色のままにする: 配色を切り替えても Catalog の見た目がほぼ変わらない。
- on-color を全配色で黒に固定する: 暗い primary では白系の方が高コントラストになる。
- `primary-container` の帯で強調を代用する: 色付きのリンクと見出しを諦めることになる。
- `#eb6101` の primary 上を白文字にする: コントラストは 3.31:1 で、4.5:1 を満たさない。
- `#eb6101` の primary を維持する: 暗い文字は 5.74:1 だが、画面上で読みやすさが不足した。
- `#a84300` の primary と白文字: コントラストは 5.96:1 だが、黒を見やすくする方向と異なる。
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
