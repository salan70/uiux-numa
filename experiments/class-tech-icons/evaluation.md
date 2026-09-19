# 授業資料で使う技術アイコンの評価

- Experiment: [README](README.md)
- 評価日: 未定
- 対象 variant: 未定
- 観点: designer、UX / product、accessibility、implementation
- 手順: [docs/evaluation/review.md](../../docs/evaluation/review.md)

## 評価軸と重み

軸はレビューの前に選んだ。
選定は README の Problem、Hypothesis、Scope / Domains に基づく。

| 軸                  | 重み | 選定理由                                                                                       | 担当する観点             |
| ------------------- | ---- | ---------------------------------------------------------------------------------------------- | ------------------------ |
| consistency         | 必須 | 8 個 1 組で使う。1 個でも揃わないと組として成立しない。ページとスライドで同じ組を使う          | designer、implementation |
| accessibility       | 必須 | 20px で文字と並ぶ。コントラスト、名前、装飾と意味の区別が要る                                  | accessibility            |
| discoverability     | 重要 | 絵文字の代替であり、話題の目印として意味が読めることが目的である                               | UX / product             |
| visual hierarchy    | 重要 | ページでは見出しと本文より目立たず、スライドの章扉では主役になる必要がある                     | designer                 |
| brand fit           | 重要 | 学生が読む資料であり、堅すぎず、既製のアイコン集をそのまま貼ったようにも見えないことが望ましい | designer                 |
| information density | 参考 | サイドバーの 8 項目すべてにアイコンが付く。目印が増えることで読みにくくならないか              | UX / product             |
| maintainability     | 参考 | 後から 9 個目を足せる構造か。`part-*` の id と色の与え方が保守しやすいか                       | implementation           |

### 軸の定義の補足

`discoverability` の目安は操作の発見を想定している。
この Experiment では静的な資料の目印なので、次のように読み替える。

- 課題あり: ラベルと並べても、そのアイコンが指す話題が分からない。別の話題と取り違える。
- 許容: ラベルと並べれば分かるが、アイコン単独では推測できない。
- 良い: ラベルと並べたとき理解を助け、アイコン単独でも話題を推測できる。

`brand fit` の「プロダクトの人格」は、授業資料サイトの調子とする。
学生向けで、堅すぎず、既製のアイコン集をそのまま貼ったようには見えないこと。

## 比較表

未定

## 観点別の要点

未定

## 人間の判断待ちの論点

未定
