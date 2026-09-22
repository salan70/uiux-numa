---
title: Cornix Bonsai のプロダクト UI
status: decided
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

| id               | 仮説                                                                  | 変えた軸                   | 実装                       |
| ---------------- | --------------------------------------------------------------------- | -------------------------- | -------------------------- |
| `chromatic-rail` | 強い縦レールと固定 action dock は、現在地と実行操作を明確に分離できる | レイアウト、色面、視覚階層 | `variants/chromatic-rail/` |

削除した variant:

- `layer-stage`: 盤面を大きな色面に置くと、編集対象と周辺操作の主従が明確になる。
- `editorial-console`: 大きな文字と罫線による非対称構成は、密な情報を大胆に整理できる。

## Evaluation

正式な観点別評価は行っていない。
2026-09-22 に 3 案を 1280 × 800 で表示し、編集面、現在地、選択中キー、保存状態、Apply への導線を比較した。
判断はこの実寸確認と利用者の採用指定に基づく。
キーボード操作、focus、文字拡大、reduced motion、明暗テーマ、保存失敗、実機適用は未評価である。

## Decision

`chromatic-rail` を採用する。
判断者は利用者で、判断日は 2026-09-22 である。
左の縦レールが現在地と編集対象を固定し、中央の Keymap と右の選択・保存パネルを分離する。
Header に Workspace 操作を置く現行修正とも整合し、キー選択から割当変更、ローカル保存状態の確認までを同じ視線で追いやすい。
未評価の軸は、利用者確認後に再検証する。

## Rejected reasons

- `layer-stage`: 画面全体の緑の色面で編集領域を強く見せるが、ナビゲーション、編集面、右パネルの境界が近く、保存状態の所在を追う基準が `chromatic-rail` より弱いと判断した。
- `editorial-console`: 大きな見出しと番号ナビで個性は出るが、タイトルと罫線の強さがキー操作と保存確認より目立つと判断した。

判断者は利用者で、判断日は 2026-09-22 である。

## Learnings

未定。

## Related patterns / assets

- `tokens/typography/`
- `tokens/space/`
- `tokens/radius/`
- `tokens/border/`
- `tokens/size/`
- `tokens/motion/`
- `experiments/color-schemes-material/`
- `experiments/button/`
