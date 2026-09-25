---
name: crafting-svg
description: SVG のアイコン、ロゴ、イラストを要求文から制作、比較、改善、最適化し、利用画面で確認するときに使う。既存 SVG の部分編集にも使う。
---

# SVG の制作

編集用の原本、配布用の SVG、preview を作り、単体と利用画面内で確認する。
造形の良し悪しは描画した画像を読んで判断し、採用は人間が決める。
コマンドは `just` の recipe で、direnv 済みシェルか `nix develop -c just <recipe>` で実行する。

## 参照資料

パスはリポジトリのルートからのものである。
記録とレビューでは、根拠にした項目を ID（例: `ICON-06`）で引用する。

- `skills/crafting-svg/references/foundations.md`: 共通の造形の ID と、このリポジトリで採った値
- `skills/crafting-svg/references/icon.md`: アイコンの ID と採った値
- `skills/crafting-svg/references/logo.md`: ロゴの ID
- `skills/crafting-svg/references/illustration.md`: イラストの ID
- `skills/crafting-svg/references/ui-fit.md`: 利用画面と支援技術への適合の ID
- `skills/crafting-svg/references/svg-authoring.md`: 記述規約、SVGO と resvg の制約、埋め込み方
- `skills/crafting-svg/references/self-review.md`: 自己確認の項目、記録の形式、終了条件
- `docs/principles/`: 原則候補。`candidate` は未検証の仮説、`adopted` だけを採用済みとして参照する

## 手順

### 1. 要求を整理する

- 成果物の種類と個数、利用画面での役割、実利用サイズと最小サイズ、制約（viewBox、単色か多色か、既存の組）、目指す印象を確定する。
- 不足があって判断が変わる場合だけ依頼者に確認する。
- プロダクト固有の制約は Experiment の README の Constraints に置く。Skill には書かない。
- ロゴ、挿絵、キーヴィジュアルなどブランドを表す成果物では、比喩と目指す印象を制作前に依頼者と決める。テーマだけから比喩を自分で選ぶと外れる（削除済み Experiment `class-doc-logo`、`class-chapter-illustration`）。参照を受け取るか、比喩の候補を軽い下書きで見せて選んでもらう。
- 印象が定まっていなければ、方向の異なる案を作って選んでもらう。

### 2. 方針を選ぶ

- 線幅、端点と角、塗りか線か、比喩、グリッドをパラメータとして書き出し、参照 ID と選定理由を付ける。
- 複数案では変える軸を 1〜2 つに絞る。基準の variant を複製してから変え、比喩も座標も違うものを「1 か所だけ変えた」と扱わない。
- 既製のアイコン集の形をなぞらない。
- 既知の対応が弱い概念（API、テスト、AI、抽象的な行為）は、比喩の候補を 2〜3 個下書きし、最小サイズで比べてから描き方を選ぶ。意味は描き方では改善しない（`docs/principles/metaphor-decides-before-style.md`）。
- 既存の asset があれば同じシートに基準として並べる。

座標は目分量で置かず、「体系から理論値を出す → 組の格子へ丸める → 誤差を残す」の 3 段で決める。
体系が衝突したときの優先順位は次のとおり（2 件の Experiment で一致した経験則）。

1. 最小表示サイズでの可読性（内側の隙間、ピクセル整列、線の濃さ）
2. 作図の決定性（対称性、keyline、名前のある作図法）
3. 比例の美学（黄金比、√2、単純整数比）

黄金比は粗い格子に載る場所が少ない（`catalog-ui-icons` は 5 箇所中 2、`catalog-theme-icons` は 0）。
作図で形を決めてから、比例で説明できる箇所だけを記録する。

### 3. 作り、検査し、複数サイズで描画する

原本は `experiments/<slug>/variants/<id>/source/<asset>.svg` に、`svg-authoring.md` の規約で書く。

```bash
just svg-check <file> --viewbox "0 0 24 24" --mono   # ファイルが先、オプションが後
just svg-sheet <out.png> 16,24,48 <svg>...           # 実利用サイズを含める
```

シートは `previews/<id>-first-sheet.png`、組を横断する比較は `previews/compare-first-sheet.png` に残す。

### 4. 単体と利用画面内で比較して改善する

- シートを `self-review.md` の項目で観察し、見た目と UX の観察を分ける。
- 利用画面のモックを `variants/<id>/index.tsx` に作り、配布用を inline に展開する。モックは variant 間で同一にし、`diff` で確かめる。
- モックではアイコンと語の対応を正しくする。対応を崩すと意味の妥当性の評価と混ざる。

