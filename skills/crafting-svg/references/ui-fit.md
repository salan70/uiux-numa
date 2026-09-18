# UI への適合とアクセシビリティ

SVG のアイコン、ロゴ、イラストを画面に置くときの規律。
単体の造形が良くても、周囲との調和、主従関係、操作の理解、支援技術への対応が崩れると利用画面では失敗する。
手順 1（利用画面での役割の整理）と手順 4（利用画面内での比較）で参照する。

## UIFIT-01 操作の名前は「何が起きるか」で付ける

- 種別: 知覚原則（WCAG 2.2 1.1.1 と WAI チュートリアル）
- 適用場面: アイコンボタン、ロゴのリンク、機能アイコン全般
- 指針: アイコンだけのボタンやリンクには、見た目の説明ではなく動作を表す名前を付ける。可視ラベルが最善で、無い場合は `button` に `aria-label` を置き、SVG は `aria-hidden="true"` にする。
- 理由: 支援技術の利用者は、図形の説明ではなく結果を知りたい。
- 良い例: 印刷アイコンの名前が「このページを印刷」。
- 悪い例: 名前が「プリンター」「虫眼鏡」、または名前なし。
- 修正方法: 名前を動作（検索、印刷、ホームへ移動）に書き換える。
- 出典: [WAI: Functional Images](https://www.w3.org/WAI/tutorials/images/functional/)（2026-09-18 取得）。"The text alternative for the image should convey the action that will be initiated"

## UIFIT-02 意味を担う図形は 3:1 以上

- 種別: 知覚原則（WCAG 2.2 1.4.11）
- 適用場面: 状態アイコン、チェックマーク、メニューの矢印、枠なしのアイコンボタン
- 指針: 意味を担うアイコンと、操作できると示す視覚的な手がかりは、隣接色に対して 3:1 以上のコントラストを確保する。単色アイコンは全体を 1 つの図形として測る。四捨五入しない（2.999:1 は不合格）。
- 理由: 低視力の利用者が図形を認識できる下限。
- 良い例: 白のアイコンを #E3660E の円に置く（3:1 超）。
- 悪い例: 薄いグレーのアイコンを白の面に置き、隣にテキストのラベルもない。
- 修正方法: アイコンの色を濃くするか、同じ情報を可視テキストで併記する。
- 出典: [WCAG 2.2 Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)（2026-09-18 取得）。"For simple graphics such as single-color icons the entire image is a graphical object"

## UIFIT-03 当たり判定は 24×24 CSS px 以上

- 種別: 知覚原則（WCAG 2.2 2.5.8）
- 適用場面: ツールバー、閉じるボタン、密なアイコンの列
- 指針: ポインタ操作の対象は 24×24 CSS px 以上にする。16px や 20px の描画でも、余白を含めた当たり判定を 24px 以上にする。
- 理由: 小さな対象は誤操作を招く。ズームでの拡大は理由にならない。
- 良い例: 20px のアイコンを 24px 以上のボタン領域に中央配置する。
- 悪い例: 16px の SVG そのものをクリック対象にし、隣と 4px 間隔で並べる。
- 修正方法: ボタンに padding を足し、24px 角が内接するようにする。
- 出典: [WCAG 2.2 Understanding 2.5.8](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html)（2026-09-18 取得）。"it must be conceptually possible to draw a solid 24 by 24 CSS pixel square"

## UIFIT-04 単独で意味を持つ SVG は role="img" と title で名前を付ける

- 種別: 経験則（Deque の実測、SVG-AAM の名前計算に整合）
- 適用場面: inline SVG のイラスト、図、意味のある単独アイコン
- 指針: 単独で情報を伝える SVG は `role="img"` と最初の子 `<title>` で名前を付ける。書き出しツールが残す `<title>`（「Created by Sketch」など）は削除する。
- 理由: この組み合わせが、検証したブラウザとスクリーンリーダーで最も安定した。
- 良い例: `<svg role="img"><title>在庫あり</title>…`
- 悪い例: `<title>Created by Sketch</title>` が残った SVG に、`role` も名前もない。
- 修正方法: title を意味に書き換え、`role="img"` を付ける。
- 注意: この Skill では `aria-labelledby` を使わない。配布用の最適化（SVGO の cleanupIds）が `title` の id を消すためである。`role="img"` と最初の子 `<title>` だけで名前が付く。
- 出典: [Deque: Creating Accessible SVGs](https://www.deque.com/blog/creating-accessible-svgs/)（2026-09-18 取得）。"was the most reliable choice for the different browser and screen readers that were tested" / [SVG-AAM 1.0](https://www.w3.org/TR/svg-aam-1.0/)

## UIFIT-05 装飾とラベル付きの SVG は隠す

- 種別: 経験則（Scott O'Hara のスクリーンリーダーの横断テスト）
- 適用場面: テキスト付きのボタン、装飾のイラスト、リストの箇条アイコン
- 指針: 装飾の SVG と、可視テキストを持つリンクやボタン内の SVG は `aria-hidden="true"` と `focusable="false"` で隠し、名前は要素側の可視テキストか `aria-label` で与える。
- 理由: SVG に名前を担わせると、読み上げが重複するか欠ける。
- 良い例: `<button><svg aria-hidden="true" focusable="false">…</svg> 保存</button>`
- 悪い例: ボタン内の SVG に `<title>` を置いて名前を担わせ、ボタン本体に名前がない。
- 修正方法: SVG を隠し、名前をボタンのテキストか `aria-label` に移す。
- 出典: [Scott O'Hara: Contextually Marking up accessible images and SVGs](https://www.scottohara.me/blog/2019/05/22/contextual-images-svgs-and-a11y.html)（2026-09-18 取得）。"provide accessible names via other means, and treat the SVG as decorative"

## UIFIT-06 ラベルは常時表示する

- 種別: 知覚原則（NN/g のユーザー調査）
- 適用場面: ナビゲーション、主要な操作、初見の利用者が多い画面
- 指針: 普遍的に通じるアイコンは少数なので、原則として可視のテキストラベルを常時添える。hover やツールチップでラベルを出す方式は避ける。
- 理由: 利用者はラベルのないアイコンの意味を推測し、誤る。
- 良い例: アイコンの下または横に常時ラベル。
- 悪い例: デスクトップで hover 時のみラベルを表示する。
- 修正方法: ラベルを常時表示にし、幅がなければアイコンを減らす。
- 出典: [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/)（2026-09-18 取得）。"Icon labels should be visible at all times"

## UIFIT-07 単色は currentColor で継承させる

- 種別: 経験則（Microsoft Edge チームの解説、MDN に整合）
- 適用場面: UI アイコン、単色のロゴ、テーマ切替のある画面
- 指針: 単色アイコンの `fill` と `stroke` は `currentColor` にし、色は親の `color` から継承させる。ライト、ダーク、Windows のハイコントラスト（forced-colors）で周囲の文字色に追従する。
- 理由: forced-colors は SVG の色を調整しないため、固定色は背景に溶ける。
- 良い例: `fill="currentColor"` の SVG を、`color` を指定したボタン内に置く。
- 悪い例: `fill="#333"` を焼き込み、ダークモードで黒地に消える。
- 修正方法: 固定色を `currentColor` に置き換える。多色は利用画面の CSS で `#part-*` を上書きする（SVG 内で `var()` は使わない）。
- 出典: [Microsoft Edge: Styling for Windows high contrast](https://blogs.windows.com/msedgedev/2020/09/17/styling-for-windows-high-contrast-with-new-standards-for-forced-colors/)（2026-09-18 取得）。"Forced color modes do not adjust SVGs" / [MDN: forced-colors](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors)

## UIFIT-08 隣接する文字と線の太さを揃える

- 種別: ブランド規約（Apple HIG。一般原則として使える）
- 適用場面: ボタン内のアイコンと文字、リストの行、タブバー
- 指針: 隣接する文字とアイコンは線の太さ（ウェイト）を揃え、強調したい側だけ変える。重心が偏るアイコンは幾何学的な中心ではなく、数 px ずらして光学的に中央へ置く。
- 理由: 太さが違うと、アイコンが文字より目立ち主従が崩れる。
- 良い例: 本文 Regular に細線のアイコン、見出し Bold に太線のアイコン。
- 悪い例: 細い本文に太い塗りのアイコンで、アイコンが文字より目立つ。
- 修正方法: 線幅を文字のウェイトに合わせ、上下の重心を見て 1〜2px 動かす。
- 出典: [Apple HIG Icons](https://developer.apple.com/design/human-interface-guidelines/icons)（2026-09-18 取得）。"In general, match the weights of interface icons and adjacent text."

## UIFIT-09 文字と組むアイコンは文字と同じ色にする

- 種別: ブランド規約（IBM Carbon の値）
- 適用場面: テキスト付きのアイコン、フォーム、テーブルの行
- 指針: アイコンの大きさは文字の大きさと対で決め、文字に対して中央揃えにする。色は並べる文字と同じにし、アイコンだけ別の色にしない。Carbon の値は 14〜16px の本文に 16〜20px のアイコン。
- 理由: アイコンだけ別の色だと、主従が逆転する。
- 良い例: 本文色のトークンを、アイコンと文字の両方に適用する。
- 悪い例: 文字はグレー、アイコンはブランド色で主従が逆転する。
- 修正方法: アイコンの色を文字のトークンに揃え、ベースライン揃えを中央揃えにする。
- 出典: [Carbon Design System: Icons usage](https://carbondesignsystem.com/elements/icons/usage/)（2026-09-18 取得）。"Do match your icon color with your text color when pairing them"

## UIFIT-10 同じプロダクト内で寸法、線幅、角を統一する

- 種別: ブランド規約（Atlassian。Apple HIG に同旨）
- 適用場面: 新しいアイコンの追加、外部のアイコン集との混在、レビュー
- 指針: 同じプロダクト内のアイコンは寸法、線幅、角の処理、端点、細部の量、遠近を統一する。混在させないことが本質。
- 理由: 1 つでも違うと、プロダクトの一貫性が崩れる。
- 良い例: 既存の組と同じ線幅と角丸で描き、並べて比較する。
- 悪い例: 2px の線のアイコン集に、1px の線の外部アイコンを混ぜる。
- 修正方法: 既存のアイコンの線幅と角に合わせて描き直すか、既存の類似アイコンを使う。
- 出典: [Atlassian Iconography](https://atlassian.design/foundations/iconography/)（2026-09-18 取得）。"Ensure icons work together as a cohesive system by adhering to consistent size, shape, and style"

## UIFIT-11 ロゴはコントラストを免除されるが、リンクなら確保する

- 種別: 知覚原則（WCAG 2.2 1.4.11 と 1.4.3）
- 適用場面: header のロゴのリンク、パートナーのロゴ一覧
- 指針: ロゴはコントラストの要件を免除されるが、リンクとして働くなら十分なコントラストの版を選ぶ。低コントラストが作者の選択（hover まで薄くするなど）なら免除されない。リンク化したロゴの名前は行き先（例: 「Hako ホーム」）にする。
- 理由: 免除はブランドの規約による制約への配慮であり、選択の言い訳にはならない。
- 良い例: header で白背景用の濃色のロゴを使い、名前は「Hako ホーム」。
- 悪い例: グレースケールで薄くしたロゴ群を hover で色付けする。
- 修正方法: 既定の状態で 3:1 を満たす版に差し替える。
- 出典: [WCAG 2.2 Understanding 1.4.11](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)（2026-09-18 取得）。"the logo that has sufficient contrast, if allowed by the corporate identity or brand guidelines" / [Understanding 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

## 相反する指針と注意点

- Edge の解説は「forced colors は SVG を調整しない」と述べるが、CSS Color Adjust の仕様は `fill` と `stroke` を強制の対象に列挙する。`currentColor` はどちらでも文字色に追従するので安全側。多色のイラストはブラウザの forced-colors のエミュレーションで確かめる。
- Carbon はアイコンに 4.5:1 と 44px のタッチ領域を求め、WCAG 2.2 の 3:1 と 24px より厳しい。これはそのシステムの値。
- Deque の実測では単一の最良パターンはなく、対象のブラウザとスクリーンリーダーでの検証を求めている。
