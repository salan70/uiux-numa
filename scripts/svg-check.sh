#!/usr/bin/env bash
# SVG の機械検査。構文、対応範囲、明示された制約だけを扱う。
# デザインの良し悪しや複雑さは判定しない。
#
# 使い方: svg-check.sh [--viewbox "<値>"] [--mono] <file|->
#   --viewbox  root の viewBox がこの値と一致することを求める（例: "0 0 24 24"）
#   --mono     fill と stroke を none、currentColor、url(#...) に限る（単色アイコン向け）
#   -          標準入力を読む
#
# 出力は 1 行 1 項目。error があれば終了コード 1。
set -euo pipefail

want_viewbox=""
mono=0
file=""
while [ $# -gt 0 ]; do
  case "$1" in
    --viewbox) want_viewbox="$2"; shift 2 ;;
    --mono) mono=1; shift ;;
    -h|--help) sed -n '2,10p' "$0"; exit 0 ;;
    *) file="$1"; shift ;;
  esac
done
[ -n "$file" ] || { echo "usage: svg-check.sh [--viewbox \"<値>\"] [--mono] <file|->" >&2; exit 2; }

tmp=""
if [ "$file" = "-" ]; then
  tmp="$(mktemp)"; cat > "$tmp"; file="$tmp"
fi
trap '[ -n "$tmp" ] && rm -f "$tmp"' EXIT

errors=0
err() { echo "error: $*"; errors=$((errors + 1)); }
ok() { echo "ok: $*"; }

# 構文。well-formed でなければ以降の検査はできない。
errfile="$(mktemp)"
if ! xmllint --nonet --noout "$file" 2>"$errfile"; then
  sed 's/^/error: /' "$errfile"; rm -f "$errfile"
  echo "error: well-formed な XML ではない"
  exit 1
fi
rm -f "$errfile"
ok "well-formed"

xp() { xmllint --nonet --xpath "$1" "$file" 2>/dev/null; }

# root 要素と名前空間
root="$(xp 'string(name(/*))')"
ns="$(xp 'string(namespace-uri(/*))')"
if [ "$root" = "svg" ] && [ "$ns" = "http://www.w3.org/2000/svg" ]; then
  ok "root は svg（xmlns あり）"
else
  err "root が svg ではないか、xmlns=\"http://www.w3.org/2000/svg\" がない（root=$root, ns=$ns）"
fi

# viewBox
viewbox="$(xp 'string(/*/@viewBox)')"
if [ -z "$viewbox" ]; then
  err "root に viewBox がない"
elif [ -n "$want_viewbox" ] && [ "$viewbox" != "$want_viewbox" ]; then
  err "viewBox が \"$want_viewbox\" ではない（\"$viewbox\"）"
else
  ok "viewBox=\"$viewbox\""
fi

# 対応範囲。MVP は自己完結した静的 SVG だけを扱う。
before=$errors
for el in script foreignObject animate animateMotion animateTransform set image text textPath tspan; do
  n="$(xp "count(//*[local-name()='$el'])")"
  [ "$n" = "0" ] || err "未対応の要素 <$el> が $n 個ある"
done
n="$(xp 'count(//@*[local-name()="href" and not(starts-with(.,"#"))])')"
[ "$n" = "0" ] || err "外部参照の href が $n 個ある（許すのは #id だけ）"
n="$(xp 'count(//@*[starts-with(local-name(),"on")])')"
[ "$n" = "0" ] || err "イベント属性（on*）が $n 個ある"
if grep -q 'var(' "$file"; then err "CSS の var() がある。resvg は描画できないため、色の差し替えは利用画面の CSS で行う"; fi
if grep -q '@import' "$file"; then err "@import がある"; fi
if grep -Eq 'url\([[:space:]]*["'"'"']?[^#"'"'"')[:space:]]' "$file"; then err "url() が #id 以外を参照している"; fi
[ "$errors" -gt "$before" ] || ok "対応範囲内（script、foreignObject、animate 系、image、text、外部参照、on*、var()、@import なし）"

# 明示された制約: 単色
if [ "$mono" = "1" ]; then
  before=$errors
  n="$(xp 'count(//@*[(local-name()="fill" or local-name()="stroke") and not(.="none" or .="currentColor" or starts-with(.,"url(#"))])')"
  [ "$n" = "0" ] || err "--mono: fill / stroke に currentColor と none 以外の値が $n 個ある"
  n="$(xp 'count(//@*[local-name()="stop-color"])')"
  [ "$n" = "0" ] || err "--mono: stop-color が $n 個ある"
  if grep -Eq '(fill|stroke|stop-color|color)[[:space:]]*:' "$file"; then err "--mono: style に fill / stroke / color の指定がある"; fi
  [ "$errors" -gt "$before" ] || ok "単色（fill / stroke は none、currentColor、url(#...) のみ）"
fi

# 参考情報。合否には使わない。
echo "info: 要素数=$(xp 'count(//*)') バイト数=$(wc -c < "$file" | tr -d ' ') part-id=$({ xp '//@id' || true; } | { grep -o '"part-[^"]*"' || true; } | tr -d '"' | tr '\n' ' ')"

[ "$errors" -eq 0 ] || { echo "error: $errors 件"; exit 1; }
