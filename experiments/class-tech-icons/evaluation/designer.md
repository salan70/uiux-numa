# designer レビュー: 授業資料で使う技術アイコン

- 観点: designer
- 対象: line-round、line-square、solid、duotone
- 入力: README、variants/、previews/、docs/evaluation.md
- 担当した軸: consistency、visual hierarchy、brand fit
- 計測: 外形と濃さは preview 画像の画素から測った。濃さは枠あたりの平均インク量、または 96px の枠に占める着色画素の割合。

## 判定

| 軸               | line-round                                                                                 | line-square                                                                   | solid                                                                                                | duotone                                                                           |
| ---------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| consistency      | 良い: 8 個とも線幅 2 と round で揃い、24px の外形は 16〜20 に収まる                        | 許容: 描き方は揃うが terminal と web が同一の外枠を共有し、ai だけ 45° の菱形 | 課題あり: 24px の外形が 14〜22 とこの組で最も散り、開いた形と塊の重さ差が未解決                      | 課題あり: accent が 7 種類の形で面積が 4.1 倍まで開き、同じ役割に別表現が混在する |
| visual hierarchy | 良い: 20px と 24px で本文と見出しに従属し、96px の章扉では見出しの 1.31 倍                 | 許容: ページでは従属するが、96px の章扉が見出しの 1.10 倍で主役になりきらない | 課題あり: 20px でラベルの 1.69 倍、24px で見出し文字の 1.9 倍と競合する（96px は 1.95 倍で最も強い） | 課題あり: ページ唯一の赤が装飾の細部に付き、96px の章扉は見出しの 0.97 倍         |
| brand fit        | 良い: 丸い端点が本文の重さに馴染み、キャレット入りの山括弧と凹んだ星に既製にない造形がある | 許容: 違和感はないが製図の調子で、web と code の比喩は既製の定番そのもの      | 課題あり: 比喩が既製の定番で揃い、塗りの重さがページを道具の画面に寄せる                             | 許容: 独自性は最も高いが、赤が 3 か所で警告に読め、資料の既存の赤と役割が衝突する |

## 観察

### line-round

- 8 個とも `stroke-width="2"`、`stroke-linecap="round"`、`stroke-linejoin="round"` を宣言し、塗りの例外は `part-ai-spark` の 1 要素だけである（`variants/line-round/source/*.svg`）。
- 24px での外形は幅 16〜20、高さ 16〜20 に収まり、4 案で最も散りが小さい（`previews/compare-final-24.png`）。
- 濃さは code 35.9 から web 78.9 まで 2.2 倍開く。web は 32px の箇条書きでも 79.2 と隣の code 35.5 の 2.2 倍で、全サイズで最も濃い（`previews/compare-final-24.png`、`previews/line-round-final-in-context.png`）。
- サイドバーの 20px では、アイコンとラベルが同じ `--vp-text-2` で描かれ、アイコンの濃さはラベルの平均 1.44 倍にとどまる。8 行のうち branch は 1.03、api は 1.06 で、ラベルとほぼ同じ重さである（`previews/line-round-final-in-context.png`、`variants/line-round/mock.css`）。
- 見出しの 24px では、`今回の目標` の見出し文字 64.3 に対しアイコン 45.2 で明確に従属する。`準備` の行はアイコン 45.0 に対し文字 33.0 だが、文字数が 2 字で枠内の余白が多いための差であり、目視では見出しが先に読める（`previews/line-round-final-in-context.png`）。
- 96px の章扉では、アイコンの濃さ 84.7 が見出し `API と通信` の 64.4 の 1.31 倍で、アイコン、章番号、見出しの順に視線が流れる（`previews/line-round-final-in-context.png`）。
- `code` は `</>` でも `<>` でもなく、山括弧の間にキャレットを 1 本立てる（`variants/line-round/source/code.svg` の `part-code-caret`）。`ai` は制御点を中心に置いた凹む 4 点星で、直線の星ではない（`source/ai.svg` の `M11 5Q11 13 19 13`）。この 2 つが既製のアイコン集との差になっている。
- 一方 `branch`（幹と 3 ノード）と `web`（円と経線 1 本の地球儀）は既製の定番に近い。組全体では「見覚えはあるが同じではない」位置にある（`previews/compare-final-96.png`）。
- terminal の外枠は 24px で 20×18、code と api は 20×16 で、縦に 2 単位の差がある。目視では気づかない範囲だった（`previews/compare-final-24.png`）。

### line-square

