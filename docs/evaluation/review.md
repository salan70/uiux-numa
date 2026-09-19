# 評価の実行手順

[評価の方針](policy.md)を実際の Experiment で運用するための手順と記録形式を定める。
評価軸の定義と判定の目安は [axes.md](axes.md) に置く。
評価の入口は `experiments/<slug>/evaluation.md` とする。
観点別の記録は `experiments/<slug>/evaluation/<perspective>.md` に置き、入口から参照する。

## 用語

| 用語 | 意味                                                                  |
| ---- | --------------------------------------------------------------------- |
| 軸   | axes.md に定義した評価の項目。17 件から Experiment ごとに選ぶ         |
| 判定 | 軸ごとの 3 段階の結果。課題あり、許容、良い。根拠が足りないときは保留 |
| 重み | Experiment における軸の重要度。必須、重要、参考の 3 段階              |
| 観点 | レビューを行う立場。designer など 7 種類                              |

## 軸と重みを選ぶ

Experiment の担当者が、レビューの前に選ぶ。

1. README の problem、hypothesis、scope / domains を読む。
2. hypothesis が変えようとしている軸を選ぶ。
3. 変えていなくても壊してはいけない軸を加える。
4. 各軸に重みを付ける。
5. 選んだ軸を担当する観点を決める。
6. 軸、重み、選定理由、観点を `evaluation.md` に記録する。

重みの意味は次のとおり。

| 重み | 意味                                                             |
| ---- | ---------------------------------------------------------------- |
| 必須 | 課題ありなら、他の軸が良くても採用しない                         |
| 重要 | 判断を左右する。課題ありのまま採用するなら decision に理由を書く |
| 参考 | 記録するが、判断の決め手にはしない                               |

- 軸は 5 件から 9 件を目安にする。多すぎると根拠が薄くなる。
- accessibility は既定で必須にする。外す場合は理由を記録する。
- 重みは 3 段階の言葉だけにし、数値にしない。加重合計を計算しない。

## 観点の定義

| 観点                 | slug                 | 役割                                     | 主に見る対象                                             | 主に担当する軸                                                                                                 |
| -------------------- | -------------------- | ---------------------------------------- | -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| designer             | `designer`           | 視覚と構成の質を見る                     | previews、レイアウト、余白、色、文字                     | visual hierarchy、information density、consistency、delight、brand fit                                         |
| UX / product         | `ux-product`         | 目的の達成と流れを見る                   | Brief、画面の流れ、情報の構造                            | discoverability、information architecture、information density                                                 |
| UX writing           | `ux-writing`         | 文言の明確さと調子を見る                 | ラベル、エラー文言、案内、ボタン                         | writing clarity、feedback quality、localization robustness                                                     |
| accessibility        | `accessibility`      | 支援技術と多様な条件での利用を見る       | コードの role、aria、focus、キーボード操作、コントラスト | accessibility                                                                                                  |
| platform             | `platform`           | 対象プラットフォームの慣習との適合を見る | 標準部品との差、入力手段                                 | platform fit、consistency                                                                                      |
| interaction / motion | `interaction-motion` | 操作、状態、動き、feedback を見る        | 状態遷移、タイミング、動き                               | interaction clarity、feedback quality、motion appropriateness、perceived performance、discoverability、delight |
| implementation       | `implementation`     | 実装の妥当性を見る                       | コードの構造、依存、変更範囲                             | implementation cost、maintainability、perceived performance、localization robustness                           |

- 観点は Experiment ごとに選ぶ。選んだ軸を担当する観点だけを使う。
- 同じ軸を複数の観点が判定してよい。判定が割れたら両方を記録し、論点にする。
- `reviewing-motion` の所見は interaction / motion 観点の入力にする。生成セッションの点検表が無くても、この手順で評価する。

## レビューを実行する

観点ごとに独立したレビュアーが行う。
AI agent を使う場合は、観点ごとに別の agent を並列に動かす。

入力は次のとおり。

- README（Brief と variants の一覧）
- `variants/<variant-id>/` のコード
- `previews/` の画像
- `evaluation.md` の軸と重み
- axes.md と担当する観点の定義

出力は `evaluation/<perspective>.md` とする。
`<perspective>` は観点の slug にする。

レビューの規則は次のとおり。

- 担当する軸だけを判定する。担当外の気づきは論点に書く。
- 判定ごとに根拠となる観察を必ず書く。観察には該当箇所（ファイル名、行、preview 名）を含める。
- 判定は axes.md の目安に照らして行う。variant 間の違いは根拠に書く。
- 根拠が足りない軸は保留にし、何があれば判定できるかを書く。
- 総合点、順位、おすすめの variant を書かない。
- 他の観点の記録を読まない。独立した判定を保つ。
- 人間の判断が必要な点を論点として挙げる。

観点別ファイルの形式は次のとおり。

```markdown
# <観点> レビュー: <Experiment の title>

- 観点: <観点>
- 対象: <variant-id>、<variant-id>、<variant-id>
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: <axis>、<axis>

## 判定

| 軸     | <variant-id> | <variant-id> | <variant-id>     |
| ------ | ------------ | ------------ | ---------------- |
| <axis> | 良い: <根拠> | 許容: <根拠> | 課題あり: <根拠> |

## 観察

### <variant-id>

- <観察>（<該当箇所>）

## 論点

- <人間の判断が必要な点>
```

## 結果をまとめる

Experiment の担当者が観点別ファイルを読み、`evaluation.md` にまとめる。
テンプレートは [docs/templates/experiment/evaluation.md](../templates/experiment/evaluation.md) にある。

1. 軸 × variant の比較表を作る。セルには判定と短い根拠を書く。
2. 同じ軸で観点の判定が割れたら、両方をセルに書き論点に加える。
3. 各観点の要点を 3 点程度に要約し、観点別ファイルへリンクする。
4. 必須の軸で課題ありがある variant を明記する。
5. 人間の判断待ちの論点を列挙する。

比較表に合計や順位を付けない。
判断は人間が行い、結果は README の decision と rejected reasons に記録する。
