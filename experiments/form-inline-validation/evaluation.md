# 入力フォームの inline validation の評価

- Experiment: [README](README.md)
- 評価日: 2026-09-13
- 対象 variant: on-blur、on-submit、realtime
- 観点: designer、UX writing、accessibility、interaction / motion、implementation
- 手順: [docs/evaluation/review.md](../../docs/evaluation/review.md)

## 評価軸と重み

| 軸                    | 重み | 選定理由                                                     | 担当する観点                     |
| --------------------- | ---- | ------------------------------------------------------------ | -------------------------------- |
| accessibility         | 必須 | 支援技術とキーボードで完了できることが前提                   | accessibility                    |
| writing clarity       | 必須 | 文言の書き方が variant の軸                                  | UX writing                       |
| feedback quality      | 重要 | 検証タイミングと成功表示が variant の軸                      | interaction / motion、UX writing |
| interaction clarity   | 重要 | エラーと成功の状態と次の操作が分かるか                       | interaction / motion             |
| perceived performance | 参考 | 修正までの往復回数と体感                                     | interaction / motion             |
| visual hierarchy      | 参考 | 共通レイアウトの中でエラー要約や文言の配置が視線を乱さないか | designer                         |
| consistency           | 参考 | variant 間で見た目を揃える制約が守られているか               | designer                         |
| maintainability       | 参考 | 実装の複雑さと実プロジェクトへの持ち込みやすさ               | implementation                   |

## 比較表

未定

## 観点別の要点

未定

## 人間の判断待ちの論点

未定
