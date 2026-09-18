#!/usr/bin/env bash
# 編集用 SVG から配布用 SVG を作り、最適化で必要な情報が失われていないことを検査する。
#
# 使い方: svg-optimize.sh <source.svg> <dist.svg>
#
# 手順:
#   1. SVGO（scripts/svgo.config.mjs）で最適化する
#   2. 配布用を svg-check.sh に通す
#   3. part-* の ID 集合が編集用と配布用で一致することを確かめる
# 見た目の確認は行わない。svg-sheet.sh で再描画して確かめる。
set -euo pipefail

[ $# -eq 2 ] || { echo "usage: svg-optimize.sh <source.svg> <dist.svg>" >&2; exit 2; }
src="$1"; dist="$2"
here="$(cd "$(dirname "$0")" && pwd)"

mkdir -p "$(dirname "$dist")"
svgo --quiet --config "$here/svgo.config.mjs" -i "$src" -o "$dist"
echo "ok: 最適化 $(wc -c < "$src" | tr -d ' ') -> $(wc -c < "$dist" | tr -d ' ') バイト"

"$here/svg-check.sh" "$dist"

ids() { xmllint --nonet --xpath '//@id' "$1" 2>/dev/null | grep -o '"part-[^"]*"' | tr -d '"' | sort; }
src_ids="$(ids "$src")"; dist_ids="$(ids "$dist")"
if [ "$src_ids" = "$dist_ids" ]; then
  echo "ok: part-* の ID を保持（$(echo "$src_ids" | grep -c . ) 個）"
else
  echo "error: part-* の ID が一致しない"
  diff <(echo "$src_ids") <(echo "$dist_ids") | sed 's/^/  /' || true
  exit 1
fi
