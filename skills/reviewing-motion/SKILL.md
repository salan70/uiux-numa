---
name: reviewing-motion
description: 動きのコードと実操作を、目的、頻度、中断、a11y の観点で点検するときに使う。作者の Block / Approve は 1 観点であり、Experiment の採用判断ではない。実装には crafting-motion を使う。
---

# 動きの点検

動きと状態遷移だけを見る。機能追加と動き以外のバグ修正はしない。
一般のコードレビューを求められたら断り、`docs/evaluation.md` の担当観点へ向ける。

## 参照

パスはリポジトリのルートからのものである。

- `skills/reviewing-motion/references/standards.md`: 要件と仮説の出発値
- `docs/evaluation.md` の interaction / motion 観点と記録形式
- 対象 Experiment の README と `evaluation.md` の重み

## 位置付け

- 出力は interaction / motion 観点の材料であり、Experiment の Decision ではない。
- 総合点、順位、おすすめの variant を書かない。他観点の記録を読まない。
- 要件の欠落と仮説からの逸脱を分けて判定する。仮説から外れていても、Brief の頻度と観察に照らして判定する。
- 生成セッションで点検表が出なくても実装を止めない。評価は別 agent が観点として行う。

## 見る項目

1. 目的が無い動きは削除候補にする。
2. 頻度が Brief の利用状況と合っているか。キーボード起点を一律に禁じて稀な完了まで消していないか。
3. 300ms 超は理由を求めるが、理由があれば Block にしない。
4. 連続操作と中断で破綻しないか。
5. layout 属性の変化でクリックの取りこぼしや段飛びが起きていないか。
6. reduced motion と hover のゲートがあるか。

コードと実操作の両方を見る。
直す提案は、消す、短く小さくする、曲線、原点、中断、layout の回避、決める相と応答の分離、ゲートの順で軽いものから出す。

## 出力

観点別ファイルへ書くときは `docs/evaluation.md` の形式にする。
動きだけの点検メモは次の 2 部にする。

指摘表は `箇所`（`file:行`）、`観察`、`提案`、`種別`（要件 / 仮説）の 4 列にする。
所見は影響の大きい順に、操作が分からなくなる、消した方がよい動き、性能（計測または保留）、中断と時間、原点と調子、アクセシビリティの節で書き、空の節は省く。
末尾の Block / Approve は「interaction / motion 観点の所見」と明記し、人間の Decision に書き換えない。
