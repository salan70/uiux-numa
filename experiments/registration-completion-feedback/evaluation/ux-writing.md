# UX writing レビュー: 登録完了の遷移とフィードバック

- 観点: UX writing
- 対象: no-skill-replace、no-skill-confirm、no-skill-next、with-skill-replace、with-skill-confirm、with-skill-next
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: writing clarity、feedback quality

## 判定

| 軸               | no-skill-replace | no-skill-confirm | no-skill-next | with-skill-replace | with-skill-confirm | with-skill-next |
| ---------------- | ---------------- | ---------------- | ------------- | ------------------ | ------------------ | --------------- |
| writing clarity  | 良い             | 許容             | 良い          | 良い               | 許容               | 良い            |
| feedback quality | 良い             | 良い             | 良い          | 良い               | 許容               | 良い            |

## 観察

### no-skill-replace

- 「登録が完了しました」「ようこそ」は次の行動（ログインへ進む）とつながる（`no-skill-replace-success.png`）。

### no-skill-confirm

- 「下の内容で登録しました。続けてログインできます。」は意味が通る。
- 確認面が狭く、preview では 1 文が折り返す。読みにくさはあるが意味は残る。

### no-skill-next

- 「次にできること」が見出しになり、主操作と副操作が分かれる。

### with-skill-replace

- 「アカウントを作成しました」「ログインできます」は完了と次操作を分けている。

### with-skill-confirm

- 「登録しました」と「登録が完了しました」が重複する（`with-skill-confirm-success.png`）。
- live region の文は作成とログイン案内を 1 塊にしている。

### with-skill-next

- 「次はログインです」は一読で次の行動が分かる。
- 「登録内容を確認する」は副操作として短い。

## 論点

- 成功をボタンラベルと見出しの両方で言う設計を、強調と見るか冗長と見るか。
