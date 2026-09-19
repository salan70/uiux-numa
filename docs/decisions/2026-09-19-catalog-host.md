# Catalog のホストを見本帳にし、必要になった token を取り込む

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [Typography foundation](2026-09-19-typography-foundation.md)、[判断履歴](2026-09-13-decision-records.md)、[評価を経ない判断](2026-09-17-named-variants-and-unevaluated-decisions.md)、[color-schemes](../../experiments/color-schemes/README.md)

## 背景

公開 Catalog はドキュメントサイトの三点セットに寄っていた。
大文字アイブロウ、英語の分類名、同一カード、README 調のリードが重なり、AI が組んだ見本に見えた。
配色切替はサイト全体へ当てる前提のまま、ホストの顔を別に作る必要があった。

## 決定

- Catalog の比喩は見本帳とする。
- サイト全体の配色切替は維持する。紙が変わる操作として扱う。
- ホストの顔は構成、文字の役割、画面の言葉で作る。固有のブランド色は持たない。
- Catalog 全体の見た目を 3 案の Experiment にはしない。
- 画面語彙は日本語にする。`wasabi` などの id はコードとしてだけ出す。
- `title` は画面に 1 つだけ使い、`h1` の大きさを token の外で増やさない。
- 大文字アイブロウと字間強調は使わない。
- 右レールの機械目次はやめる。
- 前後ナビとフッターは本文の末尾に置き、初画面を切らない。
- 検索結果に影を使わない。枠だけで重ねる。
- コントロールの角丸 `0.25rem` は Catalog に残す。token にはしない。
- 余白は `space.page-inline` と `space.section` の 2 個だけ token にする。
- コンポーネントは `apps/catalog/src/components/` に置く。
- 配色の `tokens/color/` 昇格はこの判断に含めない。
- 未評価の軸は、利用者の横断確認と公開面の改修速度である。

### token の取り込み規則

Catalog で値が必要になったら、次の順で決める。

1. 既存 token で表せるなら、Catalog 側の上書きを消してそれを使う。
2. 役割名があり、利用面が 2 つあるなら `tokens/` へ追加する。
3. Catalog だけの値なら Catalog に残し、昇格しない理由をこの ADR に書く。

第二の利用面は、比較軸を壊さない既存面に限る。
この改修では Catalog と `color-schemes` の `layout.css` だけを第二面にする。
`form-inline-validation` の見た目は比較条件のため変更しない。
将来用の token は作らない。

### この改修で取り込む値

- `space.page-inline` は `1.5rem` とする。ページ左右の余白である。
- `space.section` は `2.5rem` とする。主要セクションの開始までの縦の間隔である。
- 両方とも Catalog と color LP の `layout.css` が同じ値を既に使っていた。

### Catalog に残す値

- 入力とボタンの角丸は `0.25rem` とする。見本帳の紙を強く丸めないためである。
- スライム状の `999px` と LP の `0.5rem` / `0.75rem` は、役割が分かれており共通化しない。
- `--shadow-popover` は削除する。color LP は影を禁止しており、汎用 elevation の第二面がない。

## 理由

見本帳にすると、採用成果が主役になり、クロムは構造だけになる。
配色切替を残すと、役割色 `--color-*` がホストと見本で同じかをその場で確かめられる。

全体を Experiment にすると variant がサイト単位になり、公開面の改修が止まる。
日本語の画面語彙にすると、英語の Foundations 分類を先に置く生成物の型から外れる。

Typography の `title` を破る `clamp` は、display token を足す理由にならない。
用途が Catalog の見出し 1 つだからである。

余白 2 個は、両面で同じ値と同じ役割があった。
角丸は値が面ごとに違い、コピーして token にすると役割が壊れる。

## 却下した案

- VitePress 型三点セットのまま細部だけ整える: ドキュメント生成器の骨格が残り、AI 感の主因を消さない。
- ホスト配色を 1 つに固定する: サイト全体の切替を残す方針と反する。
- `experiments/catalog-chrome` で 3 スキンを先に作る: 比較軸がサイト全体になり、公開面が止まる。
- display / overline の typography token を足す: 共通用途が Catalog の見出しだけである。
- color LP の角丸をすべて token 化する: `0.375` / `0.5` / `0.75` / `999px` は役割が分かれていない複製になる。
- 影の elevation token を足す: 第二面がなく、color LP の制約とも反する。
- `design-systems/` を新設する: 第二の利用面がない。
- 配色をこの改修で DTCG JSON 化する: 役割は Experiment にあり、Catalog は実行時に当てている。別 ADR にする。

## 影響

Catalog は `apps/catalog/` の CSS とページを見本帳の骨格へ直す。
画面名は配色、文字、アイコン、図、部品とする。
URL は `/foundations/colors` などの既存パスを維持する。

余白 token の正本は `tokens/space/space.tokens.json` である。
生成 CSS は `just tokens-build` が作る。
color LP の `layout.css` は、同じ余白を変数参照に置き換える。見た目の値は変えない。

角丸と検索の重ね方は Catalog の CSS に残る。
配色切替の操作はヘッダーへ移す。