- 描き方のパラメータは 8 個で揃い、`butt` と `miter`、線幅 2 を全ファイルが宣言する（`variants/line-square/source/*.svg`）。
- `terminal` と `web` が完全に同じ外枠 `rect x="3" y="4" width="18" height="16"` を共有する（`variants/line-square/source/terminal.svg`、`source/web.svg`）。サイドバーの 20px では `準備` と `ブラウザと Web` が同寸の正方形として並び、輪郭だけでは見分けがつかない（`previews/line-square-final-in-context.png`）。
- `ai` だけが 45° に回した菱形で、24px の外形 20×20 は組で最大である。回転した形はこの 1 個だけで、系統から浮く（`previews/compare-final-24.png`、`previews/compare-final-96.png`）。
- `code` の `{}` は 96px で着色画素 17.0% と、terminal 29.1%、web 30.2% のおよそ半分である。外形の幅も 68 と組で小さい部類で、96px のシートでは隣より一段小さく見える（`previews/compare-final-96.png`）。
- 20px のサイドバーではアイコンがラベルの平均 1.45 倍にとどまり、line-round と同じ水準で従属する（`previews/line-square-final-in-context.png`）。
- 96px の章扉では、アイコンの濃さ 70.9 に対し見出しが 64.4 で、比は 1.10 にとどまる。`butt` の端点が丸い端点より各端で 1 単位短いぶん矢印が痩せ、章扉ではアイコンと見出しがほぼ同じ重さで並ぶ（`previews/line-square-final-in-context.png`）。
- 32px の箇条書きでは branch 54.3 に対し code 37.1 で 1.5 倍の差があり、行の強弱が文言ではなくアイコンで決まる（`previews/line-square-final-in-context.png`）。
- 端点は直角、角は 90° の miter、斜線は 45° 固定、branch のノードは正方形という組み合わせで、調子は製図や回路図に近い。4 案の中では学生向けの柔らかさから最も遠い（`previews/compare-final-96.png`）。
- `web` のブラウザ窓と `code` の `{}` は、その意味に対して既製の組が最もよく使う形である。`ai` の菱形は珍しいが、README も記録するとおり「生成」より「宝石」に読める（`previews/line-square-final-sheet.png`）。

### solid

- 塗りの規則（正の棒 4、負の空間 2、外形の角丸 2）は 8 個で一貫して適用されている（`variants/solid/source/*.svg` のコメントと座標）。
- その一方で仕上がりの見かけの大きさが揃っていない。24px の外形は幅 14〜22、高さ 14〜20 で、`api` 22×20 に対し `database` 14×16、`terminal` 18×14 である。外形面積の最大と最小の比は 1.96 で、他の 3 案の 1.56〜1.59 より大きい（`previews/compare-final-24.png`）。
- 濃さも 24px で ai 38.2 から terminal 85.7 まで開く。README 自身が「開いた形と塊の見かけの重さは完全には揃わず、塗りの語彙では原理的に残る差として許容した」と記録しており、未解決のまま残っている（README の solid 節）。
- 20px のサイドバーでは、アイコンがラベルと同じ色でありながら濃さはラベルの平均 1.69 倍で、terminal 2.46 倍、test 2.76 倍に達する。目線がラベル列よりアイコン列に先に落ちる（`previews/solid-final-in-context.png`）。
- 見出しの 24px では、`準備` のアイコン 62.5 に対し見出し文字 33.0、`演習` のアイコン 56.2 に対し文字 31.0 である。目印が、目印を付ける対象より重い（`previews/solid-final-in-context.png`）。
- 96px の章扉では逆に最も強く、アイコン 125.5 は見出し 64.4 の 1.95 倍で、4 案で唯一はっきり主役になる。96px の 8 個平均の着色画素も 29.1% で最大である（`previews/solid-final-in-context.png`、`previews/compare-final-96.png`）。
- 比喩が既製の定番とほぼ一致する。`code` は `<>`、`test` はチェック付きクリップボード、`ai` は大小 2 つのきらめき、`api` は向かい合う 2 本の矢印、`web` は塗りの地球儀である。README も `code` について「比喩そのものが既製と同じで固有性が低い」と記録している（`previews/compare-final-96.png`、README の solid 節）。
- `branch` は 24px と 20px で小文字の h に近い塊になる。README も未解決として残している（`previews/solid-final-sheet.png` の 4 倍拡大）。
- 塗りの重さと既製の比喩が重なり、ページでは資料の一部ではなく道具の画面のツールバーを貼ったように見える（`previews/solid-final-in-context.png`）。

### duotone

