# 評価

評価は任意で、判断に迷う Experiment だけで行う。
行わなかった Experiment は README の Evaluation に「何を見て判断したか」を書く。
最終判断は人間が行い、総合点や順位は付けない。

## 軸

Experiment ごとに 5〜9 件を選び、必須、重要、参考の 3 段階で重みを付ける。
accessibility は既定で必須にし、外すなら理由を書く。

| 軸                       | 見ること                                                    |
| ------------------------ | ----------------------------------------------------------- |
| visual hierarchy         | 視線の順序が画面の目的と一致しているか                      |
| information density      | 画面あたりの情報量が目的と文脈に合っているか                |
| discoverability          | 次に取れる操作と結果を予測できるか                          |
| information architecture | 分類、順序、階層が利用者の心理モデルと合っているか          |
| interaction clarity      | 操作の対象、方法、結果、状態が明確か                        |
| writing clarity          | 文言が短く具体的で、次の行動が分かるか                      |
| motion appropriateness   | 動きが変化の理解を助け、reduced motion でも意味が保たれるか |
| feedback quality         | 結果、成功、失敗、進行中が適切なタイミングと手段で伝わるか  |
| consistency              | 同じ意味に同じ表現を使っているか                            |
| accessibility            | キーボード、支援技術、拡大表示、色覚多様性で利用できるか    |
| platform fit             | 対象プラットフォームの慣習と標準部品に合っているか          |
| delight                  | 目的の達成を妨げずに心地よさがあるか                        |
| perceived performance    | 応答が即時に返り、進行が伝わるか                            |
| localization robustness  | 文言の長さや形式が変わっても崩れないか                      |
| implementation cost      | 効果に対して工数、依存、変更範囲が見合うか                  |
| maintainability          | 責務が分かれ、変更と再利用がしやすいか                      |
| brand fit                | 表現の調子がプロダクトの人格と合っているか                  |

## 観点

観点ごとに独立したレビュアー（AI agent なら別 agent）が担当する軸だけを判定し、他の観点の記録は読まない。

| 観点                 | slug                 | 主に見る対象                                    |
| -------------------- | -------------------- | ----------------------------------------------- |
| designer             | `designer`           | previews、レイアウト、余白、色、文字            |
| UX / product         | `ux-product`         | Problem、画面の流れ、情報の構造                 |
| UX writing           | `ux-writing`         | ラベル、エラー文言、案内、ボタン                |
| accessibility        | `accessibility`      | role、aria、focus、キーボード操作、コントラスト |
| interaction / motion | `interaction-motion` | 状態遷移、タイミング、動き                      |
| implementation       | `implementation`     | コードの構造、依存、変更範囲                    |

## 記録

- 判定は課題あり、許容、良いの 3 段階にし、根拠の観察（ファイル、行、preview 名）を書く。根拠が足りなければ保留にし、何があれば判定できるかを書く。
- 観点別の記録は `experiments/<slug>/evaluation/<slug>.md` に置く。判定の表、観察、人間の判断が要る論点の 3 節で書く。
- 入口は `experiments/<slug>/evaluation.md` にする。軸と重みと選定理由、軸 × variant の比較表、観点別の要点とリンク、判断待ちの論点を書く。
- 判断は README の Decision と Rejected reasons に書く。
