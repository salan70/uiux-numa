---
title: Catalog トップのギャラリー
status: implementing
role: module
maturity: experimental
created: 2026-09-21
updated: 2026-09-21
platforms:
  - web
domains:
  - visual-design
  - animation-motion-design
  - information-architecture
  - accessibility
sources: []
adopted: []
---

## Problem

公開 Catalog のトップは、最終更新 1 件の hero とトピック 5 件の入口だけで、成果物の幅が一目で伝わらない。
利用者は、定義済みの成果物がギャラリーサイトのように並び、動きを持って流れる入口にしたい。

## Target

公開 Catalog を初めて開き、使いたい配色、文字、token、アイコン、部品、方針を眺めて探す人を対象にする。

## Scope / Domains

対象は Catalog のトップ 1 画面の版面と動きとする。
並べる対象は Works（配色、書体、token、アイコン、部品）と Guidelines の抜粋である。
方向は利用者が選んだ 3 つ（流れる帯、モザイク壁とスクロールでの登場、カーソル追従と奥行き）とし、1 案に 1 つずつ当てる。
variant で変える軸は、タイルの並べ方と動きだけとする。
版面の構造（題字、リード、トピックの入口）とタイルの中身は 3 案で共有する。

## Constraints

- React + TypeScript と CSS で実装し、追加依存を入れない。
- タイルの見本は新しく描かず、リポジトリの実物を読む。配色は `color-schemes-material` の `scheme.css`、アイコンは `class-tech-icons` の採用 variant の `dist/`、方針は `docs/guidelines/*.md` の summary、部品は採用済みの Button と Card を使う。
- `apps/catalog` の解析器を import しない。Experiment と公開面の間に依存を作らない。
- 色と寸法は既存 token と scheme の `--color-*` だけを使う。ホスト固有のブランド色を足さない。紙や印刷の質感を入れない。
- タイルは Card と同じく、題名のリンクの `::after` を全面へ広げて全体を押せるようにする。見本は操作要素を含むので `aria-hidden` と `inert` にし、リンクの中へ入れない。
- 5 秒を超えて動き続ける内容には止める手段を置く。
- 帯の複製は `aria-hidden` と `inert` にし、読み上げとフォーカスを重複させない。
- `prefers-reduced-motion: reduce` では、流れる帯を止めて普通の横スクロールにし、登場を即時表示にし、視差と傾きを外す。
- 視差と傾きは精密ポインタ（`hover: hover` かつ `pointer: fine`）に限る。
- hover でしか届かない情報を作らない。キーボードで全タイルへ届く。
- 状態の変化でレイアウトの寸法を変えない。拡大と傾きは `transform` だけで行う。
- 画面外と非表示のタブでは、流す処理を止める。
- Catalog の配色と light / dark を反映する。単体表示の代替配色は無彩の `sumi` とし、タイルの色を面より先に立たせる。

## Hypothesis

中身を揃えて並べ方と動きだけを変えると、トップで成果物の幅を伝える力と、探すときの落ち着きの釣り合いを比べられる。

## Variants

| id              | 仮説                                                                               | 変えた軸                                     | 実装                      |
| --------------- | ---------------------------------------------------------------------------------- | -------------------------------------------- | ------------------------- |
| `marquee-rows`  | 逆向きに流れる帯を重ねると、スクロールしなくても成果物の幅が 1 画面で伝わる        | 並び: 横に流れる 3 段の帯。動き: 無限の送り  | `variants/marquee-rows/`  |
| `mosaic-reveal` | 枠の数で重要度を示す非対称の壁に、見えた順の登場を足すと、眺めながら順に読める     | 並び: 大小のグリッド。動き: スクロールで登場 | `variants/mosaic-reveal/` |
| `depth-tilt`    | 層ごとの視差とタイルの傾きで奥行きを持たせると、静止した壁でも触れたくなる面になる | 並び: 層を持つグリッド。動き: ポインタ追従   | `variants/depth-tilt/`    |

| id              | 向く状況                                                 | 代償                                                                                 |
| --------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `marquee-rows`  | 件数が多く、1 画面で幅を見せたい。眺める時間が短い入口   | 常に動くので止める操作が要る。目当てのタイルが流れていき、狙って押しにくい           |
| `mosaic-reveal` | 重要度に差をつけたい。スクロールして順に見てほしい       | 動きは登場の 1 回だけで、最初の画面の印象は静か。枠の組み方で空きが出ることがある    |
| `depth-tilt`    | デスクトップで触れる楽しさを出したい。件数が少なくてよい | 精密ポインタ以外では静止した壁になり、案の差がほぼ消える。傾きと光の分だけ描画が重い |

### 実装の要点

- `marquee-rows`: 帯は `transform` ではなく横スクロールの位置を `requestAnimationFrame` で送る。キーボードで帯の外のタイルへ進んだとき、ブラウザが自分でスクロールして見える位置へ出すためである。ポインタが乗るかフォーカスが入った段は徐々に減速して止まる。見出しの横に「止める」ボタンを置く。
- `mosaic-reveal`: `IntersectionObserver` で見えたタイルから順に出す。出す前の状態は JavaScript が動いたときだけ付け、フォーカスが先に届いたタイルは待たせずに出す。
- `depth-tilt`: 大きいタイルほど手前の層に置き、奥の層は少し縮める。ポインタの位置で層ごとにずらし、乗ったタイルはその位置に向かって傾き、光の当たりが追う。

動きの長さのうち、登場（480ms / 640ms）、視差の追従（600ms）、傾き（300ms）は token の 120ms / 160ms では短すぎるため、各 `variant.css` に理由を添えて直接書いた。
token 化は採用後に 2 つ目の利用面ができたときに検討する。

## Evaluation

未実施。
自動の確認として、1280 と 390 の幅、light と dark、reduced motion の各状態を headless Chrome で描画し、帯の送りと停止、フォーカスの見える位置、登場、傾きの付与を確かめた。
支援技術による読み上げと、実機のタッチ操作は未確認である。

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

- `experiments/card/`: タイルの押せる範囲と、見本の中身だけを拡大する hover を `zoom-cover` から借りる。見本の一部は `shared/covers.tsx` を使う。
- `experiments/button/shared/useCatalogColors.ts`: 単体表示で Catalog の配色を読む処理を共有する。
- `experiments/color-schemes-material/`: 配色タイルの値の正本。
- [visual showcase ADR](../../docs/decisions/2026-09-20-catalog-visual-showcase.md): Catalog の見た目は Experiment で比べてから公開面へ入れる。
