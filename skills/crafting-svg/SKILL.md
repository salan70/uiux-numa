---
name: crafting-svg
description: SVG のアイコン、ロゴ、イラストを要求文から制作、比較、改善、最適化し、利用画面で確認するときに使う。既存 SVG の部分編集にも使う。
---

# SVG の制作

要求文から、編集用の原本、配布用の SVG、preview を作り、単体と利用画面内で確認する。
機械検査は構文、対応範囲、明示された制約だけを扱う。造形の良し悪しは描画した画像を読んで判断し、採用は人間が決める。
コマンドはすべて `just` の recipe で、direnv 済みシェルか `nix develop -c just <recipe>` で実行する。

## 参照資料

必要な資料だけを読む。改善の記録とレビューでは、根拠にした項目を ID（例: `ICON-06`）で引用する。

- `skills/crafting-svg/references/foundations.md`: 共通の造形（視覚的な中心、見かけの重さ、簡略化、曲線）
- `skills/crafting-svg/references/icon.md`: アイコン（比喩、グリッド、線幅、端点、隙間、サイズ別の版）
- `skills/crafting-svg/references/logo.md`: ロゴ（独自性、lockup、単色と縮小、safe zone）
- `skills/crafting-svg/references/illustration.md`: イラスト（文言との役割分担、焦点、明暗、統一）
- `skills/crafting-svg/references/ui-fit.md`: UI への適合とアクセシビリティ（名前、コントラスト、主従、currentColor）
- `skills/crafting-svg/references/svg-authoring.md`: 記述規約（対応範囲、part-* の id、座標、SVGO と resvg の落とし穴）
- `skills/crafting-svg/references/self-review.md`: 自己確認の項目、記録の形式、終了条件
- `docs/principles/`: 独自の原則候補。status が `candidate` のものは未検証の仮説として扱い、`adopted` だけを採用済みとして参照する

パスはすべてリポジトリのルートからのものである。

## 手順

### 1. 要求を整理する

要求文と、任意の参照画像や既存 SVG を入力にする。次の項目を埋め、不足があって判断が変わる場合だけ確認する。

- 成果物の種類: アイコン、ロゴ、イラストのどれか。個数と組の関係
- 利用画面での役割: どの画面のどこに置くか。周囲の文字、面、余白
- 表示サイズ: 実利用のサイズと、最小サイズ
- 制約: viewBox、単色か多色か、配色の役割、既存の組との整合、プロダクト固有の制約
- 目指す印象: 要求文の言葉。定まっていなければ、方向の異なる案を作って選んでもらう

プロダクト固有の制約は要求文と Experiment の README の Constraints に置く。Skill には書かない。

ロゴ、挿絵、キーヴィジュアルなど、ブランドを表す成果物では、比喩と目指す印象を制作の前に依頼者と決める。
テーマだけを受け取って比喩を自分で選ぶと、機能アイコンでは成立しても、これらでは外れる（削除した Experiment `class-doc-logo` と `class-chapter-illustration` の Learnings）。
参照（好きな意匠、作風、既存の例）を受け取るか、比喩の候補だけを軽い下書きで見せて選んでもらう。

### 2. 方針を選び、比較する違いを明確にする

- 参照資料と原則候補から方針を選ぶ。線幅、端点と角、塗りか線か、比喩、グリッドをパラメータとして書き出し、それぞれに選定理由と参照 ID を付ける。
- 複数の案を作るときは、変える軸を 1〜2 つに絞り、他は共通にする。
- 既製のアイコン集の形をなぞらない。参照色や参照例から選んだ理由を残す。
- 既知の対応が弱い概念（API、テスト、AI、抽象的な行為）では、比喩の候補を 2〜3 個、下書きで描いて実利用の最小サイズで比べる。描き方を選ぶのはその後にする。意味は描き方では改善しない（`docs/principles/metaphor-decides-before-style.md`）。
- 既存の asset がある場合は、同じシートに基準として並べる。

### 3. 作り、検査し、複数サイズで描画する

- 編集用の原本を `experiments/<slug>/variants/<id>/source/<asset>.svg` に書く。規約は `svg-authoring.md` に従う（`role="img"` と `<title>`、`part-<asset>-<role>` の id、`currentColor`、格子上の座標、基本図形から始める）。
- 検査する。エラーが消えるまで直す。

