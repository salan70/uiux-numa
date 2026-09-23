# 文書の地図

`docs/` の文書を区分ごとに案内する。
各行の文書が、その内容の正本である。

## 構成と思想

- [scope.md](scope.md): 対象領域
- [layers.md](layers.md): Lab / Knowledge / Assets と置き場
- [asset-model.md](asset-model.md): `role` と `maturity` の Asset モデル

## Experiment と Pattern

- [experiment-lifecycle.md](experiment-lifecycle.md): Experiment の流れ
- [experiment-format.md](experiment-format.md): Experiment の記録形式と status
- [pattern-lifecycle.md](pattern-lifecycle.md): Pattern の抽出と Asset への昇格

## 評価

- [evaluation/policy.md](evaluation/policy.md): 評価の方針
- [evaluation/axes.md](evaluation/axes.md): 17 の評価軸と判定の目安
- [evaluation/review.md](evaluation/review.md): 評価の実行手順と記録形式

## Guideline と原則候補

- [guidelines/](guidelines/README.md): 主題ごとの指針。読み手向けの入口
- [guideline-format.md](guideline-format.md): Guideline の書式と機械検査
- [principles/](principles/README.md): 原則候補と採否の判断手順

## Catalog

- [catalog-publishing.md](catalog-publishing.md): UI/UX NUMA の Cloudflare Pages 公開手順

## 記録と雛形

- [decisions/](decisions/): リポジトリの設計判断（ADR）
- [records/](records/): 削除した Experiment の記録
- [templates/](templates/): Experiment、Pattern、Guideline の雛形
- [../skills/README.md](../skills/README.md): UI/UX 固有 Skill の成熟度と改善手順

### ADR の見出し

ADR の見出しには `状態`、`日付`、`参照` を置く。
判断の一部が後の ADR に置き換えられたら、古い ADR に `置き換え先:` を足し、新しい ADR に `置き換え元:` を書く。
全体が置き換えられたら、古い ADR の `状態` を `Superseded` にする。
ADR の本文は書き換えない。
既存 ADR には `置き換え:` と `更新:` の表記も残っている。
向きは本文で確かめる。

### records

`docs/records/<slug>/` は、削除した Experiment の記録文書の置き場である。
他の文書が Markdown リンクで出どころにしている記録だけを移す。
コード、variant、preview は移さず、各記録の冒頭に書いた commit から Git 履歴で辿る。
削除の規則は [削除の ADR](decisions/2026-09-21-prune-decided-experiments.md) と [掲載しない Experiment の ADR](decisions/2026-09-22-unlisted-experiments.md) に従う。