```bash
just web-dev                                   # 別のシェルで起動。variant を追加したら再起動する
just web-shot <slug>/<id> previews/<id>-final-in-context.png 1280 900
```

- 反復は 1 variant あたり 3 回まで。round ごとに観察、変更、参照 ID、終了理由を記録する。
- 要素を足す前に、既にある形を減らして整えられないかを問う。
- 画像を読めない、または上限に達したら、未検証と未解決の項目を報告して止める。

### 5. 配布用を最適化して確認する

```bash
just svg-optimize variants/<id>/source/<asset>.svg variants/<id>/dist/<asset>.svg
just svg-sheet previews/<id>-final-sheet.png 16,24,48 variants/<id>/dist/*.svg
```

- `svg-optimize` は最適化、配布用の検査、`part-*` の id の一致を順に行う。失敗したら原本を直す。
- 部分編集は原本に対して行い、配布用を作り直す。

### 6. 依頼者へ SVG のまま見せる

PNG のシートは自分が形を確かめるためだけに使い、依頼者には渡さない。
SVG をそのまま並べた比較ページを作り、依頼者のブラウザで開く。

```bash
just svg-compare previews/compare.html 16,24,64 variants/<a>/dist variants/<b>/dist --scheme <配色 id>
open -a "Google Chrome" previews/compare.html
```

- サイズには実利用のサイズと、形を確かめる大きさ（64 など）を並べる。ライトとダークは自動で並ぶ。
- 多色の `part-*-accent` には指定した配色の色が塗られる。色の比較はこのページで行う。
- 利用画面での比較は runner の URL（`http://localhost:5183/#<slug>/<id>`）を渡す。
- 比較ページは `previews/compare.html` に置き、Experiment と一緒に commit する。

### 7. 記録し、報告する

- Experiment の README に、Variants の表、反復の記録、造形の理由、確認した内容を `docs/experiment.md` の形式で書く。
- 座標を導出で決めたら、asset ごとに「対象 / 体系 / 理論値 / 採用値 / 誤差 / 理由」の表で残す。
- 報告は、成果物の一覧、造形の理由（パラメータと参照 ID）、確認した内容、未解決と未検証の 4 つに分け、比較ページのパスと runner の URL を添える。
- Decision と Rejected reasons は人間が判断してから書く。
- 一般化できる知見は Learnings に書き、原則候補は `docs/principles/README.md` の手順で足す。

## 落とし穴

- SVG 内で CSS の `var()` を使わない。resvg が描画できない。色の差し替えは利用画面の CSS で `#part-*` を上書きする。
- `<text>` を使わない。resvg の文字描画はマシンのフォントに依存する。文字は path で描くか、利用画面の HTML テキストで組む。
- `aria-labelledby` を使わない。最適化で `<title>` の id が消える。`role="img"` と最初の子 `<title>` で名前が付く。
- `<g id="part-x">` の子が 1 つなら、最適化で id は子へ移り `<g>` は消える。塗りは part 要素自身に置く。
- inline に展開した SVG は root に `width` と `height` がないため、CSS で大きさを与える。指定しないと 300×150 になる。
- `just svg-sheet` は resvg の警告を失敗として扱う。警告の原因（未対応の要素、外部参照）を直す。
- `just web-dev` は 5183 番で起動する。起動後に追加した Experiment は glob に反映されないので、再起動する。
- 比較シートに asset の id を印字すると、意味の読み取りの確認に使えない。`svg-sheet` と `svg-grid` はファイル名を印字するので、名前を伏せた別の描画を用意する。
- 同じアイコンを 1 文書に 2 回 inline 展開すると `part-*` の id が重複する。最適化は `part-*` の重複を防がない。
- 多色の asset は `just svg-sheet` で色を確認できない。resvg に利用画面の CSS を渡せず、単色の線画として出る。色は利用画面の preview か比較ページで確かめる。
- `just svg-check --mono` は `fill="currentColor"` を許す。禁じているのは hex と `var()` である。塗りが要る比喩で `fill="none"` に固定すると案が成立しない。
- 領域の間に隙間を空けても線の量は減らない。接している間は共有辺が 1 本に見えるが、離すと平行 2 本になる。線を軽くしたいなら輪郭の色か有無を変える。
- SVGO は既定値と同じ属性（`stroke-linecap="butt"`、`stroke-linejoin="miter"`、`stroke="none"`）を配布用から落とす。外側から stroke を継承する利用先では塗りの SVG が変わりうる。
