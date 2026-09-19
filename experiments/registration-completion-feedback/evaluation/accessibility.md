# accessibility レビュー: 登録完了の遷移とフィードバック

- 観点: accessibility
- 対象: no-skill-replace、no-skill-confirm、no-skill-next、with-skill-replace、with-skill-confirm、with-skill-next
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: accessibility

## 判定

| 軸            | no-skill-replace | no-skill-confirm | no-skill-next | with-skill-replace | with-skill-confirm | with-skill-next |
| ------------- | ---------------- | ---------------- | ------------- | ------------------ | ------------------ | --------------- |
| accessibility | 良い             | 良い             | 良い          | 良い               | 課題あり           | 良い            |

## 観察

### 共通

- 初期のタブ順は email、password、displayName、登録するである（CDP `tabOrder`）。
- 空送信後は 3 項目が `aria-invalid="true"` になり、フォーカスは要約の `section` へ移る。
- reduced motion でも完了文言は残る（`previews/*-success-reduced.png`）。

### no-skill-replace

- 成功後のフォーカスは `H1.rcf-replace-title` である。
- preview `no-skill-replace-success.png` に見出しのフォーカスリングがある。

### no-skill-confirm

- 成功後のフォーカスは `SECTION.rcf-confirm-banner` である。
- 入力欄は読み取り専用で残る。

### no-skill-next

- 成功後のフォーカスは `H1.rcf-next-title` である。
- preview に見出しのリングがある。

### with-skill-replace

- 成功後のフォーカスは `rcf-replace-done-heading` である。
- preview `with-skill-replace-success.png` にリングがある。

### with-skill-confirm

- 成功後のフォーカスは `BODY.` である（CDP `afterSuccess.focus`）。
- コードは完了時に確認面へフォーカスしていない（`variants/with-skill-confirm/index.tsx` の effect は login と要約だけ）。
- 送信ボタンは「登録しました」に変わり、フォーカスの置き場が消える。

### with-skill-next

- 成功後のフォーカスは `rcf-next-view-heading` である。
- preview にリングがある。

## 論点

- `with-skill-confirm` のフォーカス落ちを、Skill の指示（フォーカスを動かさない）の副作用と見るか、実装漏れと見るか。
