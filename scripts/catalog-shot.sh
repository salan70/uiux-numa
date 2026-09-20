#!/usr/bin/env bash
# Catalog の主要ルートを 390 / 1280 とライト / ダークで撮影する。
#
# 使い方: catalog-shot.sh <base-url>
#   例: http://localhost:5184
set -euo pipefail

[ $# -ge 1 ] || { echo "usage: catalog-shot.sh <base-url>" >&2; exit 2; }
base="${1%/}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out_dir="$root/apps/catalog/shots"
mkdir -p "$out_dir"

pages=(
  home:/
  colors:/foundations/colors
  typography:/foundations/typography
  icons:/foundations/icons
  graphics:/foundations/graphics
  components:/components
  motion:/motion
)

for entry in "${pages[@]}"; do
  page="${entry%%:*}"
  path="${entry#*:}"
  for theme in light dark; do
    for width in 390 1280; do
      height=800
      [ "$width" = "390" ] && height=844
      out="$out_dir/${page}-${width}-${theme}.png"
      "$root/scripts/web-shot.sh" "${base}${path}?theme=${theme}&scheme=sumi" "$out" "$width" "$height"
      sleep 1
    done
  done
done
