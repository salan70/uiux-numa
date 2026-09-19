#!/usr/bin/env bash
# variant を行、asset を列に並べた比較グリッドを PNG 1 枚にする。
# svg-sheet.sh は 1 SVG を 1 行に置くため、variant 数 × asset 数が増えると縦に長くなりすぎる。
# 同じ asset を縦に見比べ、同じ variant を横に見比べるときはこちらを使う。
#
# 使い方: svg-grid.sh <out.png> <size> <variant-dir>...
#   size          セルの描画サイズ（px）。1 つだけ指定する
#   variant-dir   その variant の SVG を置いたディレクトリ。中の *.svg をファイル名順に列にする
#
# 全 variant で同じファイル名の SVG がそろっていることを前提にする。
# 行名はディレクトリ名にする。dist と source は 1 つ上のディレクトリ名を使う。
# 描画は svg-sheet.sh と同じ二段方式（各 SVG を PNG にしてから並べる）。
# currentColor は明るい背景の #1b1b1b にする。暗い背景での確認は svg-sheet.sh を使う。
set -euo pipefail

[ $# -ge 3 ] || { echo "usage: svg-grid.sh <out.png> <size> <variant-dir>..." >&2; exit 2; }
out="$1"; size="$2"; shift 2
case "$out" in /*) ;; *) out="$PWD/$out" ;; esac

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT
printf 'svg{color:#1b1b1b}' > "$work/light.css"

render() { # <svg> <out.png>
  local err
  err="$(resvg -w "$size" --background "#ffffff" --stylesheet "$work/light.css" "$1" "$2" 2>&1 >/dev/null || true)"
  if [ -n "$err" ]; then
    echo "error: $1 の描画で resvg が警告またはエラーを出した" >&2
    echo "$err" >&2
    exit 1
  fi
}

row_label() { # <dir> -> variant 名
  local base parent
  base="$(basename "$1")"
  if [ "$base" = "dist" ] || [ "$base" = "source" ]; then
    parent="$(dirname "$1")"; base="$(basename "$parent")"
  fi
  echo "$base"
}

# 列の幅は、セルと asset 名の見出しが重ならない幅にする（1 文字を約 7px と見積もる）
col_w="$size"
for svg in "$1"/*.svg; do
  [ -e "$svg" ] || { echo "error: $1 に SVG がない" >&2; exit 1; }
  name="$(basename "$svg" .svg)"
  w=$(( ${#name} * 7 + 12 ))
  [ "$w" -gt "$col_w" ] && col_w="$w"
done
gap=14; label_w=140; header_h=26
col_pitch=$((col_w + gap))

cells=""; header=""; row_y=$header_h; grid_w=0; first=1; row=0
for dir in "$@"; do
  label="$(row_label "$dir")"
  cells="$cells<text x=\"12\" y=\"$((row_y + size / 2 + 5))\" font-family=\"sans-serif\" font-size=\"13\" fill=\"#222\">$label</text>"
  x=$label_w
  for svg in "$dir"/*.svg; do
    [ -e "$svg" ] || { echo "error: $dir に SVG がない" >&2; exit 1; }
    asset="$(basename "$svg" .svg)"
    png="$work/$row-$asset.png"
    render "$svg" "$png"
    cells="$cells<image href=\"$png\" x=\"$((x + (col_w - size) / 2))\" y=\"$row_y\" width=\"$size\" height=\"$size\"/>"
    if [ "$first" = "1" ]; then
      header="$header<text x=\"$((x + col_w / 2))\" y=\"18\" text-anchor=\"middle\" font-family=\"sans-serif\" font-size=\"12\" fill=\"#222\">$asset</text>"
    fi
    x=$((x + col_pitch))
  done
  first=0
  [ "$x" -gt "$grid_w" ] && grid_w="$x"
  row_y=$((row_y + size + gap))
  row=$((row + 1))
done

cat > "$work/grid.svg" <<EOS
<svg xmlns="http://www.w3.org/2000/svg" width="$grid_w" height="$((row_y + 4))" viewBox="0 0 $grid_w $((row_y + 4))"><rect width="100%" height="100%" fill="#ffffff"/>$header$cells</svg>
EOS

err="$(resvg "$work/grid.svg" "$out" 2>&1 >/dev/null | grep -v 'Fallback from' || true)"
if [ -n "$err" ]; then echo "error: グリッドの描画で resvg が警告またはエラーを出した" >&2; echo "$err" >&2; exit 1; fi
echo "ok: $out"
