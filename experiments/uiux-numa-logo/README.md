---
title: UI/UX NUMA のロゴ
status: implementing
role: module
maturity: experimental
created: 2026-09-22
updated: 2026-09-22
platforms:
  - web
domains:
  - logo-brand-identity
  - visual-design
  - accessibility
sources:
  - color-schemes-material
  - product-ui-typography
adopted: []
---

## Problem

公開サイトの表示名を「UI/UX NUMA」へ変えたが、顔になる形がない。
[表示名の ADR](../../docs/decisions/2026-09-22-display-name-uiux-numa.md) は「ロゴの wordmark は本 ADR では決めない」「ロゴと favicon は未着手」を残した。

favicon は存在しない。
`apps/catalog/index.html` に `<link rel="icon">` がなく、`apps/catalog/public/` は `_redirects` だけである。
本番 `https://uiux.oda79.me/` はブラウザ既定の白紙アイコンで出ている。

サイドバー題字とホーム大見出しは、書体そのままの文字列である。
タブ、ブックマーク、共有先のように文字が使えない面で、このサイトを指す形がない。

## Target

Catalog を見る利用者と、リポジトリの作者自身を対象にする。
最も頻度が高い面はブラウザのタブ（16px）である。
次がサイドバー題字（20px 相当）、最も大きい面がホームの大見出し（42〜96px）である。

## Scope / Domains

対象はマーク 1 個と、その lockup の形式である。
domain は `logo-brand-identity`、`visual-design`、`accessibility`。
`iconography` は入れない。`logo-brand-identity` に topic が無いため、2 番目以降の domain が topic を決めてしまう。

variant で変えるのは「比較の 2 面をどう関係づけるか」だけである。
viewBox、live area、格子、線幅、色数は 3 案で共通にする。

比喩の系統と目指す印象は、制作前に利用者が決めた（2026-09-22）。

- 比喩: 比較の 2 面。複数案を並べて比べるという、このリポジトリの営み自体を形にする。「沼」の語義とは切り離す。
- 印象: 実験的で動きがある。したがって非対称にする（`LOGO-03`）。

この順は [比喩は描き方より先に効く](../../docs/principles/metaphor-decides-before-style.md)（`candidate`）と、`crafting-svg` の手順 1 に従う。
削除した `class-doc-logo` は比喩をエージェントが選び、4 案とも却下された。

## Constraints

- `<text>`、`var()`、`aria-labelledby` を使わない。`role="img"` と最初の子 `<title>`、id は `part-<asset>-<role>`、色は `currentColor`（[SVG ツールチェーンの ADR](../../docs/decisions/2026-09-18-svg-toolchain.md)）。
- フォントの outline 化ツールは同 ADR で却下済みである。path の wordmark を作る場合、LINE Seed JP の複製ではなく独自の作図になる。
- SVG に色を書かない。差し替えは利用画面の CSS で `part-*` を上書きする。
- 白黒 1 色で設計し、反転と 16px で成立してから色を考える（`LOGO-07`）。
- 10 配色 × light / dark で成立させる。`sumi` の dark は `--cat-accent` が背景にほぼ溶けるため、前景に色を持たせるなら `--cat-accent-text` を使う。
- viewBox は `0 0 32 32`。favicon の基準が 32px である（`LOGO-07`）。
- Catalog には載せない。`domains` の先頭を `logo-brand-identity` にして topic を持たせない（[掲載しない Experiment の ADR](../../docs/decisions/2026-09-22-unlisted-experiments.md)）。

## Hypothesis

「複数案を並べて比べる」という営みを 2 面の関係で表すと、16px から 96px まで同じ形で成立し、かつ既製のアイコン集と区別できる固有の形になる。

## Variants

