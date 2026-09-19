---
title: 日本語プロダクト UI の Typography
status: decided
created: 2026-09-19
updated: 2026-09-19
platforms:
  - web
domains:
  - typography
  - visual-design
  - design-tokens
  - accessibility
adopted:
  - line-seed-minimal
---

## Problem

Typography の共通定義がない。
各 Experiment は `system-ui` と個別のサイズを直接指定している。
そのため、同じ役割の文字でも値と意図を再利用できない。

## Target

日本語を中心とする Web プロダクトの利用者と開発者を対象にする。
一般的な設定画面を使い、情報の確認と操作を同時に検証する。

## Scope / Domains

対象は typography、visual design、design tokens とする。
accessibility も対象に含める。
書体、サイズ、ウェイト、行間、字間、行長、折返しを扱う。

## Constraints

- 本文は 16px を基準にする。
- 書体は LINE Seed JP に固定する。
- token は複数箇所で共通の意味を持つ値だけにする。
- LINE Seed JP の Regular と Bold だけを配布する。
- canonical token は DTCG 2025.10 に従う。
- 200% の文字拡大と WCAG 1.4.12 の spacing で内容を失わない。

## Hypothesis

6 個の semantic role で、一般的なプロダクト UI の階層を表現できる。
400 と 700 にウェイトを絞れば、合成ウェイトを避けながら配信量も抑えられる。
本文と UI の行間を分ければ、サイズを増やさず読み物と操作の双方へ対応できる。

## Variants

| id                  | 仮説                                          | 変えた軸               | 実装                          |
| ------------------- | --------------------------------------------- | ---------------------- | ----------------------------- |
| `current-system`    | 基準: 現状の暗黙の体系を再現できる            | system-ui、既存値      | `variants/current-system/`    |
| `line-seed-direct`  | 書体だけの置換では 600 の意図が曖昧なまま残る | LINE Seed JP、既存値   | `variants/line-seed-direct/`  |
| `line-seed-minimal` | 6 role と 2 weight で必要な階層を表現できる   | 書体、尺度、行間、role | `variants/line-seed-minimal/` |

| 判断                        | 解決する問題               | 根拠                                                        | 却下案                                              | 検証結果                                       |
| --------------------------- | -------------------------- | ----------------------------------------------------------- | --------------------------------------------------- | ---------------------------------------------- |
| LINE Seed JP を使う         | OS ごとに字面が変わる      | 既存プロジェクトで広く使い、和欧文の調整も済んでいる        | system-ui は表示が一定しない                        | 採用案で和文、英字、数字を同じ調子で表示できた |
| 400 / 700 に絞る            | 600 の実体がない           | 通常と強調の 2 段階でモックの階層を表現できる               | 800 は title だけにしか使わない                     | 合成ウェイトなしで操作と見出しを区別できた     |
| 14 / 16 / 20 / 24px に絞る  | 既存のサイズ段階が多い     | caption、基準、heading、title の 4 用途に対応する           | display と中間サイズは共通用途がない                | 狭い画面でも階層と本文量を保てた               |
| body と UI の行間を分ける   | 長文と操作文の密度が異なる | 本文は 1.75、UI は 1.5 で目的が異なる                       | 行間 1 種ではどちらかが過密か疎になる               | 本文と表の双方を同じサイズで読めた             |
| 字間は 0 にする             | 専用字間の用途がない       | overline を初回の共通 role に含めない                       | 0.04em は一部ラベルだけの値になる                   | 和文の本文と UI で余分な空きが出なかった       |
| semantic role を 6 個にする | role の重複を避ける        | title、heading、body、ui、control、caption でモックを覆える | label、ui-strong、body-small は既存 role と重複する | 追加 role なしで全要素へ割り当てられた         |

## Evaluation

[evaluation.md](evaluation.md)に比較結果を記録する。
可読性、階層、文字拡大、spacing 上書き、実装の一貫性を確認した。

## Decision

`line-seed-minimal` を採用する。
判断者は利用者、判断日は 2026-09-19 とする。

canonical token は `tokens/typography/` へ昇格する。
primitive 10 個と semantic 6 個を初回の上限とする。
新しい token は、既存 token で表せない複数の利用例が確認できた場合だけ追加する。

## Rejected reasons

- `current-system`: OS ごとに字面が変わり、複数プロジェクトで同じ結果を再現できない。
- `line-seed-direct`: 600 が残る。LINE Seed JP の実ファイルと役割が一致しない。
- 800: title だけのために token と font file を増やす必要がない。
- Thin: 小さい日本語 UI で使う共通用途がない。
- display: 一般的な設定 UI に必須ではない。
- overline: 一部の分類名だけに使う値であり、初回の共通 role に含める根拠がない。
- `clamp()` の尺度: プロダクト UI の階層は固定の 4 サイズで表現できる。

## Learnings

token の少なさだけでは一貫性を作れない。
各値に役割と追加条件を持たせると、似た token の増殖を防げる。

書体を替えるときは、既存のウェイト値をそのまま移してはいけない。
配布する実ファイルと semantic role を同時に決める必要がある。

## Related patterns / assets

- `tokens/typography/`
