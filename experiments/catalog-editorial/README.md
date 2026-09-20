---
title: Catalog のエディトリアル再設計
status: evaluating
role: reference
maturity: experimental
created: 2026-09-20
updated: 2026-09-20
platforms:
  - web
domains:
  - visual-design
  - information-architecture
  - navigation
  - typography
  - color
  - accessibility
sources:
  - experiments/catalog-redesign
  - docs/decisions/2026-09-20-catalog-visual-showcase.md
adopted: []
---

## Problem

公開 Catalog の見た目と情報設計を 1 から作り直す。
[catalog-redesign](../catalog-redesign/README.md) の判断は、既存の殻 `hairline-float` を維持したまま `quiet-hierarchy` の役割と `playful-chroma` の色だけを借りる折衷だった。
その結果、左サイドバーと 56rem 本文という文書サイトの骨格、1.5rem を上限とする見出し、均一なカード格子と iframe の箱が残り、グラデの紙と色付きカードが後付けの装飾として浮いた。
利用者の評価は「もとの実装に縛られて効果がない。UI がダサい」である。
不満の対象は、文書サイトの骨格、グラデと色付きカード、標本の見せ方、個別の部品のすべてである。

## Target

Catalog で成果物を探し、触り、再利用の前提を読む開発者。
作った本人が、何をいつ決めたかを読み返す用途も含む。
キーボード操作と、動きを減らす設定の利用者も含める。

## Scope / Domains

対象は visual design、information architecture、navigation、typography、color、accessibility。
造形のテーマは利用者が「エディトリアル / 雑誌」と決めた。
variant で変える軸は IA、文字、グリッド、色の 4 つである。
どの案も、他の案と 2 軸以上で位置が異なるように割り当てる。

見た目と IA は白紙から作る。
維持するのは、Vite + React という実装基盤、正本を `import.meta.glob` で読む仕組み、iframe の live preview、Catalog を正本にしない原則だけである。
破棄の対象には、`hairline-float` の殻、`playful-chroma` の色面、サイドバーの骨格、6 種別ナビ、見出しを 1.5rem に縛る規則、ホストが固有色を持たない方針を含む。
破棄の判断は利用者が 2026-09-20 に行った。

テーマから借りるのは版面の構造だけにする。
利用者の指摘により、紙の質感の再現をやめた（2026-09-20）。
借りるのは、大きな見出し、非対称グリッド、段抜きの幅が重要度になる関係、号や日付順といった編集の骨格である。
入れないのは、象牙色や生成り色の紙、新聞の二重罫、セリフの図版番号、「紙面」「墨」「罫」といった印刷の語彙、紙の地紋である。
面は無彩にし、線はヘアライン、強調は 1 色、角丸と短い transition を持つ画面の部品にする。

## Constraints

- 比較は `just web-dev` の実サイズで行う。URL は `http://localhost:5183/?bare#catalog-editorial/<id>`。
- variant の根は `position: fixed; inset: 0; overflow: auto` にして、実行基盤の `.runner-main` の余白から切り離す。`platforms/web/src/runner.css` は変えない。他の Experiment に影響するためである。
- 画面は top / list / detail / sheet の 4 つにし、query `?screen=` で切り替える。hash は実行基盤が variant の選択に使っている。query にすると再読込で画面が消えず、`scripts/web-shot.sh` で 1 画面ずつ撮影できる。
- データは `shared/data.ts` が読む実データだけを使う。ダミーの文字列と、押しても何も起きない部品を置かない。
- `experiments` から `apps/` へ import しない。`shared/` は同じ glob を自前で書く。不整合の検査は `apps/catalog/src/content/collect.ts` の責務のままにする。
- `apps/catalog/src/catalog.css`、`apps/catalog/src/components/*`、`experiments/soft-component-kit/shared/*` を import せず、class 名も流用しない。
- 共有してよいのは `shared/data.ts`、`shared/schemes.ts`、`shared/contrast.ts`、`shared/Sheet.tsx` の構造だけである。見た目の CSS は案ごとに書く。
- 部品は `@base-ui/react` 1.8.0 の上に案ごとに造形する。対象は Catalog が実際に使う Select、SegmentedControl、Button / Link、Table、CopyButton、Drawer の 6 種。
- WCAG 2.2 AA を守る。本文は 4.5:1、UI と罫は 3:1、ターゲットは 24px 以上、focus の可視は 2px 以上。
- 全操作をキーボードで完結させる。skip link を置き、画面遷移後は見出しへ focus を移す。
- `prefers-reduced-motion` に対応する。hover は `(hover: hover) and (pointer: fine)` の中だけに書く。
- 390 幅と 1280 幅の両方で崩れないようにする。
- 画面を作る前に、色と文字だけの見本（`?screen=sheet`）を先に出して利用者の判断を受ける。
- 最終案は人間が決める。

