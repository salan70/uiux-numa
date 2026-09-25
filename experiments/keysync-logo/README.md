---
title: KeySync のロゴ
status: implementing
role: module
maturity: experimental
created: 2026-09-25
updated: 2026-09-25
platforms:
  - web
domains:
  - logo-brand-identity
  - visual-design
  - accessibility
sources:
  - uiux-numa-logo
  - cornix-ui-icons
  - color-schemes-material
adopted: []
---

## Problem

Cornix Bonsai は 2026-09-25 に KeySync へ改名した（Issue #15、KeySync の ADR 0035）。
Cornix LP だけでなく、MacBook の内蔵キーボードと Magic Keyboard、今後買う機種のキーマップを 1 か所で管理する道具にするためである。
ロゴは絵文字 🌱 だけで、SVG のマークも favicon も無い。
🌱 は旧名の bonsai から来ており、新しい名前とも道具の役割とも結び付かない。

## Target

KeySync を macOS の Chrome で使い、複数のキーボードの割り当てを編集する個人と、その友人。
ロゴが出る面は 3 つある。
最も頻度が高いのはブラウザのタブ（16px）である。
次がヘッダーの題字（黄のキーキャップ型の箱 36px の中）、最も大きいのが workspace の入口（箱 64px）である。

## Scope / Domains

対象はマーク 1 個と、その lockup の形式である。
domain は `logo-brand-identity`、`visual-design`、`accessibility`。
`logo-brand-identity` を先頭に置き、Catalog に載せない。

比喩の系統と目指す印象は、制作前に利用者が決めた（2026-09-25）。

- 比喩: 4 系統すべてで下書きを作る。キーキャップが揃う、文字 K を核にする、同期の矢印や円環、キーボードの盤面を抽象化する。
- 印象: カラフルで楽しい。Pop Toy 配色と同じ方向で、丸みのある形と太めの面を使う。
- 色: 単色（`currentColor`）を基本にし、Pop Toy の多色版を同じ形で添える。

第 1 世代で変える軸は比喩の系統だけである。
viewBox、live area、線幅、端点、角丸、色の役割は 10 案で共通にする。

## Constraints

- `<text>`、`var()`、`aria-labelledby` を使わない。`role="img"` と最初の子 `<title>`、id は `part-mark-<role>`、色は `currentColor`（[SVG ツールチェーンの ADR](../../docs/decisions/2026-09-18-svg-toolchain.md)）。
- 白黒 1 色で成立させてから色を考える（`LOGO-07`）。多色版は SVG に色を書かず、part の id の末尾で役割を示し、利用画面の CSS が塗る。`-accent` は黄（primary）、`-accent-2` は青（secondary）、`-accent-3` は赤橙（tertiary）。
- `-accent` は塗りの part だけに付ける。`just svg-compare` は `-accent` の fill だけを塗るためである。
- 黄は白の面に 1.61:1 しかない。多色版で黄の面だけが形を担う案は、明の面で輪郭が弱くなる。
- 本体のヘッダーと入口では、マークは黄の箱（`.logo`）の中に置かれる。単色版は箱の上で黒に近い `on-primary` になる。多色版を使うなら箱を外す。
- viewBox は `0 0 32 32`、live area は `4..28`。favicon の基準が 32px である（`LOGO-07`）。
- Catalog には載せない（[掲載しない Experiment の ADR](../../docs/decisions/2026-09-22-unlisted-experiments.md)）。

## Hypothesis

キーキャップ、盤面、文字 K、同期の記号のどれかを核にすれば、16px のタブでもキーボードの道具と読め、複数の機器を揃える役割を伝えられる。
どの系統が名前と役割に届くかは、下書きを並べて利用者が選ぶ。

## Variants

第 1 世代の 10 案と、それらを同じ条件で並べる一覧面 `overview` を置く。
系統が選ばれたら、ほかの案と一覧面は削除し、仮説と軸を「削除した variant」に残す。

