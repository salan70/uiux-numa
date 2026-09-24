# implementation レビュー: 授業資料で使う技術アイコン

- 観点: implementation
- 対象: line-round、line-square、solid、duotone
- 入力: README、variants/、previews/、docs/evaluation.md
- 担当した軸: consistency、maintainability

## 判定

| 軸              | line-round                                                                                                                           | line-square                                                                                                               | solid                                                                                                                                            | duotone                                                                                                                                                            |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| consistency     | 良い: root 属性が 8 個で 1 文字も違わず、座標は 27 種すべて整数、part-\* 27 個すべてが 3 分節。dist は全 8 個で source と画素一致    | 良い: root 属性が 8 個で一致し、座標は 25 種すべて整数で 45° のみ。part-\* 24 個すべてが 3 分節。dist も全 8 個で画素一致 | 許容: root 属性は 8 個で一致するが、part-\* の粒度が 1〜5 個と開き、命名の分節数も 3 と 4 が混在する。座標の端数は 52 種ある                     | 許容: root と accent の規則は 8 個で守られるが、32 ファイル中ここだけが transform を持ち、README が宣言した「line-round と揃える」が geometry では成り立っていない |
| maintainability | 良い: 1 要素 1 役割で 9 個目の規則が「整数座標と root のコピー」に尽きる。ただし index.tsx:13 のコメントと terminal の rx が食い違う | 良い: 45° と miter 比という 9 個目の検査基準が明文化されている。keyline の値だけ README にない                            | 課題あり: terminal、database、web が 1 path 1 id で、プロンプトや溝や経線を単独で編集できない。9 個目は 45° 接合と円弧の端数を手で解くことになる | 許容: accent id が 8 個で揃い CSS 上書きが実際に効く。ただし上書きの実例が mock.css に 1 つもなく、branch では accent が幹の隙間を埋める geometry を兼ねる         |

## 観察

### 共通（4 案とも）

- `scripts/svg-optimize.sh` を 4 案 × 8 個の全 32 ファイルで再実行したところ、生成物は committed の `dist/*.svg` と 1 バイト単位で一致した（`nix develop -c just svg-optimize <source> <tmp>` を 32 回、diff は 0 件）。source と dist のドリフトは現時点で存在しない。
- 単色 3 案の dist を `just svg-check --mono --viewbox "0 0 24 24"` に、duotone の dist を `--viewbox` に通し、32 ファイルすべて error 0 件だった。
- source と dist を resvg で 384px（16 倍）に描き、PNG をバイト比較したところ 32 ファイルすべて完全一致した。SVGO が落とす属性は現状どれも描画に影響していない。
- `.pre-commit-config.yaml` の hook は oxfmt と markdownlint だけで、`.github/workflows` は存在しない。`svg-check` と `svg-optimize` は手動実行に依存する。dist の再生成漏れを機械が止める仕組みはない。
- `Mock.tsx` は同じアイコンをサイドバーと本文・スライドに 1 回ずつ、計 16 か所へ `dangerouslySetInnerHTML` で inline 展開する（Mock.tsx:33、45-50、56、61、69、78、86、90、94、98）。結果として `part-terminal-frame` などの id が 1 文書に 2 個ずつ重複する。CSS の `#id` セレクタは重複した要素すべてに当たるため見た目の上書きは効くが、`getElementById` と `querySelector` は最初の 1 個しか返さず、HTML としては不正である。
- `mock.css` は 4 案とも完全に同一で（`diff` で差分 0）、`#part-*` を参照する規則は 1 つもない。色の入口は `.ti-slide-list .ti-icon { color: var(--slide-primary) }`（mock.css:168-170）だけである。

### line-round

- 8 個の root がすべて `fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" role="img" viewBox="0 0 24 24"` で一致する（source/\*.svg の 1 行目）。要素側で `stroke-width`、`stroke-linecap`、`stroke-linejoin` を上書きしたものは 0 個である。
- 要素レベルの属性上書きは `part-ai-spark` の `fill="currentColor" stroke="none"` 1 か所だけで、README の「塗りは ai の小さい火花だけ」と一致する（source/ai.svg:6）。
- `d`、`cx`、`rx` などの数値は 27 種すべて整数で、0.5 刻みも小数もない。9 個目を足すときの座標規則が最も単純である。
- part-\* は 27 個で、`terminal` 3、`code` 3、`branch` 5、`database` 5、`api` 4、`test` 2、`ai` 2、`web` 3。すべて `part-<icon>-<role>` の 3 分節に収まる。`part-api-requesthead` のように役割名を連結して分節を増やさない書き方で統一されている。
- SVGO は `part-ai-star` の末尾の `Z` を落とす（source/ai.svg:4 の `…11 5Z` が dist で `…8 8` で終わる）。閉じ路の linejoin が 2 つの linecap に変わるが、cap と join がどちらも round のため 384px で画素一致した。将来 cap や join を変えると、この 1 個だけ source と dist の見た目がずれる。
- index.tsx:13 は「角丸 2」と書くが、実際の `part-terminal-frame` は `rx="3"`（source/terminal.svg:4）で、SVG 側のコメントは「角丸 3 で端点の丸さと揃える」と書いている。9 個目に角丸矩形を足す人がどちらを読むかで値が割れる。
- README は keyline を「円 20、正方形 18、横長 20×16」と記録するが、dist の stroke 込み bounding box を実測すると `terminal` 20×18、`database` 16×19、`test` 16×19、`branch` 17×19 で、宣言した 3 つのどれにも乗らない縦長の群が 4 個ある（previews/line-round-final-sheet.png の 96px 列でも縦長の 3 個が横に狭い）。見かけの大きさは揃っているが、文書化された keyline は 8 個を説明していない。