## Hypothesis

同じ成果物でも、版面の組み方が探索性と主役度を変える。
雑誌の作法は、均一な格子を使わずに主従を決める方法を 4 通り持っている。
号と特集は時間で区切り、索引は一覧性を取り、見開きは標本を最大にし、段組は面積で重要度を示す。
代償は、一覧性、実装量、狭い幅での特徴の消失、そして既存の判断をどれだけ覆すかである。

## Variants

| id                 | 仮説                                                                                  | 変えた軸               | 実装                         |
| ------------------ | ------------------------------------------------------------------------------------- | ---------------------- | ---------------------------- |
| `topic-first`      | 入口を「何を探しているか」の種類にすれば、編集の枠組みを挟まずに目的へ届く            | IA                     | `variants/topic-first/`      |
| `issue-feature`    | 却下: 号で時間を区切り 1 号 1 特集にすれば、均一な格子なしで主役が決まる              | IA、文字、グリッド、色 | `variants/issue-feature/`    |
| `chronicle-column` | 却下: 日付順に並べれば更新そのものが内容になり、段抜きの幅が重要度になる              | IA、文字、グリッド、色 | `variants/chronicle-column/` |
| `index-ledger`     | 却下: 巻末索引を顔にすれば、全作品が 1 画面で読め、大きな見出しがなくても順序が分かる | IA、文字、グリッド、色 | `variants/index-ledger/`     |
| `spread-plate`     | 却下: 1 作品 1 見開きにすれば標本が最大になり、ホストは額縁に徹することができる       | IA、文字、グリッド、色 | `variants/spread-plate/`     |

`topic-first` は造形を `issue-feature` から引き継ぎ、情報設計だけを変えた案である。
利用者が「UI の雰囲気は issue-feature が好き。情報設計はいまいち」と判断したためで、変えた軸は IA だけになる。
配色、文字の階梯、余白、部品の造形は `issue-feature` の決定をそのまま使う。

| id            | 入口                                                                                 | 画面                         | 造形                         |
| ------------- | ------------------------------------------------------------------------------------ | ---------------------------- | ---------------------------- |
| `topic-first` | 配色 / タイポグラフィ / トークン / コンポーネント / アイコン / イラスト / モーション | トップ、トピック、詳細、見本 | `issue-feature` から引き継ぐ |

却下した 4 案は評価に含めない。
実装は学習材料として残す（[ADR 2026-09-17](../../docs/decisions/2026-09-17-named-variants-and-unevaluated-decisions.md)）。
`index-ledger` と `spread-plate` は紙の質感をやめる方向修正より前の造形のままである。

決定ごとの意図、根拠、却下案は `rationale/<variant-id>.md` に書く。

- [topic-first の根拠](rationale/topic-first.md)
- [issue-feature の根拠](rationale/issue-feature.md)
- [index-ledger の根拠](rationale/index-ledger.md)
- [spread-plate の根拠](rationale/spread-plate.md)
- [chronicle-column の根拠](rationale/chronicle-column.md)

### 段階

