# SVG の記述規約

このリポジトリで SVG を書くときの規約と、記述技術の知識。
対応範囲は `just svg-check` が検査する。ここに書くのは、検査で拾えない落とし穴と理由である。

## 対応範囲（MVP）

- 自己完結した静的 SVG だけを扱う。
- 使わない: `script`、`foreignObject`、animate 系、`image`、`text`、外部参照、`on*` 属性、CSS の `var()`、`@import`。
- `<text>` を使わない理由: resvg の文字描画はマシンのフォントに依存する。文字は path で描くか、利用画面の HTML テキストで組む。
- `var()` を使わない理由: resvg が描画できない。テーマへの結び付けは利用画面の CSS で `#part-*` を上書きする。
- 未対応の入力（既存 SVG に上記が含まれる）は、`just svg-check` の出力をそのまま報告し、置き換え案を示す。

## 構造の規約

- root は `xmlns="http://www.w3.org/2000/svg"` と `viewBox` を持ち、固定の `width` と `height` を付けない。
- 単独で意味を持つ SVG は `role="img"` と最初の子 `<title>` で名前を付ける。`aria-labelledby` は使わない（最適化で `title` の id が消える）。
- 部分編集の単位には `id="part-<asset>-<role>"` を付ける（例: `part-assign-head`）。asset 名を含めるのは、複数の SVG を同じ HTML に inline したときの衝突を避けるため。
- 塗りと線は part 要素自身に置く。`<g>` に置くと、利用画面の CSS `#part-x { fill: … }` が子の属性に負ける。
- `<defs>` の id には asset 名を含める（例: `hako-grad-1`）。
- 単色のアイコンは `fill` と `stroke` を `currentColor` か `none` だけにする。`stroke-width`、`stroke-linecap`、`stroke-linejoin` は root に 1 回書く。
- 編集用の原本にはコメントで造形の意図を残してよい。最適化で消える。

## SVG-01 線幅の偶奇で座標の刻みを決める

- 種別: 知覚原則（ラスタ化の原理）
- 適用場面: 小サイズで表示するアイコン
- 指針: viewBox は目標の表示サイズと同じ整数（例 `0 0 24 24`）にする。stroke は中心線の両側へ線幅の半分ずつ広がるので、偶数幅の線は整数座標、奇数幅の線は 0.5 刻みの座標に置く。
- 指針（viewBox と表示サイズが違う場合）: viewBox が `V` で最小表示サイズが `S` のとき、軸に平行な線の外縁 `e` が整数ピクセルに乗る条件は `e × S/V ∈ ℤ` である。`V=24` なら `S=16` で `e` は 1.5 の倍数、`S=20` で 1.2 の倍数になる。**整列できる値は最小表示サイズごとに解き直す。** 組の格子（例 `0.75 + 1.5n`）と両立しない場合は、どちらを捨てるかを記録に残す。曲線が主役の組では、整列より組で格子を共有することを優先してよい。
- 理由: ピクセルの境界にまたがる線は 2 ピクセルに分かれてぼやける。
- 良い例: stroke-width 1 の縦線を x=12.5 に置く。stroke-width 2 の縦線を x=12 に置く。
- 悪い例: stroke-width 1 の縦線を x=12 に置き、2px 幅の灰色になる。
- 修正方法: 線幅の偶奇で刻みを決め、0.5 ずらすか線幅を偶数にする。
- 出典: [MDN: Drawing shapes with canvas](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Drawing_shapes)（2026-09-18 取得）。"For even-width lines, each half ends up being an integer number of pixels, so you want a path that is between pixels"

## SVG-02 端点と角を明示する

- 種別: 知覚原則（規格）
- 適用場面: 線画のアイコン、線で構成するロゴ
- 指針: `stroke-linecap` と `stroke-linejoin` の既定は `butt` と `miter`。miter は鋭角で `stroke-miterlimit`（既定 4）を超えると bevel に落ちて角の形が変わる。端点と角の形を 1 組で明示する。
- 理由: 既定に任せると、鋭角の頂点だけ切れて見える。
- 良い例: root に `stroke-linecap="round" stroke-linejoin="round"` を書く。
- 悪い例: 指定なしで、鋭角の頂点だけ切れる。
- 修正方法: cap と join を root で与え、鋭角は round か miterlimit で揃える。
- 出典: [MDN: stroke-linejoin](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/stroke-linejoin)（2026-09-18 取得）。"The corner is formed by extending the outer edges of the stroke at the tangents of the path segments until they intersect"

## SVG-03 use で差し替える属性は参照先に書かない

- 種別: 知覚原則（規格）
- 適用場面: 同じ形を繰り返すイラスト、複数パーツのロゴ
- 指針: 繰り返す形は `<defs>` に置いて `<use>` で参照する。`<use>` 側の fill などは、参照先に同じ属性があると無視される。差し替えたい属性は参照先に書かない。
- 理由: 参照先の属性が優先される。
- 良い例: `<defs>` の path に fill を書かず、`<use fill="…">` で与える。
- 悪い例: 参照先に fill があり、`<use fill="red">` が効かない。
- 修正方法: 変える属性を参照先から外し、`<use>` か親で与える。
- 出典: [MDN: use](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/use)（2026-09-18 取得）。"are ignored if the corresponding attribute is already defined on the element"

## SVG-04 SVGO の既定は id、g、role を消す

