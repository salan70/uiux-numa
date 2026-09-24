---
title: Cornix Bonsai の機能アイコン
status: implementing
role: module
maturity: experimental
created: 2026-09-24
updated: 2026-09-24
platforms:
  - web
domains:
  - iconography
  - visual-design
  - accessibility
sources:
  - catalog-ui-icons
  - cornix-workbench
  - color-schemes-material
adopted: []
---

## Problem

Cornix Bonsai の Web UI（board-desk、Cornix Bonsai `17fd920`）には SVG のアイコンが無い。
左端の入口、診断の重さ、保存状態、パネルの操作、encoder の回転方向に、文字の記号（⌨ ▦ ⚙ ✓ ⇅ ▤ ⛔ ⚠ ⓘ ◌ ○ ⤢ ⤡ × ↺ ↻ →）を使っている。
記号は OS のフォントで形と太さが揃わず、Pop Toy の造形とも合っていない。
Cornix のために描いた 1 組の機能アイコンに置き換える。

ロゴ、favicon、アプリ名は、利用者の判断で別の対応にする。
keycap の刻印記号（⌘ ⌥ ⌃ ⇧ ⏎ ⌫ ⇥ など）は macOS と Vial の慣習なので対象外にする。
CSS で描いた点（接続状態、差分、layer の色点）も対象外にする。

## Target

Cornix Bonsai を macOS の Chrome で使い、キー割り当てを連続で編集する個人。
アイコンは語の隣に置き、意味は語が担う。
アイコンは、語を読む前に置き場所と状態を見分ける手がかりにする。

## Scope / Domains

17 個の機能アイコンを 1 組で作る。

| asset         | 役割                     | 置き場所（Cornix の部品）                   | 実利用のサイズ |
| ------------- | ------------------------ | ------------------------------------------- | -------------- |
| `keymap`      | 入口: キー割り当て       | `Rail`（色のタイル 32px の中）              | 20px           |
| `overview`    | 入口: 全体マップ         | `Rail`                                      | 20px           |
| `behaviors`   | 入口: 動作定義           | `Rail`                                      | 20px           |
| `validation`  | 入口: 検証               | `Rail`                                      | 20px           |
| `device`      | 入口: 実機と適用         | `Rail`                                      | 20px           |
| `files`       | 入口: ファイル           | `Rail`                                      | 20px           |
| `error`       | 診断 error、保存の失敗   | `StatusBar`、`ValidationPanel`、`Inspector` | 16px           |
| `warning`     | 診断 warning、保存の競合 | `StatusBar`、`ValidationPanel`、`Inspector` | 16px           |
| `info`        | 診断 information         | `StatusBar`、`ValidationPanel`              | 16px           |
| `saving`      | 保存中（回して使う）     | `Inspector`                                 | 16px           |
| `check`       | 保存済み、Apply の完了   | `Inspector`、`ApplyDialog`                  | 16px           |
| `close`       | パネルを閉じる           | `PanelDialog`                               | 16px           |
| `expand`      | 全画面で表示             | `PanelDialog`                               | 16px           |
| `collapse`    | 元の大きさに戻す         | `PanelDialog`                               | 16px           |
| `rotate-ccw`  | encoder の左回し         | `Board` の encoder の帯                     | 16px           |
| `rotate-cw`   | encoder の右回し         | `Board` の encoder の帯                     | 16px           |
| `arrow-right` | 移動（layer を開く）     | `Inspector`、`OverviewPanel`                | 16px           |

variant で変える軸は造形（見た目）だけにする。
置き場所、サイズ、語との対応は 3 案で同じにする。

## Constraints

- viewBox は `0 0 24 24`、最小サイズは 16px（`docs/principles/icon-set-consistency-by-few-parameters.md`）。
- 線は `currentColor`。語の色を継ぎ、Pop Toy の明暗へ追従する（UIFIT-07）。
- 2 色にする場合は、色の面を `part-<asset>-accent` にし、色は利用画面の CSS が与える。意味は輪郭が担い、色の面には意味を担わせない（`docs/principles/theme-color-fill-carries-no-meaning.md`）。
- 色だけで意味を伝えない。error、warning、info は形でも見分ける。
- アイコンは読み上げから外す（`aria-hidden`）。名前は隣の語か `aria-label` が持つ。
- Cornix Bonsai の `design-system.test.ts`（CSS に生の hex と px を書かない）に載せられること。
- 追加の npm 依存を入れない。

## Hypothesis

組の値を少数に固定すると、17 個が 1 組に見え、16px でも潰れない。
Pop Toy の色の面や、キーキャップの枠を足すと、道具としての明瞭さを保ちながら玩具らしさが出る。

## Variants

3 案は同じ骨格（`shared/build-icons.mjs` の `ASSETS`）から書き出す。
骨格以外の差は 1 軸だけにする。

