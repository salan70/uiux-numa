# SVG 制作の実行基盤を決める

- 状態: Accepted
- 日付: 2026-09-18
- 参照: [Issue #7](https://github.com/salan70/uiux-numa/issues/7)、[Web 実行基盤の ADR](2026-09-13-web-runner.md)、[Experiment の記録形式](../experiment.md)

## 背景

Issue #7 は、AI エージェントが SVG を制作し、検査、描画、最適化、利用画面での確認までを再現できる環境を求めている。
既存の Experiment 2 件は、preview の撮影と検査のスクリプトをリポジトリに置かず、置き場を未定としていた。
Issue は resvg と SVGO を第一候補にし、薄いスクリプトや just recipe で接続することを求めている。
機械検査は構文、対応範囲、明示された制約だけを扱い、デザインの良し悪しや根拠のない複雑度を合否にしない。

## 決定

- 描画は resvg、最適化は SVGO、構文と XPath の検査は xmllint（libxml2）を使う。`flake.nix` で固定し、resvg と svgo は nixpkgs-unstable、libxml2 は stable から取る。
- トップレベルに `scripts/` を新設し、薄いスクリプトを置く。コマンドの定義は justfile に集約し、recipe からスクリプトを呼ぶ。
- recipe は `svg-check`、`svg-sheet`、`svg-grid`、`svg-optimize`、`web-shot` の 5 つにする。`svg-grid` は variant を行、asset を列に並べた比較グリッドを作る。`svg-sheet` は 1 SVG を 1 行に置くため、variant 数 × asset 数が増えると縦に長くなりすぎるためである。
- MVP の対応範囲は自己完結した静的 SVG にする。`script`、`foreignObject`、animate 系、`image`、`text`、外部参照、`on*` 属性、CSS の `var()`、`@import` は未対応として診断する。
- `<text>` は未対応にする。resvg の文字描画はマシンのフォントに依存するためである。文字は path で描くか、利用画面の HTML テキストで組む。
- 比較シートは二段で描画する。各 SVG をサイズと明暗の背景ごとに PNG へ描画し、その PNG を並べた SVG を再び描画する。`currentColor` は明背景で `#1b1b1b`、暗背景で `#e6e6e6` に固定する。
- 最適化は SVGO の preset-default を基にし、`cleanupIds` の `minify` を止めて `part-` を保持し、`role` 属性を残す。`svg-optimize` は最適化の後に配布用を検査し、`part-*` の ID 集合が編集用と一致することを確かめる。
- 部分編集の単位には `part-<asset>-<role>` の ID を付ける。塗りは part 要素自身に置く。
- 支援技術向けの名前は `role="img"` と最初の子 `<title>` で付ける。`aria-labelledby` は使わない。SVGO の `cleanupIds` が `title` の id を消すためである。
- SVG 内で CSS の `var()` を使わない。テーマへの結び付けは利用画面の CSS で `#part-*` を上書きして行う。
- SVG を扱う Experiment は、編集用の原本を `variants/<id>/source/`、配布用を `variants/<id>/dist/` に置く。`index.tsx` は配布用を `?raw` で inline に埋め込む。variant 横断の比較画像は `previews/compare-<state>.png` にする。
- 利用画面の撮影はローカルの Chrome の headless で行う。倍率は 2 に固定する。ブラウザは Nix で固定できないため、`CHROME_BIN` で差し替えられるようにする。
- Web の開発サーバーは 5183 番に固定し、`--strictPort` を付ける。`web-dev` と `web-shot` は justfile の同じ変数を使う。

## 却下した案

- ピクセル差分ツール（ImageMagick など）: SVGO の数値の丸めで差が出るため閾値が要り、根拠のない閾値を合否にできない。最適化後の見た目は再描画をエージェントが読んで確かめる。
- `svg-check` を pre-commit hook にする: Skill なしの基準 variant と却下 variant は学習材料として残すため、対応範囲に違反しうる。
- フォントの outline 化ツール（Inkscape、fonttools など）: ツールとフォントのライセンス管理が増える。MVP では文字を扱わない。
- `<image href="x.svg">` で SVG を直接並べる比較シート: resvg は入れ子の SVG に色を伝えず、`currentColor` が黒になる。
- Playwright と puppeteer: npm 依存とブラウザのダウンロードが増える。撮影は Chrome の CLI で足りる。
- rsvg-convert と Inkscape の CLI: resvg は静的 SVG に特化し、依存が少なく、Nix で固定できる。
- `svg-check` に必須 ID の一覧を渡す: `svg-optimize` が編集用と配布用を自動で比較するため不要。
- スクリプトを Skill の配下に置く: コマンドの定義元を justfile に集約する方針に反し、他の Experiment からも使う。
- Chrome の `--virtual-time-budget`: Vite の開発サーバーに対して撮影が終わらなかった。ファイルの出現を待つ方式にする。
- nixpkgs の chromium: Linux 限定で darwin では使えない。

## 影響

- Web の Experiment の preview 撮影は `just web-shot` で再現できる。過去の Experiment の Learnings にある「置き場は未定」はここで解消するが、過去の記録は変更しない。
- Chrome 152 の headless は `--screenshot` の後に終了しないことがある。`web-shot` はファイルの出現を待ってから Chrome を止める。
- resvg の描画はブラウザと異なることがある。最終的な見え方は利用画面の撮影で確かめる。
- Vite の開発サーバーは、起動後に追加した Experiment のディレクトリを glob に反映しないことがある。variant を追加したら `just web-dev` を再起動する。
- SVG を扱う Experiment の記録は、[Experiment の記録形式](../experiment.md)の追記に従う。
