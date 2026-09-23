# Experiment lifecycle

Experiment は「作る → 比較する → 評価する → 知識化する → 再利用する → 実プロジェクトで検証する」の循環で進める。
最終判断は人間が行う。

## 基本フロー

1. Problem / Brief を定義する。
2. 必要な対象領域を特定する。
3. 複数案を実装する。
4. UI/UX を複数の観点から評価する。
5. 人間が判断する。
6. 必要に応じて追加案や改善案を実装する。
7. Decision と rejected reasons を記録する。
8. 再利用可能な知見を抽出する。
9. 再利用できる形があれば Pattern を抽出し、必要なら Asset へ昇格する。
10. 実プロジェクトで利用し、再度フィードバックする。

手順 9 の `extracted` は記録上の抽出完了である。
Asset の `maturity` を `stable` にしたことではない。
分離の規則は [asset-model.md](asset-model.md) に定める。

対象領域は [scope.md](scope.md)、評価の方針は [evaluation/policy.md](evaluation/policy.md) に従う。

## Variant の考え方

見た目だけを比較しない。
必要に応じて copy、情報構造、操作方法、motion、feedback も独立した variant として比較する。
却下した variant は判断まで残す。
判断後はコードを削除し、却下理由を README に残す（[削除の ADR](decisions/2026-09-21-prune-decided-experiments.md)）。

## Experiment で残す情報

problem から related patterns / assets までの 11 項目を残す。
項目、形式、status は [experiment-format.md](experiment-format.md) に定める。
判断の記録先は [判断履歴の ADR](decisions/2026-09-13-decision-records.md) に定める。
