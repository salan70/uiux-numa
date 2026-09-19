# Catalog 部品を Experiment の見本で比較する

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [Catalog ホスト](2026-09-19-catalog-host.md)、[判断履歴](2026-09-13-decision-records.md)

## 背景

公開 Catalog の部品は `catalog.css` の要素セレクタ上書きと角丸 `0.25rem` で作っている。
利用者はこれを古く感じ、柔らかい現代系の部品一式を作り直したい。
[Catalog ホスト](2026-09-19-catalog-host.md) は、サイト全体の見た目を 3 案の Experiment にしないと決めた。
角丸 `0.25rem` と影の禁止も、そこで Catalog に残している。
今回の比較対象はサイト全体のスキンではない。
部品一式の見本であり、公開面を止めない。

## 決定

- 部品一式の見本比較の正本は、この ADR と Experiment `soft-component-kit` とする。
- 公開 Catalog の見た目は、採用決定まで変えない。
- 挙動の土台は `@base-ui/react` 1.8.0 とする。
- 版は exact pin とし、`apps/catalog` と `platforms/web` の両方へ入れる。
- 造形は 4 案を variant として並べ、利用者が採用を決める。
- 角丸と影は token にしない。各 variant のローカル変数にする。
- Catalog ホスト ADR の角丸 `0.25rem` と影の禁止は、採用決定まで有効とする。
- 採用が決まった時点で、その 2 点をこの ADR の内容で置き換える。
- preview の配色は variant 側で `localStorage` を読んで追従する。
- `preview-main.tsx` で配色を一律適用しない。

## 理由

全体スキンの Experiment は公開面の改修を止める。
部品の見本なら、既存 Catalog を残したまま比較できる。

Radix UI や React Aria は、Catalog に載せる土台として重い。
自作 headless は、Select や Drawer のキーボード操作を再実装することになる。
1 案で `catalog.css` を書き換えると、採用前に公開面が変わる。

角丸と影を token にすると、案ごとの差が共通定義に漏れ、比較軸が壊れる。
`preview-main.tsx` で配色を当てると、opt-in していない Experiment まで変わる。

## 却下した案

- Radix UI: Catalog の部品土台として依存が大きく、Portal と modal の前提も重い。
- React Aria: 様式の制約が強く、4 案の造形差を CSS だけで置くのが難しい。
- 自作 headless: Select の typeahead や Drawer の focus trap を再実装するコストが大きい。
- `catalog.css` を直接 1 案で書き換える: 採用前に公開面が変わる。
- `design-systems/` を新設する: 第二の利用面がなく、ホスト ADR の却下とも重なる。
- 角丸と影を token 化する: 値が案ごとに違い、共通役割がない。
- `preview-main.tsx` で配色を一律適用する: 他 Experiment の比較条件を壊す。

## 影響

Experiment は `experiments/soft-component-kit/` に置く。
`forms-input-ux` を domains に含め、Catalog の部品ページへ載せる。
採用後に `apps/catalog/src/components/` と `catalog.css` へ取り込む。
その作業はこの ADR の範囲に含めない。
