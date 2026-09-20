---
title: Accessibility
summary: キーボード操作、視覚多様性、支援技術に対応し、誰でも等しく利用できる品質を担保する。
status: draft
axes:
  - accessibility
  - interaction clarity
  - platform fit
created: 2026-09-20
updated: 2026-09-20
---

## 目的

多様な身体条件、環境、入力手段において等しく利用できるようにする。
支援技術やキーボード操作を前提とした設計を標準とする。

## 適用範囲

Web の画面を前提とし、配色、文字の階梯、入力部品、ダイアログ、キーボード導線に適用する。
他の platform では同等の達成基準へ読み替える。
外部ライブラリは、採用した時点で本稿の責任範囲に入る。内部の実装を直せない場合も、選定時に本稿の確認項目で確かめ、満たさないものは採用しない。

## コア

### 情報は必ず 2 つ以上の手がかりで伝える

意図と根拠: 1 つの感覚や 1 つの属性だけに頼ると、その手がかりを受け取れない利用者に情報が届かない。
色、形、位置、文字のうち 2 つ以上を重ねて同じ情報を伝える。
この規則が色、アイコン、状態表示の個別の規則すべての土台になる。

- 良い例: エラーを赤色、アイコン、文言の 3 つで示す。
- 悪い例: エラーを赤い枠線だけで示す。
- 例外: 色そのものを鑑賞・選択する領域。

### レベル AA を最低線にする

意図と根拠: どこまでやるかを都度決めていると、画面ごとに水準が揺れる。
WCAG 2.2 のレベル A と AA をすべて満たすことを最低線と決め、AAA は個別に選ぶ。
最低線を数値で決めておくと、実装前に判断が終わる。

