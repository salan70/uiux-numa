---
title: Catalog の visual direction
status: evaluating
role: reference
maturity: experimental
created: 2026-09-20
updated: 2026-09-20
platforms:
  - web
domains:
  - visual-design
  - information-architecture
  - navigation
  - interaction-design
  - animation-motion
  - accessibility
sources:
  - docs/decisions/2026-09-20-catalog-visual-showcase.md
adopted: []
---

## Problem

公開 Catalog の見た目を、公開面を止めずに 3 方向で比べる必要がある。
ホスト ADR は公開 `apps/catalog/` を 3 スキンにしない。
比較は Lab の Experiment に閉じる。

## Target

Catalog で成果物を探し、触り、再利用の前提を読む開発者。
キーボード操作と、動きを減らす設定の利用者も含める。

## Scope / Domains

対象は visual design、information architecture、navigation、interaction、motion、accessibility。
variant で変える軸は layout、density、interaction、motion、調子の 5 つである。
掲載する specimen と metadata は 3 案で同じにする。
公開 `apps/catalog/` のコードは変えない。

## Constraints

- 比較は `just web-dev` の実サイズで行う。URL は `http://localhost:5183/#catalog-redesign/<id>`。
- 既存 token があれば使う。ホスト固有のブランド色は持たない方針を破る場合は、その variant の軸として明示する。
- `prefers-reduced-motion` と、hover は `hover: hover` かつ `pointer: fine` で囲む。
- live specimen を詳細の主役にする。説明文を先に置かない。
- AI は最終案を決めない。

## Hypothesis

同じ成果物でも、殻の精密さ、余白、色の人格が探索性と主役度を変える。
keyboard-first は探索を速くし、静かな階層は成果物を大きく見せ、色の遊びは記憶に残る。
代償は密度、実装コスト、ブランドの静けさである。

## Variants

| id                   | 仮説                                                            | 変えた軸                            | 実装                           |
| -------------------- | --------------------------------------------------------------- | ----------------------------------- | ------------------------------ |
| `precision-keyboard` | 精密なキーボード操作が、成果物へ最短で届く                      | 密度、keyboard-first、速い feedback | `variants/precision-keyboard/` |
| `quiet-hierarchy`    | 静かな階層と大きな specimen が、成果物を 1 度に 1 つ主役にする  | 余白、情報階層、動きの少なさ        | `variants/quiet-hierarchy/`    |
| `playful-chroma`     | 色と細部の遊びが、探索を楽しくし、metadata を二次情報に落とせる | 色、copy、hover、人間味             | `variants/playful-chroma/`     |

## Evaluation

[evaluation.md](evaluation.md) に比較表がある。
選んだ軸は visual hierarchy、discoverability、interaction clarity、motion appropriateness、brand fit、accessibility、implementation cost である。
成果物の主役度は visual hierarchy の判定に含める。
最終採用は人間が決める。

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

なし
