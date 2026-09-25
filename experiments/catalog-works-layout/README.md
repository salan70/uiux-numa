---
title: Catalog の Icons と Motion の組み方
status: decided
role: module
maturity: experimental
created: 2026-09-24
updated: 2026-09-25
platforms:
  - web
domains:
  - visual-design
  - information-architecture
sources:
  - button
  - catalog-screen-entrance
adopted:
  - quiet-sections
  - motion-tiles
---

## Problem

Catalog の Works のうち Icons と Motion だけが、他の Works と違う組み方をしている。
Colors と Components は、大きな見本の下に「補足、題名、要約」を置いた Card の格子で成果物を並べる。
Icons と Motion は、成果物ごとに太い罫の見出し（`WorkHead`）、等幅で字間を開けた「詳細 module / experimental / 日付」、等幅のチップ、罫で囲んだセルを使う文書寄りの組み方である。
利用者は 2026-09-24 に、Icons と Motion を他の Works と統一感のある UI にすることを求め、方向を 3 案で比べてから決めることを選んだ。
1 巡目の結果、利用者は `quiet-sections` が最もイメージに近いと判断し、日付の情報は一切いらないとした。
Motion は既存の実装にとらわれずに考え直すことを求めた。

## Target

Catalog の Works をサイドバーで行き来し、成果物を見比べる人を対象にする。
Colors と Components を見た直後に Icons と Motion を開く。

## Scope / Domains

対象は visual design と information architecture とする。
1 巡目で変えた軸は、成果物を画面に直接並べるか、Card の一覧を挟んで詳細へ送るか、その中間か、である。
2 巡目は Icons を `quiet-sections` に固定し、Motion の見せ方だけを変える。
軸は、型をどう比べさせるか（同じ場所で切り替える / 並べて同時に見る / 分解して止める / 使われる画面の中で見る）である。
サイドバー、題字、入場の動きは案で変えない。

## Constraints

- 採用済みの Button（`experiments/button/shared/Button.tsx`）を使い、部品を複製しない。1 巡目の案は Card（`experiments/card/shared/Card.tsx`）も使った。
- 色、余白、字は既存の token だけを使う。寸法は `apps/catalog/src/catalog.css` の実値から写す。
- 配色と明暗は `useCatalogColors` で Catalog の選択を読む。
- 題名と variant は各 Experiment の README から `shared/works.ts` へ写す。SVG は各 variant の `dist/` をそのまま読む。
- 詳細へのリンクは runner の `#<slug>/<variant>` に向ける。Catalog では詳細ページへ向く。
- 日付と成熟度は画面に出さない（利用者の 2026-09-24 の判断）。
- 動きの見本は iframe を使わず、本文に直接描く。動きの中身は `catalog-screen-entrance` の各 variant の CSS をそのまま読み、`shared/entrance.tsx` は文字の分け方だけを持つ。iframe は runner の余白と地の色が枠に出て、読み込みの時点で再生が終わっていた。
- 見本は、見出しが画面に入ったときに 1 回再生する。

## Hypothesis

Icons と Motion の見た目が浮いて見える原因は、部品の語彙（罫、等幅、字間を開けたメタ、枠のセル）にある。
Colors と Components に揃えるには、部品を揃えるだけで足りるのか、一覧の構成まで揃える必要があるのかを比べる。

## Variants

| id               | 仮説                                                                                                    | 変えた軸                                                                                                                                                         | 実装                       |
| ---------------- | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| `quiet-sections` | 構成を保ったまま部品の語彙を Card と Colors に揃えれば、成果物を直接見られる利点を残して統一感が出る    | 構成 = 成果物を画面に直接並べる。太い罫と等幅メタと日付をやめ、題名と Colors と同じ ⓘ、丸い切替、罫の無い面のセルにする。Motion は型ごとに見本と説明を並べる基準 | `variants/quiet-sections/` |
| `motion-tiles`   | Icons と同じ「面のセルに名前を添えた格子」にすれば、Works の中で Icons と Motion が同じ画面の型に見える | Motion の比べ方 = セルを並べ、押すか載せると再生、「すべて再生」で同時に見る。説明は値の 1 行だけ                                                                | `variants/motion-tiles/`   |

`motion-tiles` の部品は `shared/MotionTiles.tsx` と `shared/motion-tiles.css` にあり、Catalog の Motion 画面も同じものを読む。

### 削除した variant

却下した案はコードを削除し、仮説と軸だけを残す。

1 巡目（Icons と Motion の組み方）:

