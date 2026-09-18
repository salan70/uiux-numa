# アイコン

UI アイコンの知識。
共通の造形は `skills/crafting-svg/references/foundations.md` にあり、ここには重複を書かない。
数値はデザインシステムごとに異なる。値は「そのシステムの値」として書き、1 組の中で 1 つの値に統一することが本質である。

## ICON-01 ラベルを常時表示する

- 種別: 知覚原則（NN/g のユーザー調査）
- 適用場面: ナビゲーション、ツールバー、単独のアイコンボタン
- 指針: アイコンには常に見えるテキストラベルを併記する。hover で出すラベルは不可。ラベルなしで通じるのは home、print、検索の虫眼鏡など少数。
- 理由: 同じアイコンでも意味は文脈で揺れ、利用者は推測を強いられる。
- 良い例: 時計のアイコンに「履歴」のラベルを添える。
- 悪い例: 時計のアイコンだけで履歴を表す。
- 修正方法: ラベルを常時表示にする。幅がなければアイコンを減らす。
- 出典: [NN/g: Icon Usability](https://www.nngroup.com/articles/icon-usability/)（2026-09-18 取得）。"text label must be present alongside an icon" / "Icon labels should be visible at all times"

## ICON-02 形が分かることと意味が分かることを分ける

- 種別: 知覚原則（NN/g）
- 適用場面: 新しい比喩の選定、既存アイコンのレビュー
- 指針: 「形が分かる（recognizability）」と「意味が分かる（interpretation）」は別物で、両方を確かめる。比喩は既知の対応（封筒 = メール）を使い、参照関係を引き延ばした比喩は避ける。5 秒で思いつかない比喩はアイコン化を諦める。
- 理由: 単純な物でも、利用者が同じ意味に結び付けるとは限らない。
- 良い例: 封筒でメールを表す（似姿による対応）。
- 悪い例: 時計で閲覧履歴を表す（参照の引き延ばし）。
- 修正方法: 既知の対応を持つ比喩に差し替える。なければテキストにする。
- 出典: [NN/g: How to Test Digital Icons](https://www.nngroup.com/articles/how-to-test-digital-icons/)（2026-09-18 取得）。"Don't assume that simple objects will always be easily recognized" / [NN/g: Classifying Icons](https://www.nngroup.com/articles/classifying-icons/)。"the analogy has been stretched too far"

## ICON-03 正面か真横から、細部を削って描く

- 種別: 知覚原則（NN/g、IBM、Material 1 が一致）
- 適用場面: 16px と 24px で使う UI アイコン全般
- 指針: 対象の基本的な特徴だけを図式的に描く。遠近、立体、傾きを使わず、正面か真横から描く。
- 理由: 細部と遠近は小サイズで判別できず、シルエットを崩す。
- 良い例: 正面から見た封筒。
- 悪い例: 斜め上から見た立体の箱に影を付ける。
- 修正方法: 視点を正面か側面に戻し、識別に不要な線を消す。
- 出典: [IBM Design Language: UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/)（2026-09-18 取得）。"avoid dimensional or perspective-based representations" / [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"Don't tilt, rotate, or make icons appear dimensional."

## ICON-04 グリッドと padding を 1 つ選ぶ

- 種別: ブランド規約（各システムの値）
- 適用場面: viewBox と余白の決定
- 指針: 制作グリッドと live area はシステムごとに異なる。Material 1: 24dp、live area 20dp。IBM: 32px、padding 2px。Octicons: 16px と 24px。Lucide と Feather: 24px（Lucide は safe zone 1px）。Atlassian と Phosphor: 16px。1 組では 1 つを選ぶ。
- 理由: グリッドが揃わないと、同じ組の中で大きさと余白がばらつく。
- 良い例: viewBox 24 で、描画を 20×20 に収める。
- 悪い例: 線が viewBox の端に接している。
- 修正方法: 対象システムのグリッドを 1 つ選び、padding の内側に収める。
- 出典: [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"Icon content is limited to the 20dp x 20dp live area, with 4dp of padding around the perimeter." / [IBM UI icons](https://www.ibm.com/design/language/iconography/ui-icons/design/)。"The grid contains 2px padding." / [Lucide: Icon design principles](https://lucide.dev/contribute/icons/design-principles)（2026-09-18 取得）

## ICON-05 線幅を 1 組で統一する

- 種別: ブランド規約（各システムの値）
- 適用場面: stroke-width の指定、密な形状の細部
- 指針: 1 つのアイコン内でも 1 組の中でも線幅を混ぜない。値はシステム固有。Material 1: 2dp（24dp）。IBM: 2px（32px）。Lucide: 2px（24px）。Octicons: 1.5px（16px と 24px で共通）。Atlassian: 1.5px（16px）。
- 理由: 線幅の統一が、組としての一体感を作る。
- 良い例: 全 path が同じ stroke-width。
- 悪い例: 外形は 2px、内部の細部は 1px。
- 修正方法: 細部を減らして基準の線幅で描く。Material 1 は複雑な形でのみ 1.5dp を許す。
- 出典: [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"Consistent stroke weights are key to unifying the overall system icon family." / [Octicons design guidelines](https://primer.style/octicons/design-guidelines/)（2026-09-18 取得）。"Use a consistent stroke width of 1.5px for both 16px and 24px icons."

## ICON-06 keyline で見かけの大きさを揃える

- 種別: 知覚原則（keyline の値はブランド規約）
- 適用場面: 新しいアイコンの大きさ決め、1 組の整合のレビュー
- 指針: 円、正方形、長方形の keyline を基準に、幾何学的な大きさではなく見かけの大きさを揃える。Material 1 の値は正方形 18dp、円 20dp、長方形 20×16dp。重さが偏る形は、重い側に寄せて視覚的に中央に置く。
- 理由: 同じ bounding box でも、円は正方形より小さく、細い形は軽く見える。
- 良い例: 丸い時計は円の keyline いっぱい、四角いカレンダーは一回り小さい正方形。
- 悪い例: 全アイコンを bounding box いっぱいに拡大し、円が小さく見える。
- 修正方法: 円と正方形の基準アイコンと並べて描画し、明暗の量が揃うまで拡縮する。
- 出典: [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"By using these core shapes as guidelines, you can maintain a consistent visual proportion" / [IBM UI icons usage](https://www.ibm.com/design/language/iconography/ui-icons/usage/)（2026-09-18 取得）。"Visually center an icon where the visual weight is heaviest."

## ICON-07 端点と角を 1 種類に統一する

- 種別: ブランド規約（各システムの値）
- 適用場面: stroke-linecap、stroke-linejoin、角丸の指定
- 指針: 端点（cap）、接合（join）、角丸は 1 組で 1 種類にする。Material 1 と IBM と Atlassian は角張った端点、Octicons と Lucide は丸い端点。
- 理由: 端点の混在は、同じ線幅でも別の組に見える。
- 良い例: SVG のルートで linecap と linejoin を一括指定する。
- 悪い例: 同じアイコンの中に round と butt が混在する。
- 修正方法: 選んだ cap と join に揃え、path 個別の上書きを消す。
- 出典: [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"Do not round the corners of strokes (shapes 2dp wide or less)." / [Atlassian Iconography](https://atlassian.design/foundations/iconography)（2026-09-18 取得）。"End points should be squared off, not rounded." / [Octicons design guidelines](https://primer.style/octicons/design-guidelines/)。"Use round caps and joins."

## ICON-08 隙間の最小値を守る

- 種別: ブランド規約（小サイズの識別の知覚に基づく）
- 適用場面: 斜線やバッジ付きのアイコン、密な内部構造
- 指針: 要素間と内部の隙間に最小値を設ける。Lucide: 2px（2px の円が入るかで検査）。Octicons: 修飾要素の周囲 1.5px。Polaris: 1px 未満は不可。
- 理由: 隙間が線幅より狭いと、小サイズで塗り潰れる。
- 良い例: 斜線と本体の間に 1.5px の切り欠きがある。
- 悪い例: 線同士が 0.5px で接し、16px で潰れる。
- 修正方法: 隙間に基準径の円を置いて重なりを確かめ、足りなければ要素を削る。
- 出典: [Octicons design guidelines](https://primer.style/octicons/design-guidelines/)（2026-09-18 取得）。"Use a 1.5px gap around modifier elements, like lines and arrows." / [Polaris: Creating icons](https://raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/design/icons/creating-icons.mdx)（2026-09-18 取得）。"The minimum gap between strokes should never be less than 1px."

## ICON-09 座標をピクセルに整列する

- 種別: 知覚原則（低密度ディスプレイでのにじみ）
- 適用場面: path 座標の最終調整、最適化後のレビュー
- 指針: 座標は整数に置き、形の外縁をピクセルの境界に合わせる。1.5px の線は片側だけを整列させる。光学的な調整の例外は 0.25px 刻み（Polaris の値）。
- 理由: ピクセルの境界にかかる線は、2 ピクセルにまたがってぼやける。
- 良い例: 2px の線を x=4〜6 に置く。
- 悪い例: 中心 x=4.5 の 1px の線がぼける。
- 修正方法: 外縁を整数座標へ移し、ずれは内縁側に寄せる。
- 出典: [Material Design 1 Icons](https://m1.material.io/style/icons.html)（2026-09-18 取得）。"meaning the X and Y coordinates are integers and do not contain decimals" / [Octicons design guidelines](https://primer.style/octicons/design-guidelines/)。"Align the outer edge of shapes to pixel boundaries when possible." / [Polaris: Creating icons](https://raw.githubusercontent.com/Shopify/polaris/main/polaris.shopify.com/content/design/icons/creating-icons.mdx)。"one side of the stroke should always be aligned with the pixel grid"

## ICON-10 塗りは状態に限る

- 種別: ブランド規約（Apple、Polaris、Fluent、Material Symbols が一致）
- 適用場面: タブバー、ナビゲーション、トグル、選択状態
- 指針: 既定は線（outlined）で、塗り（filled）は選択などの状態に限る。
- 理由: 塗りは強調として機能するため、理由なく使うと階層が崩れる。
- 良い例: 選択中のタブだけ塗りにする。
- 悪い例: 目立たせたい理由だけで塗りのアイコンを使う。
- 修正方法: 線に戻し、状態にだけ塗りを割り当てる。塗り版は線版と見かけの重さを揃える。
- 出典: [Apple HIG SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)（2026-09-18 取得）。"use the fill variant to indicate selection" / [Fluent 2 Iconography](https://fluent2.microsoft.design/iconography)（2026-09-18 取得）。"Filled theme icons are used for highlighting selected states"

## ICON-11 サイズごとに版を用意する

- 種別: ブランド規約（Octicons、Material Symbols、IBM、Fluent、Apple の値）
- 適用場面: 複数サイズでの提供、16px 向けの簡略版
- 指針: 線形の拡縮に頼らず、表示サイズごとに版を用意する。Octicons: 16px と 24px の 2 版。Material Symbols: optical size 20〜48dp で線幅が変わる。IBM: 16/20/24/32px で線幅 1/1.25/1.5/2px。囲み形は小サイズで可読性を上げる。
- 理由: 24px 版を縮めると線幅と隙間が最小値を割る。
- 良い例: 16px 版で内部の細部を落とす。
- 悪い例: 24px 版を縮めて線幅が 1.33px になる。
- 修正方法: 対象サイズで別に描き、隙間の最小値と線幅を満たす。
- 出典: [Octicons design guidelines](https://primer.style/octicons/design-guidelines/)（2026-09-18 取得）。"Always design two versions of each icon: a 16px version and a 24px version." / [Apple HIG SF Symbols](https://developer.apple.com/design/human-interface-guidelines/sf-symbols)。"Symbols that use an enclosing shape — like a square or circle — can improve legibility at small sizes."

## 相反する指針と注意点

- 端点は Material 1、IBM、Atlassian が角張った cap、Octicons、Lucide、Polaris が丸い cap を使う。値は普遍解ではなく、1 組で混ぜないことが本質である。
- 小サイズの線幅は、IBM が線形に細く、Octicons が 1.5px 固定、Material Symbols が光学サイズで連続調整と分かれる。
- IBM はアイコンに文字と同じ 4.5:1 のコントラストを求める。WCAG の非テキストは 3:1 で、基準はシステムごとに異なる。