| id           | 仮説                                                                        | 変えた軸           | 実装                   |
| ------------ | --------------------------------------------------------------------------- | ------------------ | ---------------------- |
| `caps-pair`  | 幅の違う 2 個のキーに同じ刻印を置くと、機種が違っても割り当てが揃うと読める | 比喩（キーが揃う） | `variants/caps-pair/`  |
| `caps-grid`  | 2×2 のうち 3 個が揃い 1 個が輪郭で残ると、揃えている途中と読める            | 比喩（キーが揃う） | `variants/caps-grid/`  |
| `caps-stack` | 奥の輪郭に手前の面を重ねると、複数の機器を 1 か所に重ねると読める           | 比喩（キーが揃う） | `variants/caps-stack/` |
| `k-cap`      | キーキャップの天面に K を抜くと、名前とキーボードを同時に示せる             | 比喩（文字 K）     | `variants/k-cap/`      |
| `k-sync`     | K の斜画を出る矢印と入る矢印にすると、Key と Sync を 1 字で示せる           | 比喩（文字 K）     | `variants/k-sync/`     |
| `k-keys`     | 縦長のキーと傾けた 2 個のキーで K を組むと、字がキーでできていると読める    | 比喩（文字 K）     | `variants/k-keys/`     |
| `ring-cap`   | 中央のキーを 2 本の円弧の矢印が巡ると、キーの同期と読める                   | 比喩（同期の記号） | `variants/ring-cap/`   |
| `swap-caps`  | 対角の 2 個のキーを往復の矢印で結ぶと、機器の間の同期と読める               | 比喩（同期の記号） | `variants/swap-caps/`  |
| `board-pop`  | 盤面から 1 個のキーだけが浮くと、割り当てを変える道具と読める               | 比喩（盤面）       | `variants/board-pop/`  |
| `board-link` | 2 台の段を 1 本の縦長キーが貫くと、同じ割り当ての共有と読める               | 比喩（盤面）       | `variants/board-link/` |
| `overview`   | 10 案を同じ条件で並べると、系統を比べて選べる                               | 一覧面             | `variants/overview/`   |

原本は `shared/build-marks.mjs` が書き出す。配布用は `just svg-optimize` の出力である。

### 造形のパラメータ

10 案で共通の値である。

| 項目       | 値                           | 理由                                                                     |
| ---------- | ---------------------------- | ------------------------------------------------------------------------ |
| viewBox    | `0 0 32 32`                  | favicon の基準が 32px（`LOGO-07`）。uiux-numa-logo と同じ                |
| live area  | `4..28`（24 角）             | 外周 4 を余白に残す（`LOGO-06`）                                         |
| 線幅       | 3                            | 16px で 1.5px。面を主にし、線は矢印と輪郭だけに使う                      |
| 端点と角   | 丸                           | Pop Toy の丸みと、機能アイコン（`cornix-ui-icons`）の丸い端点に揃える    |
| キーの角丸 | 一辺の約 3/10                | 機能アイコンのキーキャップ（超楕円）に近い見えを、下書きでは角丸で代える |
| 色数       | 1（currentColor）+ 役割 3 つ | 単色で成立させ、多色は利用画面の CSS で塗る                              |

### 反復の記録

| round | 観察                                                                                   | 変更                            | 参照      | 終了理由         |
| ----- | -------------------------------------------------------------------------------------- | ------------------------------- | --------- | ---------------- |
| 1     | `caps-pair` の刻印を下寄せの横棒（ホームポジションの突起）にすると、目と口の顔に読めた | 刻印を左上の縦の刻みへ移す      | `LOGO-02` | 口の読みが消えた |
| 2     | `caps-pair` は左右対称のままでは 2 つの目に読めた                                      | 幅を 9 と 12 に変えて対称を崩す | `LOGO-03` | 上限に達した     |
| 3     | `caps-pair` は幅を変えても目の読みが残った                                             | 変更なし。系統の選定に持ち込む  | `LOGO-02` | 未解決として残す |
| 1     | `k-sync` の入る矢印の矢じりが K の分岐点に重なり、16px で塊になる                      | 変更なし。系統の選定に持ち込む  | `LOGO-07` | 判断待ち         |
| 1     | `board-link` は 2 段と縦棒が H や梯子に読める                                          | 変更なし。系統の選定に持ち込む  | `LOGO-02` | 判断待ち         |
| 1     | `caps-grid` は 4 個の角丸が汎用のアプリ一覧の記号に近い                                | 変更なし。系統の選定に持ち込む  | `LOGO-04` | 判断待ち         |

### previews

- `compare.html`: 10 案の SVG をそのまま並べた比較ページ。16 / 24 / 32 / 64px、明暗、Pop Toy の `-accent`。

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related

- [uiux-numa-logo](../uiux-numa-logo/README.md): ロゴの Experiment の進め方と記録の手本
- [cornix-ui-icons](../cornix-ui-icons/README.md): KeySync の機能アイコン。キーキャップの枠と丸い端点の出どころ
- [比喩は描き方より先に効く](../../docs/principles/metaphor-decides-before-style.md): 比喩の系統を先に並べる手順の出どころ
