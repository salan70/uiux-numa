---
title: Accessibility
summary: キーボード操作、視覚多様性、支援技術に対応し、誰でも等しく利用できる品質を担保する。
status: draft
axes:
  - accessibility
  - interaction clarity
  - platform fit
created: 2026-09-20
updated: 2026-09-21
---

## 目的

多様な身体条件、環境、入力手段において等しく利用できるようにする。
支援技術やキーボード操作を前提とした設計を標準とする。
Web を前提に書く。他の platform では同等の達成基準へ読み替える。

## コア

### 情報は 2 つ以上の手がかりで伝える

色、形、位置、文字のうち 2 つ以上を重ねて同じ情報を伝える。
表現の簡潔さより、1 つの手がかりを受け取れない利用者にも届くことを優先する。

### 達成基準を最低線として先に決める

どこまでやるかを画面ごとに決めず、満たす水準を着手前に決めておく。
個別の判断より、実装前に判断が終わっていることを優先する。

### 入力手段を 1 つに限定しない

すべての操作を、ポインタとキーボードの双方で完結できるようにする。
操作の快適さより、手段を選ばず完結できることを優先する。

### 見た目ではなく構造で意味を持たせる

見出し、一覧、ボタン、ランドマークは、それぞれの意味を持つ要素で組む。
見た目の自由より、構造と意味が一致することを優先する。

### 利用者の設定を上書きしない

文字サイズ、動きの抑制、配色の設定は、端末とブラウザの設定を検出して従う。
表示の意図より、利用者が選んだ設定が生きることを優先する。

## Tips

### WCAG 2.2 のレベル A と AA を確認項目に落として照合する