- 種別: 経験則（SVGO 公式ドキュメント）
- 適用場面: 最適化の設定、SVGO の版の更新
- 指針: preset-default は参照のない id を消し、参照のある id を短縮し、基本図形を path 化し、`<g>` を畳み、`role` を消す。このリポジトリの `scripts/svgo.config.mjs` は `part-` の保持、id の短縮の停止、`role` の保持を明示する。`removeTitle` と `removeViewBox` は v4.0.0 で既定から外れたが、古い版やラッパーは既定が違う。
- 理由: 既定のままでは、部分編集の単位と支援技術向けの属性が失われる。
- 良い例: `just svg-optimize` で配布用を作り、part-* の一致を確かめる。
- 悪い例: 編集用を既定の設定で通し、id、`<g>`、`role` が消える。
- 修正方法: overrides で明示し、最適化後に id、title、role の有無を検査する。
- 注意: `<g id="part-x">` の子が 1 つなら、最適化で id は子へ移り `<g>` は消える。id は残るが要素は変わる。
- 出典: [SVGO: cleanupIds](https://svgo.dev/docs/plugins/cleanupIds/)（2026-09-18 取得）。"Removes unused IDs, and minifies IDs that are referenced by other elements." / [SVGO v4.0.0 release](https://github.com/svg/svgo/releases/tag/v4.0.0)

## SVG-05 resvg は静的 SVG だけを描く

- 種別: 経験則（resvg と usvg の公式 README）
- 適用場面: resvg で描画して確認する制作の流れ
- 指針: resvg は CSS の対応が最小限で、文字はフォントの読み込みが要り、外部ファイル参照の `<use>` は非対応。確認用の SVG は presentation 属性で描く。
- 理由: `<style>` と `<text>` に依存すると、ブラウザと見た目が違う。
- 良い例: fill と stroke を属性で書く。
- 悪い例: `<style>` の class と `<text>` に依存する。
- 修正方法: CSS を属性へ展開し、文字は path 化する。
- 出典: [usvg README](https://github.com/linebender/resvg/blob/main/crates/usvg/README.md)（2026-09-18 取得）。"CSS support is minimal"

## SVG-06 基本図形で下絵を作り、部分ごとに path 化する

- 種別: 経験則（査読研究による LLM の能力評価）
- 適用場面: 生成の手順
- 指針: LLM は配置と基本図形は作れるが、複雑な path の合成が弱い。`circle`、`rect`、`line`、`polyline`、短い `path` で構図を決め、必要な部分だけ path 化する。座標は格子上（整数か 0.5 刻み）に置き、自由曲線より円弧を優先する。
- 理由: 長い cubic Bézier を最初から書くと、意図しない形になりやすい。
- 良い例: circle と rect で構図を決め、必要な部分だけ path 化する。
- 悪い例: 最初から長い cubic Bézier 1 本で描く。
- 修正方法: 基本図形で下絵 → 描画確認 → 部分ごとに path 化、の順に分ける。
- 注意: 2024〜2025 年の研究の結果で、モデルの更新で変わりうる。禁止ではなく既定の順序として扱う。
- 出典: [Chat2SVG（arXiv 2411.16602）](https://arxiv.org/html/2411.16602)（2026-09-18 取得）。"the LLM has limitations in synthesizing geometrically complex paths" / [SVGenius（arXiv 2506.03139）](https://arxiv.org/html/2506.03139)

## SVG-07 反復の間で構造を保つ

- 種別: 経験則（既存のロゴ制作 Skill）
- 適用場面: 反復による改善、部分編集
- 指針: 反復の間で `part-*` の id と要素の構成を保ち、変えた部分だけを差分として追う。
- 理由: 構造が変わると、改善前後の比較と部分編集ができない。
- 良い例: 反復ごとに小サイズの描画を確認し、id を維持する。
- 悪い例: 描画の確認なしに構造を作り直す。
- 修正方法: 変更は part 単位で行い、`git diff` で対象外が不変であることを確かめる。
- 出典: [neonwatty/logo-designer-skill](https://github.com/neonwatty/logo-designer-skill/blob/main/skills/logo-designer/SKILL.md)（2026-09-18 取得）。"Keep SVG structure consistent across iterations (same group IDs)"

## 利用画面への埋め込み（Web 実行基盤）

- `index.tsx` は配布用を `import svg from "./dist/x.svg?raw"` で読み、`dangerouslySetInnerHTML` で inline に展開する。
- 大きさは CSS で与える（`.icon svg { width: 24px; height: 24px }`）。root に `width` と `height` がないため、指定しないと 300×150 になる。
- 色は親の `color` で与える。多色は `#part-x { fill: … }` で上書きする。
- 多色では塗りだけでなく**輪郭の色も利用画面が決める**。原本は `currentColor` の単色線画のまま残し、色が当たらない場面（一覧画面、forced-colors、シート）でも意味が通る形にする。役割色と面のコントラストは配色によって保証されないため、意味を塗りに担わせない（原則候補 `docs/principles/theme-color-fill-carries-no-meaning.md`）。
- アプリのコンポーネントへ手で転記するときは、`id="part-*"` ではなく `class="part-*"` にする。配布用をそのまま一覧展開する画面（Catalog の Icons ページなど）と同居すると、同じ id が 1 文書に 2 つ出る。
- 新しい Experiment を追加したら、`just web-dev` を再起動する。起動後に追加したディレクトリは glob に反映されないことがある。
