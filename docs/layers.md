# Lab / Knowledge / Assets

リポジトリは Lab、Knowledge、Assets の 3 層で構成する。
層は作業の置き場である。
完成した Design System へ一方向に昇格する段階ではない。
各成果の使い方は [Asset composition model](asset-model.md) の `role` と `maturity` で表す。

## Lab

UI/UX とプロダクト体験の実験を行う層。
同じ課題に対して UI、interaction、copy、motion などの複数案を実装し、比較・改善する。
完成品だけでなく、却下した案も学習材料として残す。
置き場は `experiments/` とする。
手順は [experiment-lifecycle.md](experiment-lifecycle.md) に定める。

## Knowledge

実験から得た知見を整理する層。
次を蓄積する。

- principles
- patterns
- anti-patterns
- evaluation criteria
- platform-specific learnings
- design decisions
- writing decisions
- interaction / motion learnings

置き場は `docs/` と `patterns/` とする。
原則は `docs/principles/`、評価基準は `docs/evaluation/`、設計判断は `docs/decisions/` に置く。
Pattern と anti-pattern は `patterns/` に置く。

## Assets

他プロジェクトで組み合わせて使う成果を置く層。
`stable` だけを置く場所ではない。
`experimental` な Skill や `candidate` な token もここに置いてよい。
対象例は次のとおり。

- skills
- design tokens
- design systems
- templates
- reusable UI / UX patterns
- writing patterns
- motion / interaction patterns

置き場は `skills/`、`tokens/`、`design-systems/` とする。

## Pattern first

初期段階では、完成された Design System を先に設計しない。
まず実験から再利用可能な Pattern を蓄積する。
Pattern は visual component に限定しない。

Pattern の例:

- floating action dock
- editorial hero
- dense settings
- numeric background
- bottom action area
- empty state
- confirmation copy
- inline validation
- success feedback
- navigation transition
- loading transition
- haptic feedback

各 Pattern には、将来的に次を記録できるようにする。

- when to use
- when not to use
- good examples
- bad examples
- platform considerations
- accessibility considerations
- implementation examples

## Asset への昇格

Pattern を他プロジェクトで再利用できる形に変える手順は [pattern-lifecycle.md](pattern-lifecycle.md) に定める。
昇格は置き場を Assets へ移すことであり、Asset の `maturity` を `stable` にすることではない。
Experiment の `extracted` は抽出の完了であり、再利用前提ではない。

## Asset モデル

`role` と `maturity` は置き場と独立させる。
Lab の Experiment が `reference` でもよい。
Assets の Skill が `experimental` でもよい。
必須 metadata、他プロジェクトでの利用、実例は [asset-model.md](asset-model.md) に定める。
判断は [Asset composition model の ADR](decisions/2026-09-20-asset-composition-model.md) に残す。
ディレクトリ再編は、分類の実例で必要になるまで行わない。

## Design Tokens

Design System より早い段階から導入を検討する。
Web、SwiftUI、Flutter などへ展開できる canonical token source を持つ。
visual token だけでなく、必要性が確認できれば motion などの token 化も検討する。
具体的な仕様、変換方式、ツール選定は後続 Issue で扱う。

## Catalog

Catalog は成果物の visual showcase とする。
仕様書や Asset の正本にはしない。
説明文より先に見て触れ、`role` と `maturity` で再利用の前提を確かめる。
採用成果に限らず、`reference` も探索してよい。

Experiment 本文、原則、開発者向け手順、ADR 全文は Catalog 内で描画しない。
成果物の背景となる方針は二次情報として掲載する。
正本（`docs/guidelines/`）から glob で読み、成果物探索の邪魔をしない。
live variant は専用 route と iframe へ隔離する。
Components の採用 Button は Experiment の実装を直接表示し、ページ全体のスクロールへ統合する。
preview PNG は Experiment の検証資産として `experiments/*/previews/` に残す。
実装は `apps/catalog/` に置く。
公開時の表示名は「UI/UX 沼」とする。
公開は Cloudflare Pages を使う。
責務の判断は [visual showcase の ADR](decisions/2026-09-20-catalog-visual-showcase.md) に残す。
ホストの顔と情報設計の正本は `apps/catalog/` 自身である。
出どころは `topic-first` 案で、記録は `docs/records/catalog-editorial/` にある。
入口は Works の 5 トピックと Guidelines の 2 群にする。
ホストは固有の色を持たず、採用した配色のいずれかを着る（[ホスト ADR](decisions/2026-09-19-catalog-host.md)）。
置き換えの判断は [topic-first ADR](decisions/2026-09-20-catalog-topic-first.md) に残す。

## AI Agent と Skill

最終的な目的は、プロダクト体験の探索プロセス自体を再現可能にすることである。
UI を生成する単発の Skill は目的ではない。

候補:

- ui-explore
- ui-critique
- ui-refine
- ui-compare
- ux-writing-review
- information-architecture-review
- interaction-review
- motion-review
- ui-a11y-review
- ui-platform-review
- ui-state-review
- ui-extract-pattern
- ui-promote-pattern

prompt、skill、reference、過去の decision の違いによる生成結果の差も研究対象に含める。
AI から良い UI/UX を安定して引き出す方法そのものを成果物とする。