### line-square

- 8 個の root がすべて `stroke-linecap="butt" stroke-linejoin="miter"` を含めて一致する（source/\*.svg の 1 行目）。
- SVGO は dist で `stroke-linecap` と `stroke-linejoin` を落とす（dist/terminal.svg の root は `fill stroke stroke-width role viewBox` のみ）。butt と miter は SVG の初期値なので描画は変わらず、384px の画素比較でも 8 個すべて一致した。README の未解決欄の記述は実測と合っている。
- `z` は dist でも全 path に残る。line-round の `ai` と違い、閉じ路が開くケースは 1 つもない。
- 座標は 25 種すべて整数で、斜線は 45° のみ。README の「miter 比 1.41 は既定の miterlimit 4 に収まる」も、角が落ちていないことが previews/compare-final-96.png の `ai` と `database` で確認できる。
- part-\* は 24 個で、`code` 2、`database` 3、`web` 3 と、line-round より少ない代わりに 1 要素の担う範囲が広い。命名はすべて 3 分節で揃う。
- `terminal` と `web` が同じ `x="3" y="4" width="18" height="16"` の矩形を共有する（source/terminal.svg:4、source/web.svg:3）。座標の使い回しとしては一貫しており、枠の寸法を変えるときに 2 ファイルを同じ値で直せばよい。
- keyline の値が README にない。実測の bounding box は `api` 16.00×15.50 から `ai` 20.44×20.44 まで開く。`ai` が最大なのは 90° の miter が頂点を 1.41 外へ伸ばすためで、整数座標だけを守っても bbox は整数にならない。9 個目で miter の尖りを見落とすと組から飛び出す。

### solid

- 8 個の root がすべて `fill="currentColor" stroke="none" role="img" viewBox="0 0 24 24"` で一致する。stroke 系の属性を持たないので、線の規則を 8 個で揃える必要が最初からない。
- SVGO は dist で root の `stroke="none"` を落とす（dist/terminal.svg の root は `fill role viewBox` のみ）。単体の描画は初期値と同じで 384px の画素比較も一致した。ただし stroke は継承プロパティなので、外側が stroke を与える環境では結果が変わる。source と dist を `stroke="#ce1126" stroke-width="1"` の外側 svg に入れて描き分けたところ、dist だけが外の stroke を拾って別の絵になった。`mock.css` は stroke を与えないため現在の利用画面では差は出ないが、VitePress や Marp のテーマが `svg { stroke: … }` を持つと dist だけが崩れる。
- part-\* は 16 個で 4 案中最少。`terminal`、`database`、`web` は 1 ファイル 1 id で、負の空間を `fill-rule="evenodd"` の同じ `d` に埋め込んでいる（source/terminal.svg:7、source/database.svg:7、source/web.svg:7）。プロンプト記号だけ、溝だけ、経線だけを CSS や部分編集で触ることはできない。
- 一方 `branch` は 5 個に割れており（`part-branch-main`、`part-branch-fork`、`part-branch-node-head/tail/side`）、粒度が 1〜5 と icon ごとに大きく違う。
- 命名も `part-branch-node-head`、`part-branch-node-tail`、`part-branch-node-side`、`part-ai-spark-small` の 4 個が 4 分節で、残り 12 個の 3 分節と混在する。`part-<icon>-<role>` は満たすが、role の区切り方の規則が組の中で 1 つに決まっていない。
- `fill-rule="evenodd"` は 8 個中 4 個（terminal、database、test、web）にだけ付く。必要な場所に限った付け方だが、root へ上げられていないため 9 個目で付け忘れると切り抜きが塗り潰れる。
- 座標は整数 23 種、0.5 刻み 16 種、小数 2 桁 52 種。README の「整数か 0.5 刻み、45° の接合と円弧から生じる端数だけ小数 2 桁」という規則自体は実装と矛盾しないが、9 個目で同じ太さ 4・切り抜き 2・角丸 2 を保つには、接合点の端数を毎回手で解く必要がある。
- README の keyline（横長 20×14、円 r=9、縦長 14×18）に対し、実測は `terminal` 18×14、`branch` 17×20、`api` 21×19、`ai` 20×20 で、宣言の外にある形が 4 個ある。`api` は x が 1.50〜22.50 で、他の 7 個より live area の外へ 0.5 ずつ出ている。

