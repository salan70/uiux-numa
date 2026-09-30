---
title: Baseball Player Journey の UI を要件から作り直す
status: decided
role: reference
maturity: experimental
created: 2026-09-28
updated: 2026-09-30
platforms:
  - flutter
domains:
  - information-architecture
  - navigation
  - interaction-design
  - forms-input-ux
  - states-design
  - ux-writing
  - accessibility
sources: []
adopted:
  - matchday
---

## Problem

Baseball Player Journey の現在の UI は、Flutter 版から SwiftUI 版への移植を重ねたもので、要件から情報設計を導いたものではない。
製品は Flutter で作り直す予定なので、既存の UI にとらわれず、要件（`salan70/baseball_player_journey` `5e5fb44` の `docs/specification/`）から、uiux-numa の Guideline と token に従って UI/UX を作り直す。
最初の round では、情報構造と試合の入力の置き場が異なる 3 案を Flutter で並べ、利用者が方向を選ぶ。

## Target

架空のプロ野球選手を作り、1 試合ずつ成績を記録して、自分だけの選手名鑑を作る人（製品のペルソナ PER-001）。
主な利用は通勤中や自宅で、片手で数分ずつ遊ぶ場面である。
最も多い操作は試合の記録で、1 季に最大 143 回ある。
シーズンの終了は年に 1 回、選手の作成と名鑑の閲覧はたまに行う。

## Scope / Domains

製品の全画面を対象にする。
タイトル、選手の選択、選手の作成、プレイトップ、試合の入力、スコア、欠場で進める、試合の履歴、シーズンの終了、引退、名鑑、選手の詳細、設定、遊び方を含む。

variant で変える軸は、情報構造（どこから何へ行くか）と、試合の入力を置く場所である。
試合の入力の部品、選手の詳細、名鑑、選手の作成、シーズンの終了と引退、設定は `shared/` に置いて 3 案で共有し、比較軸にしない。

### 要件の整理

仕様書の規則には、機能の要件と、当時の画面の判断が混ざっている。
機能の要件を次の 3 表に取り出し、画面の判断は「縛らない判断」に分けた。

作業（W）:

| ID   | 作業                                                                 | 出典                                          |
| ---- | -------------------------------------------------------------------- | --------------------------------------------- |
| W-01 | 選手を作る（基本情報、能力 3〜10 個、球団、入団の経緯、契約）        | function_requirements、player_creation        |
| W-02 | 遊ぶ選手を選ぶ。現役の選手から続ける                                 | save_select                                   |
| W-03 | 今季の進みと成績、能力を見て、次の試合へ進む                         | play_top                                      |
| W-04 | 出場のしかた（スタメン、代打、代走、守備固め）を選び、試合を記録する | game_result_input AC-001〜AC-004              |
| W-05 | 打席ごとに打点と走塁を付け、直し、取り消す                           | game_result_input AC-005〜AC-007、AC-011〜017 |
| W-06 | スコアを入れて保存する。自チームの得点は打点の合計以上               | game_result_input AC-008〜AC-010              |
| W-07 | 出場せずに日程を進める                                               | skip_games_dialog                             |
| W-08 | 今季の試合の履歴を見る                                               | season_game_history                           |
| W-09 | シーズンを終える（順位、タイトル、進退、契約か移籍、来季の能力）     | season_end_process                            |
| W-10 | タイトルを足す。足したタイトルはほかの選手でも使える                 | function_requirements のタイトル管理          |
| W-11 | 引退する（最終季と通算の成績、通算の順位）                           | retirement_wizard                             |
| W-12 | 名鑑で全選手を見て、絞り込み、並べ替える                             | player_directory                              |
| W-13 | 選手の詳細（経歴、年度別の成績、能力、タイトル）を見て、共有する     | player_detail                                 |
| W-14 | 表示の設定を変え、データを消す                                       | settings                                      |
| W-15 | 初めての人が遊び方を知る                                             | function_requirements のチュートリアル        |

状態（T）:

| ID  | 状態                                                           | 出典                           |
| --- | -------------------------------------------------------------- | ------------------------------ |
| T-1 | 選手がいない / 現役がいる / 現役が上限（10 人）                | save_select                    |
| T-2 | シーズン: 開幕前（0 試合）/ 進行中 / 全試合を終えた            | play_top、season_end_process   |
| T-3 | 試合の入力: 未入力 / 入力中 / スコアの入力 / 保存中 / 保存失敗 | game_result_input の state     |
| T-4 | 選手: 現役 / 引退（見るだけ）                                  | season_end_process assumptions |
| T-5 | 作成とシーズン終了: 必須の未入力 / 入力済み / やめる確認       | player_creation、season_end    |

