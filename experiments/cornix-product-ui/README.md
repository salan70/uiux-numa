---
title: Cornix Bonsai のプロダクト UI
status: implementing
role: reference
maturity: experimental
created: 2026-09-22
updated: 2026-09-22
platforms:
  - web
domains:
  - visual-design
  - information-architecture
  - interaction-design
  - states-design
  - accessibility
sources:
  - color-schemes-material
  - product-ui-typography
  - button
adopted:
  - chromatic-rail
---

## Problem

Cornix Bonsai へ uiux-numa の Asset を局所適用したが、画面全体の造形と情報階層は既存のままである。
既存の Cornix と Mac のタブ分割に制約されず、対象と作業を軸に情報設計を再構成する。
採用済みの配色、文字、余白、角丸、寸法、動き、Button を使い、編集ツール全体の方向を比較する。

## Target

Cornix LP と Mac のキー割り当てを、デスクトップ版 Chrome で編集する利用者を対象にする。

## Scope / Domains

Header、全タブ、盤面、picker、編集パネル、保存状態、status bar、Apply、復旧・エラー状態を対象にする。
variant ではレイアウト、視覚階層、色面、情報密度を変える。

## Constraints

- React、TypeScript、CSS で実装し、追加依存を入れない。
- 10 配色と light / dark を同じ案で確認できるようにする。
- uiux-numa の Foundation token と採用済み Button を使う。
- 実機への write、flash、OS 設定適用は行わない。
- picker、盤面、編集対象、保存状態、Apply の関係を失わない。
- キーボード、focus、文字拡大、reduced motion に対応する。

## Hypothesis

基盤 Asset を画面全体へ適用し、構成まで変えると、道具としての明瞭さを保ちながら Cornix 固有の顔を作れる。

## Variants

| id                       | 軸                                         | 向く状況                       | 代償                             | 実装                               |
| ------------------------ | ------------------------------------------ | ------------------------------ | -------------------------------- | ---------------------------------- |
| `chromatic-rail`         | 既存案の強い縦レール                       | 現在地と作業を常時見せたい場合 | 対象数が増えると選択が窮屈になる | `variants/chromatic-rail/`         |
| `chromatic-rail-next`    | 対象選択と作業選択を縦レールへ固定         | 1対象を集中編集する場合        | 横幅をナビゲーションが消費する   | `variants/chromatic-rail-next/`    |
| `chromatic-rail-library` | 対象一覧を常時表示し、Railの視覚階層を維持 | 対象を頻繁に切り替える場合     | 対象一覧が縦方向の面積を使う     | `variants/chromatic-rail-library/` |
| `target-library`         | 対象一覧と作業一覧のマスター・ディテール   | 複数キーボードを切り替える場合 | 編集面の開始位置が右へ移動する   | `variants/target-library/`         |
| `focus-workbench`        | 上部の対象選択と横並びの作業バー           | 盤面を広く使い連続編集する場合 | 作業の現在地が上部へ分散する     | `variants/focus-workbench/`        |

削除した variant:

- `layer-stage`: 盤面を大きな色面に置くと、編集対象と周辺操作の主従が明確になる。
- `editorial-console`: 大きな文字と罫線による非対称構成は、密な情報を大胆に整理できる。

## Evaluation

2026-09-22 に3案を1280 × 800と1024 × 768で表示し、編集面、現在地、選択中キー、保存状態、Applyへの導線を比較できる状態にした。
3案は同じ対象、作業、盤面、picker、保存状態、検証、Applyのモック操作を共有し、情報設計とレイアウトを比較軸にしている。
対象を切り替えると利用できない作業は固定位置のまま無効化され、理由をアクセシブルな説明として示す。
キーボード操作、focus、文字拡大、reduced motion、明暗テーマ、保存失敗、実機適用の本評価は採用案決定後に行う。

## Decision

前回の `chromatic-rail` 採用は履歴として保持し、利用者のフィードバックを受けて `chromatic-rail-library` を追加した。
`chromatic-rail-library` は Target Library の常時表示と Chromatic Rail Next のサイドパネル、色面、見出し、編集ステージを組み合わせる。
判断者は利用者で、判断日は未定である。
選定後に採用案を一度ブラッシュアップし、Cornix本体への移植対象を確定する。

## Rejected reasons

- `layer-stage`: 画面全体の緑の色面で編集領域を強く見せるが、ナビゲーション、編集面、右パネルの境界が近く、保存状態の所在を追う基準が `chromatic-rail` より弱いと判断した。
- `editorial-console`: 大きな見出しと番号ナビで個性は出るが、タイトルと罫線の強さがキー操作と保存確認より目立つと判断した。

前回の判断者は利用者で、判断日は 2026-09-22 である。

## Learnings

既存の対象別タブは、将来のキーボード追加時にナビゲーションを増やす方向へ誘導するため、対象と作業の2軸へ分離して比較する。
無効な作業を非表示にすると対象変更時に位置が動くため、固定位置の無効表示を比較案の共通条件にする。

## Related patterns / assets

- `tokens/typography/`
- `tokens/space/`
- `tokens/radius/`
- `tokens/border/`
- `tokens/size/`
- `tokens/motion/`
- `experiments/color-schemes-material/`
- `experiments/button/`
