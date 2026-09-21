# Catalog の面を無彩色にし、公開カテゴリを絞る

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [Catalog を成果物の visual showcase にする](2026-09-20-catalog-visual-showcase.md)
- 置き換え: 上記 ADR の色面とナビゲーション
- 更新: 公開カテゴリの決定は [topic-first ADR](2026-09-20-catalog-topic-first.md) が置き換えた。Graphics も公開面から外した。
- 更新: 「背景、surface、本文、通常の罫線は白黒を基準にする」は [24 役割の ADR](2026-09-20-catalog-material-color-roles.md) が置き換えた。面はテーマの色相へ低彩度で寄せる。

## 背景

Catalog の色面が成果物より先に見えていた。
配色ごとの背景色も面積が大きく、切替時の印象を支配していた。
公開ナビには Illustrations と Motion も含まれていた。
この 2 カテゴリは現時点で掲載を止める。

## 決定

- 公開カテゴリは Home / Colors / Typography とする。
- Icons / Graphics / Components も公開する。
- 背景、surface、本文、通常の罫線は白黒を基準にする。
- scheme 固有色は操作、状態、色付き文字・罫線へ限定して使う。
- Catalog 固有のグラデーションとカテゴリ別の色面を廃止する。
- Illustrations と Motion は公開カテゴリと通常ルートから外す。
- 対象 Experiment の実装、評価記録、preview 資産は残す。
- Graphics には logo / brand identity を掲載する。

## 理由

無彩色の面は、成果物と scheme 固有色の競合を減らす。
accent の用途を限定すると、配色の識別性と静かな外観を両立できる。
Experiment を残すと、公開停止後も判断の経緯を参照できる。

## 却下した案

- scheme 固有色で背景を染め続ける: 色の面積が大きく、成果物より先に見える。
- Catalog を完全な無彩色にする: Colors の切替と比較の意味が弱くなる。
- Illustrations と Motion の原本を削除する: R&D の記録が失われる。

## 影響

Colors と Theme の保存値は維持する。
URL query と Light / Dark の切替も維持する。
Illustrations と Motion の preview は研究用資産として残す。
公開 Catalog からは案内しない。
