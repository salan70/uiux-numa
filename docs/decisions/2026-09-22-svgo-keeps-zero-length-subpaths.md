# SVGO に零長の subpath を残させる

- 状態: Accepted
- 日付: 2026-09-22
- 参照: [SVG 制作の実行基盤を決める](2026-09-18-svg-toolchain.md)、[Catalog の UI アイコン](../../experiments/catalog-ui-icons/README.md)
- 対象: `scripts/svgo.config.mjs`、`experiments/*/variants/*/dist/`

## 背景

零長の線に丸い端点を打つと、塗り要素を足さずに点を描ける。
`catalog-ui-icons` の `detail` は、この形で i の点を描いている（`d="M12 7.5h0"`）。
[SVG 制作の実行基盤 ADR](2026-09-18-svg-toolchain.md) が定めた ICON-10 は単色の線画に塗り要素を足さないことを求めるため、点を描く手段はこれしかない。

`catalog-ui-icons` の成果物は x86_64-darwin で作った。
`flake.nix` の `nixpkgs-unstable` pin が x86_64-darwin を切っていたため devShell が評価できず、`nixpkgs-26.05-darwin` の svgo 4.1.0 を一時的に使った。
4.1.0 は `h0` を `z` に畳んで点を残す。

aarch64-darwin で正本の pin を使うと svgo は 4.0.1 になる。
4.0.1 の `convertPathData` は零長の subpath を「無用」と見なし、`path` 要素ごと削除する。
`h0`、`z`、`v0`、`h0z` のどの書き方でも消える。
`just svg-optimize` は `part-*` の ID 集合の不一致として検知して落ちる。

リポジトリ全体で照合すると、配布用 33 件のうち 32 件は svgo 4.0.1 でバイト単位で再現し、落ちるのは `detail.svg` だけだった。

## 決定

`scripts/svgo.config.mjs` の `preset-default` に `convertPathData: { removeUseless: false }` を足す。

零長の subpath は `z` に畳まれて残る。
`detail.svg` は commit 済みの配布用とバイト単位で一致する。

閉じた path の末尾に `Z` が 1 バイト増える。
影響は配布用 33 件のうち 5 件（`class-tech-icons` の `ai`、`hako-feature-icons` の `current-feather/assign`、`soft-solid/assign`、`soft-solid/deadline`、`soft-solid/progress`）。
16 / 20 / 24 / 48px の 4 サイズで再描画して比較し、差のあるサブピクセルは 0 だった。
配布用は再生成して commit する。

## 却下した案

- `flake.nix` の `nixpkgs-unstable` を `nixpkgs-26.05-darwin` へ差し替える: svgo 4.1.0 に戻せば設定を変えずに済み、x86_64-darwin も戻る。ただし resvg、oxfmt、node、pnpm の版も同時に下がり、影響範囲がこの問題より広い。pin の扱いは別に判断する。
- `convertPathData` 自体を無効にする: 点は残るが、配布用 33 件すべての path が最適化されなくなる。必要なのは零長の subpath の保持だけである。
- `detail` の点を塗りの円で描く: ICON-10 の「塗り要素を足さない」と衝突し、`catalog-ui-icons` の座標の導出と Learnings を書き直すことになる。描画系の都合で造形の規則を曲げない。
- 何もせず「正本の pin では `just svg-optimize` が通らない」と記録に残す: 再現できない成果物がリポジトリに残る。検査が成果物を守れなくなる。

## 影響

- 配布用 SVG は svgo の版に関わらず零長の subpath を保つ。描画系での揺れは resvg と Chrome で確認済み（[Catalog の UI アイコン](../../experiments/catalog-ui-icons/README.md)）。
- 既存の配布用 5 件が 1 バイトずつ増える。見た目は変わらない。
- `flake.nix` の pin は変更しない。x86_64-darwin で devShell が評価できない状態は残る。