- 良い例: レベル AA の達成基準を確認項目に落とし、実装前に照合する。
- 悪い例: 「できる範囲で対応する」とだけ決めて着手する。
- 例外: 動きの抑制のように、AAA でも本リポジトリが必須にするもの。
- 出典: [WCAG 2.2 ガイドライン](https://www.w3.org/WAI/WCAG22/quickref/)

### 入力手段を 1 つに限定しない

意図と根拠: マウス、キーボード、タッチ、音声のどれか 1 つを前提にすると、他の手段の利用者が操作できない。
すべての操作を、ポインタとキーボードの双方で完結できるようにする。

- 良い例: 押す、選ぶ、閉じるのすべてをキーボードでも実行できる。
- 悪い例: ドラッグでしか並べ替えられない一覧を置く。
- 例外: 自由描画キャンバスなど、連続した軌跡が本質である操作。

### 見た目ではなく構造で意味を持たせる

意図と根拠: 支援技術が読むのは見た目ではなく要素と属性である。
見出し、一覧、ボタン、ランドマークは、それぞれの要素で組む。
見た目を合わせるために要素を選ぶと、構造と意味がずれる。

- 良い例: 押せるものを `button`、移動するものを `a` で組む。
- 悪い例: `div` に `onClick` を付け、見た目だけをボタンに似せる。
- 例外: 標準の要素で表せない部品。WAI-ARIA で役割と状態を明示する。

### 利用者の設定を上書きしない

意図と根拠: 文字サイズ、動きの抑制、配色の設定は、利用者が必要があって変えている。
端末とブラウザの設定を検出して従い、画面側の都合で上書きしない。

- 良い例: 文字サイズを相対単位で組み、端末の拡大設定に従う。
- 悪い例: 表示を崩したくないという理由で拡大を禁止する。
- 例外: 利用者自身が画面内で明示的に選び直した設定。

## Tips

### 本文テキストのコントラスト比は 4.5:1 以上を確保する

意図と根拠: 背景と文字の明度差が足りないと、弱視や屋外の環境で読めなくなる。
四捨五入せずに 4.5:1 を上回る色を選択する。

- 良い例: 背景に対して 4.5:1 を超える文字色をコントラスト計算して設定する。
- 悪い例: コントラスト比が 3.8:1 の淡いグレー文字を本文に使う。
- 例外: 24px 以上、または 19px 以上の太字は 3:1 でよい。操作不能な無効化テキストと純粋な装飾も対象外。
- 実験: [catalog-editorial/shared/contrast.ts](../../experiments/catalog-editorial/shared/contrast.ts)
- 出典: [WCAG 2.2 達成基準 1.4.3](https://www.w3.org/WAI/WCAG22/quickref/#contrast-minimum)

### UI 部品と意味を持つ図形は 3:1 以上のコントラストを確保する

意図と根拠: アイコンや境界線が見分けられないと、操作対象や状態を認識できない。
意味を担う非テキスト要素は 3:1 以上の明度差を保つ。

- 良い例: チェックマークや入力枠の輪郭を背景に対して 3:1 以上にする。
- 悪い例: 背景との比が 2:1 に満たないヘアラインだけで入力枠を示す。
- 例外: デザインの統一感を保つための純粋な装飾罫線。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 1.4.11](https://www.w3.org/WAI/WCAG22/quickref/#non-text-contrast)

### 情報や状態を色だけで伝えない

意図と根拠: 色覚の多様性やモノクロ表示では、色だけの差異を判別できない。
色に加えて線種、アイコン、テキストラベルを併用する。

- 良い例: 良い例と悪い例を、枠線の実線と破線、および語のラベルで分ける。
- 悪い例: 成功とエラーを緑と赤の円だけで示し、文字や形を変えない。
- 例外: 配色見本帳など、色そのものを鑑賞・選択する目的の領域。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 1.4.1](https://www.w3.org/WAI/WCAG22/quickref/#use-of-color)

### 意味を持つ画像に代替テキストを付け、装飾は読み上げから外す

意図と根拠: 画像が読めない利用者には、画像が担う情報が文字で届く必要がある。
情報を担う画像には内容を説明する代替テキストを付け、装飾だけの画像は読み上げの対象から外す。

- 良い例: 図版に内容を説明する代替テキストを付け、飾り罫は `aria-hidden` にする。
- 悪い例: すべての画像に `alt=""` を付ける、または `alt` 属性自体を省く。
- 例外: 隣接するテキストが同じ内容を完全に説明している画像。
- 出典: [WCAG 2.2 達成基準 1.1.1](https://www.w3.org/WAI/WCAG22/Understanding/non-text-content.html)

### 見出しとランドマークで画面の構造を示す

意図と根拠: 支援技術の利用者は、見出しとランドマークを飛ばし読みの目印に使う。
見た目の大きさではなく文書構造で見出しの階層を決め、主要な領域をランドマーク要素で囲む。

- 良い例: `header`、`nav`、`main` で領域を分け、見出しを h1 から順に置く。
- 悪い例: 文字を大きくした `div` を見出しの代わりに使い、階層を飛ばす。
- 例外: 視覚的に見出しを出さない領域。`aria-label` でランドマークに名前を付ける。
- 実験: [catalog-editorial/variants/topic-first/index.tsx](../../experiments/catalog-editorial/variants/topic-first/index.tsx)
- 出典: [WCAG 2.2 達成基準 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

### ラベル、エラー文、補足を入力欄と結び付ける

意図と根拠: 見た目が近いだけでは、支援技術はどの文言がどの入力欄のものか判別できない。
`label` の `for` で名前を結び、補足とエラー文は `aria-describedby` で結ぶ。

- 良い例: `label` の `for` と `aria-describedby` で、名前と説明を入力欄に結ぶ。
- 悪い例: 入力欄の上に文字を置くだけで、要素として関連付けない。
- 例外: 入力欄自身の `aria-label` で名前が完結する検索窓など。
- 実験: [form-inline-validation](../../experiments/form-inline-validation/README.md)
- 出典: [WCAG 2.2 達成基準 1.3.1](https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html)

### ポインタのターゲット領域は 24px 以上にする

意図と根拠: 小さすぎる操作対象は、タッチ操作や震えのある手で誤操作を起こす。
余白を含めた当たり判定を 24×24 CSS px 以上に保つ。

- 良い例: 余白を設けて 24px 以上のボタン領域を確保する。
- 悪い例: 16px の SVG のみを直接のクリック対象にして配置する。
- 例外: インラインテキスト中に配置された文脈上のリンク。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 2.5.8](https://www.w3.org/WAI/WCAG22/quickref/#target-size-minimum)

### 文字の拡大と狭い幅で内容を失わせない

意図と根拠: 文字を拡大したり狭い幅で開いたりしても、読めて操作できる必要がある。
文字サイズを 200% にしても内容が欠けず、320px 相当の幅で 2 方向のスクロールを起こさない。

- 良い例: 相対単位で寸法を組み、折り返しと縦 1 方向のスクロールで収める。
- 悪い例: 高さを px で固定し、拡大した文字を枠の外で切り落とす。
- 例外: 表、地図、図版など、2 次元の配置が内容の本質である要素。
- 出典: [WCAG 2.2 達成基準 1.4.4 / 1.4.10](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html)

### すべての操作をキーボードだけで完結させる

意図と根拠: マウスやタッチ操作が困難な利用者はキーボードのみで操作する。
すべての対話要素にフォーカスが当たり、Enter や Space で実行できるようにする。

- 良い例: タブやボタンをネイティブ要素で組み、キーボードで操作可能にする。
- 悪い例: div や span に onClick だけを付け、キーボードで押せないようにする。
- 例外: 自由描画キャンバスなど、ポインタの連続軌跡が必須の操作。
- 実験: [catalog-editorial/README.md](../../experiments/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.1.1](https://www.w3.org/WAI/WCAG22/quickref/#keyboard)

### フォーカスを可視化し sticky な帯で隠さない

意図と根拠: 現在地が見えないと、キーボード操作で次に何が起きるか読めない。
明確なフォーカス枠を出し、固定ヘッダーの下に隠れないよう配慮する。

- 良い例: 2px の鮮明な輪郭線を出し、scroll-margin で固定帯との重なりを防ぐ。
- 悪い例: outline: none で枠を消し、固定ヘッダーの背後に要素が潜り込む。
- 例外: ポインタで押した直後。`:focus-visible` を使い、キーボード操作のときだけ枠を出す。
- 実験: [catalog-editorial/README.md](../../experiments/catalog-editorial/README.md)
- 出典: [WCAG 2.2 達成基準 2.4.7 / 2.4.11](https://www.w3.org/WAI/WCAG22/quickref/#focus-visible)

### 画面遷移後は見出しにフォーカスを移し skip link を置く

意図と根拠: SPA の画面切替後にフォーカスが残ると、次の操作位置を見失う。
遷移先の大見出しにフォーカスを移し、本文先頭へのスキップ手段を用意する。

- 良い例: 画面遷移後に h1 要素へフォーカスを移し、最上部に skip link を置く。
- 悪い例: 画面が切り替わっても直前のボタンにフォーカスが残留する。
- 例外: 遷移を伴わない同一画面内の小さな開閉操作。
- 実験: [catalog-editorial/shared/useScreen.ts](../../experiments/catalog-editorial/shared/useScreen.ts)
- 出典: [WCAG 2.2 達成基準 2.4.1](https://www.w3.org/WAI/WCAG22/quickref/#bypass-blocks)

### hover だけでしか読めない情報を置かない

意図と根拠: タッチ端末には hover がなく、キーボード利用者も情報を取りこぼす。
focus 時にも同等に表示し、粗いポインタでは常時表示にする。

- 良い例: ホバーとフォーカスの両方で表示し、タッチ環境では常時展開する。
- 悪い例: マウスホバー時のみツールチップで必須の注記を出す。
- 例外: ホバーによって得られる純粋な視覚的装飾や演出効果。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 1.4.13](https://www.w3.org/WAI/WCAG22/quickref/#content-on-hover-or-focus)

### 動きを減らす端末設定に従う

意図と根拠: 前庭感覚の障害を持つ利用者は、大きな画面の動きで吐き気や目眩を起こす。
prefers-reduced-motion を検出し、アニメーションを抑制する。

- 良い例: prefers-reduced-motion 時に遷移時間や移動距離を 0 に近づける。
- 悪い例: 端末設定を無視して常に画面全体がスライドや拡大縮小する。
- 例外: 動画再生など、動きそのものがコンテンツの本質である場合。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [WCAG 2.2 達成基準 2.3.3（AAA）](https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html)

### 操作の名前は「何が起きるか」で付ける

意図と根拠: アイコンの外見を名前で伝えても、利用者は何の機能か理解できない。
押した結果として起きる動作や移動先をアクセシブルな名前とする。

- 良い例: 虫眼鏡アイコンのボタンに「検索」という名前を付ける。
- 悪い例: ボタンに「虫眼鏡」と名前を付ける、または名前を付けない。
- 例外: ブランドロゴそのものの表示。
- 実験: [skills/crafting-svg/references/ui-fit.md](../../skills/crafting-svg/references/ui-fit.md)
- 出典: [WCAG 2.2 達成基準 4.1.2](https://www.w3.org/WAI/WCAG22/quickref/#name-role-value)

### モーダル表示にはネイティブの dialog 要素を使う

意図と根拠: 自前のモーダル実装は、フォーカスの閉じ込めや Esc キー対応が抜けやすい。
標準の dialog 要素を showModal で開き、標準の支援技術対応を利用する。

- 良い例: ネイティブの dialog 要素を使い、Esc での終了と背景不活性化を得る。
- 悪い例: div 要素でモーダルを自作し、背後の要素にフォーカスが漏れる。
- 例外: 簡易なポップオーバーなど、非モーダルな浮動表示。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [MDN dialog 要素](https://developer.mozilla.org/ja/docs/Web/HTML/Reference/Elements/dialog)

## 確認項目

- [ ] 本文のコントラスト比が 4.5:1 以上か。大きな文字は 3:1 以上か。
- [ ] 意味を担うアイコンや枠線のコントラスト比が 3:1 以上か。
- [ ] 情報を担う画像に代替テキストがあり、装飾が読み上げから外れているか。
- [ ] 見出しの階層とランドマークが文書構造として組まれているか。
- [ ] ラベルとエラー文が入力欄に要素として関連付けられているか。
- [ ] 文字を 200% に拡大し、320px 相当の幅にしても内容が失われないか。
- [ ] すべてのボタンやリンクにキーボードだけで到達し操作できるか。
- [ ] フォーカス位置が明瞭な輪郭線で視覚化されているか。
- [ ] 動きを減らす設定を有効にした際に過剰な動きが停止するか。

## 出典

- [WCAG 2.2 ガイドライン](https://www.w3.org/WAI/WCAG22/quickref/): 知覚可能、操作可能、理解可能、堅牢の達成基準。本稿が引くのは 2.3.3 を除きレベル A と AA
- [MDN Web Docs: アクセシビリティ](https://developer.mozilla.org/ja/docs/Web/Accessibility): HTML と WAI-ARIA の実装標準

## 判断

- 判断者: 未定
- 判断日: 未定
- 理由: draft のため未定
