---
title: 柔らかい現代系の Catalog 部品キット
status: implementing
created: 2026-09-19
updated: 2026-09-19
platforms:
  - web
domains:
  - forms-input-ux
  - visual-design
  - interaction-design
  - accessibility
adopted: []
---

## Problem

Catalog の部品は要素セレクタの上書きと角丸 `0.25rem` で作っている。
利用者はこれを古く感じている。
サイト全体のスキンを止めて、部品一式だけを作り直す必要がある。

## Target

Catalog を見る開発者と、同じ部品を個人開発へ持ち込む開発者を対象にする。
キーボード操作と、ライト / ダークの配色切替も対象に含める。

## Scope / Domains

対象領域は forms / input UX、visual design、interaction design、accessibility とする。
variant で変える軸は角丸、面の階層、影、動きの 4 つである。
見本の内容と Base UI の配線は共通にする。

## Constraints

- 公開 Catalog の見た目は変えない。
- 挙動の土台は `@base-ui/react` 1.8.0 とする。
- Tooltip、Accordion、ScrollArea は使わない。
- 色は 19 role と `color-mix` だけにする。
- 角丸と影は token にせず、variant のローカル変数にする。
- focus は `2px solid var(--color-focus)` と offset `2px` にする。
- 入力の境界は 3:1 を満たす。
- 動きは CSS だけにする。
- `prefers-reduced-motion` では opacity 150ms だけにする。
- Portal の container はラッパー内の ref にする。

## Hypothesis

線、色段差、拡散影、カプセルばねのどれかで、Catalog の全部品を古く見せずに揃えられる。
挙動を Base UI に任せれば、造形だけを 4 案で比較できる。

## Variants

| id               | 仮説                                            | 変えた軸                         | 実装                       |
| ---------------- | ----------------------------------------------- | -------------------------------- | -------------------------- |
| `hairline-float` | 基準: 線で区切り、浮く面だけに影を置けば足りる  | 1px の境界、popup と drawer の影 | `variants/hairline-float/` |
| `tonal-layers`   | 影も線もなく、色段差 3 層で階層が読める         | 面の 3 層、選択は weight と ring | `variants/tonal-layers/`   |
| `soft-pillow`    | やわらかい 2 層の影で、面を層として浮かせられる | 線なし、弱いばね、press の縮小   | `variants/soft-pillow/`    |
| `capsule-spring` | 操作部品をカプセルにし、ばねを主役にできる      | 999px、accent 塗り、強いばね     | `variants/capsule-spring/` |

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

- [soft-component-kit ADR](../../docs/decisions/2026-09-19-soft-component-kit.md)
- [Catalog ホスト ADR](../../docs/decisions/2026-09-19-catalog-host.md)
