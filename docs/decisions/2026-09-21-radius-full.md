# 角丸に `radius.full` を足す

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [余白、角丸、線の太さを token の階梯にする](2026-09-21-token-scale-foundation.md)
- 対象: `tokens/radius/`

## 背景

[階梯の ADR](2026-09-21-token-scale-foundation.md) は `radius.full` を却下した。
理由は「Catalog に利用箇所がない」だった。
取り込み規則の 2 は、公開 Catalog に実利用がある値だけを primitive に足すと定めている。

利用者は 2026-09-21 に、端が完全に丸いボタンなどをコンポーネントとして用意する方針を示し、`radius.full` の追加を指示した。
公開 Catalog に利用箇所はまだない。
`experiments/` には `999px` の直書きが 7 箇所ある。

## 決定

primitive `radius.full` と semantic `radius.pill` を足す。
radius は 8 個になる。

| primitive     | 値     | semantic      | 用途                       |
| ------------- | ------ | ------------- | -------------------------- |
| `radius.full` | 9999px | `radius.pill` | 端を半円にするボタン、chip |

- `radius.full` は階梯の外の特別値とする。寸法ではなく形の指定である。
- 値は `9999px` にする。ブラウザは半径を短辺の半分で頭打ちにするので、部品の高さによらず端が半円になる。
- 「隣の段との差が space token になる値に限る」規則の対象にしない。
- 減算式の対象にしない。pill の内側に辺で接する子の半径は、減算してもまた頭打ちになる。
- ボタンの既定は `radius.control` のままにする。`radius.pill` は部品が明示して選ぶ。
- 取り込み規則の 2 と 4 は変えない。`radius.full` だけを利用者の判断による例外とする。

取り込み規則の例外にした理由は次である。

- 値が 1 つに決まる。階梯の段と違い、実利用を見て値を選ぶ必要がない。
- 直書きにすると `999px`、`9999px`、`50%` が混ざる。
- 最初の部品を作るときに名前が先にあれば、部品側は選ぶだけで済む。

## 却下した案

- 部品の実装まで追加を待つ: 規則には沿う。利用者が先に追加すると判断した。値が一意なので、待っても決定の中身は変わらない。
- `50%`: 横長の要素で楕円になり、pill にならない。
- `calc(infinity * 1px)`: 正本は DTCG の dimension で、数値と単位の組しか持てない。生成スクリプトに式の経路を足すことになり、見合わない。
- primitive だけを足す: README は CSS で semantic を使うと定める。primitive だけでは部品から参照できない。
- 円専用の semantic `radius.circle` を足す: 値は `radius.pill` と同じで、正方形に当てれば円になる。役割が分かれる部品が出るまで足さない。
- `radius.control` の参照先を `radius.full` へ変える: 既存の Catalog のボタンと入力欄がすべて変わる。利用者の指示は丸い部品の追加であり、既定の変更ではない。
- 既存の Catalog の chip を pill にして実利用を作る: 見た目の変更は依頼の範囲外である。

## 影響

- [階梯の ADR](2026-09-21-token-scale-foundation.md) の「却下した案」のうち、`radius.full` の却下を置き換える。14px 以上の段の却下は据え置く。
- 同 ADR の「追加する家族」の radius は primitive 4 個、semantic 4 個になる。
- `scripts/build-dimension-tokens.mjs` の radius の個数を 8 にする。
- Catalog の Tokens 画面は角丸の見本の枠を横長にする。正方形では `radius.full` が円になり、端が半円になる形が見えない。
