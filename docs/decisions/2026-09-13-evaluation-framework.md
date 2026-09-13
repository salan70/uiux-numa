# UI/UX evaluation framework を決める

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #3](https://github.com/salan70/uiux-numa/issues/3)、[評価の方針](../evaluation/policy.md)

## 背景

[評価の方針](../evaluation/policy.md)は、総合点だけで評価しないことを定めた。
軸と重みを Experiment ごとに変え、複数観点でレビューし、最終判断は人間が行う。
最初の Experiment（#4）で実際に使える手順と記録形式が必要になった。
レビューは観点ごとに AI agent を並列に動かす運用を前提にする。

## 決定

- 判定は課題あり、許容、良いの 3 段階にする。根拠が足りないときは保留とし、理由を書く。
- 重みは必須、重要、参考の 3 段階にする。数値にせず、加重合計を計算しない。
- 軸と重みは Experiment ごとに選び、選定理由と共に `evaluation.md` に記録する。accessibility は既定で必須にする。
- 観点は 7 種類を定義し、Experiment ごとに選ぶ。観点ごとに独立したレビュアーが担当する。AI agent なら別の agent にする。
- 判定には該当箇所を含む観察を必須にする。総合点、順位、おすすめは書かない。
- 記録は `evaluation.md` を入口とし、観点別の記録を `evaluation/<perspective>.md` に置く。比較表は軸 × variant とし、セルに判定と根拠を書く。
- 軸の定義は `docs/evaluation/axes.md`、手順は `docs/evaluation/review.md`、テンプレートは `docs/templates/experiment/evaluation.md` に置く。

## 却下した案

- 単一スコアや加重合計: 方針に反する。差の理由が数値に埋もれ、判断履歴として使えない。
- 5 段階や 10 段階の尺度: AI の判定がぶれ、段階の差を根拠で説明できない。3 段階なら判定と根拠が対応する。
- 観点を全 Experiment で固定する: 目的に応じて軸を変える方針と合わない。不要な観点のレビューは根拠が薄くなる。
- レビューを 1 agent にまとめる: 観点の独立性が失われ、自己評価に近づく。判定の割れも見えなくなる。
- 数値の重み: 加重合計を誘発する。3 段階の言葉で判断への使い方を示す方が明確である。
- 観点別の記録を README に直接書く: README が肥大化する。観点ごとの並列作業で衝突する。

## 影響

- Experiment の README（#2）は evaluation 節から `evaluation.md` へリンクする。
- 多観点レビューを行う agent は `review.md` の規則と形式に従う。
- 最初の Experiment（#4）で運用する。不足は文書を直し、判断を変える場合は新しい ADR を追加する。