制約（C）:

| ID  | 制約                                                                   | 出典                                   |
| --- | ---------------------------------------------------------------------- | -------------------------------------- |
| C-1 | 打点、盗塁、得点に結果ごとの上限と下限がある（ホームランは 1〜4 打点） | AtBatResultType.swift                  |
| C-2 | 自チームの得点は打点の合計以上、0〜99                                  | game_result_input、score_input_dialog  |
| C-3 | 試合の入力は途中で保存も再開もしない                                   | game_result_input の assumptions       |
| C-4 | シーズンの終了は全試合を終えた後だけ                                   | season_end_process の preconditions    |
| C-5 | 引退した選手では試合を記録しない                                       | season_end_process の assumptions      |
| C-6 | 能力は 3〜10 個、1〜99、名前が重ならない                               | PlayerAbilities.swift、player_creation |
| C-7 | 永続化の項目を増やさない                                               | #20 の適用原則                         |
| C-8 | 片手で操作でき、短い時間で区切れる                                     | ui_ux_concepts の PER-001              |
| C-9 | 打率、出塁率、OPS は 3 桁、年俸は万円                                  | ui_ux_concepts の contentRules         |

縛らない判断（当時の画面の判断として扱い、決め直した）:

- 常設のナビゲーションを置かない（IA の globalNavigation: none）。`clubhouse` はタブを置き、ほかの 2 案は置かない。
- セーブの選択と名鑑を別の画面にする。実体はどちらも選手なので、3 案とも名鑑に 1 つにした（Information Architecture の置き場を 1 つに決める）。現役を開くと「この選手で続ける」を出す。
- 名鑑を 20 人ずつのページで送る。数十人は 1〜2 画面に収まるので、送りを置かず、現役と引退の絞り込みと並べ替えだけにした。
- 打席結果をセーフ、アウト、その他のタブで分ける。主な 12 の結果を常に見せ、残りの 7 つを「ほかの結果」にした（下の調査）。
- 履歴を押して編集モードに入る。打席を足すとその打席が選ばれ、打点と走塁をすぐ直せる形にして、モードを無くした。
- 選手の作成を 5 段、シーズンの終了を 7 段にする。作成は 4 段、終了は 4 段（引退は 3 段）にまとめた。
- 必須の項目が埋まるまで「次へ」を押せなくする。押したときに足りない項目を要約と項目の下に出す（States & Feedback の送信時の検証）。
- 設定を 4 タブと「保存」にする。項目が少ないので 1 画面にし、変えたらすぐ効く形にした。文字の大きさは端末の設定に従い、アプリでは持たない。
- 日程の進め方ダイアログ、出場区分のダイアログ、欠場の試合数のダイアログを別にする。出場の選択に「欠場」を足し、1 つの面にした。
- データ選択ダイアログ（今季か通算か）を挟む。選手の詳細の中で通算と年度別を並べ、ダイアログを無くした。
- ニュー・ブルータリズムの造形の詳細（輪郭 2〜4px、影 4〜8px、画面ごとの配色）。輪郭と影は押せる面にだけ残し、値は token に寄せた。

### 高頻度の入力の調査

試合の記録は 1 季に最大 143 回あり、製品の体験の大半を占める。
次の知見を入力の部品に当てた。

