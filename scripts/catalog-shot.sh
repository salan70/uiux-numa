#!/usr/bin/env bash
# Catalog のホームと 5 種別ページを 390 / 1280 とライト / ダークで撮影する。
#
# 使い方: catalog-shot.sh <base-url>
#   例: http://localhost:5184
set -euo pipefail

[ $# -ge 1 ] || { echo "usage: catalog-shot.sh <base-url>" >&2; exit 2; }
base="${1%/}"
root="$(cd "$(dirname "$0")/.." && pwd)"
out_dir="$root/apps/catalog/shots"
mkdir -p "$out_dir"

for page in home colors typography icons graphics components; do
  path="/"
  [ "$page" = "home" ] || path="/$page"
  for theme in light dark; do
    for width in 390 1280; do
      height=800
      [ "$width" = "390" ] && height=844
      out="$out_dir/${page}-${width}-${theme}.png"
      "$root/scripts/web-shot.sh" "${base}${path}?theme=${theme}&scheme=sumi" "$out" "$width" "$height"
    done
  done
done
