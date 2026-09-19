---
name: reviewing-motion
description: 動きのコードと実操作を、目的、頻度、中断、a11y の観点で点検するときに使う。作者の Block / Approve は 1 観点であり、Experiment の採用判断ではない。実装には crafting-motion を使う。
---

# 動きの点検

動きと状態遷移だけを見る。
機能追加や、動き以外のバグ修正はしない。
一般のコードレビューを求められたら断り、`docs/evaluation/review.md` の担当観点へ向ける。

## 参照

- `skills/reviewing-motion/references/standards.md`
- `docs/evaluation/review.md`
- `docs/evaluation/axes.md` の motion appropriateness、feedback quality、interaction clarity、accessibility
- 対象 Experiment の README と `evaluation.md` の重み

パスはリポジトリのルートからのものである。
`emil-design-eng` は呼び出さない。

## この Skill の位置

出力は interaction / motion 観点の材料である。
作者由来の Block / Approve は、その観点の所見である。
Experiment の Decision ではない。
他観点の記録は読まない。
総合点、順位、おすすめの variant は書かない。

要件と仮説を混ぜない。

- 要件: キーボードで操作できる、状態が支援技術に伝わる、`prefers-reduced-motion` がある、hover をタッチ誤爆させない
- 仮説: 300ms 上限、キーボードなら無音、`ease-in` 禁止、GPU 属性のみ。外れていても、観察と Brief の頻度に照らして判定する

性能の指摘は計測または再現手順を付ける。
無いときは保留にし、何があれば判定できるかを書く。

## 見る項目

1. 目的があるか。ない動きは削除候補にする。
2. 頻度と Brief の利用状況が合っているか。一律のキーボード禁止で稀な完了まで消していないか。
3. 入退場の曲線が観察上遅れて見えないか。表の曲線は出発点である。
4. 時間が操作の理解を助けているか。300ms 超は理由を求めるが、理由があれば即 Block にしない。
5. 原点と `scale(0)` の入場がないか。
6. 連続操作と中断で破綻しないか。keyframes の再開が邪魔なら指摘する。
7. layout 属性の変化がクリック取りこぼしや段飛びを起こしていないか。起きたら interaction clarity の根拠にする。
8. reduced motion と hover のゲートがあるか。
9. 決める相と応答の時間が意図と逆になっていないか。
10. 画面の調子と動きが喧嘩していないか。迷ったら減らす案を書く。

コードと実操作の両方を見る。
通常速度で見て、必要な箇所だけ低速とコマ送りにする。

## 直し方の順

1. 消す
2. 短く、小さくする
3. 曲線を変える
4. 原点を直す
5. 中断できるようにする
6. layout 変化を避けるか、高さを確保してクリックを守る
7. 決める相と応答の時間を分ける
8. reduced motion と hover ゲートを足す

## 出力

生成セッションで点検表が出なくても、実装を止めない。
評価は別 agent が `docs/evaluation/review.md` の interaction / motion 観点で行う。
この Skill の出力は、その観点の入力であり、代替ではない。

観点別ファイルへ書くときは `docs/evaluation/review.md` の形式を使う。
動きだけの点検メモが必要なときは、次の 2 部にする。

### 1. 指摘表

| 箇所      | 観察         | 提案   | 種別        |
| --------- | ------------ | ------ | ----------- |
| `file:行` | 何が起きるか | 代わり | 要件 / 仮説 |

「Before / After」表は仮説の修正案に使ってよい。
要件の欠落は仮説と同じ列に混ぜない。

### 2. 所見

影響の大きい順に書く。空の節は省略する。

1. 操作が分からなくなる
2. 消した方がよい動き
3. 性能（計測または保留）
4. 中断と時間
5. 原点と調子
6. アクセシビリティ

末尾の Block / Approve は「interaction / motion 観点の所見」と明記する。
人間の Decision に書き換えない。

## 落とし穴

- 作者の好みを必須の accessibility 判定に使う。
- 1 Skill の Approve を Experiment の採用にする。
- 未計測のまま「GPU だから速い」と書く。
- 生成中に点検表が無いことを、Skill 未読込や見送り理由にする。
