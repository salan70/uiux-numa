# ロゴ

シンボルマークと wordmark の知識。
共通の造形は `skills/crafting-svg/references/foundations.md` にある。
この Skill の MVP では `<text>` を扱わないため、wordmark は path で描くか、利用画面の HTML テキストで組む。

## LOGO-01 核となる要素 1 つを面で表す

- 種別: ブランド規約（Apple HIG）
- 適用場面: マークの設計の初期、アプリアイコン化
- 指針: マークは核となる要素 1 つを最小限の面で表す。細い線と鋭角は縮小で潰れるので避け、文字は原則入れない。
- 理由: 単純なマークほど理解と認識が早い。
- 良い例: 2〜3 個の面で成立するマーク。
- 悪い例: 細い線の多要素のイラストに、アプリ名を添える。
- 修正方法: 要素を 1 つに絞り、線を面に置き換え、文字を外す。
- 出典: [Apple HIG App icons](https://developer.apple.com/design/human-interface-guidelines/app-icons)（2026-09-18 取得）。"Simple icons tend to be easiest for people to understand and recognize."

## LOGO-02 無名ブランドでは扱う対象を示す

- 種別: 知覚原則（査読研究）
- 適用場面: 新しいアプリのロゴの方向の決定
- 指針: 無名のブランドでは、扱う対象を示す descriptive なロゴが処理しやすく、真正性の印象と評価を高める。既知のブランドでは効果が薄れ、負の連想がある業種では逆転する。
- 理由: 対象を想起できると、処理の流暢さが上がる。
- 良い例: 家計簿アプリに硬貨のモチーフ。
- 悪い例: 抽象図形だけの新規ロゴ。
- 修正方法: 対象を想起させる要素を 1 つ加える。
- 出典: [Luffarelli, Mukesh, Mahmood (2019) Journal of Marketing Research](https://doi.org/10.1177/0022243719845000)（要旨を 2026-09-18 取得）。"more (vs. less) descriptive logos are easier to process and thus elicit stronger impressions of authenticity, which consumers value"

## LOGO-03 対称性を性格に合わせる

- 種別: 知覚原則（査読研究）
- 適用場面: マークの構図の決定
- 指針: 非対称なロゴは覚醒度が高く、刺激的な性格と合う。落ち着きや信頼を狙うなら効果はないので、性格に合わせて対称性を決める。
- 理由: 非対称は動きと興奮の知覚を生む。
- 良い例: 遊びのアプリに傾いた動的なマーク。
- 悪い例: 金融アプリに非対称のマーク。
- 修正方法: 意図する性格に合わせて、対称軸の有無を決め直す。
- 出典: [Luffarelli, Stamatogiannakis, Yang (2019) Journal of Marketing Research](https://doi.org/10.1177/0022243718820548)（要旨を 2026-09-18 取得）。"compared with symmetrical logos, asymmetrical logos tend to be more arousing, leading to increased perceptions of excitement"

## LOGO-04 単純にしすぎない

- 種別: 知覚原則（査読研究）
- 適用場面: 単純化しすぎのレビュー
- 指針: 単純なロゴは短期の認識に有利だが、露出が増えると複雑なロゴのほうが認識と態度が伸びる。識別の手がかりになる固有の要素を 1 つ残す。
- 理由: 固有の要素がないと、他の汎用図形と区別できない。
- 良い例: 単純な輪郭に固有のひねりが 1 つある。
- 悪い例: 円と正方形だけの汎用図形。
- 修正方法: 対象と結び付く固有の要素を 1 つ足す。
- 出典: [van Grinsven & Das (2016) Journal of Marketing Communications](https://repository.ubn.ru.nl/bitstream/handle/2066/124095/124095.pdf?sequence=1)（2026-09-18 取得）。"suggesting short-term benefits for simple brand logos, and long-term benefits for complex logos" / [Henderson & Cote (1998) Journal of Marketing](https://doi.org/10.1177/002224299806200202)（要旨。"moderately elaborate" を推奨）

## LOGO-05 lockup を基本形にする

- 種別: ブランド規約（GitHub、Spotify）
- 適用場面: ロゴのバリエーションの定義
- 指針: マーク + wordmark の lockup を基本形にし、マーク単独はブランドが確立された場所だけで使う。wordmark 単独は許可しない。
- 理由: 無名のうちはマークだけでは名前と結び付かない。
- 良い例: LP は lockup、アプリ内はマーク単独。
- 悪い例: 外部の媒体でマークだけを使う。
- 修正方法: 横組みの lockup を主、マーク単独を条件付きの副と定義する。
- 出典: [GitHub Logos](https://github.com/logos)（2026-09-18 取得）。"We use the lockup, featuring the invertocat and wordmark, in most places." / [Spotify Design Guidelines](https://developer.spotify.com/documentation/design)（2026-09-18 取得）。"While the icon can exist without the wordmark, the wordmark should never exist without the icon."

## LOGO-06 clear space と最小サイズを数値で定める

- 種別: ブランド規約（Spotify の値）
- 適用場面: ガイドラインの数値の決定、配置のレビュー
- 指針: clear space と最小サイズを数値で定める。Spotify の値は clear space がアイコン高さの 1/2、最小サイズがロゴ 70px、アイコン 21px。
- 理由: 余白の単位をマーク自身の寸法にすると、拡縮しても比率が保たれる。
- 良い例: マークの一部の寸法を単位にした余白。
- 悪い例: 他の要素がロゴに接する。
- 修正方法: 単位 x を決めて余白を定義し、最小サイズ未満を禁止する。
- 出典: [Spotify Design Guidelines](https://developer.spotify.com/documentation/design)（2026-09-18 取得）。"The exclusion zone is equal to half the height of the icon (marked as × in the diagram)."

## LOGO-07 白黒 1 色で設計を始める

- 種別: 経験則
- 適用場面: マークの評価の順序、header と favicon への展開
- 指針: 最初に白黒 1 色で設計し、反転と切手サイズで成立してから色を加える。縮小時は wordmark を落とす段階（横組み、縦積み、マーク単独）を用意し、favicon は 32px を基準に 16px で崩れるなら専用版を作る。
- 理由: 単色と縮小で成立しないマークは、利用場面の多くで破綻する。
- 良い例: 単色版が単独で成立し、幅に応じて要素を落とす。
- 悪い例: グラデーションの境界に頼ったマークを一様に縮小する。
- 修正方法: グラデーションの境界を実線か負の空間に置き換え、要素を削る順を定義する。
- 出典: [Smashing Magazine: Vital Tips For Effective Logo Design](https://www.smashingmagazine.com/2009/08/vital-tips-for-effective-logo-design/)（2026-09-18 取得）。"One way to create a versatile logo is to begin designing in black and white." / [Smashing Magazine: Logo Design for Responsive Websites](https://www.smashingmagazine.com/2016/04/logo-design-responsive-websites/) / [Evil Martians: How to Favicon](https://evilmartians.com/chronicles/how-to-favicon-in-2021-six-files-that-fit-most-needs)

## LOGO-08 負の空間にも形を与える

- 種別: 知覚原則（ゲシュタルトの閉合）
- 適用場面: マークの造形、モチーフの隠し込み
- 指針: 負の空間は閉合により、少ない要素で形を伝える。負の形にも正の形と同じ注意を払い、正負の境界を明確にする。
- 理由: 人は欠けた輪郭を補い、負の空間を図として読む。
- 良い例: FedEx の E と x の間の矢印。
- 悪い例: 負の形が曖昧で、縮小時に消える。
- 修正方法: 負の形を独立した図として抜き出し、単独で読めるか確かめる。
- 出典: [Smashing Magazine: Principles of Closure and Figure/Ground](https://www.smashingmagazine.com/2016/05/improve-your-designs-with-the-principles-of-closure-and-figure-ground-part-2/)（2026-09-18 取得）。"Look at the negative space just as much as the positive space to discover interesting forms"

## LOGO-09 アプリアイコンの safe zone を守る

- 種別: ブランド規約（Android と Web App Manifest の値）
- 適用場面: アプリと PWA のアイコンの書き出し
- 指針: Android の adaptive icon は 108dp 四方で作り、ロゴは中央 66dp 以内に収める。外周はマスク用。PWA の maskable icon の safe zone は中心から半径 40%。
- 理由: 外周はプラットフォームのマスクで切り取られる。
- 良い例: 前景と全面塗りの背景を分離する。
- 悪い例: 角まで要素が届く一枚絵。
- 修正方法: 前景と背景を分け、前景を 66/108 に縮める。
- 出典: [Android: Adaptive icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)（2026-09-18 取得）。"It must not exceed 66x66 dp, because the inner 66x66 dp of the icon appears within the masked viewport." / [web.dev: Maskable icons](https://web.dev/articles/maskable-icon)

## LOGO-10 黄金比の作図を根拠にしない

- 種別: 経験則（黄金比への批判は査読論文）
- 適用場面: 作図の根拠のレビュー
- 指針: 黄金比や円の作図は説明用で、品質の根拠にならない。グリッドは一貫性の道具にとどめ、見た目の重さが揃わないなら作図より視覚的な補正を優先する。
- 理由: 芸術や設計における黄金比の主張の多くは、誤りか誤解を招く。
- 良い例: 円と正方形の見た目の大きさを揃える。
- 悪い例: 黄金比の螺旋を後付けして説明する。
- 修正方法: 作図線を外し、16px と 1 色で見比べて形を手で補正する。
- 出典: [Markowsky (1992) Misconceptions about the Golden Ratio](https://eric.ed.gov/?id=EJ445071)（2026-09-18 取得）。"much of what is presented with respect to the golden ratio in art, architecture, literature, and aesthetics is false or seriously misleading"

## 相反する指針と注意点

- 「ロゴは事業内容を説明しなくてよい」という意見は LOGO-02 と対立する。査読研究は無名のブランドに限り descriptive を支持するので、新規の個人開発では LOGO-02 を優先する。
- 「単純」は万能ではない。LOGO-04 のとおり露出が増えると複雑さが効く。
- LOGO-06 と LOGO-09 の数値は各システムの値であり、自分のプロダクトでは単位を決め直す。
