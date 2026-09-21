# 入力フォームの inline validation の評価

- Experiment: [README](README.md)
- 評価日: 2026-09-13（hybrid の追記と保留の確認は 2026-09-17）
- 対象 variant: on-blur、on-submit、realtime、hybrid
- 観点: designer、UX writing、accessibility、interaction / motion、implementation
- 手順: [評価手順](../../evaluation/review.md)

## 評価の経緯

1. 2026-09-13 に on-blur、on-submit、realtime の 3 variant を 5 観点で評価した。
2. 人間の判断で、追加案 hybrid を実装した（lifecycle 手順 6）。
3. 2026-09-17 に 5 観点が hybrid を各記録へ追記した。既存の判定の変更は 1 件だけである。interaction / motion が on-blur の interaction clarity を許容から保留に変えた。
4. interaction clarity の保留 3 件を、Experiment の担当者が実際のマウス操作で確認した。結果は「保留の確認」に記録する。

interaction / motion の再レビューは、この evaluation.md の比較表を読んだ状態で行った。
review.md の「他の観点の記録を読まない」から外れるため、ここに記録する。

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

| 軸                    | 重み | on-blur                                                                                              | on-submit                                                                                            | realtime                                                                                                                       | hybrid                                                                                                                 |
| --------------------- | ---- | ---------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| accessibility         | 必須 | 許容: blur 時のエラーに live region がなく、送信まで伝わらない。`autoComplete` がない                | 良い: 要約へのフォーカス移動とリンクからの移動がある。`autoComplete` がある                          | 許容: live region で変化が伝わるが、送信時のフォーカス移動が描画より先。`autoComplete` がない                                  | 許容: 要約、`autoComplete`、完了文へのフォーカス移動が揃う。ただし送信後の blur 再検証に live region がない            |
| writing clarity       | 必須 | 許容: 事実だけを述べ、次の行動は推測に頼る                                                           | 良い: 全件が行動を示し、email は例で形式を示す                                                       | 良い: エラー文言は on-submit と同一。「問題ありません」の言い切りは論点                                                        | 良い: エラー文言は on-submit と同一。成功文言を出さない                                                                |
| feedback quality      | 重要 | 許容: 解消は次の離脱まで分からない                                                                   | 許容: 修正後も再送信まで文言が残る                                                                   | 割れた。UX writing は良い: 誤りと解消が即時に伝わる。interaction / motion は許容: 完了文言に成功色がなく、成功表示の量が増える | 割れた。UX writing は良い: 解消が離脱時に文言と件数で伝わる。interaction / motion は許容: 入力中は解消済みの文言が残る |
| interaction clarity   | 重要 | 課題あり（実操作で再現）: 修正直後に送信ボタンを押すと、文言が消えてボタンが 28px 動き、送信されない | 許容: 要約から項目への移動は明確だが、修正後も再送信まで無効の表示が残る。修正直後の押下は送信できた | 課題あり（実操作で再現）: 表示名から離脱せずに押すと、成功文言が挿入されてボタンが 25px 動き、送信されない                     | 課題あり（実操作で再現）: 修正直後に押すと、文言と要約が消えてボタンが 134px 動き、送信されない                        |
| perceived performance | 参考 | 許容: 修正の確認に離脱が 1 回必要                                                                    | 許容: 修正の確認に再送信と往復が必要                                                                 | 良い: 修正の確認が入力中に返る。取りこぼしの再現により interaction / motion の見直し対象                                       | 許容: 誤りの把握に送信、修正の確認に離脱が要る                                                                         |
| visual hierarchy      | 参考 | 良い: ラベル、入力欄、エラー文の順に視線が移る                                                       | 許容: 要約の二重枠と青い送信ボタンが視線を分散させる                                                 | 許容: 成功文と誤り文が同じ大きさと位置で、色だけで区別する                                                                     | 良い: 要約、エラーの項目、送信ボタンの順に視線が移り、競合する色がない                                                 |
| consistency           | 参考 | 良い: Constraints をすべて満たす                                                                     | 課題あり: 送信ボタンが青で、無効時の枠線幅も 2px と異なる                                            | 課題あり: 完了文が黒の通常字で、文言サイズも 14px と異なる                                                                     | 良い: Constraints を満たし、値は on-blur と同じ                                                                        |
| maintainability       | 参考 | 良い: 責務が分かれ、特殊な API は `flushSync` の 1 か所だけ                                          | 許容: 要約リンクの挙動が実行基盤の hash 選択に依存する                                               | 許容: 項目定義が分散し、通知文の組み立てが重複する                                                                             | 許容: 検証関数と errors を共有するが、要約リンクが実行基盤に依存し、`submitCount` が 2 役を持つ                        |

必須の軸で課題ありがある variant: なし。
重要の軸で課題ありがある variant: on-blur、realtime、hybrid（いずれも interaction clarity）。
重要の軸で課題ありがない variant: on-submit。

## 保留の確認

