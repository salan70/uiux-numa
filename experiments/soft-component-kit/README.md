---
title: 柔らかい現代系の Catalog 部品キット
status: decided
role: module
maturity: candidate
created: 2026-09-19
updated: 2026-09-20
platforms:
  - web
domains:
  - forms-input-ux
  - visual-design
  - interaction-design
  - accessibility
sources: []
adopted:
  - hairline-float
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

| id               | 仮説                                           | 変えた軸                         | 実装                       |
| ---------------- | ---------------------------------------------- | -------------------------------- | -------------------------- |
| `hairline-float` | 基準: 線で区切り、浮く面だけに影を置けば足りる | 1px の境界、popup と drawer の影 | `variants/hairline-float/` |

### 削除した variant

判断後にコードと専用の preview を削除した。
理由は Rejected reasons、削除の判断と復元手順は [ADR](../../docs/decisions/2026-09-21-prune-decided-experiments.md) にある。

- `tonal-layers`: 影も線もなく、色段差 3 層で階層が読める。変えた軸: 面の 3 層、選択は weight と ring。
- `soft-pillow`: やわらかい 2 層の影で、面を層として浮かせられる。変えた軸: 線なし、弱いばね、press の縮小。
- `capsule-spring`: 操作部品をカプセルにし、ばねを主役にできる。変えた軸: 999px、accent 塗り、強いばね。

## Evaluation

`docs/evaluation/review.md` の多観点の評価は行っていない。
判断は、4 案の Kit 見本の確認による。

## Decision

`hairline-float` を採用する。
公開 Catalog の部品は、この案の造形と Base UI の配線へ置き換える。

- 判断者: リポジトリの所有者
- 判断日: 2026-09-20
- 根拠: Kit 見本 4 案の確認

採用の理由は次のとおり。

- 1px の境界で部品の輪郭が読め、popup と drawer だけに影を置く。
- 角丸は操作部品 `0.625rem`、面 `1rem` で、紙全体をカプセルにしない。
- 動きは 140ms の ease-out と press 1px に収まり、CSS だけで足りる。

未評価の軸は brand fit、支援技術での読み上げの横断確認、390px ヘッダーの既存のメニュー切れである。

## Rejected reasons

- `tonal-layers`: 線も影もなく、色段差だけに頼る。Catalog の紙と部品の輪郭が弱い。popup の浮きも足りない。
- `soft-pillow`: 面全体に拡散影を置く。全面の elevation になり、ホストが避けてきた影の使い方に戻る。ばねのイージングも CSS だけで揃える負荷が大きい。
- `capsule-spring`: 角丸 999px と accent 塗り、強いばねが主役になる。表やカードと操作部品の形が分かれ、見本帳の紙をカプセルに寄せすぎる。

却下した 3 案の `variants/` は判断後に削除した。

## Learnings

- 公開面へ取り込むときは、採用案のローカル変数を `catalog.css` の部品セレクタへ写す。角丸と影は token にしない。
- Experiment の Kit 見本は比較記録として残し、公開面の正本は Catalog の CSS と部品にする。

## Related patterns / assets

- [soft-component-kit ADR](../../docs/decisions/2026-09-19-soft-component-kit.md)
- [Catalog ホスト ADR](../../docs/decisions/2026-09-19-catalog-host.md)
