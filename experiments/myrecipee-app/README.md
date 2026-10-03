---
title: MyRecipee のレシピ管理と買い物の UI を見直す
status: evaluating
role: reference
maturity: experimental
created: 2026-10-03
updated: 2026-10-03
platforms:
  - ios
domains:
  - information-architecture
  - interaction-design
  - visual-design
  - states-design
  - forms-input-ux
  - ux-writing
sources: []
adopted: []
---

## Problem

MyRecipee の保存したレシピを選び、人数を決め、材料を買う流れを、主要画面の構成から見直す。
このマシンの `/Users/odatetsuo/Projects/Indee/MyRecipee`（`3e05f0e`）の仕様と実装を参照した。
現行はレシピ一覧、カート、買い物リストのタブを持ち、詳細の下部からカートへ追加する。
この構造を基準に、レシピを見つける入口と、料理から買い物へ進む入口を比較する。
本体の移植前に、uiux-numa の iOS 実行基盤で操作できる試作を残す。

## Target

自分の定番料理を保存し、買い物の前に作る料理と人数を決める人。
台所では作り方を読み、店では材料をチェックする。
検索、料理の選択、人数の変更、購入済みへの切り替えを主な操作とする。

## Scope / Domains

レシピ一覧、検索とタグの絞り込み、詳細の材料と作り方、追加と編集、カート、買い物、買い物の履歴を対象とする。
一覧の情報密度と、作る料理の置き場所を案ごとの比較軸にする。
詳細以降の操作とデータは `shared/MyrecipeePrototype.swift` で共有し、同じ料理で比較する。

| 要件           | 試作での対応                                                 | 出典                                |
| -------------- | ------------------------------------------------------------ | ----------------------------------- |
| レシピを探す   | 名前、材料、タグで検索し、タグで絞り込む                     | `docs/specs/specification.md` FR-R4 |
| 記録する       | 名前、タグ、メモを編集。新規追加は材料 1 件と手順 1 件も保存 | FR-R2、FR-R3                        |
| 人数を決める   | 詳細とカートで 1〜12 人分を変更し、材料を換算                | FR-C1、FR-C2                        |
| 材料をまとめる | 同じ名前と単位の材料を合算                                   | FR-B1                               |
| 買い物を進める | 購入済みの切り替え、買う／買わないの移動、残り件数           | FR-B2                               |
| 買い物を終える | 確認後にカートを空にし、起動中の履歴へ記録                   | 現行 `BuyListView.swift` の完了導線 |

認証、クラウド同期、広告、課金、URL 取り込み、写真の選択、削除、一括タグ編集、複数の材料と手順の編集、自由入力の買い物項目は今回実装しない。
料理名と材料量は試作用のデータで、調味料も含む実用レシピの完全な記録ではない。
料理画像の代わりに SF Symbols を使い、写真の有無で比較結果が変わらないようにした。

## Constraints

- SwiftUI と OS 標準のナビゲーション、フォーム、シートを使う。
- 現行 DesignSystem のコバルト色（RGB 0.24、0.45、0.99）を全案で共有する。
- 背景と本文色は OS の semantic color、文字は Dynamic Type に従う。
- 余白は既存 token の 8、12、16、20、24 pt、角丸は 6、10 pt を参照する。
- 主操作は 44 pt 以上。色に加え、チェック記号と文言で状態を伝える。
- 保存状態は起動中だけ保持する。実ユーザーのデータへ接続しない。
- 採用と本体への適用は利用者の判断後に行う。

## Hypothesis

レシピ、カート、買い物の置き場所を固定したまま、選ぶための情報と次の操作を前に出せば、保存から買い物までの流れを追いやすくなる。
一覧の情報密度と、準備中の料理を前に出す価値を別々に評価する。

## Variants

| id             | 仮説                                                               | 変えた軸               | 実装                     |
| -------------- | ------------------------------------------------------------------ | ---------------------- | ------------------------ |
| `recipe-index` | 基準: 名前とタグを密に並べると、覚えている料理を見つけやすい       | 一覧中心、情報密度     | `variants/recipe-index/` |
| `recipe-cards` | メモまで見える大きなカードなら、料理を思い出して選びやすい         | カード中心、メモの露出 | `variants/recipe-cards/` |
| `meal-prep`    | 準備中の料理と買い物への入口を先頭に出すと、途中の作業に戻りやすい | 作業中心、カートの露出 | `variants/meal-prep/`    |

