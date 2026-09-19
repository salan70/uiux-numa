---
title: 入力フォームの inline validation
status: decided
role: module
maturity: candidate
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
sources: []
adopted:
  - on-submit
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

`on-submit` を採用する。

- 判断者: リポジトリの所有者
- 判断日: 2026-09-17
- 根拠: [evaluation.md](evaluation.md) の比較表と「保留の確認」

採用の理由は次のとおり。

- 必須の 2 軸（accessibility、writing clarity）がともに良いである。4 variant で唯一である。
- 重要の軸で課題ありがない唯一の variant である。
- 修正の直後に送信ボタンを押しても、送信が確実に届く。離脱で表示の高さが変わらないためである。
- 送信時の要約へのフォーカス移動と項目へのリンクで、キーボードと支援技術に結果と件数が伝わる。

許容のまま採用する弱点は次のとおり。

- feedback quality は許容である。修正しても再送信まで古い文言と無効の表示が残る。
- consistency は課題ありである。送信ボタンの色と無効時の枠線幅が Constraints から外れる。variant の軸ではないため、記録して許容した。実プロジェクトでは on-blur と hybrid の値に揃える。
- 成功時にフォームを差し替え、フォーカスが body に落ちる。hybrid の完了文へのフォーカス移動を取り込む候補とする。

## Rejected reasons

- `on-blur`: 修正の直後に送信ボタンを押すと送信されない（interaction clarity が課題あり）。押下時にエラー文言が消え、ボタンが 28px 動く。事実だけの文言は次の行動を推測に頼る（writing clarity が許容）。離脱時のエラーはスクリーンリーダーに送信まで伝わらない（accessibility が許容）。
- `realtime`: 表示名から離脱せずに送信ボタンを押すと送信されない（interaction clarity が課題あり）。押下時に成功文言が挿入され、ボタンが 25px 動く。完了文の色と文言サイズが Constraints から外れる（consistency が課題あり）。修正の確認が入力中に返る利点は、取りこぼしで打ち消される。
- `hybrid`: 修正の直後に送信ボタンを押すと送信されない（interaction clarity が課題あり）。押下時に文言と要約が消え、ボタンが 134px 動く。4 variant で移動量が最も大きい。離脱時の再検証はスクリーンリーダーに伝わらない（accessibility が許容）。良い点として、完了文へのフォーカス移動、`autoComplete`、検証規則の統一を残す。

## Learnings

UI/UX の知見は次のとおり。

- 離脱で文言や要約の高さを変えると、押下時の再描画で送信ボタンのクリックが外れる。検証タイミングは、表示の高さの変化と合わせて設計する。anti-pattern の候補である。
- 送信時のエラー要約は、描画後のフォーカス移動と項目へのリンクで、キーボードと支援技術に結果を確実に伝える。Pattern の候補である。
- 対処法を含む文言は、一読で次の行動が分かる。事実だけの文言は推測に頼る。
- 成功時にフォームを差し替えると、フォーカスが body に落ちる。完了文へフォーカスを移すと防げる。

Experiment の進め方の知見は次のとおり。

- 実装の細部（空白の扱い、文字数の数え方、`autoComplete`、送信ボタンの色）が、variant の軸以外の差として判定に混じった。Brief の共通仕様はより細かく固定する。
- 保留に判定の条件を書くと、担当者が実操作で確認して判定できた。実際のマウスイベントでの確認は、コードから読んだ推測を検証できる。
- 再レビューで evaluation.md を読むと、観点の独立性が崩れる。再レビューの入力は評価軸と重みの表に絞る。
- preview の撮影とクリックの検証のスクリプトは、リポジトリに置いていない。再現性のため、置き場を別途検討する。

## Related patterns / assets

なし
