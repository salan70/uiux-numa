---
title: 登録完了の遷移とフィードバック
status: evaluating
created: 2026-09-20
updated: 2026-09-20
platforms:
  - web
domains:
  - interaction-design
  - animation-motion
  - states-design
  - forms-input-ux
  - ux-writing
  - accessibility
adopted: []
---

## Problem

アカウント登録では、送信後に完了したことと次の操作が伝わらないと、利用者は再送信や離脱を疑う。
既存の `form-inline-validation` は検証タイミングを比較し、成功時はフォームを完了文へ差し替える。
完了への遷移、動き、interrupt、reduced motion は比較していない。

Issue #9 の派生 Skill が、同じ Brief で案の分岐、動きの根拠、レビューの質を変えるかを同条件で確かめる。
Catalog の再設計はこの Experiment の課題にしない。

## Target

Web のアカウント登録を初めて使う利用者。
キーボードだけの操作とスクリーンリーダーでの利用も含める。
動きを減らす設定の利用者も含める。

## Scope / Domains

対象領域は interaction design、animation / motion、states design、forms / input UX、UX writing、accessibility。
variant で変える軸は次の 2 つ。

- 制作手法: 派生 Skill なしと、派生 3 Skill あり
- 完了の表現: 画面内の差し替え、別面への遷移、控えめな確認、動きの量

入力中の検証タイミングは比較対象にしない。
送信時検証と対処法つき文言は `form-inline-validation` の `on-submit` を共通前提にする。
配色と Typography も共通にする。

## Constraints

- React + TypeScript で実装し、追加の npm 依存を入れない。
- 項目は email、password、表示名の 3 つ。送信はサーバーなしで疑似的に成功させる。
- 検証規則は全 variant で同じにする。email は必須で `@` を含む。password は必須で 8 文字以上、英字と数字を含む。表示名は必須で 1〜20 文字。
- 送信ボタンは「登録する」。UI 文言は日本語にする。
- 配色は `experiments/color-schemes/variants/wasabi/` のライトの役割を写す。役割名は同じにする。
- 文字は `tokens/typography/` の 6 role を使う。
- キーボードだけで完了でき、エラーと成功は支援技術に伝わる。
- `prefers-reduced-motion` を扱う。動きを理解の補助に使う場合は、減らしても意味が残るようにする。
- 各 variant は `variants/<id>/` 内で完結させる。`index.tsx` は props なしで default export する。
- 比較画面は `platforms/web` で実サイズ描画する。専用 picker は作らない。URL は `http://localhost:5183/#registration-completion-feedback/<id>` とする。
- 性能は未計測なら断定しない。

### 同条件比較

比較条件は「現行構成」と「現行構成＋派生 Skill」とする。
開始コード、モデル、要求文、反復上限、終了条件は揃える。
各条件は独立した新規セッションで実行する。
基準側へ派生 Skill や他条件の生成結果を渡さない。

固定する実行条件は次のとおり。

- モデル: `claude-fable-5-1`（取得できない場合は実際に使ったモデルを記録する）
- 権限: `--permission-mode acceptEdits`。Bash は `just`、ファイル操作、開発サーバー確認に必要なコマンドに限る
- 環境: リポジトリのルート。`CLAUDE.md` とこの README は読める
- 反復上限: 1 variant あたり観察と修正を 3 回まで
- ターン上限: 100。超えたら未完了を記録して止める
- 時間の目安: 20 分。超過したら未完了を記録して止める

終了条件は次のいずれかとする。

- 完了フローがキーボードで通り、reduced motion の扱いを記録した
- 反復上限、ターン上限、時間の目安のいずれかに達した
- 画像を読めないなど、確認手段が欠けた

要求文は次をそのまま渡す。
出力先の 1 行だけを variant ごとに置き換える。
Skill あり条件では、要求文の先頭に `/exploring-ui-variants` `/crafting-motion` `/reviewing-motion` を付ける。

