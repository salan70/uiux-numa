# イラスト

UI 内のイラスト（空状態、オンボーディング、hero）の知識。
共通の造形は `skills/crafting-svg/references/foundations.md` にある。

## ILLUS-01 文言の補助であり、代替ではない

- 種別: 経験則（NN/g）とブランド規約（Atlassian）
- 適用場面: 空状態にイラストを足すか決めるとき
- 指針: 空状態を空白や絵だけにせず、何が表示され、どう埋めるかを文言で伝える。理解に寄与しない絵は置かない。
- 理由: 絵は説明を置き換えられず、文言のない空状態は利用者を止める。
- 良い例: 「星を付けるとここに並びます」と、操作の導線を示す小さなスポット。
- 悪い例: 絵だけが中央にあり、文言は「No data」か無い。
- 修正方法: 状態の説明と次の操作を先に確定し、理解を助ける絵だけ残す。
- 出典: [NN/g: Empty States](https://www.nngroup.com/articles/empty-state-interface-design/)（2026-09-18 取得）。"Do not default to totally empty states." / [Atlassian Illustrations](https://atlassian.design/foundations/illustrations)（2026-09-18 取得）。"Illustration should work with the message, not replace it."

## ILLUS-02 文言を絵で繰り返さない

- 種別: ブランド規約（Microsoft Fluent）
- 適用場面: 空状態や hero の情報量と配置
- 指針: 絵で文言を繰り返さず、単一の比喩で 1 つの概念だけを描く。配置は見出し、イラスト、説明と操作の順に縦に並べる。
- 理由: 文言と絵が重複すると、認知の負荷と混乱が増える。
- 良い例: 見出しの下に封筒 1 つ、その下に説明と「メールを書く」。
- 悪い例: 「ドラッグして追加」の横に、ドラッグの手順を描いた絵。
- 修正方法: 手順の描写を削り、対象物 1 つに絞る。
- 出典: [Microsoft Design: Fluent illustrations](https://microsoft.design/articles/embracing-vibrant-universality-in-fluent-illustrations/)（2026-09-18 取得）。"Our previous illustrations often duplicated accompanying written copy, creating unnecessary mental strain and occasional confusion."

## ILLUS-03 空状態の絵は控えめで中立にする

- 種別: ブランド規約（Material Design 1）
- 適用場面: 空状態の画像の色と明度
- 指針: 空状態の画像は背景に対して控えめで中立にし、押せるように見せない。
- 理由: 強い彩度は、画像や文言を操作対象と誤解させる。
- 良い例: 背景に近い明度の淡い単色のスポットと、目的を説明する文言。
- 悪い例: 高彩度のフルカラーの画像に「今すぐ始めよう」。
- 修正方法: 彩度と明暗差を下げて背景に寄せ、行動を促す文言はボタンへ移す。
- 出典: [Material Design 1: Empty states](https://m1.material.io/patterns/empty-states.html)（2026-09-18 取得）。"Is subtle and neutral with respect to the background"

## ILLUS-04 エラーの空状態で遊ばない

- 種別: ブランド規約（GitHub Primer）
- 適用場面: 読み込み失敗などのエラーの空状態
- 指針: エラー起因の空状態では遊び心を出さず、問題が起きたことを図で補強する。既定は警告のアイコン。
- 理由: 失敗の場面での遊びは、利用者の状況と合わない。
- 良い例: 「読み込めませんでした」に警告アイコンと再試行。
- 悪い例: 失敗画面で笑顔のキャラクターが手を振る。
- 修正方法: 警告アイコンか中立な図に替え、文言で原因と復帰の手段を示す。
- 出典: [Primer: Empty states](https://primer.style/product/ui-patterns/empty-states/)（2026-09-18 取得）。"If a Blankslate is being used to convey an error state, the graphic should not attempt to bring delight or be playful."

## ILLUS-05 支配的な要素は 1 つ、強調は 3 段階まで

- 種別: 知覚原則（ゲシュタルトに基づく解説）
- 適用場面: 焦点の決定、hero のレビュー
- 指針: 支配的な要素は 1 つにし、強調は 3 段階まで。要素は少数の意味あるものに絞る。
- 理由: すべてを強調すると何も目立たない。
- 良い例: 主役 1 つが最大の明暗差を持ち、脇役は差を弱めて配置する。
- 悪い例: 同じ大きさと彩度の要素が 5 つ均等に並ぶ。
- 修正方法: 主役を選び、他の要素の大きさ、彩度、明暗差を段階的に下げる。
- 出典: [Smashing Magazine: Dominance, Focal Points And Hierarchy](https://www.smashingmagazine.com/2015/02/design-principles-dominance-focal-points-hierarchy/)（2026-09-18 取得）。"As a general rule, people can perceive three levels of dominance."

## ILLUS-06 明暗で焦点と奥行きを作る

- 種別: 知覚原則（視覚的な重さと図地）
- 適用場面: 明暗（value）の設計、奥行き、図と地
- 指針: 暗い、高彩度、前景、暖色の要素は重い。焦点に最大の明暗差を集め、背景は明るく低彩度にして奥行きと安定した図地を作る。余白は詰めない。
- 理由: 明暗差が最も大きい場所に目が向く。
- 良い例: 主役は濃色と高彩度、背景は淡く低彩度で余白がある。
- 悪い例: 背景が主役と同じ明度で濃く、輪郭が溶けて沈む。
- 修正方法: 背景の明度を上げ、彩度を下げ、主役の輪郭に最大のコントラストを置く。
- 出典: [Smashing Magazine: Visual Weight And Direction](https://www.smashingmagazine.com/2014/12/design-principles-visual-weight-direction/)（2026-09-18 取得）。"Dark elements have more visual weight than light elements." / [Smashing Magazine: Figure/Ground](https://www.smashingmagazine.com/2014/05/design-principles-space-figure-ground-relationship/)。"One or the other usually dominates the composition."

## ILLUS-07 視線を文言と操作へ導く

- 種別: 知覚原則（Arnheim の構造骨格）
- 適用場面: 焦点の位置、文言や CTA への視線の流れ
- 指針: 視線は矢印、指差し、視線の向き、線の方向で誘導する。矩形の光学的な中心は幾何学的な中心のやや上にあり、主役はそこか、文言と CTA へ向く方向に置く。
- 理由: 目は光学的な中心に引かれ、線の向きに沿って動く。
- 良い例: キャラクターの視線と斜線が下の見出しへ向く。
- 悪い例: 主役が幾何学的な中心の下に沈み、線が画面外へ逃げる。
- 修正方法: 主役をやや上へ移し、線や視線の向きを文言側へ揃える。
- 出典: [Smashing Magazine: Visual Weight And Direction](https://www.smashingmagazine.com/2014/12/design-principles-visual-weight-direction/)（2026-09-18 取得）。"the center that attracts the eye is the optical center, and it sits just above the true geometric center"

## ILLUS-08 線幅、角丸、比率、パレットを 1 組で揃える

- 種別: ブランド規約（IBM、Salesforce Lightning の値）
- 適用場面: 複数のイラストの統一、キャラクターの要否
- 指針: グリッド、形、角丸、線幅、比率、パレットを揃える。IBM の値は比率 16:9、4:3、3:2、2:1、1:1、類似色 2〜3 色相。キャラクターは背景に線画で置き、なくても意味が通るようにする。
- 理由: 1 枚だけ線幅や色相が違うと、同じプロダクトに見えない。
- 良い例: 全スポットが同じ線幅と角丸で 3 色相。人物は背景に線画。
- 悪い例: 1 枚だけ線幅が太く、色相が 6 種。特定の職種の人物が前面にいる。
- 修正方法: 線幅と角丸を既存に合わせ、色相を減らす。人物を後退させ、対象物を主役にする。
- 出典: [IBM Design Language: Illustration tips](https://www.ibm.com/design/language/illustration/tips-and-techniques/)（2026-09-18 取得）。"Use common aspect ratios, such as 16:9, 4:3, 3:2, 2:1 and 1:1" / [Lightning Design System v1: Empty state](https://v1.lightningdesignsystem.com/guidelines/empty-state/)（2026-09-18 取得）。"characters should live only in the background, as outlines"

## 相反する指針と注意点

- Material 1 は空状態の画像を控えめで中立とし、Atlassian と Lightning は祝福や初回向けの色付きスポットを認める。日常は中立、祝福は色付き、が共通点。
- Microsoft は立体へ、IBM と Material 1 はフラットや線画へ寄る。奥行きの度合いは各システムの値。
- 装飾のイラストは `alt=""` か `aria-hidden="true"` にする（`UIFIT-05`）。
