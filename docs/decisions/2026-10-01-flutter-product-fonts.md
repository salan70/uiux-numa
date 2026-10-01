# Flutter 実行基盤に、製品の書体を Experiment から登録する

- 状態: Accepted
- 日付: 2026-10-01
- 参照: [Flutter 実行基盤](2026-09-28-flutter-runner.md)、[#21](https://github.com/salan70/uiux-numa/issues/21)

## 背景

Flutter 実行基盤の字は `tokens/typography/fonts` の LINE Seed JP だけである。
[#21](https://github.com/salan70/uiux-numa/issues/21) の round 2 では、利用者が .389 の既存のテイストを前提にすると決めた。
そのテイストは、本文の RocknRoll One と数値の Oxanium で成り立ち、LINE Seed JP で描くと別のアプリに見える。

## 決定

- 製品の書体を写す Experiment は、書体のファイルとライセンスを `experiments/<slug>/fonts/` に置く。
- `platforms/flutter/pubspec.yaml` に、`lib/experiments/<slug>/fonts/` を指す family として登録する。
- token の書体（LINE Seed JP）は変えない。製品の書体は、その Experiment の中だけで使う。
- 登録できるのは、配布できるライセンス（SIL OFL など）の書体に限る。

最初の登録は `389-app` の Oxanium（可変、OFL）と RocknRoll One（OFL）である。

## 却下した案

- `tokens/typography/fonts` に足す: token は uiux-numa の正本で、製品固有の書体を混ぜると token の判断が濁る。
- LINE Seed JP で近似する: 利用者が選んだテイストの芯を外し、比較の前提が崩れる。
- 実行時に Google Fonts から読む: 撮影と比較の再現に外部の通信が要る。Oxanium は Google Fonts の版と製品の同梱の版が一致する保証がない。

## 影響

- 実行基盤の Web のビルドに、RocknRoll One の約 2.5MB が加わる。
- Experiment を消すときは、pubspec の登録も消す。