interaction / motion は、送信ボタンのクリックが外れる可能性を保留にした。
原因は、離脱で文言や要約の高さが変わることである。
判定の条件は「再現しなければ許容、再現すれば課題あり」とされていた。
Experiment の担当者が、headless Chrome に実際のマウスイベントを送って確認した。

- 送信ボタンの中心で押し、100ms 後に同じ座標で離した。0ms でも同じ結果だった。
- 対照として、高さが変わらない状態で押す場合も確認した。
- 判定は送信イベントの有無と完了文言の表示で行った。

| variant   | 操作                                               | ボタンの移動 | 結果                                 |
| --------- | -------------------------------------------------- | ------------ | ------------------------------------ |
| on-blur   | パスワードのエラーを直した直後に押す               | 上へ 28px    | 送信されない。click は main に届いた |
| on-blur   | 対照: 全項目が離脱済みで押す                       | なし         | 送信された                           |
| on-submit | 対照: 送信でエラー後、パスワードを直した直後に押す | なし         | 送信された                           |
| realtime  | 表示名を初めて入力し、離脱せずに押す               | 下へ 25px    | 送信されない。click は form に届いた |
| realtime  | 対照: 全項目が離脱済みで押す                       | なし         | 送信された                           |
| hybrid    | 送信でエラー 1 件後、表示名を直した直後に押す      | 上へ 134px   | 送信されない。click は html に届いた |
| hybrid    | 対照: 表示名を直して離脱してから押す               | なし         | 送信された                           |

- 押下時の blur で React が同期的に再描画し、離す位置の要素が送信ボタンでなくなる。押し方の速さでは避けられない。
- 確認は Chrome だけで行った。Safari はボタンの押下でフォーカスを移さないため、結果が異なる可能性がある。タッチ操作も未確認である。
- 修正直後の送信は、エラーを直した利用者が最も通りやすい経路である。

## 観点別の要点

### designer

- on-blur と hybrid は Constraints を満たし、視線の順序も自然である。
- on-submit は送信ボタンの色と無効時の枠線幅が共通の制約から外れる。realtime は完了文の色と文言サイズが外れる。
- hybrid の完了文のフォーカスリングは幅 24rem の枠として写り、入力欄のように見える。
- 4 variant ともフォームに見出しがない。
- 記録: [evaluation/designer.md](evaluation/designer.md)

### UX writing

- 対処法つきの文言（on-submit、realtime、hybrid）は一読で次の行動が分かる。事実のみ（on-blur）は推測に頼る。
- hybrid は修正が文言に反映される時点を、再送信から離脱時に早める。件数の減少が修正の進みを伝える。
- hybrid で最後の 1 件を直すと、要約が消えるだけで解消を伝える文言がない。
- 4 variant ともパスワードと表示名の規則を事前に案内しない。
- 記録: [evaluation/ux-writing.md](evaluation/ux-writing.md)

### accessibility

- コントラストは全 variant で AA を満たす。
- hybrid だけが完了文へフォーカスを移し、フォーカスが body に落ちない。
- on-blur と hybrid は、blur 時の文言の変化がスクリーンリーダーに伝わらない。
- hybrid で最後のエラーがメールアドレスのとき、Shift+Tab で要約が消える。フォーカスが body に落ちる経路がコードから読め、実機確認が要る。
- 記録: [evaluation/accessibility.md](evaluation/accessibility.md)

### interaction / motion

- 修正の完了が伝わる時点は、on-blur と hybrid が離脱時、on-submit が再送信、realtime が入力中である。
- 離脱で高さが変わる 3 variant は、修正直後の送信クリックが外れる。上の「保留の確認」で再現した。
- hybrid の要約リンクも、上の項目を直してから押すとリンクが約 24px ずれる経路がある。
- 記録: [evaluation/interaction-motion.md](evaluation/interaction-motion.md)

### implementation

- 検証規則が variant 間で一致しない。hybrid は Brief に沿うが、表示名の数え方が on-submit と realtime と異なる。
- 「描画してからフォーカス」の書き方が 3 通りある。hybrid は `useEffect` に揃えている。
- CSS の複製は 4 回になり、要約の見た目も on-submit と hybrid で異なる。
- 記録: [evaluation/implementation.md](evaluation/implementation.md)

## 人間の判断待ちの論点

1. どの variant を採用するか。重要の軸で課題ありがないのは on-submit だけである。on-submit は必須の 2 軸でも良いである。
2. 離脱で高さが変わる設計を直した案をもう 1 回評価するか。文言の領域を事前に確保する、要約を再送信まで縮めない、などの改善案がある。
3. 成功時のフォーカスを完了文へ移すことを共通の設計にするか。hybrid で実装済みだが、フォーカスリングの見え方は論点である。
4. 次の Experiment の Brief に共通仕様として加えるか。候補は `autoComplete`、必須の明示、見出し、送信ボタンの色と角丸、文言サイズ、検証規則の数え方である。
5. 実機のスクリーンリーダーと Safari、タッチ操作で確認するか。対象は要約の読み上げ範囲、blur 時の変化の伝わり方、クリックの取りこぼしである。