| 段階 | 内容                                            | 止まる点                                             |
| ---- | ----------------------------------------------- | ---------------------------------------------------- |
| A1   | 4 案の色と文字の見本（`?screen=sheet`）         | 参照色、欧文書体の可否、先へ進める案を利用者が決める |
| A2   | 残った案のトップ、一覧、詳細と部品              | 造形の方向を利用者が決める                           |
| A3   | 決まった造形の上で情報設計を作り直す            | ナビの構成を利用者が確認する                         |
| A4   | トピックの画面が中身そのものを出すようにする    | ナビと中身の出し方を利用者が確認する                 |
| A5   | 配色トピックを coolors のパレットカードに寄せる | 利用者が最終案を決める                               |

A5 では、hover した帯だけを広げてその色の情報を出す挙動と、却下した配色を出さない判断を足した（2026-09-20）。
| C | 選ばれた案で `apps/catalog` の表示層を 1 から書く | 公開前の確認 |
| D | ADR、README、docs、Issue #8 の更新 | commit と push は利用者の指示を待つ |

現在地は A5 の実装完了である。
A2 で造形が決まり（`issue-feature`）、A3 で情報設計を `topic-first` に作り直し、A4 でトピックの画面が中身そのものを出すようにした。
A5 では配色トピックを coolors のパレットカードに寄せた。
トップ、トピック 7 面、詳細、見本を実データで実装した。

## Evaluation

未定。
A1 の見本は評価の対象にしない。
色と文字だけでは、discoverability と interaction clarity を判定できないためである。
A2 で 3 画面が揃った時点で `evaluation.md` を作る。

選ぶ予定の軸と重みは次である。

| 軸                       | 重み | 選定理由                                               |
| ------------------------ | ---- | ------------------------------------------------------ |
| accessibility            | 必須 | 既定で必須                                             |
| visual hierarchy         | 必須 | 「ダサい」という評価の中心。均一な格子からの脱却を見る |
| brand fit                | 重要 | エディトリアルという主題への適合を見る                 |
| information architecture | 重要 | 6 種別ナビを廃した後も探せるかを見る                   |
| discoverability          | 重要 | 標本と variant 切替に届くかを見る                      |
| consistency              | 重要 | 部品の造形が案の文法で揃っているかを見る               |
| localization robustness  | 参考 | 18 字の題名、和欧混植、390 幅の折返しを見る            |
| motion appropriateness   | 参考 | 動きを軸にした案がないため                             |
| implementation cost      | 参考 | 1 から書く前提なので決め手にしない                     |

総合点、順位、おすすめは書かない。
利用者は評価を待たずに判断してよい。

## Decision

未定。

## Rejected reasons

判断者は利用者である。
判断日は 2026-09-20 である。
色と文字の見本、および画面を見た時点で、評価を経ずに却下した。

- `index-ledger` を先へ進めない: 大きさを使わない対照案として置いたが、見た目の驚きが最も小さく、「ダサい」という評価への答えにならない。索引の一覧性という利点は、`chronicle-column` の一覧（面）が表で引き受ける。
- `spread-plate` を先へ進めない: 図録の見開きは紙の比喩そのものであり、紙の質感を再現しない方向修正と正面から衝突する。軸にしていた欧文セリフの追加も、比喩ごと落ちたため検討しない。`docs/decisions/2026-09-19-typography-foundation.md` の判断は覆さない。
- `issue-feature` の情報設計を採らない: 造形は良いが、号と特集という編集の枠組みが目的に合わない。利用者は「配色を見たい」「token の値を知りたい」と考えて来るのに、号という時間の束を先に通す必要がある。造形だけを `topic-first` へ引き継ぐ。
- `chronicle-column` を先へ進めない: 日付順の年表も編集の枠組みであり、`issue-feature` と同じ問題を持つ。更新順は探す道としては弱く、トピックで引けるほうが目的に近い。

## Learnings

未定。

A1 の時点で分かったことだけ記す。

