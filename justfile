# uiux-numa のコマンド定義。
# ツールチェーンは flake.nix が固定し、コマンドはこのファイルが唯一の定義元。
# direnv 済みシェル、または `nix develop -c just <recipe>` で実行する。

# Web 実行基盤のポート。web-dev と web-shot で同じ値を使う。
# 5173 は他プロジェクトの Vite と衝突するため固定する。
web_port := "5183"

# Catalog のポート。catalog-dev と catalog-shot で同じ値を使う。
catalog_port := "5184"

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
# Git 管理外の作業メモも除外し、pre-commit の対象に揃える。
lint-md:
    markdownlint-cli2 "**/*.md" "!.direnv/**" "!.claude/**" "!.agents/**" "!**/node_modules/**" "!untitled.md"

# Markdown / JSON / YAML を整形する
# .claude / .agents は正本からコピーした vendor 資産のため整形しない。
# 整形すると正本との差分が生まれ、再同期のたびに衝突する。
# token と scheme の CSS は scripts/ が生成する。cornix-workbench の fixture.json は export-fixture.mts が生成する。整形すると tokens-check と
# schemes-check が生成元と一致しなくなる。flake.lock と同じく生成物は整形しない。
# 除外するのは生成物だけ。同じ階層の index.css と fonts.css は手書きなので整形する。
# tokens/<id>/<id>.css の一覧は scripts/build-dimension-tokens.mjs の FAMILIES と
# scripts/build-typography-tokens.mjs に対応する。家族を足したらここも足す。
format:
    oxfmt --write . '!.claude/**' '!.agents/**' '!flake.lock' \
      '!tokens/space/space.css' '!tokens/radius/radius.css' '!tokens/border/border.css' \
      '!tokens/size/size.css' '!tokens/motion/motion.css' '!tokens/typography/typography.css' \
      '!experiments/color-schemes-material/variants/*/scheme.css' \
      '!experiments/cornix-workbench/shared/fixture.json'

# canonical token から Web 用 CSS を生成する
tokens-build:
    node scripts/build-typography-tokens.mjs
    node scripts/build-dimension-tokens.mjs

# token の構造、参照、生成差分を検査する
tokens-check:
    node scripts/build-typography-tokens.mjs --check
    node scripts/build-dimension-tokens.mjs --check

# 配色の正本 palettes.ts から variant ごとの scheme.css を生成する
schemes-build:
    node --disable-warning=ExperimentalWarning --experimental-strip-types scripts/build-scheme-css.mjs

# scheme.css が palettes.ts と一致するか検査する
schemes-check:
    node --disable-warning=ExperimentalWarning --experimental-strip-types scripts/build-scheme-css.mjs --check

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

# SVG をそのまま並べた比較ページ（HTML）を作る。依頼者への提示に使う。例: just svg-compare previews/compare.html 16,24,64 a/dist b/dist --scheme pop-toy
svg-compare out sizes +args:
    node --disable-warning=ExperimentalWarning --experimental-strip-types scripts/svg-compare.mjs "{{out}}" "{{sizes}}" {{args}}

# Catalog（apps/catalog）の依存を導入する
catalog-install:
    cd apps/catalog && pnpm install --frozen-lockfile

# Catalog の開発サーバーを起動する
catalog-dev:
    cd apps/catalog && pnpm dev --port {{catalog_port}} --strictPort

# Catalog の TypeScript を型検査する
catalog-check:
    cd apps/catalog && pnpm check

# Catalog の単体テストを実行する
catalog-test:
    cd apps/catalog && pnpm test

# Catalog の production build を作る
catalog-build:
    cd apps/catalog && pnpm build

# 先に just catalog-dev を起動しておく。主要ルートを 390 / 1280 とライト / ダークで撮影する。
catalog-shot:
    scripts/catalog-shot.sh "http://localhost:{{catalog_port}}"
