#!/usr/bin/env bash
# Web 実行基盤で描画した variant を headless Chrome で撮影する。
#
# 使い方: web-shot.sh <url> <out.png> [width] [height]
#   url  例: http://localhost:5183/?bare#hako-feature-icons/soft-outline
#
# ブラウザは Nix で固定できない（nixpkgs の chromium は Linux 限定）。
# 既定は macOS の Google Chrome。CHROME_BIN で差し替える。
# 描画倍率は 2 に固定する。小さなアイコンの細部を preview で確認するため。
set -euo pipefail

[ $# -ge 2 ] || { echo "usage: web-shot.sh <url> <out.png> [width] [height]" >&2; exit 2; }
url="$1"; out="$2"; width="${3:-1280}"; height="${4:-800}"
case "$out" in /*) ;; *) out="$PWD/$out" ;; esac
chrome="${CHROME_BIN:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
[ -x "$chrome" ] || { echo "error: Chrome が見つからない: $chrome（CHROME_BIN で指定する）" >&2; exit 1; }

# 開発サーバーが起動しているか（URL の host と port へ TCP 接続を試す）
hostport="${url#*://}"; hostport="${hostport%%/*}"
host="${hostport%%:*}"; port="${hostport##*:}"
if ! (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null; then
  echo "error: $host:$port に接続できない。先に just web-dev を起動する" >&2; exit 1
fi

profile="$(mktemp -d)"
mkdir -p "$(dirname "$out")"
rm -f "$out"
# Chrome 152 の headless は --screenshot の後に終了しないことがある。
# ファイルの出現を待ち（最長 30 秒）、1 秒おいて Chrome を止める。
"$chrome" --headless --no-first-run --disable-gpu \
  --user-data-dir="$profile" \
  --hide-scrollbars --force-device-scale-factor=2 \
  --window-size="$width,$height" \
  --screenshot="$out" "$url" >/dev/null 2>&1 &
pid=$!
stop_chrome() {
  # SIGTERM で 2 秒待ち、止まらなければ SIGKILL にする
  if kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    for _ in 1 2 3 4; do kill -0 "$pid" 2>/dev/null || break; sleep 0.5; done
    kill -9 "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
  rm -rf "$profile"
}
trap stop_chrome EXIT
waited=0
while [ ! -s "$out" ] && [ "$waited" -lt 60 ]; do sleep 0.5; waited=$((waited + 1)); done
sleep 1
[ -s "$out" ] || { echo "error: 30 秒以内に撮影できなかった: $out" >&2; exit 1; }
echo "ok: $out"