- `feature-cards`: Colors と同じ「注目 1 件の帯と前後送り」と「全件の Card の格子」にすれば、Works の中で最も似た画面の型に揃う。変えた軸: 注目 1 件を全幅で見せ前後に送る帯と、全件の Card の格子。
- `card-index`: Components と同じ Card の一覧だけにすれば、一覧の見た目は最も揃う。代わりに成果物を見るまでの操作が 1 回増える。変えた軸: 1 成果物 1 枚の Card の格子だけにし、variant と型の切替は詳細へ預ける。

2 巡目（Motion の比べ方）:

- `motion-stage`: 舞台を 1 つにし、型を切り替えるたびに同じ場所で再生すれば、違いが動き方だけになり最も見分けやすい。変えた軸: 1 つの舞台で切り替え、説明は選んだ型の分だけ出す。
- `motion-scrub`: 動きは一瞬で終わるので、任意の時点で止め、単位ごとの遅れと長さと曲線を図で示せば、違いを言葉にできる。変えた軸: 再生と止めるつまみ、再生中の animation から読んだ単位ごとの時間の線、曲線の図。
- `motion-in-context`: 画面表示の動きは、使われる画面の中で見なければ良し悪しが分からない。変えた軸: Catalog を縮めた画面の中でナビを押して画面の表示を起こし、型で変わるのは題字だけにする。

## Evaluation

比較評価は行わず、利用者が runner で案を見て判断した。

## Decision

Icons は `quiet-sections`、Motion は `motion-tiles` を採用する。

- 判断者: リポジトリの所有者
- 判断日: 2026-09-24（Icons と日付）、2026-09-25（Motion）
- Icons: 利用者は `quiet-sections` が「1 番イメージと近い」と判断した。成果物を画面に直接並べる構成は保ち、部品の語彙だけを Colors と Components に揃える。
- 日付: 利用者は「日付情報は一切いらない」と判断した。Icons と Motion の成果物の見出しから、日付、role、maturity を外す。
- Motion: 利用者は 2 巡目の 4 案から `motion-tiles` を選んだ。`quiet-sections` の Motion 側（型ごとに見本と説明を並べる）は基準として置いたもので、採用しない。

Catalog への適用:

- 成果物の見出し（`WorkHead`）は、題名と Colors のカードと同じ ⓘ の 1 行にする。方針の画面は `.work-head` を使い続けるので、class を `.topic-work-head` に分ける。
- variant の切替（`VariantChips`）は丸い切替にし、選択は文字色の塗りで示す。
- SVG のセル（`SvgGrid`）は罫をやめ、面の色と角丸で置き、名前を本文の書体で組む。
- Motion 画面は `shared/MotionTiles` を読み、見本を iframe に入れず本文に直接描く。
- セルの値は「・」で区切らず、間隔で区切る。利用者が 2026-09-25 に、「・」を区切りに使わないよう求めた。
- 「Catalog で使用」の印は出さない。利用者が 2026-09-25 に、この情報はいらないと判断した。印の元だった `ENTRANCE_VARIANT` も外した。

## Rejected reasons

- `feature-cards`、`card-index`（2026-09-24、判断者はリポジトリの所有者）: 利用者は `quiet-sections` が最もイメージに近いと判断した。どちらも一覧を挟むので、成果物を見るまでに操作が増える。
- `motion-stage`、`motion-scrub`、`motion-in-context`（2026-09-25、判断者はリポジトリの所有者）: 利用者は `motion-tiles` を選んだ。3 案とも Icons と違う画面の型になり、Works の中での統一感という Problem に対して `motion-tiles` より遠い。

## Learnings

- 「統一感」の求めに対して、1 巡目は一覧の構成（Card を挟むか）を軸にしたが、利用者が求めたのは構成ではなく部品の語彙の揃いだった。構成を変える案は、成果物を見るまでの操作を増やす代償が先に立った。
- 動きの見本を iframe に入れると、読み込みの時点で再生が終わり、下にある見本は見る前に止まっている。本文に直接描き、画面に入ったときに再生すると、見本として機能する。

## Related

- `experiments/card/`: 1 巡目の案で使った一覧の Card。
- `experiments/button/`: 「すべて再生」の Button と `useCatalogColors`。
- `experiments/catalog-screen-entrance/`: Motion に載る型と、その animation の CSS。
- `apps/catalog/README.md`: Catalog の画面の判断の表。
- `docs/principles/state-changes-must-not-move-layout.md`: 切替で寸法を変えない根拠（候補）。
