#!/usr/bin/env bash
# iOS 実行基盤で variant を起動し、シミュレータの画面を撮影する。
# 使い方: scripts/ios-shot.sh <slug>/<id> <out.png> <device> <appearance> <content-size> [variant の起動引数...]
#   appearance: light | dark
#   content-size: large（既定）や accessibility-extra-extra-extra-large など simctl ui の値
# 先に just ios-build を実行しておく。
set -euo pipefail

target="$1"
out="$2"
device="$3"
appearance="$4"
content_size="$5"
shift 5

# Nix の devShell は SDK とリンカーの環境変数を差し込む。Xcode の道具は空の環境から呼ぶ。
simctl() { env -i HOME="$HOME" PATH=/usr/bin:/bin:/usr/sbin:/sbin /usr/bin/xcrun simctl "$@"; }

app="platforms/ios/build/Build/Products/Debug-iphonesimulator/NumaRunner.app"
bundle="dev.salan70.uiuxnuma.runner"

simctl boot "$device" 2>/dev/null || true
simctl bootstatus "$device" -b >/dev/null
simctl ui "$device" appearance "$appearance"
simctl ui "$device" content_size "$content_size"
simctl install "$device" "$app"
simctl terminate "$device" "$bundle" 2>/dev/null || true
simctl launch "$device" "$bundle" -variant "$target" "$@" >/dev/null
# 描画と出現の動きが落ち着くまで待つ。
sleep "${IOS_SHOT_WAIT:-3}"
mkdir -p "$(dirname "$out")"
simctl io "$device" screenshot "$out" >/dev/null
echo "$out"