```bash
just svg-check <file> --viewbox "0 0 24 24" --mono   # オプションは制約に応じて
just svg-sheet <out.png> 16,24,48 <svg>...           # 実利用サイズを含める
```

- シートは `previews/<id>-first-sheet.png` に残す。組を横断する比較は `previews/compare-first-sheet.png` にする。

### 4. 画像を読み、単体と利用画面内で比較して改善する

- シートを Read で開き、`self-review.md` の項目で観察する。見た目と UX の観察を分ける。
- 利用画面のモックを `variants/<id>/index.tsx` に作り、配布用を inline に展開する。モックは variant 間で同一にし、`diff` で確かめる。

```bash
just web-dev                                   # 別のシェルで起動。variant を追加したら再起動する
just web-shot <slug>/<id> previews/<id>-final-in-context.png 1280 900
```

- 反復は 1 variant あたり 3 回まで。round ごとに観察、変更、参照 ID、終了理由を記録する。
- 要素を足す前に、既にある形を減らして整えられないかを問う。
- 画像を読めない、または上限に達した場合は、未検証と未解決の項目を報告して止める。

### 5. 原本を保持し、配布用を最適化して確認する

```bash
just svg-optimize variants/<id>/source/<asset>.svg variants/<id>/dist/<asset>.svg
just svg-sheet previews/<id>-final-sheet.png 16,24,48 variants/<id>/dist/*.svg
```

- `svg-optimize` は最適化、配布用の検査、`part-*` の id の一致を順に行う。失敗したら原本を直す。
- 配布用のシートを読み、原本と見た目が同じことを確かめる。
- 部分編集は原本に対して行い、配布用を作り直す。`git diff` で対象外が不変であることを確かめる。

### 6. 記録し、報告する

- Experiment の README に、Variants の表、反復の記録、造形の理由、確認した内容を書く。形式は `docs/experiment-format.md` に従う。
- 報告は次の 4 つを分ける。成果物の一覧、造形の理由（パラメータと参照 ID）、確認した内容（検査、シート、利用画面）、未解決と未検証。
- 採用と却下の判断は人間が行う。Decision と Rejected reasons を先に書かない。
- 一般化できる知見は Learnings に書き、原則候補は `docs/principles/README.md` の手順で追加する。

## 落とし穴

- SVG 内で CSS の `var()` を使わない。resvg が描画できない。色の差し替えは利用画面の CSS で `#part-*` を上書きする。
- `<text>` を使わない。文字は path で描くか、利用画面の HTML テキストで組む。
- `aria-labelledby` を使わない。最適化で `<title>` の id が消える。`role="img"` と最初の子 `<title>` で名前が付く。
- `<g id="part-x">` の子が 1 つなら、最適化で id は子へ移り `<g>` は消える。塗りは part 要素自身に置く。
- inline に展開した SVG は root に `width` と `height` がないため、CSS で大きさを与える。
- `just svg-sheet` は resvg の警告を失敗として扱う。警告の原因（未対応の要素、外部参照）を直す。
- `just web-dev` は 5183 番で起動する。起動後に追加した Experiment は glob に反映されないことがあるので、再起動する。
- `just svg-check` はファイルを最初の引数にし、オプションを後に置く。
- 比較シートに asset の id を印字すると、意味の読み取りの確認に使えない。ラベルなしで意味を確かめるときは、名前を伏せた別の描画を用意する。
- 利用画面のモックでは、アイコンと語の対応を正しくする。複数のアイコンを 1 画面で見せる目的で対応を崩すと、意味の妥当性の評価と混ざる。
- 同じアイコンを 1 文書に 2 回 inline 展開すると、`part-*` の id が重複する。最適化は短縮 id の衝突を防ぐが、`part-*` 自身の重複は防がない。
- 基準の variant と 1 か所だけ変えた比較をするなら、基準を複製してから変える。比喩も座標も違うものを「1 か所だけ変えた」と扱わない。
- SVGO は既定値と同じ属性（`stroke-linecap="butt"`、`stroke-linejoin="miter"`、`stroke="none"`）を配布用から落とす。今日の描画には影響しないが、外側から stroke を継承する利用先では塗りの SVG が変わりうる。
