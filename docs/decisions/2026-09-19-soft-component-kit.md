# Catalog 部品を Experiment の見本で比較する

- 状態: Accepted
- 日付: 2026-09-19
- 置き換え: Components の掲載、Button の詳細 URL と表示方法は [Components と Button の ADR](2026-09-21-components-button-only.md) が置き換える。
- 参照: [Catalog ホスト](2026-09-19-catalog-host.md)、[判断履歴](2026-09-13-decision-records.md)

## 背景

公開 Catalog の部品は `catalog.css` の要素セレクタ上書きと角丸 `0.25rem` で作っている。
利用者はこれを古く感じ、柔らかい現代系の部品一式を作り直したい。
[Catalog ホスト](2026-09-19-catalog-host.md) は、サイト全体の見た目を 3 案の Experiment にしないと決めた。
角丸 `0.25rem` と影の禁止も、そこで Catalog に残している。
今回の比較対象はサイト全体のスキンではない。
部品一式の見本であり、公開面を止めない。

## 決定

- 部品一式の見本比較の正本は、この ADR と Experiment の記録とする。
- 公開 Catalog の見た目は `hairline-float` とする。
- 挙動の土台は `@base-ui/react` 1.8.0 とする。
- 版は exact pin とし、`apps/catalog` と `platforms/web` の両方へ入れる。
- 造形は 4 案を variant として並べ、利用者が採用を決める。
- 角丸と影は token にしない。各 variant のローカル変数にする。
- 採用した `hairline-float` では、操作部品の角丸は `0.625rem`、面は `1rem` とする。
- 影は popup と drawer だけに置く。色は `--color-text` の `color-mix` とする。
- [Catalog ホスト](2026-09-19-catalog-host.md) の角丸 `0.25rem` と影の禁止は、この条項で置き換える。
- preview の配色は variant 側で `localStorage` を読んで追従する。
- `preview-main.tsx` で配色を一律適用しない。

採用の記録は [Experiment の記録](../records/soft-component-kit/README.md) の Decision と Rejected reasons にある。
却下理由は残し、判断後に variant のコードを削除する。

## 理由

全体スキンの Experiment は公開面の改修を止める。
部品の見本なら、既存 Catalog を残したまま比較できる。

Radix UI や React Aria は、Catalog に載せる土台として重い。
自作 headless は、Select や Drawer のキーボード操作を再実装することになる。
1 案で `catalog.css` を書き換えると、採用前に公開面が変わる。

角丸と影を token にすると、案ごとの差が共通定義に漏れ、比較軸が壊れる。
`preview-main.tsx` で配色を当てると、opt-in していない Experiment まで変わる。

公開面へ取り込むときは、採用案のローカル変数を Catalog の部品セレクタへ写す。
`design-systems/` は作らない。

## 却下した案

- Radix UI: Catalog の部品土台として依存が大きく、Portal と modal の前提も重い。
- React Aria: 様式の制約が強く、4 案の造形差を CSS だけで置くのが難しい。
- 自作 headless: Select の typeahead や Drawer の focus trap を再実装するコストが大きい。
- `catalog.css` を直接 1 案で書き換える: 採用前に公開面が変わる。
- `design-systems/` を新設する: 第二の利用面がなく、ホスト ADR の却下とも重なる。
- 角丸と影を token 化する: 値が案ごとに違い、共通役割がない。
- `preview-main.tsx` で配色を一律適用する: 他 Experiment の比較条件を壊す。

## 影響

判断と評価の記録は [Experiment の記録](../records/soft-component-kit/README.md) に移した。
`forms-input-ux` を domains に含め、Catalog の部品ページへ載せる。
公開 Catalog の共有 chrome は `apps/catalog/src/components/` と `catalog.css` に置く。
Components の Button 表示は [新しい ADR](2026-09-21-components-button-only.md) に従う。
