---
title: Baseball Player Journey のドット絵のアイコン
status: draft
role: module
maturity: experimental
created: 2026-10-01
updated: 2026-10-01
platforms:
  - web
domains:
  - iconography
  - visual-design
sources:
  - baseball-journey-app
adopted: []
---

## Problem

製品の design system の部品（[salan70/baseball_player_journey#238](https://github.com/salan70/baseball_player_journey/issues/238)）は、試作 `baseball-journey-app`（`208f9e3`）から写す。
試作は Material Icons の `check`、`remove`、`add`、`backspace_outlined`、`sports_baseball` を使っている。
製品の UI/UX 方針（`ui_ux_concepts.md` §4）は、太い線か塗りのアイコンとピクセル風のアイコンを求め、アウトラインのアイコンを使わない。
部品が使うアイコンを、ドット絵の 1 組として描く。

## Target

1 季に 143 試合を記録する、ファミコンとスーファミの時代を知る野球好き。
アイコンは語の隣か、読み上げの名前を持つ押せる面の中に置く。
意味は語と読み上げが担い、アイコンは押す場所の手がかりにする。

## Scope / Domains

| asset       | 役割                         | 置き場所（製品の部品）           | 実利用のサイズ |
| ----------- | ---------------------------- | -------------------------------- | -------------- |
| `check`     | 選んだ札の印                 | `Tag`                            | 12px           |
| `minus`     | 数を 1 減らす                | `NumberStepper`                  | 24px           |
| `plus`      | 数を 1 増やす                | `NumberStepper`                  | 24px           |
| `backspace` | 1 字消す                     | 数字パッド                       | 24px           |
| `ball`      | 空の状態の印                 | `EmptyState`                     | 48px           |

## Constraints

- 12 × 12 の升目を塗る。12、24、48px で 1 升が 1、2、4px になり、画素の境界に揃う。
- 升目の文字列（`#` が塗る、`.` が空ける）を正本にし、SVG と製品の Dart の sprite を同じ文字列から作る。
- 単色の `currentColor` にする。色は利用画面が与える。
- 線の太さは 2 升を基本にする。12px で 2px になり、§8.1 のチップの輪郭と揃う。
- 製品は Flutter で、SVG を読む package を足さず、design system の `PixelArt` で同じ升目を描く。

## Variants

| id         | 内容                                       |
| ---------- | ------------------------------------------ |
| `pixel-12` | 12 × 12 の升目。check、minus、plus、backspace は塗り、ball は輪と縫い目の線 |

## 反復の記録

### round 1

- 観察: ball を塗った円から縫い目を抜いたところ、24px 以下で縫い目が目に見え、顔に読めた（`previews/pixel-12-first-sheet.png`）。
- 観察: check、minus、plus、backspace は 12px でも形が残る。backspace の × は 1 升の抜きで、24px では 2px の隙間になる。

### round 2

- 変更: ball を、輪と「)(」の縫い目を 1 升の線で描く白球にした（`previews/pixel-12-round2-sheet.png`）。
- 観察: 12px でも野球の球に読める。線は 1 升で他の 4 つより細いが、48px の空の状態にだけ使うので揃えない。
- 終了理由: 5 つとも実利用のサイズで形と意味が読めたので、利用者の確認に回す。

## 確かめ方

- 比較ページ: `previews/compare.html`（12、24、48px、ライトとダーク、pop-toy）。
- 利用画面のモック: `just web-dev` の後に `http://localhost:5183/#baseball-journey-icons/pixel-12`。
- 原本の作り直し: `node experiments/baseball-journey-icons/shared/build-icons.mjs` の後、`just svg-optimize` で `dist/` を作る。

## 未解決

- ball だけ 1 升の線で、組の中で重さが軽い。空の状態の印として十分かは利用者が確かめる。
