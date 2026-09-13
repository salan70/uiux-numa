# Web の実行基盤に Vite と React を採用する

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #6](https://github.com/salan70/uiux-numa/issues/6)、[Issue #4](https://github.com/salan70/uiux-numa/issues/4)、[初期ディレクトリ構成](2026-09-13-initial-directory-layout.md)

## 背景

最初の Experiment（#4）を Web で回すにあたり、variant の実装方式を決める必要があった。
初期ディレクトリ構成の ADR は `platforms/` の作成時期を Web 以外の最初の Experiment としていた。
ビルドなしの静的 HTML でも最初の 1 件は回せるが、後の Catalog や Skill と実装方式が分かれる。

## 決定

- Web の variant は Vite + React + TypeScript で実装する。パッケージマネージャは dotfiles と揃えて pnpm を使う。
- `platforms/web/` を Web の実行基盤として今作る。初期ディレクトリ構成の ADR の作成時期は「最初の Web Experiment」に改める。
- 実行基盤の責務は `experiments/*/variants/*/index.tsx` を glob で列挙し、選択した variant を描画することだけにする。Catalog の機能は持たない。
- variant の実装は `experiments/<slug>/variants/<id>/` に置き、`platforms/web/` には Experiment 固有の実装を置かない。
- toolchain は `flake.nix` で `nodejs_22` と `pnpm` を固定する。npm パッケージの版は `pnpm-lock.yaml` で固定する。
- コマンドは `justfile` の `web-install`、`web-dev`、`web-check` を正本とする。
- 整形は既存の oxfmt を TypeScript にも適用する。lint（oxlint）と a11y の自動検査は今は入れない。

## 却下した案

- ビルドなしの静的 HTML / CSS / JS: 最初の 1 件は最小で回せるが、Catalog や Skill と実装方式が分かれ、React 前提の知見を再利用しにくい。
- Svelte、Vue、Vanilla TypeScript: AI の実装例と a11y のツールは React が最も多く、後の再利用先も React が多い。
- npm、bun: dotfiles の textlint 環境が pnpm のため揃える。
- Experiment ごとの Vite プロジェクト: 設定と依存が重複し、更新の手間が Experiment 数に比例する。
- `platforms/web/` に variant の実装を置く: Experiment の記録と実装が分かれ、`experiments/<slug>/` に閉じる方針に反する。

## 影響

Web の Experiment は `just web-dev` で描画し、preview の撮影もこの基盤で行う。
SwiftUI や Flutter の実行基盤は、それぞれ最初の Experiment の時点で別の ADR として決める。
