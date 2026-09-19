# Asset を role と maturity の疎結合モデルで扱う

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [Issue #8](https://github.com/salan70/uiux-numa/issues/8)、[Asset composition model](../asset-model.md)、[Lab / Knowledge / Assets](../layers.md)、[Experiment の記録形式](../experiment-format.md)、[Pattern lifecycle](../pattern-lifecycle.md)

## 背景

README と `docs/layers.md` は、検証済み成果を Assets へ一方向に昇格する前提だった。
Catalog は公開 Design System、または採用成果だけの見本帳と読めた。
完成された Design System を中心に据えると、参考成果と基盤と選択部品が同じ「採用」に潰れる。

Issue #8 は、責務と適用範囲に応じて組み合わせる Asset 群へ改める。
Experiment の `extracted`、Pattern の `promoted`、variant の `adopted` を Asset の成熟度と混ぜると、再利用判断を誤る。

## 決定

- Asset の性質は `role`（`foundation` / `module` / `reference`）と `maturity`（`experimental` / `candidate` / `stable` / `deprecated`）で表す。
- 2 軸は独立させる。ディレクトリ名や 3 層の置き場へ固定しない。
- 運用の正本は [Asset composition model](../asset-model.md) にする。
- Catalog と再利用判断に使う必須 metadata は `role`、`maturity`、`platforms`、`sources` だけにする。
- Skill の `SKILL.md` frontmatter は `name` と `description` のままにする。分類は `skills/README.md` に書く。
- Experiment の `status` と `adopted`、Pattern の `status` は各 lifecycle の語として残す。Asset の `maturity` へ転記しない。
- 物理ディレクトリは現状維持とする。3 件の分類で再編の必要は確認できなかった。

### 実例

| 成果物                         | role         | maturity       | 理由                                                                                                                                   |
| ------------------------------ | ------------ | -------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `tokens/typography/`           | `foundation` | `candidate`    | 複数プロダクトの本文と操作文の共通土台。Catalog と Experiment で使っている。他リポジトリでの長期利用は未確認のため `stable` にしない。 |
| `skills/exploring-ui-variants` | `module`     | `experimental` | 案の分岐が必要なときだけ選ぶ手順。Pattern からの昇格ではない。                                                                         |
| `experiments/class-doc-logo`   | `reference`  | `experimental` | 特定サイトのマーク探索。採用 variant はなく、他プロダクトへコピーしない。                                                              |

Typography Experiment 自体も `foundation` / `candidate` とする。
token の由来は `product-ui-typography` である。

## 理由

role を分けると、土台と選択部品と着想材料を同じ昇格レーンに載せない。
maturity を分けると、抽出済みでも利用前提を置かない判断が残る。
必須項目を 4 つに限ると、使わない metadata が増えない。
Skill の frontmatter を変えないと、エージェントの起動契約を壊さない。
ディレクトリを動かさないと、未確認の分類のために参照が壊れない。

## 却下した案

- 3 層の置き場を role と同一視する: Lab の Experiment にも `reference` がある。Knowledge の Pattern は再利用の形ではない。
- Experiment の `status` に `stable` を足す: lifecycle の手順位置と再利用判断が混ざる。
- Pattern の `promoted` を Asset の `stable` と同一にする: 昇格は形を変えた印であり、実利用の十分さではない。
- 全成果物を `design-systems/` へ集約する: 完成 Design System 前提に戻る。
- Skill の `SKILL.md` へ `role` を足す: 起動用 frontmatter の方針と衝突する。
- 分類に合わせて `tokens/` や `experiments/` を再編する: 3 件では移動の利益がない。

## 影響

Experiment の README は `role`、`maturity`、`sources` を frontmatter に持つ。
Typography token は `$extensions.uiux-numa` に同じ 4 項目を持つ。
Skill の表は role と Asset maturity で書く。
`promoted` は Pattern lifecycle の語としてだけ使う。
Catalog はこれらの正本を読み、独自の分類表を持たない。
