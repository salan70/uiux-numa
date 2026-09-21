# Asset composition model

成果物は一枚岩の Design System に集約しない。
`role` と `maturity` を独立した軸として持つ疎結合な Asset 群として扱う。
物理ディレクトリは分類軸に固定しない。
分類は metadata と実例で先に検証し、再編は必要性が確認できたときだけ行う。

実例と現状維持の判断は [Asset composition model の ADR](decisions/2026-09-20-asset-composition-model.md) に残す。

## Role

利用の仕方を表す。
置き場や lifecycle の進捗ではない。

| 値           | 意味                                                           |
| ------------ | -------------------------------------------------------------- |
| `foundation` | 原則として複数のプロダクトに共通適用する基盤                   |
| `module`     | プロダクトや用途に応じて明示的に選択して使う再利用可能な Asset |
| `reference`  | コピーや直接依存を前提とせず、参考・着想・比較に使う成果物     |

他プロジェクトでは、`foundation` を既定の土台として取り込み、`module` は用途を読んで選び、`reference` は模倣せず観察する。

## Maturity

再利用してよいかを表す。
Experiment や Pattern の status ではない。

| 値             | 意味                                   |
| -------------- | -------------------------------------- |
| `experimental` | R&D 中で、利用前提を置かない           |
| `candidate`    | 実利用で検証中                         |
| `stable`       | 十分に検証され、再利用候補として扱える |
| `deprecated`   | 新規利用を推奨しない                   |

`stable` は人間が再利用の前提を置けると判断した印である。
Experiment の `extracted` や Pattern の `promoted` から自動では付けない。

## Lifecycle status との分離

次の語は Asset の `maturity` と混ぜない。

| 語          | 属する記録                          | 意味                                            |
| ----------- | ----------------------------------- | ----------------------------------------------- |
| `adopted`   | Experiment の frontmatter           | 人間が採用した variant-id。再利用の可否ではない |
| `extracted` | Experiment の `status`              | 知見の抽出と Pattern / Asset へのリンクを終えた |
| `promoted`  | Pattern の `status`                 | Pattern を再利用できる形の Asset へ変えた       |
| `candidate` | Pattern の `status` または maturity | Pattern では抽出直後。Asset では実利用の検証中  |

Experiment の `status` は [experiment-format.md](experiment-format.md) の手順位置である。
Pattern の `status` は [pattern-lifecycle.md](pattern-lifecycle.md) の抽出と昇格の位置である。
Asset の `maturity` は、その成果物を他プロジェクトでどう扱うかである。

抽出済みでも `reference` かつ `experimental` でよい。
昇格済みでも Asset の `maturity` は `candidate` から始めてよい。

## 必須 metadata

Catalog と再利用判断に使う項目だけを正本へ持つ。

| 項目        | 内容                                                                  |
| ----------- | --------------------------------------------------------------------- |
| `role`      | 上の Role                                                             |
| `maturity`  | 上の Maturity                                                         |
| `platforms` | 有効性を確認したプラットフォーム。`platforms/` のディレクトリ名と同じ |
| `sources`   | 由来。Experiment の slug、token のパス、Skill 名など                  |

Skill の `SKILL.md` frontmatter は `name` と `description` のままにする。
Skill の `role` と `maturity` は [skills/README.md](../skills/README.md) の表と本文に書く。

token の分類は、該当家族の DTCG JSON の `$extensions.uiux-numa` に書く。
Catalog は正本を glob で読む。
Catalog 固有の copy や metadata を正本にしない。

## 他プロジェクトでの利用

1. `role` と `maturity` を読む。
2. `experimental` は観察だけにする。実装へコピーしない。
3. `candidate` は検証として取り込み、差分をフィードバックする。
4. `stable` な `foundation` は土台として使い、上書き理由を残す。
5. `module` は用途が合うときだけ選ぶ。
6. `reference` は着想に使い、ファイルを依存にしない。
7. `deprecated` は新規利用しない。代替の `sources` を辿る。

## 実例

性質の異なる 3 件で、role の差を固定する。
詳細は ADR の実例節に書く。

| 成果物                  | role         | maturity       | 置き場                            |
| ----------------------- | ------------ | -------------- | --------------------------------- |
| Typography token        | `foundation` | `candidate`    | `tokens/typography/`              |
| `exploring-ui-variants` | `module`     | `experimental` | `skills/exploring-ui-variants/`   |
| Hako の機能アイコン     | `reference`  | `experimental` | `experiments/hako-feature-icons/` |

## 他プロジェクトでの具体例

個人の Web アプリへ取り込むときは、次のように分ける。

Typography token は `foundation` かつ `candidate` である。
本文と操作文の共通土台として入れてよい。
他リポジトリでの長期利用は未確認なので、`stable` としては扱わない。
上書きしたら理由を残す。

`exploring-ui-variants` は `module` かつ `experimental` である。
複数案を分岐する依頼のときだけ選ぶ。
常時の開発手順には入れない。

`hako-feature-icons` は `reference` かつ `experimental` である。
構図や比較の着想に使い、SVG を依存にコピーしない。
