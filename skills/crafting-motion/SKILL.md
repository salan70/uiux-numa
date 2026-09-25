---
name: crafting-motion
description: UI の動きを、動かすべきか、目的、手段、属性、曲線と時間、中断、終了の順で設計し実装するときに使う。既存の動きの点検には reviewing-motion を使う。
---

# 動きの実装

最初に決めるのは「動かすか」で、動かさない判断も成果である。
採用は人間が決める。

## 参照

パスはリポジトリのルートからのものである。

- 対象 Experiment の README の Brief、Constraints、利用頻度
- `skills/reviewing-motion/references/standards.md`: 要件と仮説の出発値
- `skills/crafting-motion/references/recipes.md`: 部品ごとの token の当てはめ
- `tokens/motion/README.md`: duration と easing の token と使用規則
- `docs/evaluation.md` の motion appropriateness と feedback quality
- 分岐は `skills/exploring-ui-variants/SKILL.md`、点検は `skills/reviewing-motion/SKILL.md`

## 手順

1. Brief の利用頻度から動かすかを決める。動かさないなら即座の状態変化を実装し、理由を書く。
2. 目的を出発値の語彙から 1 語で置く。読み取り中のデータを見た目のために動かさない。
3. 手段は CSS transition、`@starting-style`、CSS animation、WAAPI の順に安いものを選ぶ。新規ライブラリは Brief が許す場合だけ入れる。
4. 属性、曲線、時間は出発値と token に従う。外れる値は根拠を書いて variant 内の局所値にする。
5. 要件（reduced motion、hover のゲート）を同時に入れる。後回しにしない。
6. 連続操作と中断を実操作で確かめる。

Experiment では目的が同じでも手段の違う候補を残してよい。
各候補に目的と代償を 1 行で付け、1 案に決め打ちしない。

## 出力

コードに続けて次を短く書く。

- 頻度の判断と目的。動かさなかったものがあれば理由
- 手段、属性、曲線、時間。出発値と token から外れた値の根拠
- コードから判断できない感触を、2〜5 倍速、コマ送り、実機のどれで見るか

性能とフレーム落ちは、計測なしで断定しない。

## 落とし穴

- 出発値の数値を必須にすると、稀な完了画面の因果まで消える。頻度は Brief で判断する。
- 親の CSS 変数で子の transform を一括駆動しない。対象要素へ直接書く。
