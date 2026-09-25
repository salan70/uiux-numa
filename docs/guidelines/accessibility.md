---
title: Accessibility
summary: キーボード操作、視覚多様性、支援技術に対応し、誰でも等しく利用できる品質を担保する。
status: draft
created: 2026-09-20
updated: 2026-09-25
---

## 目的

身体条件、環境、入力手段によらず等しく利用できるようにする。
Web を前提に書き、他の platform では同等の達成基準へ読み替える。

## コア

### 必要な情報を 1 つの感覚だけに頼らせない

色、形、位置のどれか 1 つだけで伝えず、文字と構造でも知覚できるようにする。

### 達成基準を最低線として先に決める

満たす水準を着手前に決め、画面ごとに判断しない。

### 入力手段を 1 つに限定しない

すべての操作をポインタとキーボードの双方で完結できるようにする。
操作の快適さより、手段を選ばず完結できることを優先する。

### 見た目ではなく構造で意味を持たせる

見出し、一覧、ボタン、ランドマークは意味を持つ要素で組む。
見た目の自由より、構造と意味が一致することを優先する。

### 利用者の設定を上書きしない

文字サイズ、動きの抑制、配色は端末とブラウザーの設定に従う。
表示の意図より、利用者が選んだ設定が生きることを優先する。

## Tips

### WCAG 2.2 のレベル AA を最低線にし、動きの抑制は AAA でも必須にする

意図と根拠: 水準を先に決めないと画面ごとに達成の判断が揺れる。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- コア: 利用者の設定を上書きしない
- 良い例: AA の達成基準を確認項目に落として実装前に照合し、`prefers-reduced-motion` に常に従う。
- 悪い例:「できる範囲で対応する」とだけ決めて着手する。
- 出典: [WCAG 2.2 ガイドライン](https://www.w3.org/WAI/WCAG22/quickref/)

### 外部ライブラリは採用時に達成基準で選ぶ

意図と根拠: 採用した部品の内部を直せなくても、達成の責任は採用側にある。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- 良い例: 候補をキーボード操作と読み上げで試し、満たさないものは採用しない。
- 悪い例: 見た目と API だけで選び、後からフォーカスの閉じ込めが無いと気づく。
- 例外: 画面に出ない計算や整形だけを担うライブラリ。

### フォーカスの輪郭を固定帯で隠さない

意図と根拠: 固定ヘッダーの背後にフォーカス先が潜ると、キーボード利用者は現在地を見失う。

- 適用: foundation
- コア: 入力手段を 1 つに限定しない
- 良い例: `:focus-visible` で輪郭を出し、`scroll-margin` で固定帯との重なりを防ぐ。
- 悪い例: `outline: none` で枠を消し、固定ヘッダーの背後に要素が潜り込む。
- 実験: [catalog-editorial/README.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.4.7 / 2.4.11](https://www.w3.org/WAI/WCAG22/quickref/#focus-visible)

### 画面遷移後は h1 にフォーカスを移し skip link を置く

意図と根拠: h1 へのフォーカス移動は達成基準の要求ではなく、本リポジトリが選んだ方法である。

- 適用: module
- コア: 入力手段を 1 つに限定しない
- 良い例: 画面遷移後に h1 へフォーカスを移し、最上部に skip link を置く。同じ画面に留まる保存は `role="status"` で伝え、フォーカスは動かさない。
- 悪い例: 画面が切り替わっても直前のボタンにフォーカスが残る。または body に落ちる。
- 例外: 遷移を伴わない同一画面内の小さな開閉操作。
- 実験: [catalog-editorial/README.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.4.1](https://www.w3.org/WAI/WCAG22/quickref/#bypass-blocks)

### モーダルはネイティブの dialog 要素を showModal() で開く

意図と根拠: `open` 属性や `show()` では背後を操作できたままになり、自作のモーダルは閉じ込めが抜けやすい。

- 適用: module
- コア: 見た目ではなく構造で意味を持たせる
- 良い例: `dialog` を `showModal()` で開き、閉じたら開いた操作へフォーカスを戻す。
- 悪い例: `div` でモーダルを自作する。または `dialog` に `open` 属性を付けただけでモーダルとして扱う。
- 例外: 非モーダルな浮動表示。
- 実験: [catalog-editorial/rationale/topic-first.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/rationale/topic-first.md)
- 出典: [WAI-ARIA APG: Dialog (Modal) Pattern](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)