| id             | 軸             | 向く状況                         | 代償                       |
| -------------- | -------------- | -------------------------------- | -------------------------- |
| `recipe-index` | 一覧密度       | 料理名を覚えている、保存数が多い | メモは詳細まで見えない     |
| `recipe-cards` | メモを読む     | 保存した料理を眺めて選ぶ         | 1 画面に見える料理が少ない |
| `meal-prep`    | 準備を再開する | 作る料理を決めた後に買い物へ移る | 保存一覧の開始位置が下がる |

### 起動と比較

```sh
just ios-run myrecipee-app/recipe-index
just ios-run myrecipee-app/recipe-cards
just ios-run myrecipee-app/meal-prep -fixture planned
```

`-fixture saved` が既定（保存 4 品、空のカート）。
`-fixture empty` は初回、`-fixture planned` は炊き込みご飯とみそ汁を各 2 人分追加した状態。
`-screen recipes` が既定で、`-screen detail`、`-screen cart`、`-screen shopping` も使える。
買い物の比較は全案で `-fixture planned -screen shopping` を指定する。

```sh
just ios-shot myrecipee-app/meal-prep /tmp/myrecipee-shopping.png dark large -fixture planned -screen shopping
```

### 確認する操作

実機での比較は `just ios-device-run <device-id> <team-id>` で NUMA をインストールし、起動する。
起動引数なしなら一覧から各案を開ける。
案を開いた後は画面上部の「一覧へ戻る」で一覧へ戻る。
実機でステータスバーの長押しが反応しなかったという利用者の報告を受け、専用の行にボタンを常設した。
2026-10-03、利用者の iPhone 16（iOS 26.6）へ、既存の開発署名でワイヤレスにビルド、インストール、起動するところまで成功した。
デバッガはこのコマンドでは接続しない。
Xcode から同じ端末へ Run すればブレークポイントを利用できる。

1. 「しめじ」で検索し、材料を含む 3 品が出ることを確認する。
2. 主食で絞り、詳細で人数を 4 人に変え、米が 4 合になることを確認してカートへ追加する。
3. みそ汁を 2 人分追加し、買い物のしめじが 300 g に合算されることを確認する。
4. チェックを付けて外し、スワイプか長押しで買わないへ移し、買うへ戻す。
5. 編集で保存とキャンセルを試し、入力後のキャンセルで破棄確認を試す。
6. カートの削除、全消去のキャンセル、買い物完了のキャンセルと確定、履歴を確認する。

## Evaluation

2026-10-03、iPhone 17（iOS 26）のシミュレータで検証した。

- `just ios-build`: 成功。
- `just lint-md`: 新しい README を含めて成功。
- `just lint`: 既存の `baseball-journey-icons` の 3 ファイルで oxfmt が整形差分を作り、初回は失敗した。
  整形後の再実行は成功したが、その 3 ファイルは今回の対象外なので元に戻した。
  コミット時に新規 README も oxfmt で整形し、再実行の成功を確認した。
- 3 案の同じ保存状態、準備済みのダークモード、買い物の最大 Dynamic Type を撮影して確認した。
- 最大文字サイズで材料名と数量が横並びで折り返される問題を見つけ、縦並びに変更した。
- ボタン内の本文が tint を継承する問題を見つけ、明暗に合う `Color.primary` と `Color.secondary` を明示した。
- 保存済みの表示と詳細のカート導線は領域を常に確保し、追加によって寸法を変えない。
- 人数の変更で材料の必要量が変わったときは、その材料の購入済みチェックを外す。
- Computer Use の Accessibility と Screen Recording の権限が未完了のため、クリック、キーボード、連続操作、スワイプ、確認の確定と取り消しは未検証。
  上の「確認する操作」は手動確認用の手順で、実施済みの結果ではない。

比較用の撮影:

| 一覧案                                            | カード案                                          | 準備案                                         |
| ------------------------------------------------- | ------------------------------------------------- | ---------------------------------------------- |
| [保存状態](previews/recipe-index-saved-light.png) | [保存状態](previews/recipe-cards-saved-light.png) | [保存状態](previews/meal-prep-saved-light.png) |

[準備済みのダークモード](previews/meal-prep-planned-dark.png)、[買い物の最大文字サイズ](previews/shopping-planned-dark-large-text.png)、[詳細](previews/detail-saved-light.png)。
[初回の空状態](previews/recipe-index-empty-light.png)は、検索と追加の入口を残して表示する。
利用者の採用判断は未実施。

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related

- [やきう選手物語](../baseball-journey-app/README.md)
- [.389](../389-app/README.md)
- [Information Architecture](../../docs/guidelines/information-architecture.md)
- [UX Writing](../../docs/guidelines/ux-writing.md)
- [状態は色で示し、寸法で示さない](../../docs/principles/state-changes-must-not-move-layout.md)（原則候補）
