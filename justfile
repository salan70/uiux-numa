# uiux-numa のコマンド定義。
# ツールチェーンは flake.nix が固定し、コマンドはこのファイルが唯一の定義元。
# direnv 済みシェル、または `nix develop -c just <recipe>` で実行する。

# Web 実行基盤のポート。web-dev と web-shot で同じ値を使う。
# 5173 は他プロジェクトの Vite と衝突するため固定する。
web_port := "5183"

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
    @resvg --version | sed 's/^/resvg /'
    @svgo --version | sed 's/^/svgo /'
    @xmllint --version 2>&1 | head -1

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
    cd platforms/web && pnpm dev --port {{web_port}} --strictPort

# Web 実行基盤と experiments の TypeScript を型検査する
web-check:
    cd platforms/web && pnpm check

# 先に just web-dev を起動しておく。ブラウザはローカルの Chrome（CHROME_BIN で差し替え可）。
# 実行基盤で描画した variant を撮影する（例: just web-shot hako-feature-icons/soft-outline out.png）
web-shot target out width="1280" height="800":
    scripts/web-shot.sh "http://localhost:{{web_port}}/?bare#{{target}}" "{{out}}" "{{width}}" "{{height}}"

# SVG の機械検査（構文、対応範囲、明示された制約）。例: just svg-check icon.svg --mono --viewbox "0 0 24 24"
[positional-arguments]
svg-check file *args:
    #!/usr/bin/env bash
    file="$1"; shift
    scripts/svg-check.sh "$@" "$file"

# 複数の SVG を複数サイズ × 明暗背景で描画し、比較シート 1 枚にする。例: just svg-sheet out.png 16,24,48 a.svg b.svg
svg-sheet out sizes +svgs:
    scripts/svg-sheet.sh "{{out}}" "{{sizes}}" {{svgs}}

# 編集用 SVG から配布用 SVG を作り、検査と part-* の ID 保持を確かめる
svg-optimize src dist:
    scripts/svg-optimize.sh "{{src}}" "{{dist}}"

# variant を行、asset を列に並べた比較グリッドを作る。例: just svg-grid out.png 32 a/dist b/dist
svg-grid out size +dirs:
    scripts/svg-grid.sh "{{out}}" "{{size}}" {{dirs}}
