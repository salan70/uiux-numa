# Components は Button だけを直接掲載する

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [topic-first ADR](2026-09-20-catalog-topic-first.md)
- 参照: [visual showcase ADR](2026-09-20-catalog-visual-showcase.md)
- 参照: [Experiment 削除 ADR](2026-09-21-prune-decided-experiments.md)
- 置き換え: Components の構成は本 ADR に従う。
- 置き換え: [soft-component-kit ADR](2026-09-19-soft-component-kit.md) の Components 関連条項。

## 背景

Components には Button など 3 つの Experiment が並んでいた。
各見本は iframe に入り、ページ内に別のスクロール領域を作っていた。
利用者は `pill-action` を採用した。
Button 以外の掲載廃止とページ構成の見直しも指示した。

## 決定

- Components の掲載対象を Button だけにする。
- `/components` の本文に Button を直接表示する。
- 見出しは Components、Button、役割とサイズ、状態とアイコンの順にする。
- Button 見出しに role、maturity、更新日を表示する。
- Button では `pill-action` を採用する。
- Experiment の status を `decided` にする。
- Button の maturity は `candidate` とする。
- `hairline-control` のコードを削除する。
- `tonal-layer` のコードを削除する。
- 2 variant の専用 preview も削除する。
- 却下理由は Button Experiment の README に残す。
- 2 Experiment の README と評価文書を `docs/records/` に移す。
- 2 Experiment の実装と preview を削除する。
- 採用 Button の実装だけは Experiment から直接 import する。
- Button の見本は親ページの token、配色、明暗を継承する。
- `/components/<slug>` の詳細 route を削除する。
- 旧詳細 URL は NotFound にする。
- ほかの live variant は引き続き route と iframe で隔離する。

## 理由

Button を本文に置けば、見本専用のスクロール領域が要らない。
Components を Tokens と同じく topic の中に直接並べられる。
採用実装を共有すれば Experiment と Catalog の差分を防げる。
カプセル形、短い押下反応、Catalog との視覚的な調和を採用理由とする。

## 却下した案

- 3 Experiment を iframe の一覧に残す: 新しい掲載範囲と表示構造に合わない。
- Button の詳細 route を残す: topic から成果を見る段階が 2 つになる。
- 2 件を非表示で保持する: 削除 ADR と食い違う。
- Button を iframe のまま高さだけ伸ばす: 内部スクロールが残る。

## 影響

- Components の成果物リンクは `/components` に集約する。
- 廃止した Experiment の記録は `docs/records/` に残す。
- iframe を外す対象は `/components` の本文だけに限る。
- soft-component-kit が移した `sumi` の CSS も、利用先がないため削除する。
