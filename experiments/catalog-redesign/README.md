---
title: Catalog の visual direction
status: decided
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
  - experiments/soft-component-kit
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
比較中は公開 `apps/catalog/` を変えない。
公開面の改修は人間判断のあと、Decision の原則だけを移す。

## Constraints

- 比較は `just web-dev` の実サイズで行う。URL は `http://localhost:5183/#catalog-redesign/<id>`。
- 既存 token があれば使う。ホスト固有のブランド色は持たない方針を破る場合は、その variant の軸として明示する。
- `prefers-reduced-motion` と、hover は `hover: hover` かつ `pointer: fine` で囲む。
- live specimen を詳細の主役にする。説明文を先に置かない。
- 最終案は人間が決める。

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

公開 Catalog の正は、3 つの named variant のどれでもない。
殻の見た目は `soft-component-kit` の `hairline-float` を続ける。
中身の役割は `quiet-hierarchy` から借りる。静かな殻、大きな 1 specimen、成果物が主役である。
色面は `playful-chroma` から借りる。グラデの紙、温かい面と冷たい面、カードの色の出方である。
表層レイアウトと人間味のある copy は足さない。
判断者は利用者である。判断日は 2026-09-20 である。
`adopted` は空にする。variant を公開サイトの正にしなかったためである。

公開 Catalog が参照する原則は次である。

- Quiet shell, expressive work: ホストは線と面だけにし、見本を先に置く
- One hero at a time: トップは 1 件の大きな標本。同時に強い主役を並べない
- 色面は scheme の `--color-*` に混ぜる。固有パレットの正にはしない
- 画面語彙は静かにする。題名と `role` / `maturity` / `platforms` は正本から出す
- 一覧は説明文より preview を先にする。詳細は live specimen を先にする
- ナビは配色、文字、アイコン、図、UI、動きなど、見て辿る種別にする

## Rejected reasons

- `precision-keyboard` を公開殻にする: 暗い精密さが先に目立つ。ホストが固有色を持たない判断と張る。検索は今回の公開面に必須ではない。
- `quiet-hierarchy` の表層を公開サイトへ写す: 借りるのは階層と主役の役割だけである。部品の造形は既に `hairline-float` がある。
- `playful-chroma` を公開殻にする: 入口 / 棚の IA と遊び copy が標本と並走する。Arc / Dia の人間味は採用しない。色だけ借りる。
- `playful-chroma` の色を足さない: 殻が均一だと入口と階層が弱い。利用者の修正判断である。
- 3 案を Catalog 本番へ同居させる: 比較軸がサイト単位になり、公開面が止まる。ホスト ADR と visual showcase ADR の維持判断である。
- 人間味 copy を足す: 静かな殻と成果物主役の方針と反する。

## Learnings

公開殻と中身の役割は別の採用単位である。
表層を写さず役割と色面だけ借りると、既存部品キットを捨てなくてよい。
遊び copy は記憶に残るが、標本の前に人格が来る。
3 スキンの同居は比較には向くが、公開面の正にはしない。

## Related patterns / assets

- 公開殻: [soft-component-kit](../soft-component-kit/README.md) の `hairline-float`
- 責務: [visual showcase の ADR](../../docs/decisions/2026-09-20-catalog-visual-showcase.md)
