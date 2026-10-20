---
title: ぷろやきう選手ものがたりのアプリアイコン
status: draft
role: module
maturity: experimental
created: 2026-10-20
updated: 2026-10-20
platforms:
  - ios
domains:
  - visual-design
sources:
  - baseball-journey-app
  - baseball-journey-badges
adopted: []
---

## Problem

ですてにい版（`apps/destiny`、表示名「ぷろやきう選手ものがたり」）の iOS のアイコンが Flutter の既定のままである。
DQ-19 でアイコンはリリースの前に決める論点として残っている。

## Constraints

- 比喩は選手の顔のドット絵にする（利用者が選んだ、2026-10-20）。
- 升目と色は製品の `packages/shared/lib/face/player_face.dart` の 16 × 16 の胸像をそのまま使う。顔はもみあげ、黒髪、肌 2 番目。
- 地の色は `ui_ux_concepts.md` §15.1 の primary か夜の球場の色だけを使う。
- 1024 × 1024 の正方形の全面を塗る。角丸は iOS が付けるので描かない。文字を入れない（`LOGO-01`）。

## Variants

| id           | 地                            | 大きさ                              |
| ------------ | ----------------------------- | ----------------------------------- |
| `day-bust`   | primary の黄、帽子は青        | 1 升 52、左右に 148 の余白          |
| `day-fill`   | 同上                          | 1 升 64、16 升で全面                |
| `night-bust` | 夜の球場の緑と刈り目、帽子は黄 | 1 升 52                             |
| `night-fill` | 同上                          | 1 升 64                             |

変えた軸は「地」と「大きさ」の 2 つ。

## 反復の記録

### round 1

- 観察: どの案も 40px で帽子と顔と胸の番号が読める（`previews/first-sheet.png`）。
- 観察: 1024 を 16 升で割るため、60px や 40px では升の境界が画素に載らず滲む。iOS が縮小するので避けられない。
- 観察: night は墨の輪郭が緑の地に沈み、輪郭の外形が弱い。帽子の黄が目を引く。帽子の印が墨になり、穴に見える。
- 観察: fill は 40px 以下で顔が大きく読みやすい。bust は余白で落ち着くが、29px で顔が小さい。
- 終了理由: 方向の選択を利用者に回す。

## 確かめ方

- 比較ページ: `previews/compare.html`（180〜29px、明暗の壁紙のホーム画面）。
- 作り直し: `node experiments/destiny-app-icon/shared/build-icons.mjs`。

## 未解決

- なし（製品の `AppIcon` と `AppIcon-Dev` に書き出した）。

## Decision

- 利用者が `day-bust` を採用した（2026-10-20、製品の DS-297）。
- 開発版（Debug の構成）に `dev-bust` を足した。緑の地（球団色の `#2E8B57`）に、金髪の長髪で肌の暗い選手を置く（利用者の指定）。もみあげだけでは金髪が 2 升で目立たないため、長髪にした（`previews/dev-sheet.png`）。