| id             | 仮説                                                                   | 変えた軸           | 実装                     |
| -------------- | ---------------------------------------------------------------------- | ------------------ | ------------------------ |
| `offset-pair`  | 同形の 2 面をずらし、重なりだけを塗ると、比較と合意を 1 つの形で表せる | 2 面の関係（重ね） | `variants/offset-pair/`  |
| `chosen-one`   | 幅と丈の違う 2 面の片方だけを塗ると、選択そのものを表せる             | 2 面の関係（選択） | `variants/chosen-one/`   |
| `split-face`   | 1 つの面を非対称な対角で割ると、割れ目が負の空間として比較を表す      | 2 面の関係（分割） | `variants/split-face/`   |

### 造形のパラメータ

3 案で共通にする。

| 項目       | 値                | 理由                                                               |
| ---------- | ----------------- | ------------------------------------------------------------------ |
| viewBox    | `0 0 32 32`       | favicon の基準が 32px（`LOGO-07`）                                 |
| live area  | `4..28`（24 角）  | 外周 4 を余白に残す。`LOGO-06` の clear space をマーク内に先取りする |
| 格子       | 偶数座標          | 16px（1/2 倍）で整数ピクセルに乗る                                 |
| 線幅       | 2                 | 16px で 1px。輪郭の面と塗りの面を同じ濃さで比べられる              |
| 色数       | 1（currentColor） | 白黒 1 色で始める（`LOGO-07`）                                     |
| 主な要素   | 面                | 細い線と鋭角は縮小で潰れる（`LOGO-01`）                            |
| 対称軸     | なし              | 実験的で動きがある印象（`LOGO-03`）                                |

### 反復の記録

| round | 観察                                                                                                   | 変更                                                             | 参照               | 終了理由         |
| ----- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------- | ------------------ | ---------------- |
| 1     | `offset-pair` は手前の塗りが奥の輪郭を覆い、比較ではなく複製に読めた                                   | 2 面とも輪郭にし、重なりだけを塗る                               | `LOGO-04`          | 複製の読みが消えた |
| 1     | `chosen-one` は幅が同じで底辺が揃い、棒グラフに読めた                                                  | 幅と丈の両方を変え、天地も揃えない                               | `LOGO-03`          | 図表の読みが消えた |
| 1     | `split-face` は対角線が 16px で灰色に滲む。48px では明快                                               | 変更なし。対角は整数ピクセルに乗らないため、16px 専用版の要否を判断待ちにする | `LOGO-07`          | 未解決として残す |
| 2     | 利用画面で見ると、`offset-pair` はタブの 16px で線と塗りが密集し、輪郭の 2 面が 1 つの塊に潰れる       | 変更なし。マークの選定に持ち込む                                 | `LOGO-01`          | 判断待ち         |
| 2     | `chosen-one` はどのサイズでも読めるが、矩形 2 個だけなので固有の要素が弱い                            | 変更なし。マークの選定に持ち込む                                 | `LOGO-04`          | 判断待ち         |
| 2     | `split-face` は割れ目が `N` の字面に見え、`NUMA` と結び付く。意図していなかった固有の要素である        | 変更なし。採用する場合の理由として記録する                       | `LOGO-04`、`LOGO-08` | 判断待ち         |

### previews

- `compare-first-sheet.png`: 3 案の初回。16 / 32 / 48px、明暗、最小サイズの 4 倍拡大。
- `compare-second-sheet.png`: round 1 の変更後。同じ条件。
- `<id>-first-in-context.png`: 3 案の利用画面。タブ 16px、サイドバー題字、ホーム大見出し、16 / 24 / 32 / 48px の縮小列、明暗の反転タイル。

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

- [表示名の ADR](../../docs/decisions/2026-09-22-display-name-uiux-numa.md): 「UI/UX NUMA」と `NUMA` 単体の誤読という残る論点
- [掲載しない Experiment の ADR](../../docs/decisions/2026-09-22-unlisted-experiments.md): この Experiment を Catalog に載せない根拠
- [比喩は描き方より先に効く](../../docs/principles/metaphor-decides-before-style.md): 比喩を先に決める手順の出どころ
