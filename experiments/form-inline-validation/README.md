---
title: 入力フォームの inline validation
status: evaluating
created: 2026-09-13
updated: 2026-09-17
platforms:
  - web
domains:
  - ux-writing
  - forms-input-ux
  - states-design
  - interaction-design
  - accessibility
---

## Problem

アカウント登録フォームでは、入力エラーの伝え方が完了率と体感を左右する。
検証のタイミング、エラー文言の書き方、成功の伝え方の組み合わせで体験がどう変わるかを比較する。
最初の Experiment として、記録形式と評価手順が実際に回るかも検証する。

## Target

Web のアカウント登録画面を初めて使う利用者。
キーボードだけの操作とスクリーンリーダーでの利用も対象に含める。

## Scope / Domains

対象領域は UX writing、forms / input UX、states design、interaction design、accessibility。
variant で変える軸は次の 3 つ。

- 検証タイミング: 離脱時、送信時、初回離脱後は入力中
- 文言: 事実のみ、対処法つき
- feedback: エラーのみ、エラー要約と各項目、エラーと成功

3 variant で全組み合わせは網羅しない。
主軸は検証タイミングとし、文言と feedback は副次的に変える。
見た目（レイアウト、色、余白）は共通にし、比較対象から外す。

## Constraints

- React + TypeScript で実装し、追加の npm 依存を入れない。
- 項目は email、password、表示名の 3 つ。送信はサーバーなしで疑似的に成功させる。
- 検証規則は全 variant で同じにする。email は必須で `@` を含む。password は必須で 8 文字以上、英字と数字を含む。表示名は必須で 1〜20 文字。
- 送信ボタンは「登録する」。成功時はフォームの代わりに「登録が完了しました」を表示する。
- キーボードだけで完了でき、エラーと成功は支援技術に伝わる（`aria-invalid`、`aria-describedby`、live region など）。
- レイアウトは全 variant で揃える。最大幅 24rem の 1 列、ラベルは入力欄の上、項目間は 1rem、フォントは system-ui 16px、エラー色は `#b3261e`、成功色は `#1b6b3a`、フォーカスは可視にする。
- 共有コードを作らず、各 variant は `variants/<id>/` 内で完結させる。
- UI 文言は日本語にする。

## Hypothesis

検証のタイミングと文言の書き方は独立に体験を変える。
早い feedback は修正を速めるが、入力中の指摘は入力を妨げる。
対処法を含む文言は修正を速める。
成功の表示は安心感を与えるが、情報量が増える。

## Variants

| id          | 仮説                                                                                       | 変えた軸                                                                                                    | 実装                  |
| ----------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------- |
| `on-blur`   | 基準: フィールド離脱時の検証は入力の流れを妨げず、必要な時に指摘できる                     | 検証タイミング = 離脱時、文言 = 事実のみ、feedback = エラーのみ                                             | `variants/on-blur/`   |
| `on-submit` | 送信時にまとめて指摘し、要約から各項目へ移動できれば、修正の見通しが立つ                   | 検証タイミング = 送信時、文言 = 対処法つき、feedback = エラー要約と各項目                                   | `variants/on-submit/` |
| `realtime`  | 初回離脱後は入力中に検証し、成功も示せば、修正の完了が即座に分かる                         | 検証タイミング = 初回離脱後は入力中、文言 = 対処法つき、feedback = エラーと成功                             | `variants/realtime/`  |
| `hybrid`    | 送信時の要約と、修正後の離脱時の再検証を組み合わせれば、見通しと修正の即時確認を両立できる | 検証タイミング = 送信時、以降は離脱時、文言 = 対処法つき、feedback = エラー要約と各項目、解消は離脱時に反映 | `variants/hybrid/`    |

`hybrid` は 3 variant の評価後に追加した案（lifecycle 手順 6）。
評価で挙がった共通の指摘（`autoComplete`、成功時のフォーカス移動、検証規則の統一）も反映する。

## Evaluation

評価軸、重み、比較表、各観点の要点は [evaluation.md](evaluation.md) に記録する。
観点は designer、UX writing、accessibility、interaction / motion、implementation の 5 つ。
accessibility と writing clarity を必須の軸にする。
必須の軸で課題ありの variant はない。
重要の interaction clarity で、on-blur、realtime、hybrid が課題ありになった。
離脱で文言や要約の高さが変わり、修正直後の送信クリックが外れることを実操作で確認した。

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

なし
