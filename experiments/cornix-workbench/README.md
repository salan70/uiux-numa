---
title: Cornix Bonsai の Web UI を要件から作り直す
status: decided
role: reference
maturity: experimental
created: 2026-09-24
updated: 2026-09-24
platforms:
  - web
domains:
  - visual-design
  - information-architecture
  - interaction-design
  - states-design
  - accessibility
sources:
  - cornix-product-ui
  - color-schemes-material
  - product-ui-typography
  - button
adopted:
  - board-desk
---

## Problem

`cornix-product-ui` で採用したモックを Cornix Bonsai へ移植したが、本体で変わったのはナビゲーションと外枠だけだった。
本文の部品、`main.tsx` に集中した状態、Cornix 独自の token は旧来のまま残り、モックとの差が大きい。
原因は 2 つある。
モックが固定の見せかけデータで作られ、本体の機能（recovery、WebHID、VIL、backup、Karabiner 書出、acknowledge）を含まなかったこと。
本体側の ADR が「既存の構成と状態管理を維持する」ことを前提にしたこと。

今回は Cornix Bonsai の要件（[UI 要件](https://github.com/salan70/cornix-bonsai/blob/main/docs/tasks/2026-09-24_ui-requirements.md)、Cornix Bonsai `8381191`）から情報設計を導き直す。
採用案は、画面だけでなく部品の境界と状態の持ち方まで含めて、本体の UI 層を作り直す設計図にする。

## Target

Cornix LP と MacBook の内蔵キーボードのキー割り当てを、macOS の Chrome で編集する個人。
主作業は、盤面を見たまま 50 キー × 10 layer を連続で割り当てることである。
実機との往復（接続、読込、Apply、backup 復元）は頻度が低く、失敗の影響が大きい。

## Scope / Domains

Web UI の全体を対象にする。
header、編集対象の切り替え、盤面、encoder、picker、編集 panel、保存状態、診断、Overview、Behaviors、References、実機の接続と読込、Apply の全段階、backup 復元、VIL、SVG / PDF 書出、Karabiner 書出、workspace の入口と recovery を含む。

variant で変える軸は情報構造と操作である。
配色は `pop-toy` に固定し、variant 間で色の差を比較軸にしない。

## Constraints

- 要件文書の作業（W-01〜22）、常時表示（S-01〜07）、状態（T-01〜12）を、すべての variant が画面に置く。置かない場合は理由を README に書く。
- 要件文書の制約（C-01〜15）を守る。特に Apply は途中で他の作業へ移れない線形の流れにし、「実機に反映した」以外の完了文言を使わない。
- 固定データは Cornix Bonsai の型（`EditTarget`、`WorkTask`、`Selection`、keycode の分類、保存状態、診断、`ApplyState`）と fixture（`fixtures/cornix-lp/baseline.vil`、V1.12 definition、`fixtures/mac-keyboard/desired.yaml`）から作る。本体に無い状態や数値を置かない。
- 盤面の座標と keycode の表示は、Cornix Bonsai の `src/render/geometry.ts` と label 関数の出力を写す。出典 commit を残す。
- 配色は `color-schemes-material` の `pop-toy`、寸法と文字は `tokens/` の 6 系統、ボタンは `button` の `pill-action` を使う。追加の npm 依存を入れない。
- 色を積極的に使い、カラフルで楽しい雰囲気を出す。ただし色だけで状態を区別せず、良し悪しの色（success / warning / error）と強調色を分ける。黄の塗りは白の面に 1.61:1 しかないため、塗りだけで選択を示さない。
- キーボード操作（方向キー、Enter、Esc）、focus、文字拡大、reduced motion、ライトとダークを確認する。
- 1280 × 800 と 1024 × 768 で横スクロールを出さない。
- 各 variant は README に、部品の境界と状態の持ち方の図を書く。

## Hypothesis

要件の作業頻度に合わせて面積と経路を配分すると、主作業（連続した割り当て）を妨げずに、実機との往復を安全に辿れる。
その配分を部品の境界まで決めておけば、本体の移植が外枠だけの後付けにならない。

## Variants

2026-09-24 に 4 方向の静的なモック（1280 × 800）を利用者に見せ、`board-desk` だけを操作できる variant として実装すると決めた。
ほかの 3 方向は実装する前に見送った。
見送った方向と理由は Rejected reasons に置く。

| id           | 仮説                                                                                                                                                                   | 変えた軸       | 実装                   |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ---------------------- |
| `board-desk` | 盤面・picker・編集パネルを常設し、全体マップ・動作定義・検証・実機・ファイルを画面中央のパネル（全画面へ広げられる）で開くと、連続した割り当てを妨げずに広い作業へ届く | 情報構造、操作 | `variants/board-desk/` |

### 反復の記録

| round | 観察                                                                                 | 変更                                                                           | 参照した知識                         | 終了理由         |
| ----- | ------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------ | ---------------- |
| 1     | 右から出る引き出しは幅が約 600px で、全体マップが 1 列になり、Behaviors の表も詰まる | 利用者の提案で、引き出しを画面中央のパネルに替え、全画面へ広げられるようにした | 要件 W-06、W-07。ネイティブの dialog | 利用者が採用した |

### `board-desk` の設計図

盤面、picker、編集パネルを常に同じ位置に置き、それ以外の作業は左端の入口から画面中央のパネルで開く。
パネルは標準の大きさと全画面を切り替えられ、全画面にしたパネルは次も全画面で開く。
パネルは Esc、×、背景の押下でいつでも閉じられ、閉じると開いた入口へ focus が戻る。
Apply は、段階を終えるまで他の作業へ移れない modal として、パネルと区別する。

```text
BoardDesk（index.tsx）            ← 状態の hook を組み合わせ、部品へ値と操作を渡すだけ
├─ Header（Chrome.tsx）           ← brand と build、workspace、編集対象の切替、実機の接続状態、テーマ
├─ Rail（Chrome.tsx）             ← 割り当て / 全体 / 動作 / 検証 / 実機 / ファイル。Mac で使えない入口は位置を保って理由を出す
├─ desk
│  ├─ LayerBar（Chrome.tsx）      ← layer の切替。参照なしの layer は畳む。Mac は適用先を出す
│  ├─ Board（Board.tsx）          ← Cornix の盤面と encoder の帯、Mac の盤面。方向キー、Enter、Esc
│  ├─ Picker（Picker.tsx）        ← 選ばれた keycode を生のまま返す。適用先の組み立ては呼び出し側
│  ├─ Inspector（Inspector.tsx）  ← 選択中のキー、適用先、raw、表示名、保存状態
│  └─ PanelDialog（Panels.tsx）    ← 中央の modal。標準 / 全画面。中身は Overview / Behaviors / Validation / Device / Files
├─ StatusBar（Chrome.tsx）        ← 診断の件数、保存状態、通知、実機との差分、Apply の入口と開けない理由
├─ ApplyDialog（ApplyDialog.tsx） ← backup → 差分確認 → 確認 → 書き込み → 結果
└─ WorkspaceGate / Recovery       ← workspace 未選択、権限の再確認、Cornix と Mac の読込失敗
```

状態は関心ごとの hook に分ける（`state.ts`）。
各 hook は他の hook の内部を読まず、`BoardDesk` が値を受け渡す。

| hook           | 持つもの                                                           | 本体での置き換え先                                   |
| -------------- | ------------------------------------------------------------------ | ---------------------------------------------------- |
| `useDocuments` | Cornix と Mac の目標状態、表示名、layer 名                         | workspace adapter と Core の編集関数                 |
| `useCursor`    | 編集対象、対象ごとの layer、選択、picker の適用先                  | そのまま UI 状態                                     |
| `useSaveQueue` | ファイルごとの保存状態（idle / saving / saved / error / conflict） | 既存の保存キュー（`save-state.ts`）                  |
| `useDevice`    | 接続、読込の往復回数、実機の現在状態                               | WebHID adapter                                       |
| `useDiff`      | 実機と目標状態の差分                                               | `diffDocuments`                                      |
| `useApply`     | Apply の段階と書き込みの進捗                                       | Apply の状態機械（`src/core/apply/`）                |
| `useMockState` | workspace、読込、次の保存、診断の出どころ                          | 本体には無い。I/O の結果として決まる状態を切り替える |

画面の固定データは `shared/fixture.json` にある。
`shared/export-fixture.mts` が Cornix Bonsai `8381191` の純関数（`geometry.ts`、`keycodeDisplay`、`buildOverviewModel`、validation、diff、Apply plan）で fixture を読んで書き出したもので、手で作った値は無い。
実機の現在状態は `baseline.vil`、目標状態はそこへ Core の編集関数で 3 件の変更を加えたものである。
error と warning の例は `invalid-cases.vil` の診断を使う（モックの状態で切り替える）。

### 要件の置き場所

| 要件                                    | 置き場所                                                          |
| --------------------------------------- | ----------------------------------------------------------------- |
| W-01〜04 割り当て、layer、保存の確認    | 盤面、picker、編集パネル（常設）                                  |
| W-05 表示名、layer 名                   | 編集パネルの詳細、全体マップの見出し                              |
| W-06 全体を見渡す                       | パネル「全体」。参照元をたどると元の layer を開く                 |
| W-07 Tap Dance、Combo、Settings         | パネル「動作」。範囲外の値は保存せず理由を出す                    |
| W-08、W-09 診断と参照                   | パネル「検証」、status bar の件数。診断から該当キーへ移る         |
| W-10〜12 接続、読込、Apply、backup 復元 | パネル「実機」の 3 段階、status bar の Apply、Apply の modal      |
| W-13、W-14、W-21 VIL、書出、再読込      | パネル「ファイル」、全体マップの書出                              |
| W-15 Karabiner                          | Mac のときの status bar とパネル「実機」                          |
| W-16〜20 入口と復旧                     | WorkspaceGate、Recovery、編集パネルの保存状態                     |
| W-22 テーマ、ガイド、build              | header、パネル「ファイル」                                        |
| S-01〜07 常に分かること                 | header（workspace、対象、接続）、LayerBar、編集パネル、status bar |

### モックの限界

- keycode の組み立て（Tap / Hold）と、fixture に無い keycode の表示は、本体の `applyPick` と `keycodeDisplay` を写した近似である。
- 保存、接続、読込、Apply は時間を置いて状態を進めるだけで、ファイルと実機には触れない。
- Mac の動作の種類（basic / modTap / layerSwitch / none）を選ぶ select は置いていない。picker と適用先で basic と modTap を作れる。
- Behaviors の Tap Dance は先頭 6 件だけを並べる。
- encoder と盤面上の押し込みキーの対応（P-01）は、definition にも Core にも対応が無いため表せない。
- 診断の出どころを `invalid-cases.vil` に切り替えても、検証パネルの「参照」は目標状態の fixture のままである。

## Evaluation

`docs/evaluation/review.md` の多観点評価は行っていない。
利用者は round 1 の後の画面を操作して採用を判断した。
実装者が headless Chrome で次の操作を確かめた（2026-09-24）。

- 盤面の方向キー、Enter で編集パネルへ、Esc で盤面へ。
- picker での割り当て、保存中から保存済みへの遷移、同じ位置の変更で差分件数が増えないこと。
- Hold では modifier だけを選べ、選ぶと mod-tap になること。
- パネルが画面中央の modal で開き、見出しへ focus し、Esc で閉じると入口へ戻ること。
- パネルを全画面へ広げ、元に戻せること。全画面にしたパネルが次も全画面で開くこと。
- 検証の診断から該当キーへ移り、盤面へ focus が戻ること。
- Apply の backup、差分確認、書き込み中は中断だけ、完了の「実機に反映した」、反映後に差分 0 件で Apply を止めること。
- 保存の競合で再試行を出さず再読込を出すこと。
- Mac JIS で Karabiner に落とせない keycode を無効にし、全体と動作の入口に理由を出すこと。
- ダーク、reduced motion、1024 × 768、文字 125% で横スクロールが出ないこと。

## Decision

2026-09-24 に利用者が `board-desk` を採用した。
判断者は利用者で、多観点の評価を経ていない。
未評価の軸は visual hierarchy、information density、discoverability、writing clarity、accessibility の第三者確認である。
実装者の操作確認（Evaluation）はあるが、評価の代わりにはしない。

採用した `board-desk` を Cornix Bonsai の UI 層を作り直す設計図にする。
本体では、README の部品の境界と hook の分け方に沿って `src/ui` を作り直し、uiux-numa の token と `pop-toy` を取り込む。
Core、ファイル形式、CLI、Apply の安全手順は変えない。

## Rejected reasons

次の 3 方向は、2026-09-24 に利用者が静的なモックを見て、実装する前に見送った。
判断者は利用者で、理由は「直感」である。
言葉にした理由は無く、下の代償は提案時に書いたものである。

- `layer-shelf`: 全 layer の縮小盤面を棚に並べて主のナビゲーションにし、棚が Overview を兼ねる。代償は、棚が面積を使い、layer の少ない Mac では棚の意味が薄いこと。
- `key-palette`: 検索できる keycode パレットで、キーボードだけで割り当てる。代償は、keycode 名を知らない利用者には物理配列の picker より探しにくいこと。
- `sync-lanes`: 目標と実機を 2 つのレーンに分け、差分と Apply をレーンの間に置く。代償は、頻度の低い実機の情報が常に面積を使い、編集面が狭くなること。

## Learnings

未定

## Related patterns / assets

なし
