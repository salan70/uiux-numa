# uiux-numa

AI エージェントで UI/UX とプロダクト体験を反復的に探索する R&D リポジトリ。
成果を個人開発へ再利用できる形に育てる。

## 目的

見た目、情報設計、操作、文章、動き、フィードバック、アクセシビリティを対象にする。
実験、比較、判断、知識化、再利用までを一貫して扱い、最終判断は人間が行う。
対象領域は [docs/scope.md](docs/scope.md)、置き場は [docs/layers.md](docs/layers.md)、文書の地図は [docs/README.md](docs/README.md) にある。

## 他リポジトリとの責務

- `uiux-numa`: UI/UX とプロダクト体験ドメインの正本。experiments、knowledge、UI/UX 固有の skills、tokens を扱う。
- `dotfiles`: AI-driven development 全般の基盤と汎用 asset を扱う。同じ asset を二重管理しない。
- product repositories: 成果を利用し、実環境で検証する場所。

## Catalog

公開サイトの表示名は「UI/UX NUMA」で、実装は `apps/catalog/`、production URL は `https://uiux.oda79.me/` である。
ローカルでは `just catalog-install` のあと `just catalog-dev` で開く。
公開手順は [docs/catalog-publishing.md](docs/catalog-publishing.md) にある。

## 開発環境

Nix flake と direnv で固定する。
初回に `direnv allow` と `just setup` を実行し、コマンド一覧は `just` で見る。
AI エージェント向けの指示は [CLAUDE.md](CLAUDE.md) にある。
