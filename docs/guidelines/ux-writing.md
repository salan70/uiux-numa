---
title: UX ライティング
summary: 画面上の文言を短く具体的にし、利用者が迷わず次の行動へ進めるようにする。
status: draft
axes:
  - writing clarity
  - feedback quality
  - consistency
created: 2026-09-20
updated: 2026-09-20
---

## 目的

操作の対象、結果、状態を利用者の言葉で伝える。
文言で迷わせず、最短で目的を達成できるようにする。

## 適用範囲

画面上のボタン、ラベル、エラー文、説明文、通知に適用する。
リポジトリ内の設計文書は concise-writing が正本であり対象外とする。

## 規則

### ボタンのラベルは押した後に起きる行動で書く

意図と根拠: 利用者はボタンを押した結果を予測して操作する。
押した後に何が起きるかを、対象を含む動詞句で書く。

- 良い例:「変更を保存」「アカウントを作成」
- 悪い例:「はい」「OK」「決定」
- 例外: 検索アイコン単体など、慣習が確立した単一目的のボタン。
- 実験: [form-inline-validation](../../experiments/form-inline-validation/README.md)
- 出典: [WCAG 2.2 達成基準 2.4.6（AA）](https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html)

### 前後の送りボタンは送り先を名前で示す

意図と根拠: 方向だけのボタンでは、押した先に何が来るか分からない。
送り先の名前を添えることで、目的の対象へ迷わず進める。

- 良い例:「前の配色: 墨」「次の配色: 柚子」
- 悪い例:「前へ」「次へ」
- 例外: ページネーションの番号や、前後の対象が自明な単一画面。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)

### エラー文には起きたことと直し方を両方書く

意図と根拠: 事実だけでは直し方が分からず、直し方だけでは原因が読めない。
起きたことと直し方の両方を揃えて、入力を完了できるようにする。

- 良い例:「パスワードが短すぎます。8 文字以上の英数字を入力してください。」
- 悪い例:「入力が正しくありません。」
- 例外: ID とパスワードのどちらが誤りか伏せるべき認証失敗。
- 実験: [form-inline-validation](../../experiments/form-inline-validation/README.md)
- 出典: [WCAG 2.2 3.3.1 / 3.3.3 達成基準](https://www.w3.org/WAI/WCAG22/quickref/#error-identification)

### 入力の形式はプレースホルダーではなく例で示す

意図と根拠: プレースホルダーは入力開始とともに消えてしまい参照できない。
ラベルの補助文として具体的な入力例を常時表示する。

- 良い例: ラベルの下に「例: `user@example.com`」を常時表示する。
- 悪い例: 入力枠内のプレースホルダーだけに「`user@example.com`」と置く。
- 例外: 日付選択など、入力部品そのものが形式を制限する場合。
- 出典: [WCAG 2.2 3.3.2 達成基準](https://www.w3.org/WAI/WCAG22/quickref/#labels-or-instructions)

### 同じものは画面内で同じ語で呼ぶ

意図と根拠: 同じ対象に複数の呼称を使うと、別の機能や状態だと誤解される。
用語を 1 つに決め、画面全体で統一する。

- 良い例: ナビゲーションと設定の双方で「配色」「テーマ」と呼ぶ。
- 悪い例: ある場所では「配色」、別の場所では「カラーパレット」と呼ぶ。
- 例外: 外部サービス名や固有名詞をそのまま引用する場合。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [Nielsen Norman Group 10 ヒューリスティクス](https://www.nngroup.com/articles/ten-usability-heuristics/)

### システムの用語ではなく利用者の語で書く

意図と根拠: 内部実装や技術用語は、利用者のメンタルモデルと一致しない。
利用者が日常で使う語彙に合わせて操作の目的を伝える。

- 良い例:「テーマ」
- 悪い例:「appearance モード」「color-scheme 属性」
- 例外: 開発者向けのコンソールログやデバッグ表示。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [Nielsen Norman Group 10 ヒューリスティクス](https://www.nngroup.com/articles/ten-usability-heuristics/)

### 画面を見れば分かる操作説明を書かない

意図と根拠: 押せる形状やホバーで反応する部品に長い説明を添えると雑音になる。
説明文で埋めず、部品の造形で操作性を伝える。

- 良い例: コピーボタンのアイコンとホバー効果だけで押せることを示す。
- 悪い例:「帯をクリックするとカラーコードがコピーされます」と文を置く。
- 例外: 特殊なジェスチャーなど、初見で推測できない操作。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [Nielsen Norman Group 10 ヒューリスティクス](https://www.nngroup.com/articles/ten-usability-heuristics/)

### 値を並べるときは項目名を添える

意図と根拠: 数値や記号だけを並べると、どの値が何を指すか推測を強いる。
項目名を添えることで、一目で値の意味を読み取れるようにする。

- 良い例:「サイズ: 1.5rem / 太さ: 700 / 行送り: 1.3」
- 悪い例:「1.5rem 700 1.3」
- 例外:「2026.09.20」のように形式から自明な日付や時刻。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)

### 見本の文面は断片ではなく文にする

意図と根拠: 単語や字形の断片では、実際の組版における行間や行長を判断できない。
その役割で実際に使われる自然な文を見本に置く。

- 良い例: その役割の用途に合わせた 1 つの完結した文を置く。
- 悪い例:「あ Aa Ａ 日本語 UI」や「更新日 2026.09.20」のような断片。
- 例外: 役割を持たない素のフォントサイズやウェイトの比較標本。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)

### 並列する項目の語尾と型を揃える

意図と根拠: リスト内の語尾が動詞、名詞、体言止めで揺れると読みにくい。
文法的な型を揃えることで、並列関係が瞬時に伝わる。

- 良い例: 全項目を動詞の基本形「〜する」で揃える。
- 悪い例:「〜の確認」「設定します」「削除すること」と語尾が混在する。
- 例外: 定型フォーマットや引用を含むリスト。

### 言い切れない不確実な事実を断定しない

意図と根拠: 非同期処理や外部要因に左右される結果を断定すると不信を生む。
状態の確からしさに応じた誠実な表現を使う。

- 良い例:「通常数分で完了します」「処理を受け付けました」
- 悪い例:「即座に反映されます」
- 例外: ローカルで完全に完結し、遅延のない処理。

## 確認項目

- [ ] ボタンのラベルは押した後に起きる行動の動詞になっているか。
- [ ] エラー文に原因と具体的な修正方法の両方が書かれているか。
- [ ] 同じ機能や状態に複数の異なる呼称を使っていないか。
- [ ] 入力形式のヒントはプレースホルダーではなく常時表示されているか。
- [ ] 並列する箇条書きの語尾や文法型が統一されているか。

## 出典

- [Nielsen Norman Group: 10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/): システムと実世界の調和（2）、一貫性と標準（4）、美的で最小限の設計（8）
- [WCAG 2.2: 達成基準 2.4.6 / 3.3.1 / 3.3.2 / 3.3.3](https://www.w3.org/WAI/WCAG22/quickref/#input-assistance): 見出し及びラベル、エラーの特定、ラベル又は説明、エラー修正の提案

## 判断

- 判断者: 未定
- 判断日: 未定
- 理由: draft のため未定