| id            | 仮説                                                                                     | 変えた軸             | 実装                    |
| ------------- | ---------------------------------------------------------------------------------------- | -------------------- | ----------------------- |
| `round-line`  | 基準: `round-soft` の値の線画だけで、17 個が 1 組に見え、16px で読める                   | —                    | `variants/round-line/`  |
| `pop-duo`     | 骨格の下に置き場所の色の面を 1 つ敷くと、線画の読みやすさを保ったまま Pop Toy の色が出る | 塗り（色の面の有無） | `variants/pop-duo/`     |
| `keycap-tile` | 骨格をキーキャップ型の枠に入れると、キーボードの道具らしさと玩具らしさが出る             | 外形（枠の有無）     | `variants/keycap-tile/` |

### 造形のパラメータ

3 案で共通にする。
`catalog-ui-icons` の `round-soft` の値をそのまま使う。

| 項目              | 値                                | 参照    |
| ----------------- | --------------------------------- | ------- |
| viewBox           | `0 0 24 24`                       | ICON-04 |
| 外形（live area） | 3..21 の 18×18。padding 3         | ICON-04 |
| 線幅              | 1.5                               | ICON-05 |
| 端点と角          | `round`。root で 1 回だけ指定する | ICON-07 |
| 座標の格子        | 0.75                              | ICON-09 |
| 内側の最小隙間    | 1.5 以上                          | ICON-08 |
| 色                | `currentColor`                    | ICON-10 |

`pop-duo` の色の面は、面を持つ asset ではその面（皿、菱形、盾、紙、輪、三角）をそのまま使い、新しい形を足さない。
面を持たない asset（矢印、×、確認の印、回転）には、外形いっぱいの円（`r=8.25`）を敷く。

`keycap-tile` の枠は、外形 3..21、角丸 3.75（線の中心）にする。
骨格は中心 (12,12) の周りに 2/3 へ縮め、外形 12 にする。
枠の内縁 4.5..19.5 との隙間は上下左右 1.5 で、線幅と同じ最小値である（ICON-08）。
縮めた骨格は 0.75 格子から外れる。

### keycap-tile の中の形

枠がすでに囲いなので、囲いを持つ asset は、囲いを外した形を枠の中に置く（round 2）。
ほかの asset は 3 案で同じ骨格を使う。

| asset      | 骨格の形      | 枠の中の形                  | 理由                                                      |
| ---------- | ------------- | --------------------------- | --------------------------------------------------------- |
| keymap     | キーキャップ  | 刻印の A                    | 枠がキーキャップなので、中はキーの刻印にする              |
| validation | 盾と確認      | 確認の印が付いた 2 行の一覧 | 盾が囲いになる。check（保存済み）と区別するため行を添える |
| files      | 角を折った紙  | 上の開いた受け皿へ入る矢印  | 紙が囲いになる。.vil の読込と書出を示す                   |
| error      | 輪と ×        | ×                           | 枠が輪の代わりになる                                      |
| warning    | 三角と !      | !                           | 三角が囲いになる                                          |
| info       | 輪と i        | i（! を上下に反転した配置） | 枠が輪の代わりになる。warning と対にする                  |
| saving     | 4 分の 3 の輪 | 3 つの点                    | 輪が囲いになり、回すと枠ごと回る。止まった点で進行を示す  |

### 座標の導出

比喩と主な座標を、体系、理論値、採用値の順に残す。
採用値はすべて 0.75 格子に載る（`keycap-tile` の縮めた骨格を除く）。

