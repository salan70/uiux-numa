---
title: Cornix Bonsai のプロダクト UI
status: decided
role: reference
maturity: experimental
created: 2026-09-22
updated: 2026-09-24
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
  - chromatic-rail-library
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

採用した 2 案だけを残す。
ほかの案は「削除した variant」に仮説と軸を残した。

| id                       | 軸                                         | 向く状況                       | 代償                             | 実装                               |
| ------------------------ | ------------------------------------------ | ------------------------------ | -------------------------------- | ---------------------------------- |
| `chromatic-rail`         | 既存案の強い縦レール                       | 現在地と作業を常時見せたい場合 | 対象数が増えると選択が窮屈になる | `variants/chromatic-rail/`         |
| `chromatic-rail-library` | 対象一覧を常時表示し、Railの視覚階層を維持 | 対象を頻繁に切り替える場合     | 対象一覧が縦方向の面積を使う     | `variants/chromatic-rail-library/` |

`shared/DraftPrototype.tsx` は削除した案の `direction` も描き分けるが、判断の経緯を読むための写しとして残し、手を入れない。

### 削除した variant

- `layer-stage`: 盤面を大きな色面に置くと、編集対象と周辺操作の主従が明確になる。
- `editorial-console`: 大きな文字と罫線による非対称構成は、密な情報を大胆に整理できる。
- `chromatic-rail-next`: 対象選択と作業選択を縦レールへ固定すると、1 対象を集中編集しやすい。代償は、横幅をナビゲーションが消費すること。
- `target-library`: 対象一覧と作業一覧のマスター・ディテールにすると、複数キーボードを切り替えやすい。代償は、編集面の開始位置が右へ移動すること。
- `focus-workbench`: 上部の対象選択と横並びの作業バーにすると、盤面を広く使い連続編集しやすい。代償は、作業の現在地が上部へ分散すること。

削除前の状態は commit `d2900ee` にある。

## Evaluation

2026-09-22 に3案を1280 × 800と1024 × 768で表示し、編集面、現在地、選択中キー、保存状態、Applyへの導線を比較できる状態にした。
3案は同じ対象、作業、盤面、picker、保存状態、検証、Applyのモック操作を共有し、情報設計とレイアウトを比較軸にしている。
`docs/evaluation/review.md` の多観点評価は行っていない。

## Decision

2026-09-22 に利用者が `chromatic-rail` を採用し、Cornix Bonsai へ移植した（Cornix Bonsai ADR 0029、`823f39b`）。
同日、利用者のフィードバックを受けて追加した `chromatic-rail-library` を採用し、Cornix Bonsai へ移植した（Cornix Bonsai ADR 0030、`ceaa730`）。
`chromatic-rail-library` は、`target-library` の対象一覧の常時表示と、`chromatic-rail-next` の縦レール、色面、編集ステージを組み合わせたものである。
判断者は利用者で、多観点の評価を経ていない。

2026-09-24 に、この Experiment は `cornix-workbench` に置き換わった。
本体への移植がナビゲーションと外枠だけの後付けになり、モックとの差が大きかったためである。
`cornix-workbench` では要件から情報設計を導き直し、採用した `board-desk` で Cornix Bonsai の UI 層を作り直した（Cornix Bonsai ADR 0031、`17fd920`）。

## Rejected reasons

- `layer-stage`: 画面全体の緑の色面で編集領域を強く見せるが、ナビゲーション、編集面、右パネルの境界が近く、保存状態の所在を追う基準が `chromatic-rail` より弱いと判断した。
- `editorial-console`: 大きな見出しと番号ナビで個性は出るが、タイトルと罫線の強さがキー操作と保存確認より目立つと判断した。
- `chromatic-rail-next`、`target-library`: 単独では採らず、両方の長所を `chromatic-rail-library` に組み合わせた。
- `focus-workbench`: 利用者が `chromatic-rail-library` を選んだ。この案を採らなかった理由は記録されていない。

`layer-stage` と `editorial-console` の判断者は利用者で、判断日は 2026-09-22 である。

## Learnings

既存の対象別タブは、将来のキーボード追加時にナビゲーションを増やす方向へ誘導するため、対象と作業の2軸へ分離して比較する。
無効な作業を非表示にすると対象変更時に位置が動くため、固定位置の無効表示を比較案の共通条件にする。

画面だけのモックは、本体への移植で外枠だけの後付けになりやすい。
この Experiment のモックは固定の見せかけデータで作られ、本体の機能（recovery、WebHID、VIL、backup、Karabiner 書出、acknowledge）を含まなかった。
本体側も「既存の構成と状態管理を維持する」ことを前提に移植したため、本文の部品、状態の持ち方、token は旧来のまま残った。
後継の `cornix-workbench` では、要件文書を先に作り、固定データを本体の純関数で書き出し、variant ごとに部品の境界と状態の持ち方の図を README に書いた。

## Related patterns / assets

- `tokens/typography/`
- `tokens/space/`
- `tokens/radius/`
- `tokens/border/`
- `tokens/size/`
- `tokens/motion/`
- `experiments/color-schemes-material/`
- `experiments/button/`
