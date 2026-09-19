# interaction / motion レビュー: 登録完了の遷移とフィードバック

- 観点: interaction / motion
- 対象: no-skill-replace、no-skill-confirm、no-skill-next、with-skill-replace、with-skill-confirm、with-skill-next
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: interaction clarity、feedback quality、motion appropriateness、perceived performance

## 判定

| 軸                     | no-skill-replace | no-skill-confirm | no-skill-next | with-skill-replace | with-skill-confirm | with-skill-next |
| ---------------------- | ---------------- | ---------------- | ------------- | ------------------ | ------------------ | --------------- |
| interaction clarity    | 良い             | 許容             | 良い          | 良い               | 課題あり           | 許容            |
| feedback quality       | 良い             | 良い             | 良い          | 良い               | 許容               | 良い            |
| motion appropriateness | 許容             | 許容             | 許容          | 許容               | 許容               | 許容            |
| perceived performance  | 保留             | 保留             | 保留          | 保留               | 保留               | 保留            |

## 観察

### no-skill-replace / with-skill-replace

- 成功後はフォームが消え、完了見出しと「ログインへ進む」だけになる（`*-replace-success.png`）。
- 次の操作は 1 つで予測しやすい。
- with-skill はチェックが左寄せである。因果は伝わるが、視線の中心は見出し側である。

### no-skill-confirm / with-skill-confirm

- 両方とも入力内容が残る。
- no-skill は確認を上に置き、「登録済み」で再送信できないことを示す。
- with-skill は「登録しました」ボタンと「登録が完了しました」と「ログインへ進む」が並ぶ。何が主操作かが一瞬で割れない。
- with-skill は成功後フォーカスが body に落ち、キーボードの次操作がページ先頭からになる。

### no-skill-next / with-skill-next

- 段階表示で「次はログイン」が伝わる。
- with-skill はステップ 2 のラベルが「ログイン」なのに、見出しはまだ「登録が完了しました」である。空間関係は前進だが、現在地のラベルと見出しがずれる。

### 動き

- 6 案とも `prefers-reduced-motion` の CSS がある。
- reduced 成功画面でも完了文は残った。
- 継続時間や GPU の主張は計測していない。判定は許容または保留にする。

## 論点

- confirm 方向で、ボタンを成功状態に変える設計がフォーカス喪失を招くか。
- next 方向のステップラベルと完了見出しのずれを、空間の連続の代償として許すか。