| asset       | 比喩                       | 対象           | 体系              | 理論値                  | 採用値                | 誤差 | 理由                                                                         |
| ----------- | -------------------------- | -------------- | ----------------- | ----------------------- | --------------------- | ---- | ---------------------------------------------------------------------------- |
| keymap      | キーキャップを上から見た形 | 外形           | keyline（正方形） | 18                      | 18（角丸 3.75）       | 0    | 入口の中で最も大きい面にする。角丸は線幅の 2.5 倍で、キーの丸みを出す        |
| keymap      |                            | 皿             | 上寄せ            | 上 3 : 下 6             | y 6.75..14.25         | 0    | キーの押す面は手前（下）が厚く見える                                         |
| overview    | layer の重なり             | 段の間隔       | 等分              | 4.5                     | 4.5                   | 0    | 菱形と 2 段の間を同じにする。16px で 3px の隙間                              |
| behaviors   | 値を調整するスライダー     | つまみ         | 線幅              | 半径 2.25（線幅 × 1.5） | 2.25                  | 0    | 線を切ってつまみへ入れる。つまみの中は隙間 1.5                               |
| validation  | 盾と確認の印               | 盾の幅         | keyline（縦長）   | 15                      | 15（x 4.5..19.5）     | 0    | 縦長の形は幅を 3 減らして円と釣り合わせる（ICON-06）                         |
| device      | 読む（上り）と書く（下り） | 2 本の軸       | 3 等分            | x 8.25 / 15.75          | 8.25 / 15.75          | 0    | 頭の幅 7.5 が中央で重ならない                                                |
| files       | 角を折った紙               | 紙の幅         | keyline（縦長）   | 12                      | 12（x 6..18）         | 0    | 紙の比 12:16.5 ≈ 1:√2                                                        |
| error       | 輪と ×                     | ×              | 輪の内接          | 6                       | 6（9..15）            | 0    | 盤面の診断バッジの × と揃える                                                |
| warning     | 三角と !                   | 三角の底       | keyline（三角）   | 16.5                    | 16.5（y 19.5）        | 0    | 三角は重心が下がるので、底を外形の下端より 0.75 上げる                       |
| info        | 輪と i                     | 点と棒         | `round-soft`      | `detail` の値           | 同じ                  | 0    | 既存の組と同じ形にする                                                       |
| saving      | 4 分の 3 の輪              | 弧             | 円の keyline      | r 8.25、270°            | 同じ                  | 0    | 回したとき、欠けた 4 分の 1 が動きを見せる                                   |
| check       | 確認の印                   | 短い辺と長い辺 | 比                | 1 : 2                   | 5.25 : 10.5（x 方向） | 0    | 長い辺を右上へ伸ばし、外形いっぱいに使う                                     |
| expand      | 外へ向かう角の矢印         | 頭の長さ       | 外形の 3/8        | 6.75                    | 6.75                  | 0    | `collapse` と頭の長さを揃え、向きだけを変える                                |
| rotate-cw   | 弧と頭                     | 弧             | 円の keyline      | r 6.75、中心 (12, 13.5) | 同じ                  | 0    | 頭を上に置くため、円を 1.5 下げて外形に収める。頭の深さは 2.25（線幅 × 1.5） |
| arrow-right | 右向きの矢印               | 軸             | 対称              | y=12                    | 12                    | 0    | round-soft の y=11.25 は、語の隣と枠の中で上に浮いて見えた（round 2）        |

### 反復の記録

| round | 観察                                                                                                            | 変更                                                     | 参照した知識 | 終了理由         |
| ----- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ------------ | ---------------- |
| 1     | `keycap-tile` の警告の三角と検証の盾の一部が欠けた。生成スクリプトが `M` の後の暗黙の座標を移動として扱っていた | 暗黙の座標を線（`L`）として扱うよう直した                | —            | 不具合の修正     |
| 1     | `keycap-tile` は骨格を 10.5/18 に縮めると、16px で全体マップと error の中身が潰れた                             | 縮小率を 12/18 に上げ、枠との隙間を最小値 1.5 まで詰めた | ICON-08      | 利用者の比較待ち |
| 2     | 利用者が keycap-tile を気に入ったが、枠の中に囲い（輪、三角、盾、紙、キー）が重なると雑然として見えた           | 囲いを持つ 7 個に、枠の中用の形を足した（上の表）        | ICON-08      | 利用者の確認待ち |
| 2     | 利用者が矢印を不自然と感じた。移動の矢印は軸が y=11.25 で、語の隣と枠の中で上に浮いていた                       | 軸を y=12 へ戻し、頭の深さを 5.25 に詰めた               | ICON-06      | 利用者の確認待ち |
| 2     | 回転の頭（深さ 3）が弧の曲がりと重なり、16px で鉤に見えた                                                       | 頭の深さを 2.25（線幅 × 1.5）に縮めた                    | ICON-08      | 利用者の確認待ち |
| 2     | 利用画面のモックが保存中のアイコン全体を回していた。枠を持つ案では枠ごと回る                                    | 回すのを `-arc` の part だけにした                       | —            | 不具合の修正     |

### 確認した内容

- 51 個の原本（17 個 × 3 案）が `just svg-check --viewbox "0 0 24 24"` を通った（`round-line` と `keycap-tile` は `--mono` も通った）。
- 51 個の配布用が `just svg-optimize` を通った。
- 16 / 20 / 24px のシートを読んだ（`previews/*-first-sheet.png`、`previews/keycap-tile-round2-sheet.png`）。
- 利用画面のモック（`shared/Mock.tsx`）で、3 案をライトとダークで撮った。
- 依頼者には `previews/compare.html`（`just svg-compare`、SVG のまま描画）と runner の URL で見せた（`docs/decisions/2026-09-24-present-svg-as-html.md`）。

未解決の点:

- `keycap-tile` は、Cornix の入口がすでに色のタイルの中にあるので、枠が二重になる。
- `keycap-tile` では囲いを外した結果、error と close がどちらも「枠の中の ×」になった。形が同じで意味が違う。
- `pop-duo` の色の面は、シートでは灰色の面にしか見えない。色は利用画面でだけ確かめられる。
- `rotate-cw` と `rotate-ccw` は、弧が頭の先で終わるため、16px では頭が鉤に見えることがある。

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

- `experiments/catalog-ui-icons/`（`round-soft` の造形のパラメータ）
- `experiments/cornix-workbench/`（置き場所）
- `experiments/color-schemes-material/`（`pop-toy`）
