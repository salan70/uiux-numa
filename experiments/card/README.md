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
sources: []
adopted: []
---

## Problem

一覧の 1 件を、全体で押せる 1 つの面にまとめ、区切りと押せることを同時に伝える。

## Target

Web のプロダクト画面で記事や部品の一覧から 1 件を選ぶ人と、Card の見本を参照する開発者を対象にする。

## Scope / Domains

対象は layout、操作、見た目、accessibility とする。
構成は題名、要約、任意の補足の 3 つに限る。
variant で変える軸は、面の区切り方と、hover と押下の返し方とする。

## Constraints

- React + TypeScript と CSS で実装し、追加依存を入れない。
- 既存の文字、余白、角丸、線、動き、役割色 token を使う。
- `<article>` と見出し内の `<a>` で意味を保ち、リンクの `::after` をカード全面へ広げて全体を押せるようにする。
- リンク名は題名だけにし、要約と補足を読み上げのリンク名に含めない。
- `focus-visible` の枠はカードの外周に出す。
- hover の変化は精密ポインタに限り、reduced motion では移動と拡縮を止める。
- 状態の変化でカードの寸法を変えない。
- Catalog の既存配色と light / dark を見本へ反映する。

## Hypothesis

同じ構造と状態を保ったまま、面の区切り方と押下の返し方を変えると、一覧での読みやすさと押せる感覚の釣り合いを比べられる。

## Variants

| id               | 仮説                                                           | 変えた軸           | 実装                       |
| ---------------- | -------------------------------------------------------------- | ------------------ | -------------------------- |
| `hairline-shift` | 細線の枠と色の変化だけで、一覧を静かに区切りつつ押せると示せる | 線、色             | `variants/hairline-shift/` |
| `tonal-raise`    | 線を持たない淡い面と濃さの変化で、区切りの線を減らせる         | 面の階層           | `variants/tonal-raise/`    |
| `press-settle`   | Button と同じ系統の浮き上がりと縮みで、押した感覚を伝えられる  | 動き、押下の返し方 | `variants/press-settle/`   |

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

- `experiments/button/`: 押下の縮みと hover の浮き上がりを `press-settle` で参照する。
- `experiments/button/shared/useCatalogColors.ts`: 単体表示で Catalog の配色を読む処理を共有する。
