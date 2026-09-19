# uiux-numa

AI エージェントで UI/UX とプロダクト体験を反復的に探索する R&D リポジトリ。
成果を個人開発へ再利用できる形に育てる。

## 目的

単なる UI コンポーネント集ではなく、プロダクト体験全体を扱う。
見た目、情報設計、操作、文章、動き、フィードバック、アクセシビリティを対象にする。
実験、比較、評価、知識化、再利用までを一貫して扱う。
対象領域とプラットフォームは [docs/scope.md](docs/scope.md) に定める。

## 3 層構成

| 層        | 役割                                                     | 置き場                                  |
| --------- | -------------------------------------------------------- | --------------------------------------- |
| Lab       | 同じ課題に複数案を実装し、比較・改善する                 | `experiments/`                          |
| Knowledge | 実験から得た知見を整理する                               | `docs/`、`patterns/`                    |
| Assets    | 検証済みの知見を他プロジェクトで再利用できる形に昇格する | `skills/`、`tokens/`、`design-systems/` |

各層の定義と昇格の方針は [docs/layers.md](docs/layers.md) に定める。
ディレクトリは中身ができた時点で作る。
構成の決定は [初期ディレクトリ構成の ADR](docs/decisions/2026-09-13-initial-directory-layout.md) に残す。

## Experiment の循環

「作る → 比較する → 評価する → 知識化する → 再利用する → 実プロジェクトで検証する」を繰り返す。
手順と記録項目は [docs/experiment-lifecycle.md](docs/experiment-lifecycle.md) に定める。
評価の方針は [docs/evaluation/policy.md](docs/evaluation/policy.md) に定める。
最終判断は人間が行い、採用理由と却下理由を記録する。

## 他リポジトリとの責務

- `uiux-numa`: UI/UX とプロダクト体験ドメインの source of truth。experiments、knowledge、UI/UX 固有の skills、patterns、tokens、design assets を扱う。
- `dotfiles`: AI-driven development 全般の基盤と汎用 asset を扱う。`uiux-numa` と同じ UI/UX asset を二重管理しない。
- product repositories: 成熟した assets と knowledge を利用し、実環境で検証する場所。

他プロジェクトへの同期方法は別途検討する。

## Catalog

公開サイトの表示名は「UI/UX 沼」である。
実装は `apps/catalog/` にある。
Catalog は実際の成果物を種別ごとに見る見本帳である。
掲載する種別は Colors、Typography、Icons、Graphics、Components とする。
Experiment の本文、原則、Skill、preview PNG は Catalog に掲載しない。
配色はヘッダーで選び、ライト / ダークのテーマと組み合わせて表示できる。
ローカルでは `just catalog-install` のあと `just catalog-dev` で開く。
production URL は `https://uiux.oda79.me/` とする。
Cloudflare Pages への Git 連携は [公開手順](docs/catalog-publishing.md) に従う。
構成の判断は [Catalog の ADR](docs/decisions/2026-09-19-catalog-artifacts-only.md) に残す。

## 開発環境

Nix flake と direnv で固定する。

```bash
direnv allow   # 初回のみ
just           # コマンド一覧
just setup     # pre-commit フックの導入
just lint      # すべての検証
```

AI エージェント向けの指示は [CLAUDE.md](CLAUDE.md) にある。

## 文書一覧

- [docs/scope.md](docs/scope.md): 対象領域
- [docs/layers.md](docs/layers.md): Lab / Knowledge / Assets と昇格の方針
- [docs/experiment-lifecycle.md](docs/experiment-lifecycle.md): Experiment の手順と記録項目
- [docs/evaluation/policy.md](docs/evaluation/policy.md): 評価の方針
- [docs/decisions/](docs/decisions/): 設計判断の記録 (ADR)
- [docs/catalog-publishing.md](docs/catalog-publishing.md): UI/UX 沼の Cloudflare Pages 公開手順
