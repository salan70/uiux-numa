# Pattern lifecycle を決める

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #5](https://github.com/salan70/uiux-numa/issues/5)、[Lab / Knowledge / Assets](../layers.md)、[判断履歴の記録先](2026-09-13-decision-records.md)

## 背景

Issue #1 で Pattern first の方針と、Pattern に記録する項目を定めた。
判断履歴の ADR は、Pattern の判断の必須項目を when not to use と bad examples とした。
Experiment から Pattern を抽出し、Asset へ昇格する手順と記録形式が決まっていなかった。
最初の Experiment（#4）から Pattern を 1 件抽出して検証する必要がある。

## 決定

詳細は [Pattern lifecycle](../pattern-lifecycle.md) に定める。
要点は次のとおり。

- Pattern は `patterns/<slug>/README.md` だけで記録する。画像とコードは複製せず、由来 Experiment へリンクする。
- 抽出の基準は、複数の variant または Experiment で有効と確認できた形、原則として一般化できる採用理由、一般化できる却下理由のいずれかにする。
- 抽出は由来 Experiment の status が `decided` になってから行う。Experiment の Related patterns / assets からリンクし、Experiment の status を `extracted` にする。
- README は YAML frontmatter（title、kind、status、created、updated、platforms、domains、sources）と、英語見出し 8 個の本文で構成する。
- anti-pattern も `patterns/` に置き、frontmatter の `kind` で区別する。
- status は `candidate`、`validated`、`promoted` の 3 段階と `retired` にする。`validated` は 2 件目の Experiment または実プロジェクトでの確認を条件にする。
- Asset への昇格は `validated` を前提にし、昇格先ごとの条件を定める。昇格の判断は ADR に残し、Pattern の Sources からリンクする。
- 抽出と昇格は人間が判断する。閾値で自動判定しない。由来 Experiment の記録は変更しない。

## 却下した案

- Experiment 内に Pattern を書き続ける: 複数の Experiment にまたがる知見の正本が決まらない。Experiment が判断時点の記録でなくなる。
- Pattern をコンポーネント実装として置く: 実装はプラットフォームに依存し、Pattern を visual component に限定しない方針に反する。実装例は Experiment の variant へリンクする。
- 昇格を Experiment 数などの閾値で自動判定する: 再利用価値は文脈に依存し、数値の根拠が薄い。人間の判断を記録する方が判断履歴として使える。
- Pattern と anti-pattern を別ディレクトリに分ける: 同じ課題の表裏として並べて読む。`kind` で一覧と絞り込みはできる。
- 画像とコードを `patterns/` に複製する: 正本が 2 つになり、Experiment の更新に追従できない。
- 昇格時に由来 Experiment の記録を更新する: Experiment は判断時点の記録として固定する。昇格は Pattern と ADR に記録する。
- frontmatter に `sources` を持たない: Catalog と一覧で Experiment と Pattern を相互に辿るために必要。本文の Sources は該当 variant と昇格の記録を持ち、役割を分ける。

## 影響

- 最初の Experiment から `patterns/inline-validation/` を抽出し、この形式を検証する。
- Skill、Design Tokens、Design System の Issue は、昇格の条件と手順を前提にする。
- Catalog は frontmatter の `kind`、`status`、`sources` を読む前提にできる。
- 不足は文書を直し、判断を変える場合は新しい ADR を追加する。