### duotone

- 8 個の root が line-round と同じ 7 属性で一致する。
- accent は 8 個すべてが `part-<icon>-accent` の id と `fill="#ce1126" stroke="none"` を持ち、各アイコンにちょうど 1 個ずつ置かれている。README と Constraints の規則を 8 個で満たす唯一の色規則である。
- `#part-*-accent` による上書きは実際に機能する。dist/terminal.svg に `#part-terminal-accent{fill:#002d62}` を注入して描き直すと描画が変わった。presentation 属性より CSS 規則が優先されるためで、`var()` を使わない選択（svg-check が var() を error にする）と整合している。id の付け方が揃っているので `[id$="-accent"]` 1 本で 8 個をまとめて上書きすることもできる。
- ただし `mock.css` は 4 案で同一のため、この上書きは利用画面で一度も使われていない。仕組みの記述は duotone/index.tsx:14 のコメントにしかない。previews/duotone-final-in-context.png では、サイドバーの現在項目がブランド青、スライドが濃紺と、周囲の色が変わっても accent は #ce1126 のまま固定されている。
- `part-code-accent` だけが `transform="rotate(25 12 12)"` を持つ（source/code.svg:6）。SVGO は焼き込まず dist にもそのまま残る。32 ファイル中ここだけが座標と回転の両方を読まないと位置が分からない。
- `part-branch-accent` は色の層ではなく geometry を兼ねている。`part-branch-trunktop` が y=4〜10、`part-branch-trunkbottom` が y=14〜20 で、その間の 4 単位の隙間を半径 2 の accent 円がちょうど埋める（source/branch.svg:3、4、9）。accent を消す、色を透明にする、半径を変えるといった操作で幹が途切れる。
- README は「線幅と端点は line-round と揃え、比較の軸を accent の有無だけに絞った」と書くが、source を突き合わせると geometry が広く違う。`terminal` の rx が 3 と 2、`web` の meridian rx が 4 と 5、`test` の首が 7 と 6、`database` は中段の帯の有無、`api` は線の山括弧と塗りの三角、`ai` の小さい火花は菱形と 4 点星、`branch` は幹 1 本・ノード 3 個と幹 2 本・ノード 1 個 + accent。accent だけを足した版ではない。
- 座標は 29 種すべて整数で、line-round と同じ規則を守っている。

## 論点

- SVGO が落とす属性（line-square の butt と miter、solid の `stroke="none"`）は今日の resvg では描画に影響しない。ただし solid の dist は外側から継承した stroke を拾う。配布先の VitePress と Marp のテーマが `svg` に stroke を当てないことを確認するか、source の `stroke="none"` を dist でも残すよう svgo.config.mjs に例外を足すかを決める必要がある。
- inline 展開で part-\* の id が 1 文書に 2 個ずつ重複する点を、許容するか作り直すか。`svg-optimize.sh` の `cleanupIds` は `minify: false` で「複数の SVG を同じ HTML に inline したときの衝突」を避けているが、避けているのは SVGO が振る短縮 id の衝突だけで、part-\* 自身の重複は残る。授業資料側で id に接頭辞を付ける、`<symbol>` + `<use>` に変える、あるいは id を class に変えるといった選択がある。
- `#part-*-accent` による色の差し替えを実際に使うかどうか。使うなら mock.css に 1 例を書いて 20px と 96px で確かめるべきで、使わないなら duotone の accent は「利用画面から変えられない固定色」として評価するのが正確である。
- solid の part-\* の粒度を上げるか。現状 3 個が 1 path 1 id で、9 個目を足すこと自体は難しくないが、既存の 1 個を部分的に直す作業は path データの手編集になる。部分編集を今後行わないなら現状で足りる。
- README の keyline の記述を実装に合わせるか。line-round と solid は 3 つの keyline を宣言しているが、実測の bounding box では縦長の群がそこに乗っていない。9 個目を足す人が README だけを読むと、乗せるべき基準を誤る。
- duotone を「line-round に accent を足しただけ」として比較するのは実装上は正しくない。描き方の差だけでなく比喩と座標も違うため、accent の有無が印象に与える効果だけを取り出したいなら、line-round の source をそのまま複製して accent を足した版を別に作る必要がある。
- 担当外の気づきとして、`Mock.tsx` は `<span aria-hidden="true">` の中に `role="img"` と `<title>` を持つ SVG を入れている（Mock.tsx:30-34）。アイコンは常にラベル文字と並ぶので装飾扱いで妥当だが、`role="img"` と `<title>` を dist に残す設定（svgo.config.mjs の `keepRoleAttr`）との関係は accessibility の観点で判断されるべきである。
