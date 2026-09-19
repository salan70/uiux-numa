# Experiment の記録形式を決める

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #2](https://github.com/salan70/uiux-numa/issues/2)、[Experiment lifecycle](../experiment-lifecycle.md)
- 補足: 名前で選ぶ variant、評価の前の却下、評価を経ない判断の記録は [補足の ADR](2026-09-17-named-variants-and-unevaluated-decisions.md) で追加した。
- 補足: SVG の `source/` と `dist/`、variant 横断の `compare-<state>.png`、反復の記録は [SVG 制作の実行基盤の ADR](2026-09-18-svg-toolchain.md) で追加した。
- 補足: `role`、`maturity`、`sources` は [Asset composition model の ADR](2026-09-20-asset-composition-model.md) で frontmatter へ追加した。`adopted` は採用 variant の記録であり、Asset の成熟度ではない。

## 背景

Issue #1 で Experiment が最低限保持する 11 項目を定めた。
形式は Issue #2 で決めるとした。
Web の実行基盤は `experiments/*/variants/*/index.tsx` を glob で読む。
評価の内部形式は Issue #3 で決めるため、この ADR では入口だけを定める。

## 決定

詳細は [Experiment の記録形式](../experiment-format.md) に定める。
要点は次のとおり。

- 1 Experiment を `experiments/<slug>/` に閉じ、記録の入口を `README.md` にする。
- README は YAML frontmatter と Markdown 本文で構成する。
- slug は kebab-case にし、日付 prefix を付けない。
- frontmatter は一覧と絞り込みに使う 6 項目（title、status、created、updated、platforms、domains）に絞る。
- 本文は lifecycle の 11 項目を英語見出しで同じ順に置く。未到達の節は `未定` と書く。
- variants は本文の表で管理し、`variants/<variant-id>/` に Markdown を置かない。
- status は `draft`、`implementing`、`evaluating`、`decided`、`extracted`、`abandoned` の 6 値にする。
- テンプレートは `docs/templates/experiment/README.md` に置く。

## 却下した案

- JSON または YAML だけで記録する: hypothesis や learnings の長文が書きにくい。diff とレビューも読みにくい。
- Experiment ごとの自由形式: 11 項目の欠落に気づけない。Experiment 間の比較と Catalog 化もできない。
- 日付 prefix の slug: 並び順は frontmatter の `created` で得られる。パスに日付が入ると参照が長くなり、改名しにくい。
- variant ごとの独立した記録ファイル: 判断と却下理由が分散し、比較表が書けない。
- frontmatter に variants と related を持つ: 本文と二重管理になる。実行基盤はファイルシステムを glob するため不要。
- 節の見出しを日本語にする: lifecycle 文書の項目名と一致しなくなり、機械的な照合が難しくなる。

## 影響

最初の Experiment はこの形式で作る。
Issue #3 は `evaluation.md` の内部形式を定める。
Issue #5 は Related patterns / assets のリンク先を定める。
Catalog は frontmatter と 11 項目の見出しを読む前提にできる。