- 主な結果と取り消しを入力面に常に見せ、メニューを開く手間を無くす。GameChanger は入力の改修で、ボールやストライク、取り消しとやり直しを常設し、入力の手数を減らした（[GameChanger](https://gc.com/post/new-scoring-experience-for-gamechanger-baseball-softball)）。
- 入力の直後に訂正でき、後からも直せるようにして、その場での正確さの負担を減らす（[GameChanger Tech Blog](https://tech.gc.com/ux-for-multi-sport-scorekeeping/)）。
- 片手持ちは約半数で、画面の下の中央が親指の届く範囲である（[Hoober, UXmatters](https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php)）。入力面と主な操作を下端に置いた。

### 案の構成

round 1 の 3 案は `shared/` の状態（`store.dart`）、入力の部品（`game_input.dart`）、画面を共有した。
variant が持つのは、ルート、ホーム、試合の入力の置き方、保存した後の見せ方だけである。
判断後に残した `matchday` は次の構成である。

```text
buildVariant（入口）                    ← JourneyApp が状態を作り、URL の query を読む
└─ タイトル                             ← つづきから、選手を作る、名鑑、設定
   └─ 選手トップ                        ← 今季の進み、成績、能力、最近の試合。下端に次の試合と欠場
      └─ 試合                           ← 電光掲示板、出場の選択（ParticipationForm）、試合の入力（ResultPad ほか）、試合後
         └─ スコア（showScoreSheet）    ← shared
選手の詳細、名鑑、試合の履歴、選手の作成、シーズンの終了と引退、設定  ← shared。右上のメニューから開く
```

## Constraints

- Flutter 3.47.0（Dart 3.13.0）で `platforms/flutter` の実行基盤に載せ、Web で動かす（[ADR](../../docs/decisions/2026-09-28-flutter-runner.md)）。製品のコードには依存しない。
- ドメインの型と規則は、製品の `domain_model.md`、機能設計、`swift-packages/Domain` を `shared/model.dart` に写し、出典をコメントに残す。本体に無い状態や値は置かない。
- 固定データは `shared/fixture.dart` に置く。選手、球団、リーグは架空で、試合の記録は選手ごとに固定の種から作る。
- 採用済みの Guideline（UX Writing、Japanese Notation、Information Architecture）に従い、draft の Guideline（Accessibility、States & Feedback、Color、Design Principles）は Flutter に読み替えて当てる。
- 最大の文字サイズ、ダーク、動きの抑制で崩れないこと。

### token と Guideline の読み替え

| 対象                               | Flutter での扱い                                                                                                              |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| typography                         | LINE Seed JP の woff2 を asset にし、6 役割を `TextStyle` に写した。1rem = 16 論理ピクセル                                    |
| space、radius、border、motion      | 値はそのまま `shared/theme.dart` の定数にした                                                                                 |
| size                               | 押せる領域の最小は target-min（24px）でなく、製品の 48dp                                                                      |
| 画面の左右                         | page-inline（24）でなく space-400（16）。402 幅で年度別の表の列を確保するため                                                 |
| 色                                 | token に色は無い。`color-schemes-material` の `pop-toy` から役割を引いた。輪郭と影の色（ink、shadow）は on-surface から作った |
| 製品の造形（輪郭と影）             | 押せる面にだけ 2px の輪郭と 3px のずらした影を置き、押すと影の分だけ沈む。情報の面は輪郭だけ                                  |
| Accessibility の h1 とフォーカス   | `Semantics(header: true)` と、画面遷移の標準のフォーカスに読み替えた                                                          |
| Accessibility の `dialog`          | 標準の `showDialog` と `showModalBottomSheet` に読み替えた                                                                    |
| Accessibility の動きの抑制         | `MediaQuery.disableAnimations` で、画面遷移、シート、押し込み、試合後の入口の動きを止める                                     |
| States & Feedback の寸法を変えない | 選択は面の色と角の印で示し、札の幅を変えない。上限の理由の行は常に確保する                                                    |
| States & Feedback の送信時の検証   | 「次へ」を押せるままにし、押したときに要約と項目の下に文字で出す                                                              |
| UX Writing のボタンの語形          | 「保存」「取り消す」「試合を終える」「選手を作る」。製品の「作成完了」「取り消し」は揃えた                                    |
| Japanese Notation の数             | 「3 打数 2 安打」「44 打点」。打率は野球の慣習どおり「.287」                                                                  |
| Japanese Notation の年俸           | 製品の「万円、区切りなし」より、Guideline の「1,000 件」を優先し「1 億 2,000 万円」                                           |

### Guideline とゲームの表現の衝突（還元の候補）

| ID  | 衝突                                                                                                           | 扱い                                                                                 |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| B1  | Color の「有彩色は操作と状態に限る」と、電光掲示板や野球カードの有彩色の面                                     | module の Tip なので、作風として掲示板の面に固定の色を使った                         |
| B2  | Japanese Notation の「環境依存文字を使わない」と、記録達成の祝福の絵文字                                       | 絵文字を使わず、印と文字の帯にした                                                   |
| B3  | Typography の 6 役割に数の見出しが無い。成績の数は 24px（xl）では見出しより弱い                                | 32px の `figure` を足した。token の不足として記録する                                |
| B4  | States & Feedback の「削除は確認でなく取り消しで守る」と、途中の保存を持たない試合の入力の破棄、戻せない引退   | 確認を出し、消える範囲を具体的に書いた                                               |
| B5  | Accessibility の Tips が Web の手段だけで、Flutter の `Semantics` と `MediaQuery` の読み替えが無い             | 上の表に読み替えを書いた。#19 の G5 と同じ論点                                       |
| B6  | Guideline に「高頻度の入力は主な選択肢と取り消しを常設し、足した項目をすぐ直せるようにする」に当たる規則が無い | [原則候補](../../docs/principles/frequent-input-keeps-choices-on-surface.md)に立てた |

### 製品への指摘

- `AtBatResultType.isAtBat` は敬遠を打数に数えている。公認野球規則 9.02(a)(1) では数えないので、試作では数えない。
- `GameParticipation` の実装はスタメンと出場なしだけで、仕様の代打、代走、守備固めが無い。試作は仕様に従った。

## Hypothesis

同じ要件を満たしながら、1 季に 143 回ある試合の記録をどこに置くかで、記録の手数と、成長を追う楽しさと、振り返りやすさの釣り合いが変わる。

## Variants

| id         | 仮説                                                                                                             | 変えた軸                                       | 実装                 |
| ---------- | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------- | -------------------- |
| `matchday` | タイトル画面から入り、今日の試合だけを 1 画面にして試合後に伸びを見せると、短い時間でも 1 試合ごとに手応えがある | 情報構造（1 試合ずつ）、入力（試合画面に常設） | `variants/matchday/` |

削除した variant:

- `clubhouse`（基準）: 試合、記録、名鑑を下端のタブに並べると、どの機能にも 1 回で届き、学ぶことが無い。変えた軸は情報構造（タブ）と入力（全画面）。試合前の画面は `matchday` の選手トップに取り込んだ。
- `scorebook`: 選手の経歴と試合を 1 本の帳面にし、最下段に次の試合の行を常設すると、記録が物語を書き足すことになり、振り返りに画面の移動が要らない。変えた軸は情報構造（帳面）と入力（帳面の最後の行と下端）。

削除した 2 案のコードは [判断前の commit](https://github.com/salan70/uiux-numa/tree/356283d/experiments/baseball-journey-app/variants) で辿る。

### 反復の記録

| round | 観察                                                                                   | 変更                                                                                                                                                                                                           | 参照した知識                                                      | 終了理由                           |
| ----- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ---------------------------------- |
| 1     | 3 案を 1 ページに並べて比べた（`compare`）                                             | `clubhouse`、`scorebook`、`matchday` を作った                                                                                                                                                                  | Information Architecture、States & Feedback、高頻度の入力の調査   | 利用者が `matchday` の方向を選んだ |
| 2     | 利用者の所見: 全体は `matchday` が良い。`clubhouse` のような試合前の選手トップがほしい | タイトルと試合の間に選手トップを置いた。下端に「次の試合へ」と「欠場で進める」を固定し、入力の途中なら「入力に戻る」に替える。試合後は次の試合と選手トップを選べるようにし、選手トップに前の試合と差の札を出す | Information Architecture の入口は中身が始まる場所、親指の届く下端 | 利用者の次の所見を待つ             |

### 要件の置き場所

| 要件                      | `matchday`（round 2）                                                  |
| ------------------------- | ---------------------------------------------------------------------- |
| W-01 選手を作る           | タイトル、名鑑                                                         |
| W-02 選手を選ぶ           | タイトルの「つづきから」、名鑑の「この選手で続ける」                   |
| W-03 今季を見て次の試合へ | 選手トップ（進み、成績、能力、最近の試合）。下端の「第 N 戦へ」        |
| W-04〜W-06 試合の記録     | 試合画面。出場を選び、同じ画面で入力する                               |
| W-07 欠場で進める         | 選手トップの下端、試合画面の「欠場」                                   |
| W-08 試合の履歴           | 選手トップの最近の試合と「すべて」、メニュー                           |
| W-09〜W-11 終了と引退     | 全試合の後、選手トップの下端の「シーズンを終える」                     |
| W-12 名鑑                 | タイトル、メニュー                                                     |
| W-13 選手の詳細           | 選手トップの能力の「記録」、メニュー、名鑑                             |
| W-14 設定                 | タイトル、メニュー                                                     |
| W-15 遊び方               | タイトルの空の状態、設定                                               |
| 保存した後                | 勝敗、節目、差の札を順に出す。選手トップへ戻ると前の試合と差の札が残る |

置かない要件:

- 投手と守備の成績。製品の機能設計で非対象である。
- オンラインの名鑑と共有の画像の書き出し。共有はカードの見本だけを出す。
- 効果音と振動の実際の出力。設定の切り替えだけを置いた。
- 分析（analyticsPolicy）。画面の比較に関わらない。

### 試し方

```sh
just flutter-dev
# http://localhost:5185/?variant=baseball-journey-app/matchday
```

| query            | 状態                                                                                                                                                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fixture=<mode>` | `midseason`（既定、4 年目の第 58 戦）、`rookie`（0 試合）、`seasonEnd`（全試合の後）、`empty`                                                                                           |
| `saveFailure=1`  | 次の試合の保存を 1 回だけ失敗させる                                                                                                                                                     |
| `route=<name>`   | 起動直後に開く画面（撮影用）。`play`（選手トップ）、`game`、`input`、`score`、`afterGame`、`topAfterGame`、`menu`、`directory`、`create`、`seasonEnd`、`settings`、`history`、`retired` |

実行基盤の `theme`、`textScale`、`reduceMotion` と組み合わせる。

round 2 の画像: [タイトル、選手トップ、試合](previews/r2-flow.png)、[入力、試合後、選手トップへ戻った後](previews/r2-game.png)、[新人、全試合の後、ダーク](previews/r2-states.png)、[文字 2 倍の選手トップ、ダークの入力](previews/r2-a11y.png)。

round 1 の比較画像（左から `clubhouse`、`scorebook`、`matchday`）:
[ホーム](previews/compare-idle.png)、[入力](previews/compare-input.png)、[保存した後](previews/compare-after.png)、[全試合の後](previews/compare-seasonend.png)、[ダーク](previews/compare-idle-dark.png)、[文字 2 倍の入力](previews/compare-input-xl.png)。
共有の画面: [詳細、名鑑、作成](previews/shared-1.png)、[シーズンの終了、引退した選手、スコア](previews/shared-2.png)。

### モックの限界

- 永続化しない。起動のたびに固定データから作り直す。
- 保存は 450ms 待つだけで、失敗は `saveFailure` でだけ起こる。
- 触覚、効果音、共有の画像の書き出しは無い。
- Web の Flutter で描いており、iOS と Android の標準の戻る操作、シートの挙動、文字の描画は確かめていない。

## Evaluation

`docs/evaluation.md` の多観点評価は行っていない。
実装者が次を確かめた（2026-09-29）。

- 一時的な widget test で、3 案の試合の記録と保存、保存の失敗と再試行、代走、欠場で進める、シーズンの終了と移籍の入力の検証、引退、選手の作成、文字 2 倍でのはみ出しの無さを通した。テストは commit していない（ADR の影響の節）。
- 3 案の主な状態をライト、ダーク、文字 2 倍で撮った。
- 文字 2 倍では、入力面が画面の 6 割を占め、上の打席の列と打点の編集は狭い範囲のスクロールになる。

round 2 では、実装者が次を確かめた（2026-09-30）。

- 一時的な widget test で、タイトルから選手トップ、試合、次の試合、選手トップへ戻る流れ、入力の途中で選手トップへ戻っても入力が残ること、選手トップからの欠場、全試合の後にシーズンを終えて選手トップへ戻ること、文字 2 倍でのはみ出しの無さを通した。
- 選手トップと試合画面をライト、ダーク、文字 2 倍で撮った。

支援技術の読み上げ（`semantics=1`）、実機の片手操作、キーボード操作は確かめていない。

## Decision

`matchday` を採用した。
判断者は利用者（salan70）、判断日は 2026-09-30 である。
利用者の所見は「全体的に `matchday` が良い」で、そのうえで `clubhouse` のような試合前の選手トップを求めた。
round 2 で選手トップを `matchday` に取り込み、この方向でブラッシュアップを続ける。
製品へ移植するかは別に決める。

## Rejected reasons

- `clubhouse`: 利用者は全体の方向に `matchday` を選び、`clubhouse` からは試合前の画面だけを取り込むとした。下端のタブの構成を選ばなかった理由は述べていない。判断者は利用者、判断日は 2026-09-30。
- `scorebook`: 利用者は `matchday` を選び、`scorebook` から取り込むものを挙げなかった。理由は述べていない。判断者は利用者、判断日は 2026-09-30。

## Learnings

未定

## Related

- [Flutter 実行基盤の ADR](../../docs/decisions/2026-09-28-flutter-runner.md)
- [原則候補: 高頻度の入力は選択肢と取り消しを入力面に置く](../../docs/principles/frequent-input-keeps-choices-on-surface.md)
- `experiments/yodoku-app/`（要件から作り直す進め方の前例）
- `experiments/color-schemes-material/`（`pop-toy`）
- `tokens/typography/`、`tokens/space/`、`tokens/radius/`、`tokens/size/`、`tokens/border/`、`tokens/motion/`
- [Issue #20](https://github.com/salan70/uiux-numa/issues/20)