意図と根拠: 水準を数値で決めておかないと、画面ごとに達成の判断が揺れる。
AAA は個別に選ぶが、動きの抑制のように本リポジトリが必須にするものもある。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- 良い例: レベル AA の達成基準を確認項目に落とし、実装前に照合する。
- 悪い例:「できる範囲で対応する」とだけ決めて着手する。
- 出典: [WCAG 2.2 ガイドライン](https://www.w3.org/WAI/WCAG22/quickref/)

### 外部ライブラリは採用時に達成基準で選ぶ

意図と根拠: 採用した時点で、その部品のアクセシビリティも自分の責任範囲に入る。
内部の実装を直せない場合も、選定時に確かめ、満たさないものは採用しない。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- 良い例: 候補のライブラリをキーボード操作と読み上げで試し、達成基準で落とす。
- 悪い例: 見た目と API だけで選び、後からフォーカスの閉じ込めが無いと気づく。
- 例外: 画面に出ない計算や整形だけを担うライブラリ。

### 本文テキストのコントラスト比は 4.5:1 以上を確保する

意図と根拠: 背景と文字の明度差が足りないと、弱視や屋外の環境で読めなくなる。
四捨五入せずに 4.5:1 を上回る色を選択する。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- 良い例: 背景に対して 4.5:1 を超える文字色をコントラスト計算して設定する。
- 悪い例: コントラスト比が 3.8:1 の淡いグレー文字を本文に使う。
- 例外: 24px 以上、または 19px 以上の太字は 3:1 でよい。操作不能な無効化テキストと純粋な装飾も対象外。
- 実験: [catalog-editorial/shared/contrast.ts](../../experiments/catalog-editorial/shared/contrast.ts)
- 出典: [WCAG 2.2 達成基準 1.4.3](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)

### UI 部品と意味を持つ図形は 3:1 以上のコントラストを確保する

意図と根拠: アイコンや境界線が見分けられないと、操作対象や状態を認識できない。

- 適用: foundation
- コア: 達成基準を最低線として先に決める
- 良い例: チェックマークや入力枠の輪郭を背景に対して 3:1 以上にする。
- 悪い例: 背景との比が 2:1 に満たないヘアラインだけで入力枠を示す。
- 例外: デザインの統一感を保つための純粋な装飾罫線。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 1.4.11](https://www.w3.org/WAI/WCAG22/quickref/#non-text-contrast)

### 情報や状態を色だけで伝えない

意図と根拠: 色覚の多様性やモノクロ表示では、色だけの差異を判別できない。

- 適用: foundation
- コア: 情報は 2 つ以上の手がかりで伝える
- 良い例: 良い例と悪い例を、`good` / `bad` の語と、成功色・エラー色の両方で分ける。
- 悪い例: 成功とエラーを緑と赤の円だけで示し、文字や形を変えない。
- 例外: 配色見本帳など、色そのものを鑑賞・選択する目的の領域。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 1.4.1](https://www.w3.org/WAI/WCAG22/quickref/#use-of-color)

### 意味を持つ画像に代替テキストを付け、装飾は読み上げから外す

意図と根拠: 画像が読めない利用者には、画像が担う情報が文字で届く必要がある。

- 適用: foundation
- コア: 情報は 2 つ以上の手がかりで伝える
- 良い例: 図版に内容を説明する代替テキストを付け、飾り罫は `aria-hidden` にする。
- 悪い例: すべての画像に `alt=""` を付ける、または `alt` 属性自体を省く。
- 例外: 隣接するテキストが同じ内容を完全に説明している画像。
- 出典: [WCAG 2.2 達成基準 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)

### hover だけでしか読めない情報を置かない

意図と根拠: タッチ端末には hover がなく、キーボード利用者も情報を取りこぼす。

- 適用: foundation
- コア: 入力手段を 1 つに限定しない
- 良い例: ホバーとフォーカスの両方で表示し、タッチ環境では常時展開する。
- 悪い例: マウスホバー時のみツールチップで必須の注記を出す。
- 例外: ホバーによって得られる純粋な視覚的装飾や演出効果。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 1.4.13](https://www.w3.org/WAI/WCAG22/quickref/#content-on-hover-or-focus)

### すべての操作をキーボードだけで完結させる

意図と根拠: マウスやタッチ操作が困難な利用者はキーボードのみで操作する。
すべての対話要素にフォーカスが当たり、Enter や Space で実行できるようにする。

- 適用: foundation
- コア: 入力手段を 1 つに限定しない
- 良い例: タブやボタンをネイティブ要素で組み、キーボードで操作可能にする。
- 悪い例: `div` や `span` に `onClick` だけを付け、キーボードで押せないようにする。
- 例外: 自由描画キャンバスなど、ポインタの連続軌跡が必須の操作。
- 実験: [catalog-editorial/README.md](../../experiments/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.1.1](https://www.w3.org/WAI/WCAG22/quickref/#keyboard)

### フォーカスを可視化し sticky な帯で隠さない

意図と根拠: 現在地が見えないと、キーボード操作で次に何が起きるか読めない。

- 適用: foundation
- コア: 入力手段を 1 つに限定しない
- 良い例: 2px の鮮明な輪郭線を出し、`scroll-margin` で固定帯との重なりを防ぐ。
- 悪い例: `outline: none` で枠を消し、固定ヘッダーの背後に要素が潜り込む。
- 例外: ポインタで押した直後。`:focus-visible` を使い、キーボード操作のときだけ枠を出す。
- 実験: [catalog-editorial/README.md](../../experiments/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.4.7 / 2.4.11](https://www.w3.org/WAI/WCAG22/quickref/#focus-visible)

### ポインタのターゲット領域は 24px 以上にする

意図と根拠: 小さすぎる操作対象は、タッチ操作や震えのある手で誤操作を起こす。

- 適用: foundation
- コア: 入力手段を 1 つに限定しない
- 良い例: 余白を設けて 24px 以上のボタン領域を確保する。
- 悪い例: 16px の SVG のみを直接のクリック対象にして配置する。
- 例外: インラインテキスト中に配置された文脈上のリンク。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 2.5.8](https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum)

### 見出しとランドマークで画面の構造を示す

意図と根拠: 支援技術の利用者は、見出しとランドマークを飛ばし読みの目印に使う。
見た目の大きさではなく文書構造で見出しの階層を決める。

- 適用: foundation
- コア: 見た目ではなく構造で意味を持たせる
- 良い例: `header`、`nav`、`main` で領域を分け、見出しを h1 から順に置く。
- 悪い例: 文字を大きくした `div` を見出しの代わりに使い、階層を飛ばす。
- 例外: 視覚的に見出しを出さない領域。`aria-label` でランドマークに名前を付ける。
- 実験: [catalog-editorial/variants/topic-first/index.tsx](../../experiments/catalog-editorial/variants/topic-first/index.tsx)
- 出典: [WCAG 2.2 達成基準 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

### ラベル、エラー文、補足を入力欄と結び付ける

意図と根拠: 見た目が近いだけでは、支援技術はどの文言がどの入力欄のものか判別できない。

- 適用: foundation
- コア: 見た目ではなく構造で意味を持たせる
- 良い例: `label` の `for` と `aria-describedby` で、名前と説明を入力欄に結ぶ。
- 悪い例: 入力欄の上に文字を置くだけで、要素として関連付けない。
- 例外: 入力欄自身の `aria-label` で名前が完結する検索窓など。
- 実験: [form-inline-validation](../../experiments/form-inline-validation/README.md)
- 出典: [WCAG 2.2 達成基準 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

### 操作の名前は「何が起きるか」で付ける

意図と根拠: アイコンの外見を名前で伝えても、利用者は何の機能か理解できない。

- 適用: foundation
- コア: 見た目ではなく構造で意味を持たせる
- 良い例: 虫眼鏡アイコンのボタンに「検索」という名前を付ける。
- 悪い例: ボタンに「虫眼鏡」と名前を付ける、または名前を付けない。
- 例外: ブランドロゴそのものの表示。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 4.1.2](https://www.w3.org/WAI/WCAG22/quickref/#name-role-value)

### 文字の拡大と狭い幅で内容を失わせない

意図と根拠: 文字サイズを 200% にしても内容が欠けず、320px 相当の幅で 2 方向のスクロールを起こさない。

- 適用: foundation
- コア: 利用者の設定を上書きしない
- 良い例: 相対単位で寸法を組み、折り返しと縦 1 方向のスクロールで収める。
- 悪い例: 高さを px で固定し、拡大した文字を枠の外で切り落とす。
- 例外: 表、地図、図版など、2 次元の配置が内容の本質である要素。
- 出典: [WCAG 2.2 達成基準 1.4.4 / 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

### 動きを減らす端末設定に従う

意図と根拠: 前庭感覚の障害を持つ利用者は、大きな画面の動きで吐き気や目眩を起こす。

- 適用: foundation
- コア: 利用者の設定を上書きしない
- 良い例: `prefers-reduced-motion` 時に遷移時間や移動距離を 0 に近づける。
- 悪い例: 端末設定を無視して常に画面全体がスライドや拡大縮小する。
- 例外: 動画再生など、動きそのものがコンテンツの本質である場合。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 2.3.3（AAA）](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

### 画面遷移後は見出しにフォーカスを移し skip link を置く

意図と根拠: SPA の画面切替後にフォーカスが残ると、次の操作位置を見失う。

- 適用: module
- コア: 入力手段を 1 つに限定しない
- 良い例: 画面遷移後に h1 要素へフォーカスを移し、最上部に skip link を置く。
- 悪い例: 画面が切り替わっても直前のボタンにフォーカスが残留する。
- 例外: 遷移を伴わない同一画面内の小さな開閉操作。
- 実験: [catalog-editorial/shared/useScreen.ts](../../experiments/catalog-editorial/shared/useScreen.ts)
- 出典: [WCAG 2.2 達成基準 2.4.1](https://www.w3.org/WAI/WCAG22/quickref/#bypass-blocks)

### モーダル表示にはネイティブの dialog 要素を使う

意図と根拠: 自前のモーダル実装は、フォーカスの閉じ込めや Esc キー対応が抜けやすい。

- 適用: module
- コア: 見た目ではなく構造で意味を持たせる
- 良い例: ネイティブの `dialog` 要素を使い、Esc での終了と背景不活性化を得る。
- 悪い例: `div` 要素でモーダルを自作し、背後の要素にフォーカスが漏れる。
- 例外: 簡易なポップオーバーなど、非モーダルな浮動表示。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [MDN dialog 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/dialog)
