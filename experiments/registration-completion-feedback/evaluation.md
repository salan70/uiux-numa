# 登録完了の遷移とフィードバックの評価

- Experiment: [README](README.md)
- 評価日: 2026-09-20
- 対象 variant: no-skill-replace、no-skill-confirm、no-skill-next、with-skill-replace、with-skill-confirm、with-skill-next
- 観点: accessibility、interaction / motion、UX writing、implementation
- 手順: [docs/evaluation/review.md](../../docs/evaluation/review.md)

操作根拠は headless Chrome の CDP である。
Cursor の browser MCP はタブ作成後に view を見失った。
preview は `previews/<id>-{initial,error,success,success-reduced}.png` である。

## 評価軸と重み

| 軸                     | 重み | 選定理由                             | 担当する観点                     |
| ---------------------- | ---- | ------------------------------------ | -------------------------------- |
| accessibility          | 必須 | キーボードと支援技術で完了できること | accessibility                    |
| interaction clarity    | 必須 | 完了と次操作の分かり方               | interaction / motion             |
| feedback quality       | 必須 | 成功の伝え方                         | interaction / motion、UX writing |
| motion appropriateness | 必須 | 動きの適否が派生 Skill の仮説        | interaction / motion             |
| writing clarity        | 重要 | 完了文と次操作の文言                 | UX writing                       |
| perceived performance  | 参考 | 未計測なら保留                       | interaction / motion             |
| implementation cost    | 参考 | Skill の有無による作業量             | implementation                   |

## 比較表

| 軸                     | 重み | no-skill-replace                                        | no-skill-confirm                             | no-skill-next                | with-skill-replace                    | with-skill-confirm                                               | with-skill-next                               |
| ---------------------- | ---- | ------------------------------------------------------- | -------------------------------------------- | ---------------------------- | ------------------------------------- | ---------------------------------------------------------------- | --------------------------------------------- |
| accessibility          | 必須 | 良い: 完了見出しへフォーカス。aria-invalid あり         | 良い: 確認面へフォーカス。入力は読み取り専用 | 良い: 完了見出しへフォーカス | 良い: 完了見出し id へフォーカス      | 課題あり: 成功後のフォーカスが `body`                            | 良い: 完了見出しへフォーカス                  |
| interaction clarity    | 必須 | 良い: 差し替えと 1 つの次操作                           | 許容: 確認と「登録済み」が同時に見える       | 良い: 段階と次操作が並ぶ     | 良い: 差し替えと 1 つの次操作         | 課題あり: 「登録しました」とログインが競合し、フォーカスが消える | 許容: ステップ 2 がログインなのに見出しは完了 |
| feedback quality       | 必須 | 良い: 完了文とメールが残る                              | 良い: 入力内容を見返せる                     | 良い: 完了と次操作を分ける   | 良い: 完了文とログイン案内            | 許容: status で伝わるがボタン文言も変わる                        | 良い: 完了と次がログインと明示                |
| motion appropriateness | 必須 | 許容: reduced motion でも文言は残る。生成時の実操作なし | 許容: 同じ                                   | 許容: 同じ                   | 許容: 目的と 120ms 遅延を記録。未計測 | 許容: 確認の入場を transition と記録。未計測                     | 許容: 350ms を例外として記録。未計測          |
| writing clarity        | 重要 | 良い: 完了とようこそ                                    | 許容: 確認文が狭い面で折り返す               | 良い: 次にできることがある   | 良い: 作成したとログインできる        | 許容: 「登録しました」と「完了しました」が重複                   | 良い: 次はログインです                        |
| perceived performance  | 参考 | 保留: 疑似 800ms。未計測                                | 保留                                         | 保留                         | 保留: 疑似 900ms。未計測              | 保留                                                             | 保留                                          |
| implementation cost    | 参考 | 許容: 36 ターン、4.31 USD                               | 同左（同一セッション）                       | 同左                         | 許容: 66 ターン、6.01 USD で 3 案     | 同左                                                             | 同左                                          |

必須の軸で課題ありがある variant: `with-skill-confirm`（accessibility、interaction clarity）。

## 観点別の要点

### accessibility

- 6 案とも空送信で `aria-invalid` が付き、要約へフォーカスした。
- `with-skill-confirm` だけ成功後にフォーカスが `body` へ落ちた。
- 記録: [evaluation/accessibility.md](evaluation/accessibility.md)

### interaction / motion

- 差し替え 2 案は完了面が明確である。
- confirm は Skill ありがボタン変化と確認面で役割が割れる。
- 動きの性能は未計測のため保留に近い許容である。
- 記録: [evaluation/interaction-motion.md](evaluation/interaction-motion.md)

### UX writing

- 完了の言い切りは 6 案とも一読で分かる。
- Skill あり confirm は成功を 2 つの文言で繰り返す。
- 記録: [evaluation/ux-writing.md](evaluation/ux-writing.md)

### implementation

- 追加 npm 依存はない。token と wasabi を写している。
- Skill ありは費用とターンが増え、根拠の文章が増えた。
- 記録: [evaluation/implementation.md](evaluation/implementation.md)

## 人間の判断待ちの論点

1. 派生 3 Skill を継続利用するか、修正して再評価するか、見送りか。
2. `reviewing-motion` を評価手順へどう接続するか。今回の生成は点検表を出していない。
3. `with-skill-confirm` のフォーカス落ちを、Skill の欠陥として直すか、1 variant の実装ミスとして切り分けるか。
