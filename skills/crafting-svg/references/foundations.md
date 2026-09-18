# 共通の造形

アイコン、ロゴ、イラストに共通する造形の知識。
制作の手順 2（方針の選択）と手順 4（比較と改善）で参照する。
改善の記録とレビューでは、根拠にした項目を ID（例: `FORM-01`）で引用する。

種別の意味は次のとおり。

- 知覚原則: 人間の知覚や認知の研究、規格に基づく。プロダクトを問わず使える。
- ブランド規約: 特定のデザインシステムやブランドの決まり。数値は「そのシステムの値」であり、普遍の正解ではない。
- 経験則: 実務家の慣習や意見。状況に応じて外してよい。

## FORM-01 視覚的な中心に置く

- 種別: 知覚原則
- 適用場面: 矢印、ダウンロード、人型など、上下や左右で重さが偏る図形の配置
- 指針: 幾何学的な中心ではなく、視覚的な重心が viewBox の中心に来るまで図形を動かす。動かした分の余白は asset に含める。
- 理由: 非対称な図形は幾何学的に中央に置くと、ずれて見える。
- 良い例: 下が重いダウンロードの図形を、数 px 上に置く。
- 悪い例: bounding box の中心に置いた矢印が、低く見える。
- 修正方法: 図形を 24px と 16px で描画し、見た目で中央になるまで 0.5px 刻みで動かす。
- 出典: [Apple HIG Icons](https://developer.apple.com/design/human-interface-guidelines/icons)（2026-09-18 取得）。"can look unbalanced when you center them geometrically instead of optically"

## FORM-02 円と尖った形は少し大きくする

- 種別: 知覚原則（keyline の値はブランド規約）
- 適用場面: 円、三角、ひし形を、正方形や水平線と並べるとき
- 指針: 円や尖端は、平らな形と同じ高さだと小さく見える。基準線からわずかに出す（overshoot）。
- 理由: 活字の設計では、丸い文字の上下を数学的にではなく視覚的に揃える。
- 良い例: 正方形 18、円 20 のように、円を一回り大きく描く（Material 1 の keyline の値）。
- 悪い例: 同じ box に収めた円だけが小さく見える。
- 修正方法: 円と正方形を並べて描画し、明暗の量が揃うまで円を拡大する。
- 出典: [Microsoft Typography: Character design standards](https://learn.microsoft.com/en-us/typography/develop/character-design-standards/uppercase)（2026-09-18 取得）。"It is far more important the tops and bottoms of round characters are visually more than mathematically equal." / [Material Design 1 Icons](https://material.io/archive/guidelines/style/icons.html)（2026-09-18 取得）

## FORM-03 見かけの重さを揃える

- 種別: ブランド規約（IBM、Material 1 が一致）
- 適用場面: 1 組のアイコン、ロゴの lockup、イラストの線
- 指針: 同じ大きさの図形は、見かけの重さを揃える。1 つの図形の中で線幅を混ぜない。
- 理由: 重さが揃わないと、1 つだけ目立つか沈み、組として見えない。
- 良い例: 全アイコンが同じ stroke-width で、重く見える形は寸法で調整している。
- 悪い例: 1 つの図形に 1.5px と 2px の線が混ざる。
- 修正方法: stroke-width を統一し、太く見える図形は面積を減らす。
- 出典: [IBM Design Language: UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/)（2026-09-18 取得）。"All icons of the same size should have a consistent visual weight; no icon should appear heavier or lighter than another."

## FORM-04 本質だけに削る

- 種別: 経験則（NN/g、IBM、Material が一致）
- 適用場面: 描き起こし、細部が多い SVG のレビュー
- 指針: 対象の基本的な特徴だけを残す。小サイズで判別できない細部は削る。
- 理由: 細部は小さいサイズで判別できず、形の輪郭を濁らせる。
- 良い例: 封筒を、輪郭と V 字だけで表す。
- 悪い例: 封筒に切手や住所の線まで描く。
- 修正方法: 16px で描画し、判別できない要素を 1 つずつ消す。
- 出典: [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/)（2026-09-18 取得）。"Intricate details are difficult to distinguish at smaller sizes."

## FORM-05 live area に収める

- 種別: ブランド規約（IBM、Material 1 の値）
- 適用場面: viewBox に対する図形の大きさ
- 指針: 図形は live area に収め、padding へのはみ出しは見かけの重さを補うときだけにする。IBM は 32px 中 2px、Material 1 は 24dp 中 4dp が padding。
- 理由: 端まで達した図形は、隣の要素や面の縁と密着して見える。
- 良い例: viewBox 24 に対して、図形を 20×20 の内側に収める。
- 悪い例: 図形が viewBox の端に接している。
- 修正方法: live area を先に決め、はみ出しは重さの補正に限る。
- 出典: [IBM Design Language: UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/)（2026-09-18 取得）。"Only extend artwork into the padding for additional visual weight"

## FORM-06 水平線は太く見える

- 種別: 知覚原則（査読研究）
- 適用場面: 十字、格子、円周など、水平と垂直の線を持つ図形
- 指針: 同じ太さでも水平線は垂直線より太く見える。等しく見せたいときは水平線をわずかに細くする。
- 理由: 水平線の太さは、垂直線に対して過大に知覚される。
- 良い例: 十字の横棒を少し細くして、見た目で揃える。
- 悪い例: 数値を同じにして、横棒が重く見える。
- 修正方法: 水平線だけ線幅を 5〜10% 減らし、描画して判断する。
- 出典: [Horizontal–vertical illusion の研究（PMC6802759）](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC6802759/)（2026-09-18 取得）。"the thickness of a horizontal line is overestimated in relation to that of a vertical line"

## FORM-07 サイズごとに線幅を変える

- 種別: ブランド規約（Material Symbols の値）
- 適用場面: 1 つの SVG を複数のサイズで使うとき
- 指針: 小さいサイズでは線幅を相対的に太く、大きいサイズでは細くする。
- 理由: 線形に拡縮すると、小サイズで線が細すぎ、大サイズで太すぎる。
- 良い例: 密な形だけ 2 を 1.5 に落とす。
- 悪い例: 48px 用の線幅のまま 16px で潰れる。
- 修正方法: サイズごとに版を持つか、密な部分だけ細くする。
- 出典: [Material Symbols](https://developers.google.com/fonts/docs/material_symbols)（2026-09-18 取得）。"Optical sizes range from 20dp to 48dp."

## FORM-08 単色で成立させてから色を足す

- 種別: 知覚原則（WCAG 2.1 の規格）
- 適用場面: 配色の前のレビュー、状態を表す図形
- 指針: 黒 1 色で判別できる形にしてから色を足す。意味を持つ図形は隣接色と 3:1 以上を確保し、色だけで情報を伝えない。
- 理由: 色覚の多様性と単色の印刷や反転で、色の差は失われる。
- 良い例: 黒 1 色で ON と OFF を形で区別できる。
- 悪い例: 塗りの色だけで ON と OFF を区別する。
- 修正方法: 黒 1 色で描き、形か記号で差を出してから色を足す。
- 出典: [WCAG 2.1 Understanding 1.4.11](https://www.w3.org/WAI/WCAG21/Understanding/non-text-contrast.html)（2026-09-18 取得）。"Ensure meaningful visual cues achieve 3:1 against the background." / [Understanding 1.4.1](https://www.w3.org/WAI/WCAG21/Understanding/use-of-color.html)

## FORM-09 大きさの差で重要度を示す

- 種別: 知覚原則
- 適用場面: ロゴの構図、複数の要素を持つイラスト
- 指針: 最も重要な要素を最大にし、中心軸の両側で視覚的な量を等しくする。対称でなくてよいが、偏ると不安定に見える。
- 理由: 相対的な大きさは、重要度と順位を伝える。
- 良い例: 主役を最大にし、軽い側に小さな要素を対置する。
- 悪い例: 全要素が同じ大きさで、右に偏る。
- 修正方法: 最重要の要素を拡大し、軽い側に要素を足すか、重い側を削る。
- 出典: [NN/g: The Principles of Visual Design](https://www.nngroup.com/articles/principles-visual-design/)（2026-09-18 取得）。"Using relative size to signal importance and rank in a composition."

## FORM-10 近接、類同、閉合を使う

- 種別: 知覚原則（ゲシュタルト）
- 適用場面: ロゴの負の空間、輪郭の省略、要素の間隔
- 指針: 近い要素は同じ群、似た要素は関連として知覚される。人は欠けた輪郭を補うので、線を閉じずに形を示せ、負の空間も図になる。
- 理由: 知覚は個々の線ではなく、まとまりとして形を捉える。
- 良い例: 円の一部を欠いても円に見える。負の空間に別の形を潜ませる。
- 悪い例: 無関係な要素が近接して 1 塊に見える。
- 修正方法: 群にする要素だけ近づけ、他は離す。欠けは 1 か所にとどめる。
- 出典: [NN/g: The Principle of Closure](https://www.nngroup.com/articles/principle-closure/)（2026-09-18 取得）。"people will fill in blanks to perceive a complete object" / [NN/g: Proximity](https://www.nngroup.com/articles/gestalt-proximity/)

## FORM-11 曲線の接続で接線を揃える

- 種別: 経験則（活字設計ツールの手引き）
- 適用場面: path の手書き、円弧と直線の接続
- 指針: 曲線の接続点では接線と曲率を連続させ、上下左右の極点にノードを置く。
- 理由: 接線が不連続だと、接続点が折れ目に見える。
- 良い例: 円弧から直線へ、接線が同じ向きで続く。
- 悪い例: 制御点の向きがずれて、滑らかなはずの曲線が折れる。
- 修正方法: 極点にノードを置き、接続点で制御点を一直線にする。SVG では `A` と `L` の接続点で接線が一致するかを確かめる。
- 出典: [Glyphs Handbook: Editing paths](https://handbook.glyphsapp.com/editing-paths/)（2026-09-18 取得）。"At the node, the two segments share the same tangent line and curvature radius."

## 相反する指針と注意点

- IBM は角度を 45° と 15° 刻みに限り、Material 1 は幾何形状のみで補正する。角度の規則は 1 組ごとに決める。
- 線幅の統一（FORM-03）と小サイズの細線化（FORM-07）は衝突する。例外は密な形に限り、記録に残す。
- 黄金比や既存システムの数値は、説明や一貫性の道具であり、品質の根拠ではない（`LOGO-10` を参照）。
