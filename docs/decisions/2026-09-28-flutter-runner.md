# Flutter の実行基盤を Web 向けのビルドで置く

- 状態: Accepted
- 日付: 2026-09-28
- 参照: [Issue #20](https://github.com/salan70/uiux-numa/issues/20)、[iOS 実行基盤の ADR](2026-09-28-ios-runner.md)、[Web 実行基盤の ADR](2026-09-13-web-runner.md)

## 背景

Issue #20 で Baseball Player Journey の UI/UX を要件から作り直すことになった。
Issue は SwiftUI で案を並べるとしていたが、利用者は製品を Flutter で作り直す予定であり、UI も Flutter で作り、試作は Web で動かすよう指示した。
既存の実行基盤は React の `platforms/web` と SwiftUI の `platforms/ios` だけで、Flutter の画面を比べる置き場が無かった。

## 決定

- `platforms/flutter/` を Flutter の実行基盤にする。`pubspec.yaml` と、variant を列挙して描く殻（`lib/main.dart`）だけを置く。
- 実行基盤の責務は Web と iOS と同じく、variant を列挙し、選んだ variant を描くことだけにする。URL の query `variant=<slug>/<id>` で 1 つを開き、variant 固有の query は variant が `Uri.base` から読む。
- 端末の明暗、文字の拡大、動きの抑制は、殻が query（`theme`、`textScale`、`reduceMotion`）で `MediaQuery` を上書きして再現する。iOS の `ios-shot` の appearance と content_size に当たる。
- 端末は iPhone 17 の論理解像度（402 × 874）と安全領域（上 62、下 34）で描く。Web には安全領域が無いので、殻が `MediaQuery.padding` に入れる。
- variant の入口は `experiments/<slug>/variants/<id>/index.dart` の top-level 関数 `Widget buildVariant()` とする。Dart に `import.meta.glob` が無いので、`scripts/build-flutter-registry.mjs` が入口を探して `lib/registry.g.dart` を書く。
- experiments は `platforms/flutter/lib/experiments -> ../../../experiments` の symlink で package の中に入れる。Dart はファイルごとに名前空間が分かれるので、iOS のような名前の衝突は起きない。
- 字は `platforms/flutter/fonts -> ../../tokens/typography/fonts` の symlink で woff2 をそのまま asset にする。CanvasKit は woff2 を読める。
- CanvasKit は `--no-web-resources-cdn` で成果物に同梱し、実行時に CDN から取らない。
- Flutter は nixpkgs-unstable の `flutter` を flake で固定する（3.47.0、Dart 3.13.0）。
- 開発サーバーは release のビルドを配信する。hot reload は使えないが、撮影を実機に近い速さで再現できる。
- 撮影は `scripts/web-shot.sh` を使い、仮想時間を `VIRTUAL_TIME_BUDGET` で延ばす。headless Chrome は仮想時間の中で Flutter の遷移を進めないので、遷移先は `reduceMotion=1` で撮る。
- コマンドは justfile の `flutter-gen`、`flutter-check`、`flutter-build`、`flutter-dev`、`flutter-shot` を正本とする。生成した一覧、`.dart_tool`、ビルド成果物は追跡しない。`pubspec.lock` は追跡し、整形しない。
- Catalog は `platforms` に `web` を含まない Experiment を載せない。frontmatter の検査は通す。

## 却下した案

- React の `platforms/web` で Flutter の画面を模す: 既存の基盤で済むが、製品で使う Material の部品、文字の拡大の挙動、`Semantics` を再現できない。作った UI を製品へ持ち込めない。
- iOS と Android のシミュレータで動かす: 実機に近いが、Xcode と Android SDK が要り、指示の「試作は Web」に反する。Android SDK は Nix の外に置くことになる。
- Experiment ごとに Dart package を作り、path 依存で読む: 境界は明確だが、Experiment ごとに `pubspec.yaml` の保守が増え、runner が package の一覧を知る仕組みが別に要る。
- experiments を相対 import（`../../../experiments/...`）で読む: package の外のファイルを読むことになり、`package:` の解決と解析の対象がずれる。
- debug の開発サーバー（DDC）: hot reload が使えるが、起動が遅く、headless Chrome の撮影が読み込みの途中で終わる。
- Flutter の `integration_test` と `flutter drive` で撮る: 画面の遷移を待てるが、ChromeDriver が要り、Nix で固定できない。

## 影響

- Flutter の Experiment は `just flutter-check` で解析し、`just flutter-dev` を起動してから `just flutter-shot` で preview を撮る。最初の Experiment は `experiments/baseball-journey-app/` である。
- `docs/experiment.md` に Flutter の variant の置き方を足した。
- Flutter の variant の自動テストを置く場所は未決である。`baseball-journey-app` では一時的な widget test で主な流れを確かめ、commit しなかった。
- CI は無い。Flutter の検証は手元の `just flutter-check` と撮影だけで行う。
