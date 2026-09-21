# Components に layout の部品も載せる

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [topic-first ADR](2026-09-20-catalog-topic-first.md)
- 参照: [Components は Button だけを直接掲載する ADR](2026-09-21-components-button-only.md)
- 参照: [部品ごとの詳細ページ ADR](2026-09-21-component-detail-pages.md)

## 背景

利用者は、押せる一覧カードを新しい部品として Catalog に載せるよう指示した。
Components topic は domain `forms-input-ux` だけを対象にしていた。
lead も「入力と操作の部品。」だった。
Card は入力部品ではないため、domain を正しく書くとどの topic にも当たらない。

## 決定

- Components topic の `domains` に `layout` を足す。
- Components の lead を「画面を組む部品。」にする。
- Card の Experiment は `domains` の先頭を `layout` にする。
- Card を Components に載せる範囲は、Button と同じく採用 variant の決定後とする。

## 理由

topic は利用者が何を探しているかで分ける。
Card を探す人は、Button と同じ Components を開く。
`layout` を先頭に書く既存の Experiment はなく、ほかの成果物の割り当ては変わらない。

## 却下した案

- Card の `domains` に `forms-input-ux` を書く: topic の変更は要らないが、Card の分類が事実と食い違う。
- Card 用の新しい topic を作る: 部品が 2 つの段階で入口を分けると、探す場所が増える。
- lead を「入力と操作の部品。」のまま残す: Card が載った一覧の説明と合わない。

## 影響

- Components に当たる domain は `forms-input-ux` と `layout` になる。
- 今後 `layout` を先頭に書く Experiment は Components に入る。
