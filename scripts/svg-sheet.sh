#!/usr/bin/env bash
# 複数の SVG を、複数サイズ × 明暗の背景で描画し、比較シート（PNG 1 枚）にする。
# 単体の描画確認もこのシートで行う（1 ファイルなら 1 行のシートになる）。
#
# 使い方: svg-sheet.sh <out.png> <sizes> <svg>...
#   sizes  カンマ区切りのピクセル幅（例: 16,24,48）。最小サイズは 4 倍の拡大セルも並べる
#
# 描画は二段で行う。resvg は <image> で入れ子にした SVG に色を伝えないため、
# 各 SVG をまず PNG に描画し、その PNG を並べた SVG を再び描画する。
# currentColor は、明背景で #1b1b1b、暗背景で #e6e6e6 にする。
set -euo pipefail

[ $# -ge 3 ] || { echo "usage: svg-sheet.sh <out.png> <sizes> <svg>..." >&2; exit 2; }
out="$1"; sizes="$2"; shift 2
case "$out" in /*) ;; *) out="$PWD/$out" ;; esac

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
printf 'svg{color:#1b1b1b}' > "$work/light.css"
printf 'svg{color:#e6e6e6}' > "$work/dark.css"

# PNG の IHDR から幅と高さを読む（16 バイト目から 4 バイトずつ、big-endian）。
png_size() {
  od -An -tu1 -j16 -N8 "$1" | tr -s ' ' '\n' | grep -v '^$' | {
    read -r a; read -r b; read -r c; read -r d; read -r e; read -r f; read -r g; read -r h
    echo "$(((a << 24) + (b << 16) + (c << 8) + d)) $(((e << 24) + (f << 16) + (g << 8) + h))"
  }
}

render() { # <svg> <size> <bg> <css> <out.png>
  local err
  err="$(resvg -w "$2" --background "$3" --stylesheet "$4" "$1" "$5" 2>&1 >/dev/null || true)"
  if [ -n "$err" ]; then
    echo "error: $1 の描画で resvg が警告またはエラーを出した" >&2
    echo "$err" >&2
    exit 1
  fi
}

IFS=',' read -r -a size_list <<< "$sizes"
min="${size_list[0]}"
for s in "${size_list[@]}"; do [ "$s" -lt "$min" ] && min="$s"; done
zoom=$((min * 4))

pad=12; label_w=160; header_h=28
cells=""; row_y=$header_h; sheet_w=0
i=0
for svg in "$@"; do
  name="$(basename "$svg" .svg)"
  row_h=0; x=$label_w
  cells="$cells<text x=\"$pad\" y=\"$((row_y + 16))\" font-family=\"sans-serif\" font-size=\"12\" fill=\"#333\">$name</text>"
  for s in "${size_list[@]}"; do
    for bg in light dark; do
      [ "$bg" = light ] && color="#ffffff" || color="#1a1a1a"
      png="$work/$i-$s-$bg.png"
      render "$svg" "$s" "$color" "$work/$bg.css" "$png"
      read -r w h <<< "$(png_size "$png")"
      cells="$cells<image href=\"$png\" x=\"$x\" y=\"$row_y\" width=\"$w\" height=\"$h\"/>"
      x=$((x + w + pad))
      [ "$h" -gt "$row_h" ] && row_h="$h"
      if [ "$s" = "$min" ]; then
        # 最小サイズの 4 倍拡大。補間なし（optimizeSpeed）でピクセルを見せる
        cells="$cells<image href=\"$png\" x=\"$x\" y=\"$row_y\" width=\"$((w * 4))\" height=\"$((h * 4))\" image-rendering=\"optimizeSpeed\"/>"
        x=$((x + w * 4 + pad))
        [ "$((h * 4))" -gt "$row_h" ] && row_h=$((h * 4))
      fi
    done
  done
  [ "$x" -gt "$sheet_w" ] && sheet_w="$x"
  row_y=$((row_y + row_h + pad))
  i=$((i + 1))
done

# 列見出し
header="<text x=\"$label_w\" y=\"18\" font-family=\"sans-serif\" font-size=\"12\" fill=\"#333\">sizes: $sizes (light, dark; smallest x4)</text>"

cat > "$work/sheet.svg" <<EOS
<svg xmlns="http://www.w3.org/2000/svg" width="$((sheet_w + pad))" height="$row_y" viewBox="0 0 $((sheet_w + pad)) $row_y"><rect width="100%" height="100%" fill="#8c8c8c"/>$header$cells</svg>
EOS

err="$(resvg "$work/sheet.svg" "$out" 2>&1 >/dev/null | grep -v 'Fallback from' || true)"
if [ -n "$err" ]; then echo "error: シートの描画で resvg が警告またはエラーを出した" >&2; echo "$err" >&2; exit 1; fi
echo "ok: $out ($(png_size "$out" | tr ' ' 'x'))"