```text
アカウント登録の完了直後の遷移とフィードバックを、platforms/web の named variant として実装してください。

- 前提: 登録フォームの送信は疑似的に成功します。項目は email、password、表示名です。検証規則は experiments/form-inline-validation の on-submit と同じです。送信ボタンは「登録する」です。UI 文言は日本語です。
- 対象: 送信から完了状態までの遷移、完了の伝え方、完了後に取れる次の操作です。入力中の検証タイミングは変えないでください。送信時にまとめて検証してください。
- 利用画面: 初めて使うアカウント登録です。実利用サイズで操作できること。キーボード、focus、prefers-reduced-motion、連続操作と中断を確認すること。
- 制約: React と TypeScript。追加の npm 依存を入れない。配色は color-schemes の wasabi ライトの役割を写す。文字は tokens/typography の 6 role。共有コードを作らず、variants/<出力先 id>/ で完結させる。index.tsx は props なしで default export する。
- 目指す印象: 完了したことと次の操作が一読で分かること。動きは状態変化と因果の理解に使う。性能は未計測なら断定しない。
- 出力: 編集結果を experiments/registration-completion-feedback/variants/<出力先 id>/ に置く。方向の根拠と、確認した操作を報告する。
```

Skill の有無以外の差（権限、読んだファイル、実際の読み込み）は README に記録する。

評価軸は実装前に次で固定する。判定は [docs/evaluation/axes.md](../../docs/evaluation/axes.md) に従う。

| 軸                     | 重み | 選定理由                                   | 担当する観点                     |
| ---------------------- | ---- | ------------------------------------------ | -------------------------------- |
| accessibility          | 必須 | キーボードと支援技術で完了できることが前提 | accessibility                    |
| interaction clarity    | 必須 | 完了と次操作の分かり方が課題の中心         | interaction / motion             |
| feedback quality       | 必須 | 成功の伝え方が課題の中心                   | interaction / motion、UX writing |
| motion appropriateness | 必須 | 動きの適否が派生 Skill の仮説              | interaction / motion             |
| writing clarity        | 重要 | 完了文と次操作の文言が理解を左右する       | UX writing                       |
| perceived performance  | 参考 | 未計測なら保留にする                       | interaction / motion             |
| implementation cost    | 参考 | Skill の有無による作業量の差               | implementation                   |

作者由来の Block / Approve だけで採否を決めない。
複数観点レビューは [docs/evaluation/review.md](../../docs/evaluation/review.md) に従う。

## Hypothesis

完了への遷移とフィードバックを意図して設計すると、完了の認知と次操作の予測が上がる。
派生 Skill を同じ Brief に足すと、方向の分岐と動きの根拠が残りやすい。
一方で、好みの数値やキーボード禁止を必須にすると、登録完了のような稀な操作でも動きが足りなくなる可能性がある。
1 件の比較結果を一般的な優位性として断定しない。

## Variants

| id                   | 仮説                                                                            | 変えた軸                                     | 実装                           |
| -------------------- | ------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------------ |
| `no-skill-replace`   | 基準: Skill なしでも、同じカード内の差し替えで完了は伝わる                      | 制作手法 = なし、完了の表現 = 差し替え       | `variants/no-skill-replace/`   |
| `no-skill-confirm`   | Skill なしでも、フォームを残した確認で入力内容と完了を同時に見せられる          | 制作手法 = なし、完了の表現 = 同面の確認     | `variants/no-skill-confirm/`   |
| `no-skill-next`      | Skill なしでも、段階表示で次操作（ログイン）へ誘導できる                        | 制作手法 = なし、完了の表現 = 次操作への遷移 | `variants/no-skill-next/`      |
| `with-skill-replace` | 派生 Skill があると、差し替えの動きに目的と例外理由が残る                       | 制作手法 = あり、完了の表現 = 差し替え       | `variants/with-skill-replace/` |
| `with-skill-confirm` | 派生 Skill があると、確認をボタン近傍のフィードバックとして設計する             | 制作手法 = あり、完了の表現 = 同面の確認     | `variants/with-skill-confirm/` |
| `with-skill-next`    | 派生 Skill があると、面の前進を空間の連続として扱い、動かさない開閉を分けられる | 制作手法 = あり、完了の表現 = 次操作への遷移 | `variants/with-skill-next/`    |

比較画面は `http://localhost:5183/#registration-completion-feedback/<id>` である。