- 実データの題名は 10〜18 字である。最長は「柔らかい現代系の Catalog 部品キット」。390 幅で 1 行 8 字に収める上限が 2.625rem なので、巨大見出しの案は 2〜3 行の折返しを前提に設計する必要がある。
- `scheme.css?raw` は実行基盤でそのまま読めた。`apps/catalog/vite.config.ts` の `rawSchemeCss` プラグインに相当する回避は要らなかった。
- 色と文字の見本を同じ構造で並べると、案の差が造形の差だけになる。見た目の CSS だけを案ごとに書き、構造を共有する形が比較に向く。
- 状態の表示に寸法を使うと、状態が変わるたびに画面が動く。ナビの現在地と variant の選択を太字にし、送りの数字を内容任せにしていたため、3 箇所でレイアウトシフトが出ていた。色と線で示し、数や語の場所は寸法を固定すれば起きない。原則候補として [docs/principles/state-changes-must-not-move-layout.md](../../docs/principles/state-changes-must-not-move-layout.md) に抽出した。
- 書体が持たない機能は指定しても効かない。`font-variant-numeric: tabular-nums` を指定していたが、LINE Seed JP は等幅数字を持たないため桁ごとに幅が変わっていた。書体の能力を確かめてから設計する。
- 3px の移動は目視では気づけない。状態を変える前後で要素の矩形を読み、一致することを実測して初めて分かった。
- この案で作った値（送りのボタン 8rem、数字 4.5rem、角丸 0.375rem、最小ターゲット 2.5rem、transition 120ms）は token にしない。[Catalog ホストの ADR](../../docs/decisions/2026-09-19-catalog-host.md) の規則 2 は「役割名があり、利用面が 2 つある」ことを求めるが、いずれも catalog-editorial の 1 面だけで使っている。角丸と影を token にしない判断（[soft-component-kit の ADR](../../docs/decisions/2026-09-19-soft-component-kit.md)）とも同型で、案ごとに値が違う。段階 C で apps/catalog へ実装したときに、2 面になる値だけを改めて検討する。
- 外部の UI を参考にするとき、写せる範囲はデータの形で決まる。coolors のカードは意味を持たない 5 色だが、この repo の配色は 19 役割を持ち過半が淡色である。そのまま帯にすると差が読めないので、代表 7 色を選び、重複する役割を飛ばす規則を足した。参考にするのは構造であって、要素数や見た目ではない。
- 入口は、押した先に何があるかを説明する場所ではなく、中身が始まる場所にできる。トピックの画面で一覧を挟むのをやめたら、成果物に届くまでの操作が 1 回減った。
- 中身の形が違うものは、同じ枠で見せない。配色は標本、token は表、アイコンは格子、部品は live と、topic ごとに描き方を変えた。1 つの枠に揃えると、どれかが必ず見づらくなる。
- 造形と情報設計は別の採用単位である。同じ variant の中で 2 つを一度に比べると、片方が良くても案ごと落ちる。今回は造形だけを引き継ぐ variant を新しく立てて分けた。
- 入口の語彙は、作り手の分類ではなく利用者の探し方に合わせる。種別（色・文字・記号…）でも、編集の枠組み（号・日付）でもなく、「配色 / タイポグラフィ / トークン / コンポーネント」という探し物の名前が求められていた。
- token は Experiment ではないので、Experiment を読む層だけでは載せられない。`tokens/**/*.tokens.json` を読む層を別に足した。
- テーマの語をそのまま造形へ写すと外れる。「エディトリアル / 雑誌」から紙の質感まで再現したところ、利用者の求めていたものと違った。借りるべきは版面の構造で、表層は画面のものにする。テーマを受け取った時点で、どこまでを借りるのかを先に確かめるべきだった。
- `scripts/web-shot.sh` の狭い幅の撮影は実物と一致しない。`--window-size` だけでは layout viewport が指定幅にならず、広い幅で組まれた紙面を切り取った画像になる。既存の variant でも同じ結果になったので、この Experiment 固有の問題ではない。`previews/` は Chrome DevTools Protocol の `Emulation.setDeviceMetricsOverride` と `setEmulatedMedia` で撮り直した。`scripts/web-shot.sh` の改修は依頼の範囲外なので行っていない。

## Related patterns / assets

- 前の判断: [catalog-redesign](../catalog-redesign/README.md)
- 配色の正本: [color-schemes](../color-schemes/README.md)
- 文字の正本: [product-ui-typography](../product-ui-typography/README.md) と `tokens/typography/`
