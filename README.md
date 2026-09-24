# uiux-numa

AI エージェントで UI/UX とプロダクト体験を反復的に探索する R&D リポジトリ。
成果を個人開発へ再利用できる形に育てる。

## 目的

見た目、情報設計、操作、文章、動き、フィードバック、アクセシビリティを対象にする。
実験、比較、判断、知識化、再利用までを一貫して扱う。
最終判断は人間が行い、採用理由と却下理由を記録する。
対象領域は [docs/scope.md](docs/scope.md) に定める。

## 構成

| 層        | 役割                                       | 置き場               |
| --------- | ------------------------------------------ | -------------------- |
| Lab       | 同じ課題に複数案を実装し、比較して判断する | `experiments/`       |
| Knowledge | 実験から得た知見を整理する                 | `docs/`              |
| Assets    | 他プロジェクトで組み合わせて使う成果       | `skills/`、`tokens/` |

置き場と `role` / `maturity` は [docs/layers.md](docs/layers.md)、Experiment の進め方は [docs/experiment.md](docs/experiment.md) に定める。
文書の地図は [docs/README.md](docs/README.md) にある。

## 他リポジトリとの責務

- `uiux-numa`: UI/UX とプロダクト体験ドメインの正本。experiments、knowledge、UI/UX 固有の skills、tokens を扱う。
- `dotfiles`: AI-driven development 全般の基盤と汎用 asset を扱う。`uiux-numa` と同じ asset を二重管理しない。
- product repositories: 成果を利用し、実環境で検証する場所。

## Catalog

公開サイトの表示名は「UI/UX NUMA」で、実装は `apps/catalog/` にある。
成果物の visual showcase であり、仕様書や正本ではない。
ローカルでは `just catalog-install` のあと `just catalog-dev` で開く。
production URL は `https://uiux.oda79.me/` で、公開手順は [docs/catalog-publishing.md](docs/catalog-publishing.md) にある。

## 開発環境

Nix flake と direnv で固定する。

```bash
direnv allow   # 初回のみ
just           # コマンド一覧
just setup     # pre-commit フックの導入
just lint      # すべての検証
```

AI エージェント向けの指示は [CLAUDE.md](CLAUDE.md) にある。
