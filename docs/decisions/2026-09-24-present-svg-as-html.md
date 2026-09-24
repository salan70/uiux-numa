# SVG の成果物は、SVG のまま並べた HTML で依頼者に見せる

- 状態: Accepted
- 日付: 2026-09-24
- 参照: `skills/crafting-svg/SKILL.md`（手順 6）、`scripts/svg-compare.mjs`、`experiments/cornix-ui-icons/`

## 背景

アイコンとロゴの比較は、`just svg-sheet` と `just web-shot` の PNG で依頼者に見せていた。
`cornix-ui-icons` で、利用者は「大きい画像だと画質が悪すぎて見づらい」と述べた。
PNG は描画した倍率より大きく表示するとにじみ、細部の判断に使えない。
`svg-sheet` は resvg で描くため、多色の SVG の色も出ない。

SVG を inline で並べた HTML を利用者の Chrome で開いたところ、利用者は「とてもやりやすかった」と述べた。

## 決定

- 依頼者に SVG の成果物を見せるときは、`just svg-compare` で SVG をそのまま並べた比較ページを作り、ブラウザで開く。
- 比較ページには実利用のサイズと形を確かめる大きさ、ライトとダークを並べる。多色の `part-*-accent` には、指定した配色の色を塗る。
- 利用画面での比較は runner の URL を渡す。
- PNG のシートと `web-shot` の撮影は、制作者が形を確かめる用途と、README の preview に使う。
- 比較ページは `previews/compare.html` として Experiment と一緒に commit する。

## 却下した案

- PNG の倍率を上げる: 高い倍率で描いてもファイルが重くなるだけで、依頼者が拡大すればにじむ。多色の色も出ない。
- 比較ページを Artifact として公開する: 共有の必要がない制作途中の比較で、ローカルのファイルを開けば足りる。公開の手間と確認の往復が増える。
- `svg-sheet` を HTML 出力に置き換える: `svg-sheet` は resvg で描いた結果を制作者が読むための道具で、描画の警告を失敗として扱う検査も兼ねる。役割が違うので残す。

## 影響

- `crafting-svg` の手順を 7 段にした。手順 6 が提示、手順 7 が記録と報告である。
- `just svg-compare` と `scripts/svg-compare.mjs` を追加した。
- `color-schemes-material` の `makePalette` に依存するので、配色の体系を変えたら比較ページの生成も確かめる。
