# Catalog の visual direction の評価

- Experiment: [README](README.md)
- 評価日: 2026-09-20
- 対象 variant: precision-keyboard、quiet-hierarchy、playful-chroma
- 観点: designer、UX / product、interaction / motion、accessibility、implementation
- 手順: [docs/evaluation/review.md](../../docs/evaluation/review.md)
- 実サイズ: `http://localhost:5183/#catalog-redesign/precision-keyboard` と同じ slug の残り 2 件

## 評価軸と重み

| 軸                     | 重み | 選定理由                                    | 担当する観点                       |
| ---------------------- | ---- | ------------------------------------------- | ---------------------------------- |
| accessibility          | 必須 | キーボードと reduced motion が Brief の制約 | accessibility                      |
| visual hierarchy       | 必須 | 成果物の主役度をこの軸で見る                | designer                           |
| discoverability        | 重要 | 探索性。トップから一覧と詳細へ届くか        | UX / product、interaction / motion |
| interaction clarity    | 重要 | 操作の分かりやすさが variant の軸           | interaction / motion               |
| motion appropriateness | 重要 | hover と遷移の差が Brief の比較対象         | interaction / motion               |
| brand fit              | 重要 | 借りた役割が表層模倣になっていないか        | designer                           |
| implementation cost    | 参考 | 公開 Catalog へ持ち込む工数                 | implementation                     |

成果物の主役度は visual hierarchy に含める。
独立した軸にはしない。

## 比較表

| 軸                     | 重み | precision-keyboard                                                                              | quiet-hierarchy                                                           | playful-chroma                                                                                     |
| ---------------------- | ---- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| accessibility          | 必須 | 許容: ⌘K と矢印がある。ダイアログに見出しがある。コントラストは暗い面で高い。フォーカスは見える | 許容: タブで辿れる。コマンドパレットは無い。見出しは大きい                | 許容: タブで辿れる。色の差に依存するチップがある。フォーカスは青い輪                               |
| visual hierarchy       | 必須 | 許容: 行の選択が先に目立つ。specimen は詳細で主役。トップはリストが主                           | 良い: トップで 1 件の live が大きく、他は下のリンク。詳細も specimen が先 | 許容: 色面が同時に 3 つ並ぶ。詳細では live が主。トップはカード群が競合しうる                      |
| discoverability        | 重要 | 良い: 検索と ⌘K で 3 件へ即届く。一覧と詳細の戻りがある                                         | 許容: トップから 2 件目以降はリンク。検索は無い                           | 許容: 入口のカードは見つけやすい。role の色の凡例は無い                                            |
| interaction clarity    | 重要 | 良い: 選択行、⌘K、Escape の戻りが対応する。送信のトグルに status がある                         | 許容: ボタンは明確。キーボード専用の短絡は無い                            | 許容: カードは押せる。ホバー移動はポインタ依存                                                     |
| motion appropriateness | 重要 | 許容: 120ms の背景と影。reduced motion で移動を弱める。コマンド出現に位置移動はほぼ無い         | 良い: 色と透明度だけ。ホバーは透明度。頻度の高い切替を動かさない          | 許容: ホバーで 2px と scale。reduced motion では transform を止める。喜びのコピーは稀な完了に限定  |
| brand fit              | 重要 | 許容: Raycast の精密さは役割として出る。暗いホスト色は「ブランド色を持たない」公開方針と張る    | 良い: 静かな殻と大きな標本が Issue の Quiet shell 仮説に近い              | 許容: Arc 的な色は人間味を出す。公開ホストが固有色を持たない判断とは別に、比較軸として明示している |
| implementation cost    | 参考 | 許容: パレットとキー処理がある。依存は増やしていない                                            | 良い: 画面状態と CSS だけ。部品が少ない                                   | 許容: カードグリッドと role 色。パレットよりは軽い                                                 |

必須の軸で課題ありがある variant: なし。

## 観点別の要点

### designer

- quiet-hierarchy は 1 度に 1 つの主役が最も明確である。
- precision-keyboard はリストの精密さが先に来る。
- playful-chroma は色が記憶に残るが、トップで標本が並走する。
- 記録: [evaluation/designer.md](evaluation/designer.md)

### UX / product

- 検索があるのは precision-keyboard だけである。
- 3 案ともトップ・一覧・詳細を行き来できる。
- 記録: [evaluation/ux-product.md](evaluation/ux-product.md)

### interaction / motion

- キー短絡は precision-keyboard に偏る。
- 動きの予算は playful-chroma が最も多い。quiet-hierarchy は動かさない側である。
- 記録: [evaluation/interaction-motion.md](evaluation/interaction-motion.md)

### accessibility

- 3 案とも live の完了に `role="status"` がある。
- パレットはダイアログにした。フォーカストラップは未実装である。
- 記録: [evaluation/accessibility.md](evaluation/accessibility.md)

### implementation

- 新規 npm 依存は無い。
- 公開面へ移すならホスト色の衝突を先に決める必要がある。
- 記録: [evaluation/implementation.md](evaluation/implementation.md)

## 人間の判断

2026-09-20。利用者の決定である。
公開殻は `hairline-float`。役割は `quiet-hierarchy` の静かな階層と標本優先。
3 variant は公開サイトの正にしない。`playful-chroma` の人格と遊び copy は使わない。
詳細は [README の Decision](README.md) にある。
