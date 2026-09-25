---
title: UX Writing
summary: 部品と状態の文言を、利用者が次の行動を迷わず取れる形に揃える。
status: adopted
created: 2026-09-20
updated: 2026-09-25
---

## 目的

ボタン、ラベル、補助文、エラー、状態の文言で、利用者が次の行動を迷わず取れるようにする。
漢字とかなの開きや英数字の空白などの表記は [Japanese Notation](japanese-notation.md) が扱う。
設計文書の文体は concise-writing が扱う。

## コア

### 次の行動が読める

押した後に起きること、直すためにすべきことを文言そのものが示す。
短さより、次の行動が読めることを優先する。

### 利用者の語と文脈で書く

画面が既に示している対象は、文言の中で繰り返さない。
語の正確さより、読み手に届く語を優先する。

### 責めず、煽らず、断定しない

主語は利用者ではなく入力内容や処理に置き、確かめた範囲と文言の強さを合わせる。
謝罪と重い丁寧語は、利用者に損失があるときだけ使う。

### 要点ごとに短く区切る

1 文は 50 字以内で要点を 1 つにする。

### 面ごとに型を 1 つに決める

同じ対象は同じ語で呼び、同じ面に並ぶ文言は同じ語形と文末に揃える。

## Tips

### ボタンは押した後の行動、リンクは行き先の名前で書く

意図と根拠: 対象は画面が示していれば省き、長さは 2〜8 字を既定にする。字数に合わせるために結果を予測する決め手の語は削らない。

- 適用: foundation
- コア: 次の行動が読める
- コア: 利用者の語と文脈で書く
- 良い例:「保存」「詳細」、対象を補う「変更を保存」、送り先を示す「次の配色: 柚子」
- 悪い例:「はい」「OK」「こちらをクリック」「この内容で変更を保存して次へ進む」
- 例外: 検索や閉じるのように慣習が確立したアイコンボタンは見えるラベルを省ける。一覧で同じ「詳細」が並ぶときは、名前で対象を識別できるようにする。
- 実験: [ボタンのラベルは文脈で分かる対象を省く ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-21-button-label-omits-object.md)
- 出典: [Apple Human Interface Guidelines: Writing](https://developer.apple.com/design/human-interface-guidelines/writing)

### ボタンとラベルは語幹か終止形、文は敬体で書く

意図と根拠: ボタンはサ変動詞なら語幹、それ以外は終止形、ラベルは名詞、状態と補助文とエラーは敬体で終える。

- 適用: foundation
- コア: 面ごとに型を 1 つに決める
- 良い例: ボタン「保存」「削除」「続ける」、ラベル「メールアドレス」、文「保存しました。」
- 悪い例: ボタン「保存する」「削除します」、押せないボタンを「利用できません」に差し替える。
- 例外: 固有名詞やサービス名をそのまま引くラベル。
- 実験: [Button の見本](../../experiments/button/shared/Showcase.tsx)
- 出典: [SmartHR Design System: その他の UI テキスト](https://smarthr.design/products/contents/ui-text/app-writing/)

### 入力エラーは項目名で始め、満たすべき条件を肯定形で書く

意図と根拠: 保存や通信の失敗のように利用者が直せない誤りは、この型ではなく状態の文言で書く。

- 適用: foundation
- コア: 次の行動が読める
- コア: 責めず、煽らず、断定しない
- 良い例:「パスワードは英字と数字を含めてください。」「メールアドレスを入力してください。」
- 悪い例:「パスワードに英字と数字が含まれていません。」「無効な入力です。」
- 例外: 認証の失敗。ID とパスワードのどちらが誤りかは伏せる。
- 実験: [form-inline-validation の UX writing レビュー](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/form-inline-validation/evaluation/ux-writing.md)
- 出典: [GOV.UK Design System: Error message](https://design-system.service.gov.uk/components/error-message/)

### 進行、完了、失敗は同じ動詞で型を揃える

意図と根拠: 失敗は確かめられた状況と次の行動を書き、保存されたか分からないときは分からないと書く。

- 適用: foundation
- コア: 面ごとに型を 1 つに決める
- コア: 責めず、煽らず、断定しない
- 良い例:「保存しています」「保存しました」「保存できませんでした」
- 悪い例:「処理中…」「成功しました!」「エラーが発生しました」
- 例外: 操作に結び付かない初回の読み込み。動詞を「読み込む」にして同じ型で書く。
- 出典: [Windows Admin Center: UI text guide](https://learn.microsoft.com/en-us/windows-server/manage/windows-admin-center/extend/guides/ui-text-style-guide)

### 状態の文言は 2 文以内で、起きたことを先、次の行動を後に書く

意図と根拠: 2 文は本リポジトリの既定値であり、Atlassian Design System の 1〜2 文に合わせた。

- 適用: foundation
- コア: 次の行動が読める
- コア: 要点ごとに短く区切る
- 良い例:「まだ記録がありません。右上の追加から作れます。」
- 悪い例: 理由も行動も無い「データがありません」、経緯を 3 文以上で説明する空状態。
- 例外: 原文を変えられない規約や法令の引用。複数の誤りや一部だけの完了は、2 文で要点を伝え、詳細への導線を足す。
- 実験: [UX Writing 組み直し ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-22-ux-writing-redesign.md)
