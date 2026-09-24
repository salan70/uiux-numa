# ガイドライン

個人開発のプロダクト群に共通する UI/UX の指針。
機能や画面を設計、実装するとき、判断に迷ったときの根拠にする。
現時点の記述は Web を前提とする。
書式と文書を足す手順は [guideline.md](../guideline.md) にある。

1 文書は目的、コア、Tips の 3 層でできている。
目的で自分のプロジェクトに関係するかを判断し、コアで思想と優先順位を読み、Tips で場面ごとの規則と良い例、悪い例を引く。
Tips に無い場面に出会ったときは、コアだけで判断する。
`draft` は人間の確認を経ていない仮説、`adopted` は確認済みである。
採用は本リポジトリの判断であり、どのプロダクトにも正しいことを保証するものではない。

検証中の仮説は [原則候補](../principles/README.md) に置く。
ガイドラインは規則を簡潔に述べ、詳細な値や検証結果は原則候補を指す。

| 文書                                                       | title                    | 主題                 | status    |
| ---------------------------------------------------------- | ------------------------ | -------------------- | --------- |
| [ux-writing.md](ux-writing.md)                             | UX Writing               | UX ライティング      | `adopted` |
| [japanese-notation.md](japanese-notation.md)               | Japanese Notation        | 画面文言の日本語表記 | `adopted` |
| [information-architecture.md](information-architecture.md) | Information Architecture | 情報設計             | `adopted` |
| [design-four-principles.md](design-four-principles.md)     | Design Principles        | 視覚構成と造形の判断 | `draft`   |
| [accessibility.md](accessibility.md)                       | Accessibility            | アクセシビリティ     | `draft`   |
| [states-and-feedback.md](states-and-feedback.md)           | States & Feedback        | 状態とフィードバック | `draft`   |
| [color.md](color.md)                                       | Color                    | 色の使い方           | `draft`   |
