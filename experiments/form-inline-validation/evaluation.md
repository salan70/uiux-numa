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

| 軸                    | 重み | on-blur                                                                                                  | on-submit                                                                                             | realtime                                                                                                                     |
| --------------------- | ---- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| accessibility         | 必須 | 許容: aria 属性は正しいが、blur 時のエラーに live region がなく送信まで伝わらない。`autoComplete` がない | 良い: 送信時に要約へフォーカスを移し、リンクからキーボードで各項目へ移動できる。`autoComplete` がある | 許容: 常設の live region で変化が伝わるが、送信時のフォーカス移動が描画より先。`autoComplete` がない                         |
| writing clarity       | 必須 | 許容: 事実だけを述べ、次の行動は利用者の推測に頼る                                                       | 良い: 全件が「〜してください」で行動を示し、email は例で形式を示す                                    | 良い: エラー文言は on-submit と同一。「問題ありません」の言い切りは論点                                                      |
| feedback quality      | 重要 | 許容: 解消は文言が消えることでしか伝わらず、次の離脱まで分からない                                       | 許容: 見出しで結果と件数は伝わるが、修正後も再送信まで文言が残る                                      | UX writing は良い: 誤りと解消が即時に文言で伝わる。interaction / motion は許容: 完了文言に成功色がなく、成功表示の量も増える |
| interaction clarity   | 重要 | 許容: 入力中は解消済みのエラーが残り、変化に気づきにくい                                                 | 許容: 要約から項目への移動は明確だが、修正後も再送信まで無効の表示が残る                              | 保留: 表示名の初回離脱で文言が挿入され、送信ボタンの初回クリックが外れる可能性がある。実操作で判定する                       |
| perceived performance | 参考 | 許容: 修正の確認に離脱が 1 回必要                                                                        | 許容: 修正の確認に再送信と要約からの往復が必要                                                        | 良い: 修正の確認が入力中に返り、往復がない                                                                                   |
| visual hierarchy      | 参考 | 良い: ラベル、入力欄、エラー文の順に視線が移る                                                           | 許容: 要約の二重枠と青い送信ボタンが視線を分散させる                                                  | 許容: 成功文と誤り文が同じ大きさと位置に並び、色だけで区別する                                                               |
| consistency           | 参考 | 良い: Constraints をすべて満たす                                                                         | 課題あり: 送信ボタンが青で、無効時の枠線幅も 2px と異なる                                             | 課題あり: 完了文が黒の通常字で、文言サイズも 14px と異なる                                                                   |
| maintainability       | 参考 | 良い: 責務が分かれ、特殊な API は `flushSync` の 1 か所だけ                                              | 許容: 要約リンクの挙動が実行基盤の hash 選択に依存する                                                | 許容: 項目定義が 7 つの定数に分散し、通知文の組み立てが重複する                                                              |

必須の軸で課題ありがある variant: なし。
重要の軸で保留がある variant: realtime（interaction clarity）。
feedback quality は realtime で観点の判定が割れた（UX writing は良い、interaction / motion は許容）。

## 観点別の要点

### designer

- on-blur は Constraints をすべて満たし、視線の順序も自然である。
- on-submit は送信ボタンの色と無効時の枠線幅、realtime は完了文の色と文言サイズが共通の制約から外れる。
- 3 variant ともフォームに見出しがなく、画面の目的が視覚的に示されない。
- 記録: [evaluation/designer.md](evaluation/designer.md)

### UX writing

- 対処法つきの文言（on-submit、realtime）は一読で次の行動が分かる。事実のみ（on-blur）は推測に頼る。
- realtime の「問題ありません」は `@` の有無だけの確認に対して言い切りが強い。
- 3 variant ともパスワードと表示名の規則を事前に案内せず、エラーで初めて規則を知る。
- 記録: [evaluation/ux-writing.md](evaluation/ux-writing.md)

### accessibility

- コントラストは全 variant で AA を満たす。
- on-blur は blur 時のエラーがスクリーンリーダーに送信まで伝わらず、仮説「必要な時に指摘できる」が支援技術では成り立たない。
- 3 variant とも成功時にフォームを差し替えるためフォーカスが body に落ち、読み上げは環境依存になる。
- 記録: [evaluation/accessibility.md](evaluation/accessibility.md)

### interaction / motion

- 修正の完了が伝わる時点が variant で異なる。on-blur は次の離脱、on-submit は再送信、realtime は入力中。
- realtime は表示名の初回離脱で文言が挿入されて送信ボタンが動き、初回クリックが外れる経路がコードから読める。
- realtime だけに動きがあるが、reduced motion で無効にしても意味は保たれる。
- 記録: [evaluation/interaction-motion.md](evaluation/interaction-motion.md)

### implementation

- 検証規則が variant 間で一致しない。空白の扱いが 3 通り、表示名の文字数の数え方が 2 通りある。
- 「描画してからフォーカス」を `flushSync`、`useEffect`、描画前 focus と live region の 3 通りで解いている。
- CSS の複製がすでにずれている。入力枠の色、フォーカス色、送信ボタンの色、角丸、文言サイズが異なる。
- 記録: [evaluation/implementation.md](evaluation/implementation.md)

## 人間の判断待ちの論点

1. 検証タイミングの 3 案のどれを採用するか。必須の 2 軸で課題ありはなく、on-submit だけが両方で良い。realtime は interaction clarity が保留である。
2. realtime の初回クリックの取りこぼしを実操作で確認するか。再現すれば課題ありになる。文言領域の高さを事前に確保する改善案がある。
3. 成功時のフォーカスの扱いを共通の設計判断にするか。完了文言へフォーカスを移す案と、live region を常設する案がある。
4. Constraints からの逸脱を修正して再評価するか、記録して許容するか。対象は on-submit の送信ボタンの色と枠線幅、realtime の完了文の色とサイズ、検証規則の空白と文字数の扱いである。
5. 次の Experiment の Brief に共通仕様として加えるか。候補は `autoComplete`、必須の明示、送信ボタンの色と角丸とフォーカス色、文言サイズ、motion の扱いである。
6. realtime の「問題ありません」を残すか。「形式は正しいです」のように範囲を限る文言が候補である。
7. on-submit の「修正後も再送信まで古い文言が残る」設計を保つか。blur で解消を反映する案が候補である。
8. 判断の前に実機のスクリーンリーダー（VoiceOver と Safari、NVDA と Chrome）で確認するか。