### Skill なし実行の条件

`no-skill-*` は `--disable-slash-commands` 付きの新規 `claude -p` で作った。

- 実行日: 2026-09-20
- モデル: `claude-fable-5-1`
- 権限: `--permission-mode acceptEdits`。Bash は `just`、`ls`、`cat`、`mkdir`、`diff`
- 結果: 36 ターン、約 7 分、費用 4.31 USD
- session_id: `74937b68-7401-454f-89e4-c3e0b7519141`
- Skill の読み込み: なし（スラッシュコマンド無効。報告文に派生 Skill 名なし）

生成セッション内のブラウザ確認はできなかった。
既存の 5183 サーバーが新しい glob を持たず、別ポート起動が権限拒否されたためである。
担当者がサーバーを再起動し、headless Chrome の CDP でエラー、成功、reduced motion を操作した。

### Skill あり実行の条件

`with-skill-*` は同じ要求文の先頭に `/exploring-ui-variants` `/crafting-motion` `/reviewing-motion` を付けた新規 `claude -p` で作った。

- 実行日: 2026-09-20
- モデル: `claude-fable-5-1`
- 権限: `no-skill` と同じ
- 結果: 66 ターン、約 11 分、費用 6.01 USD
- session_id: `28c64f74-5fc0-4ac2-9225-1f1db0cd74cb`
- Skill の読み込み: 3 本の SKILL.md と `recipes.md`、`standards.md` を読んだと報告した

生成セッション内の実操作は未完了である。
撮影用に 5199 を使ったが、完了面の操作確認は担当者の CDP 実行で補った。

Skill の有無以外の差は次である。

- なし条件だけ `--disable-slash-commands` を付けた
- 疑似送信の待ちはなし 800ms、あり 900ms
- あり条件は 300ms 超（350ms）と `stroke-dashoffset` を例外として記録した

### 反復の記録

生成セッションは、実操作が欠けたため観察と修正を 3 回まで使いきっていない。

| variant              | round | 観察                                                        | 変更                                         | 参照                    | 終了理由         |
| -------------------- | ----- | ----------------------------------------------------------- | -------------------------------------------- | ----------------------- | ---------------- |
| `no-skill-*`         | 1     | 成功後もパスワードが state に残る                           | replace と next で成功後にパスワードを消した | on-submit の検証規則    | 確認手段が欠けた |
| `with-skill-next`    | 1     | StrictMode で初期表示から見出しにフォーカスが入る           | 面の変化を比較してフォーカスする             | exploring-ui-variants   | 指摘あり         |
| `with-skill-replace` | 1     | 送信ボタンだけ全幅。reduced motion で退場と入場が重なりうる | 左寄せ。遅延 120ms                           | crafting-motion recipes | 確認手段が欠けた |

## Evaluation

評価軸、重み、比較表は [evaluation.md](evaluation.md) に記録する。
観点は accessibility、interaction / motion、UX writing、implementation の 4 つ。
必須の軸で課題ありがある variant は `with-skill-confirm`（accessibility、interaction clarity）である。

担当者の操作記録は `/tmp/rcf-drive-notes.json` の内容を evaluation へ写した。
Cursor の browser MCP はタブ生成後に view を見失ったため、Chrome CDP で代替した。

## Decision

未定

人間の採用判断の前に `decided` へ進めない。
Skill ごとの継続、修正後再評価、見送りは Issue #9 の「判断待ち」に置く。

## Rejected reasons

未定

## Learnings

この 1 比較から一般化しない。
観察できた範囲は次である。

- 3 方向（差し替え、同面確認、次操作）は Skill なしでも出た。Skill ありは軸と目的の表を報告に残した。
- 費用は Skill ありが約 40% 多い。ターン数も 36 から 66 へ増えた。
- `reviewing-motion` は生成側が点検表を出さなかった。評価形式への接続は自動では起きなかった。
- `with-skill-confirm` は完了後のフォーカスが `body` に落ちた。作者の「ボタンから動かさない」が、ボタン差し替えと衝突した。
- reduced motion でも 6 案とも完了文言は残った。性能は未計測である。

## Related patterns / assets

なし
