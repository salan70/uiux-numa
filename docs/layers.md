# 置き場

リポジトリは Lab、Knowledge、Assets の 3 層で構成する。
層は作業の置き場であり、昇格の段階ではない。
ディレクトリは中身ができた時点で作る。

| 層        | 役割                                       | 置き場               |
| --------- | ------------------------------------------ | -------------------- |
| Lab       | 同じ課題に複数案を実装し、比較して判断する | `experiments/`       |
| Knowledge | 実験から得た知見を整理する                 | `docs/`              |
| Assets    | 他プロジェクトで組み合わせて使う成果       | `skills/`、`tokens/` |

- Knowledge は [guidelines/](guidelines/README.md)（主題ごとの規則）、[principles/](principles/README.md)（検証中の仮説）、[decisions/](decisions/)（リポジトリの設計判断）で持つ。
- token の正本は `tokens/` の DTCG JSON で、`just tokens-build` で CSS を生成する。
- UI/UX 固有の Skill の正本は `skills/` で、読み込み経路は [skills/README.md](../skills/README.md) にある。

## role と maturity

Experiment、token、Skill は `role` と `maturity` を独立に持つ。
Experiment は README の frontmatter、token は DTCG JSON の `$extensions.uiux-numa`、Skill は `skills/README.md` の表に書く。
Catalog が読み、値が表に無ければ build が落ちる。

| role         | 意味                                             |
| ------------ | ------------------------------------------------ |
| `foundation` | 複数のプロダクトに共通で適用する土台             |
| `module`     | 用途に応じて明示的に選んで使う                   |
| `reference`  | コピーや依存を前提とせず、参考、着想、比較に使う |

| maturity       | 意味                         |
| -------------- | ---------------------------- |
| `experimental` | R&D 中で、利用前提を置かない |
| `candidate`    | 実利用で検証中               |
| `stable`       | 十分に検証され、再利用できる |
| `deprecated`   | 新規利用を推奨しない         |

`stable` は人間が判断して付ける。Experiment の `status` や `adopted` から自動では進めない。

## Catalog

Catalog（`apps/catalog/`）は成果物の visual showcase であり、仕様書や正本ではない。
`experiments/`、`tokens/`、`docs/guidelines/` を glob で読み、Catalog 固有の説明を正本に足さない。
topic に当たらない Experiment は載せない。
画面の個別判断は [apps/catalog/README.md](../apps/catalog/README.md)、公開手順は [catalog-publishing.md](catalog-publishing.md) にある。
