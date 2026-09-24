# 寸法と動きを token にする

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [余白、角丸、線の太さを token の階梯にする](2026-09-21-token-scale-foundation.md)、[部品ごとの詳細ページ](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-21-component-detail-pages.md)、[Components を Button だけにする](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-21-components-button-only.md)
- 更新: 2026-09-23。motion の家族に見出しの入場の 5 個を足した。判断は [Motion topic の ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-23-catalog-motion-topic.md) に残す。
- 対象: `tokens/size/`、`tokens/motion/`、`experiments/button/`、`apps/catalog/src/catalog.css`

## 背景

`/components/button` の各要素を、既存の token と原則へ還元できるか精査した。
余白、角丸、線の太さ、文字、色はすでに token を参照していた。
残る生値は、動き(140ms、160ms、`ease`、`ease-out`)と部品の寸法(高さ 2 / 2.5 / 3rem、最小幅 4.5 / 6 / 7.5rem)だった。
Catalog も同じ種類の値を `--cat-duration: 120ms` と `--cat-tap: 2.5rem` の局所変数で持っていた。

ページに表示する仕様値は `Showcase.tsx` の文字列で、`button.css` の実値と別々に書かれていた。
片方だけを直すと、表示と実装が食い違う。

採用 variant の Quiet は `min-height` と `padding` を消していた。
S は高さが約 21px になり、accessibility の「ポインタのターゲット領域は 24px 以上にする」に届かなかった。

[階梯の ADR](2026-09-21-token-scale-foundation.md) は「padding と size の独立した家族」を却下している。
理由は「最小ターゲット `2.5rem` は Catalog だけの値である」だった。
Button の公開で、同じ 2.5rem を Catalog と部品の 2 か所が使うようになり、この理由は成り立たなくなった。

## 決定

利用者が 2026-09-21 に、size と motion の家族を新設すると判断した。

- `tokens/size/` を足す。高さ 3 個、最小幅 3 個、最小ターゲット 1 個の計 7 個にする。
- `tokens/motion/` を足す。時間の primitive 2 個と semantic 2 個、曲線 2 個の計 6 個にする。
- 階梯の ADR の却下のうち、size の家族だけを本 ADR で置き換える。padding の家族は却下のままにし、space を参照する。
- Button の高さ、最小幅、動きを token 参照にする。
- Button の見本は数値ではなく token 名を表示する。値の正本は Tokens 画面が持つ。
- Quiet の `min-height` を `size.target-min` にする。見た目の余白は変えない。
- Catalog の `--cat-tap` と `--cat-duration` を token 参照にし、`ease` の直書きを `easing.standard` にする。
- 生成は `scripts/build-dimension-tokens.mjs` を拡張し、`duration` と `cubicBezier` を扱う。

## 理由

- 高さ 2.5rem と時間 120ms は、Catalog と Button の両方に実利用がある。
- 最小幅も token にすると、見本に出す値がすべて token 名になり、二重管理が消える。
- Button の色遷移は 140ms から 120ms に変わる。20ms の差は知覚しにくく、段を 1 つ減らせる。
- base の 140ms は採用 variant の 160ms に上書きされ、公開面で使われていなかった。

## 却下した案

- 局所変数へ寄せるだけで token を作らない: Catalog と Button が同じ値を別々に持つ状態が残る。
- `duration.140` を足す: 実利用が無い。取り込み規則 4「将来用の段は作らない」に反する。
- spinner の 700ms を token にする: 回転の周期であり、状態変化の時間ではない。
- 最小幅を部品の局所変数にする: 見本に数値を書く必要が残り、二重管理が解けない。
- 見本が computed style を読んで数値を出す: 見本のためだけの実行時処理が増える。token 名の表示で足りる。
- padding の家族を足す: space を参照すれば足りる。階梯の ADR の判断を維持する。

## 見送り

精査で見つけたが、利用者の判断で今回は直さない。

- spinner の線幅 `1.5px` と `border-radius: 50%`。`border.width` と `radius.full` のどちらにも寄せていない。
- 見本の注記の文字サイズ `0.75rem` と `0.8125rem`。typography の階梯の外にある。
- 色、面、線の遷移は `prefers-reduced-motion` でも 120ms で残る。移動だけを止めている。
- 単体表示用の配色の fallback が `button.css` に hex で残る。

## 影響

- token は 51 個、家族は 6 個になる。
- Tokens 画面に「寸法」と「動き」が並ぶ。寸法は長さの帯、曲線は線の図で見せる。
- `--size-*`、`--duration-*`、`--easing-*` の CSS 変数が増える。
