# iOS の実行基盤に SwiftUI と XcodeGen を採用する

- 状態: Accepted
- 日付: 2026-09-28
- 参照: [Issue #19](https://github.com/salan70/uiux-numa/issues/19)、[Web 実行基盤の ADR](2026-09-13-web-runner.md)、[初期ディレクトリ構成](2026-09-13-initial-directory-layout.md)

## 背景

Issue #19 で Yodoku（SwiftUI、iOS 26）の UI/UX を要件から作り直すことになり、iOS の画面を複数案で比べる置き場が要った。
Issue #19 の反復 0 は、置き場を 3 案に絞り、比べたい課題が出た時点で決めるとしていた。

1. `platforms/ios` を作り、SwiftUI の variant を並べる。
2. Web で iOS の画面を模す。
3. Yodoku の中で作り、記録だけを uiux-numa に残す。

Web の ADR は、SwiftUI の実行基盤を最初の Experiment の時点で別の ADR として決めるとしていた。
2026-09-28 に利用者が 1 を選んだ。

## 決定

- `platforms/ios/` を iOS の実行基盤にする。XcodeGen の `project.yml` と、variant を列挙して描く殻（`Runner/`）だけを置く。
- 実行基盤の責務は Web と同じく、variant を列挙し、選んだ variant を描くことだけにする。起動引数 `-variant <slug>/<id>` で 1 つの variant を全画面で開く。variant 固有の起動引数は variant が読む。
- variant の実装は `experiments/<slug>/variants/<id>/` に、共有コードは `experiments/<slug>/shared/` に置く。XcodeGen がこの 2 か所の `*.swift` を 1 つの app target へ集める。
- variant の入口は `<Pascal(slug)><Pascal(id)>.swift` にある同名の `View` とする。Swift には `import.meta.glob` が無いので、`scripts/build-ios-registry.mjs` が入口を探して `Registry.generated.swift` を書く。
- 1 つの module に全 Experiment の Swift が入る。ファイル名と型名が重複するとビルドが落ちるので、どちらも入口の名前で始める。
- 字は `tokens/typography/fonts` の woff2 をそのまま bundle に入れ、CoreText で登録する。ttf の複製を持たない。
- Xcode 本体は Nix の外に置き、xcodegen だけを flake で固定する（nixpkgs-unstable、darwin のみ）。
- Nix の devShell は SDK とリンカーの環境変数（`DEVELOPER_DIR`、`SDKROOT`、`NIX_LDFLAGS` など）を差し込み、`xcodebuild` のリンクを壊す。Xcode の道具は `env -i` の空の環境から呼ぶ。
- シミュレータでだけ動かし、署名しない。既定の端末は iPhone 17 とし、justfile の `ios_device` で変える。
- コマンドは justfile の `ios-gen`、`ios-build`、`ios-run`、`ios-shot` を正本とする。`xcodeproj`、生成した一覧、ビルド成果物は追跡しない。
- Catalog は `platforms` に `web` を含まない Experiment を載せない。frontmatter の検査は通す。
- 適用先の製品のコードには依存しない。Yodoku の規則は Experiment の共有コードへ写し、出典の commit を残す。

## 却下した案

- Web で iOS の画面を模す: 既存の基盤で済むが、Liquid Glass、Dynamic Type、SF Symbols、シートと全画面の挙動を再現できない。#15 では見せかけのモックが本体への浅い移植を招いた。
- Yodoku の中で作る: 最も本物に近いが、実験を `experiments/<slug>/` に閉じる方針に反し、Phase 3 の記録中の製品へ試作を混ぜる。
- Xcode の Preview だけで比べる: 起動引数での撮影、シミュレータでの操作、明暗と文字サイズの切り替えを just から再現できない。
- Experiment ごとの Swift package: 名前の衝突は避けられるが、runner が package の一覧を知る仕組みが別に要り、Experiment ごとに `Package.swift` の保守が増える。
- YodokuCore を path 依存で読む: 別リポジトリの位置に依存し、この環境の外で再現しない。YodokuCore は Yodoku のリポジトリの直下に無いので、git 依存にもできない。
- Tuist、SwiftPM の実行ファイル: XcodeGen は Yodoku で既に使っており、道具を揃えられる。
- ttf を `platforms/ios` へ複製する: 字の正本が 2 つになる。CoreText は woff2 を読める。
- flake の `mkShell` を `mkShellNoCC` に替える: Xcode 以外の道具にも影響するので、この判断の範囲を超える。

## 影響

- iOS の Experiment は `just ios-build` でビルドし、`just ios-shot` で preview を撮る。最初の Experiment は `experiments/yodoku-app/` である。
- `docs/experiment.md` に iOS の variant の置き方を足した。
- Catalog に iOS の Experiment を載せる方法は未決である。
- CI は無い。iOS のビルド検証は、手元の `just ios-build` だけで行う。
