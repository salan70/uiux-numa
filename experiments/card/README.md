---
title: 押せる一覧カード
status: evaluating
role: module
maturity: experimental
created: 2026-09-21
updated: 2026-09-21
platforms:
  - web
domains:
  - layout
  - interaction-design
  - visual-design
  - accessibility
sources:
  - https://developer.apple.com/jp/design/human-interface-guidelines/content
adopted: []
---

## Problem

一覧の 1 件を、全体で押せる 1 つの面にまとめ、区切りと押せることを同時に伝える。

## Target

Web のプロダクト画面で記事や部品の一覧から 1 件を選ぶ人と、Card の見本を参照する開発者を対象にする。

## Scope / Domains

対象は layout、操作、見た目、accessibility とする。
構成は任意のカバー、題名、任意の要約、任意の補足に限る。
構成と見た目は Apple HIG の一覧カードに揃え、variant で変える軸は hover の動きだけとする。

## Constraints

- React + TypeScript と CSS で実装し、追加依存を入れない。
- 既存の文字、余白、角丸、線、動き、役割色 token を使う。
- カードは面を持たず、線と角丸は 16:9 のカバーだけが持つ。題名はカバーの下に置く。
- カバーが無いときは、同じ線と角丸の枠の中に文字を置く。
- カバーには挿絵を新しく描かず、配色、文字、token、アイコン、Button などリポジトリの実物を縮小して置く。
- カバーは飾りとして `aria-hidden` と `inert` にし、中の Button へフォーカスを移さない。
- `<article>` と見出し内の `<a>` で意味を保ち、リンクの `::after` をカード全面へ広げて全体を押せるようにする。
- リンク名は題名だけにし、要約と補足を読み上げのリンク名に含めない。
- `focus-visible` の枠はカードの外周に出す。
- hover の変化は精密ポインタに限り、reduced motion では移動と拡縮を止める。
- 状態の変化でカードの寸法を変えない。
- Catalog の既存配色と light / dark を見本へ反映する。

## Hypothesis

構成を HIG に揃えたまま hover の動きだけを変えると、押せる感覚と一覧の落ち着きの釣り合いを比べられる。

## Variants

| id               | 仮説                                                                   | 変えた軸                   | 実装                       |
| ---------------- | ---------------------------------------------------------------------- | -------------------------- | -------------------------- |
| `zoom-cover`     | 枠を止めてカバーの中身だけを 1.04 倍にすると、並びを崩さず反応を示せる | 動き: カバーの中身だけ拡大 | `variants/zoom-cover/`     |
| `zoom-tint`      | `zoom-cover` に題名の色の変化を足すと、押す先が題名だと伝わる          | `zoom-cover` + 題名の色    | `variants/zoom-tint/`      |
| `zoom-underline` | `zoom-cover` に題名の下線を足すと、配色によらず押す先が伝わる          | `zoom-cover` + 題名の下線  | `variants/zoom-underline/` |

### 削除した variant

却下した案はコードを削除し、仮説と軸だけを残す。

1 巡目の 3 案は、利用者の確認で全案を却下した。

- `hairline-shift`: 細線の枠と色の変化だけで、一覧を静かに区切りつつ押せると示せる。変えた軸: 線、色。
- `tonal-raise`: 線を持たない淡い面と濃さの変化で、区切りの線を減らせる。変えた軸: 面の階層。
- `press-settle`: Button と同じ系統の浮き上がりと縮みで、押した感覚を伝えられる。変えた軸: 動き、押下の返し方。

2 巡目は利用者が `zoom-cover` の方向を選び、残る 2 案を却下した。

- `scale-card`: HIG と同じくカード全体を 1.007 倍にすると、色を変えずに押せると示せる。変えた軸: 動き、カード全体の拡大。
- `still-underline`: 何も動かさず題名の下線と枠線で返すと、一覧が最も落ち着く。変えた軸: 動きなし、下線と線の色。

## Evaluation

未定

## Decision

未定

## Rejected reasons

- 1 巡目の 3 案: 利用者は「どれもピンとこない。AI 感が強い」と判断した。3 案とも文字の箱に線か面を付けた汎用の形で、違いが区切り方の細部にとどまった。2 巡目は利用者が示した Apple HIG の一覧カードを参照し、カバーと題名の構成に変えた。
- `scale-card`、`still-underline`: 利用者はカバーの中身だけが動く `zoom-cover` を選んだ。3 巡目は `zoom-cover` に題名の色の変化と下線を足した案を比べる。

## Learnings

HIG の一覧カードは面を持たず、線と 18px の角丸をカバーだけに付ける。
hover は `transform: scale(1.007)` を 160ms の ease-out で行い、色は変えない。reduced motion では拡大を止める。
`zoom-tint` の色は Catalog のリンクの hover と同じ `color.primary-text` にした。どの配色でも面に対して 4.5:1 を満たす役割のためである。sumi では灰色になり、差は小さい。
角丸は既存の `radius.surface`(10px) を使い、HIG の 18px には合わせていない。
1.007 倍は幅 240px で約 1.7px になる。幅 100px の Button では約 0.7px で見えないため、Button へ移すなら倍率を別に決める。

## Related patterns / assets

- `experiments/button/`: 押下の縮みと hover の浮き上がりを `press-settle` で参照する。
- `experiments/button/shared/useCatalogColors.ts`: 単体表示で Catalog の配色を読む処理を共有する。
