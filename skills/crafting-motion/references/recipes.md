# 部品ごとの token の当てはめ

`tokens/motion/` の semantic を部品に割り当てる。
値の一覧と使用規則は `tokens/motion/README.md` にある。

| 部品                           | duration            | easing                  | 補足                                                                  |
| ------------------------------ | ------------------- | ----------------------- | --------------------------------------------------------------------- |
| ボタンの押下（`:active`）      | `duration.press`    | `easing.out`            | `scale(0.97)` から。`:active` はタッチにも効く                        |
| 色、面、線の状態変化           | `duration.state`    | `easing.standard`       |                                                                       |
| ドロップダウン、ポップオーバー | `duration.press`    | `easing.out`            | 原点はトリガー側。ツールチップは隣を開くとき遅延と動きを 0 にしてよい |
| モーダル、ドロワー             | 局所値              | `easing.out`            | token に段が無い。値と根拠を variant に書く                           |
| トースト、完了の入場           | 局所値              | `easing.out`            | JS の状態が不要なら `@starting-style` で入場する                      |
| 画面の見出しの入場             | `duration.entrance` | `easing.entrance`       | 語の間隔は `duration.stagger`。毎日見る一覧には使わない               |
| アコーディオン                 | `duration.state`    | `easing.standard`       | `height` は layout の例外。`auto` へ直接動かさず測った高さへ          |
| 長押しの確認                   | 局所値              | `linear` / `easing.out` | 決める相は遅く直線、応答は速く。`clip-path` を使ってよい              |

交差フェードで状態が二重に見えるときだけ、短い `blur(2px)` を候補にする。
20px を超えるぼかしは、計測せずに軽いと書かない。
