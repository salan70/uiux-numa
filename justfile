# uiux-numa のコマンド定義。
# ツールチェーンは flake.nix が固定し、コマンドはこのファイルが唯一の定義元。
# direnv 済みシェル、または `nix develop -c just <recipe>` で実行する。

# 引数なしで一覧を表示する
default:
    @just --list

# pre-commit フックを導入する（初回のみ）
setup:
    pre-commit install

# ツールチェーンのバージョンを表示する
versions:
    @just --version
    @pre-commit --version
    @markdownlint-cli2 2>&1 | head -1
    @oxfmt --version
    @node --version
    @pnpm --version

# すべての検証を実行する（pre-commit 全体）
lint:
    pre-commit run --all-files

# Markdown を lint する
# .direnv（flake inputs）と vendor 資産（.claude / .agents）は対象外。
# pre-commit 側の exclude と範囲を揃えている。
lint-md:
    markdownlint-cli2 "**/*.md" "!.direnv/**" "!.claude/**" "!.agents/**" "!**/node_modules/**"

# Markdown / JSON / YAML を整形する
# .claude / .agents は正本からコピーした vendor 資産のため整形しない。
# 整形すると正本との差分が生まれ、再同期のたびに衝突する。
format:
    oxfmt --write . '!.claude/**' '!.agents/**' '!flake.lock'

# Web 実行基盤（platforms/web）の依存を導入する
web-install:
    cd platforms/web && pnpm install --frozen-lockfile

# Web 実行基盤の開発サーバーを起動し、experiments の variant を描画する
web-dev:
    cd platforms/web && pnpm dev

# Web 実行基盤と experiments の TypeScript を型検査する
web-check:
    cd platforms/web && pnpm check