- 線の側は line-round と同じパラメータで揃っている（`variants/duotone/source/*.svg`）。揺れているのは accent である。
- accent の形が役割 1 つに対して 7 種類ある。円（branch、database、web）、角丸正方形（terminal）、回した角丸の棒（code）、4 点星（ai）、三角（api）、裾一杯の塗り（test）である（`variants/duotone/source/*.svg`）。
- accent の面積が揃っていない。96px の枠に占める赤の割合は web / branch / database / ai が 2.26%、terminal 2.65%、api 2.73%、code 5.16%、test 9.29% で、最大が最小の 4.1 倍である（`previews/compare-final-96.png`）。
- 20px でも同じ比率が出る。サイドバー 8 行の赤の画素数は branch と web の 38 から test の 155 まで開く（`previews/duotone-final-in-context.png`）。
- accent が指すものも揃っていない。位置や節を指すもの（terminal のカーソル、branch の分岐点、web の節）、量や中身を指すもの（test の試料、database のレコード）、向きを指すもの（api の矢じり）、意味を持たない飾り（code の斜線）が混在する（`variants/duotone/source/*.svg` のコメント）。
- 24px の濃さの散りは 29.3（api）から 79.4（web）で 2.71 倍と、4 案で最大である（`previews/compare-final-24.png`）。
- ドキュメントページには赤が 1 画素もない。line-round、line-square、solid のページ領域の赤は 0 画素、duotone は 838 画素で、すべてアイコン由来である。ページで最も彩度の高い色が、見出しでも状態でもリンクでもなく、アイコンの細部に付く（`previews/*-final-in-context.png`、`variants/duotone/mock.css`）。
- サイドバーの赤 8 点は横 13px（2 倍画像で x 144〜170）の帯に収まり、項目名の左に赤い縦列を作る。現在項目はブランド青で描かれるため、現在地を示す青と意味を持たない赤 8 点が同じ列で競合する（`previews/duotone-final-in-context.png`）。
- 24px の `演習` では、アイコン 43.4 に対し見出し文字 31.0 である。赤い液体が入ったフラスコは、テストより先に警告として読める（`previews/duotone-final-in-context.png`）。
- 96px の章扉ではアイコンの濃さ 62.5 が見出し 64.4 を下回り、比は 0.97 である。duotone の `api` は 96px の 32 セルの中で着色画素 13.0% と最も薄い。章扉でアイコンが主役にならない（`previews/duotone-final-in-context.png`、`previews/compare-final-96.png`）。
- 章扉では赤い矢じりのすぐ下に赤い `第 3 章` が並ぶ。同じ赤が、章番号という意味を持つ役割と、矢印の一部という飾りの役割で 2 回使われる（`previews/duotone-final-in-context.png`）。
- 赤が警告に読める箇所が 3 つある。terminal のブロックカーソルは録画中の印、test の液体は危険物、api の赤い矢じりは失敗した方向に見える（`previews/duotone-final-sheet.png` の 96px）。
- 独自性は 4 案で最も高い。accent の置き場所が意味を持つ設計（分岐点、節、カーソル）は既製の組にない性格である（`variants/duotone/source/*.svg`）。

## 論点

- solid の 20px と 24px の重さを色で下げるか、造形で下げるかを決める必要がある。現状はアイコンがラベルの 1.69 倍、見出し文字の約 1.9 倍である。CSS で薄い色を与える、正の棒を 4 から 3 に細める、ページは線画・スライドは塗りと 2 組持つ、のいずれを取るかは利用者の判断による。
- duotone の赤を授業資料サイトのページでも使ってよいかを確認する必要がある。モックのページには赤がなく、実物の `class_document` がページで赤を使うかは未確認である。使わないなら、サイドバー 8 行に赤の縦列ができる副作用を受け入れるかどうかの判断がいる。
- duotone の accent の面積を揃えるかどうかは、比喩とのトレードオフになる。test の赤を他と同じ点に落とすと面積は揃うが、「試料が入ったフラスコ」という読みが弱まる。どちらを優先するかは利用者が決める。
- line-square の `terminal` と `web` が同一の外枠を共有する点を許容するかを決める必要がある。README も第三者による識別が未検証と記録している。片方の外形を変えると、角張った描き方で取れる選択肢が狭まる。
- 96px の章扉でアイコンを主役にするかを決める必要がある。line-square は見出しの 1.10 倍、duotone は 0.97 倍で、アイコンと見出しがほぼ同じ重さになる。章扉のレイアウトを保つなら、96px 専用に線幅を太らせた版を作るかどうかの判断がいる。README も 96px 専用の版は作っていないと記録している。
- 担当外の気づき: duotone の `#ce1126` は暗背景のスライドで輝度差が落ちる（`previews/duotone-final-sheet.png` の暗背景列）。暗テーマのスライドを使う予定があるなら accessibility の観点で判定が要る。
- 担当外の気づき: line-round の `web` は全サイズで最も濃く、24px で `code` の 2.2 倍である。サイドバー 8 行すべてにアイコンが付く構成で読みにくさにつながるかは information density の観点で判定してほしい。
- 担当外の気づき: solid の `branch` は 20px と 24px で小文字の h に近い塊になる。話題として読めるかは discoverability の観点で判定してほしい。
