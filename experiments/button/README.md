---
title: 汎用 Button
status: decided
role: module
maturity: candidate
created: 2026-09-21
updated: 2026-09-21
platforms:
  - web
domains:
  - forms-input-ux
  - interaction-design
  - visual-design
  - accessibility
sources: []
adopted:
  - pill-action
---

## Problem

画面の主要な操作と補助操作を、役割と状態が分かる一貫した Button で表す。

## Target

Web のプロダクト画面を使う人と、Button の見本を参照する開発者を対象にする。

## Scope / Domains

対象は input UX、操作、見た目、accessibility とする。
4 種の役割と 3 サイズを同じ API で比較する。
操作状態も比較する。
variant で変える軸は形状、面の階層、押下フィードバックとする。

## Constraints

- React + TypeScript と CSS で実装し、追加依存を入れない。
- 既存の文字、余白、角丸、線、役割色 token を使う。
- `<button>` を使い、キーボード操作に対応する。
- `focus-visible`、disabled、loading 状態も扱う。
- icon-only Button は対象外とし、アイコンには視覚的なラベルを付ける。
- hover の変化は精密ポインタに限り、reduced motion では移動と回転を止める。
- Catalog の既存配色と light / dark を標本へ反映する。

## Hypothesis

共通の役割と状態を保ち、形状などが異なる Button を比べる。

## Variants

| id            | 仮説                                           | 変えた軸                 | 実装     |
| ------------- | ---------------------------------------------- | ------------------------ | -------- |
| `pill-action` | 半円形と短い押下反応で、操作対象を明確にできる | 形状、押下フィードバック | 採用実装 |

### 削除した variant

判断後に却下 variant のコードと専用 preview を削除した。

- `hairline-control`: 線と標準の角丸で囲むと、操作対象を抑制的に示せる。変えた軸: 線、面、角丸。
- `tonal-layer`: 淡い役割色の面で区別すると、境界線を減らせる。変えた軸: 面の階層、役割色。

## Evaluation

比較評価は行わず、Catalog 上の実表示を確認して判断した。
未確認の軸は、複数ブランドへの適合と支援技術による横断確認である。

## Decision

`pill-action` を採用する。

- 判断者: リポジトリの所有者
- 判断日: 2026-09-21
- 根拠: カプセル形で操作対象が明確になり、短い縮小反応で押した感覚を伝えられる。現在の Catalog の文字、余白、配色とも調和する。

## Rejected reasons

- `hairline-control`: 標準の角丸と境界線では、操作対象を明確にする形状の特徴が弱い。
- `tonal-layer`: 淡い面の差だけでは、役割の強さをボタン形状から読み取りにくい。

## Learnings

Catalog に直接表示する場合も、親ページの配色と明暗設定を継承する。
きんぎょでは primary を鮮やかな朱色 `#ff7600` にし、暖色寄りの黒 `#120d09` を 7.21:1 で載せる。
役割とサイズの見本は、各サイズの最小幅を揃えて異なる役割のボタンを同じ位置で比較できるようにする。
半円形では端の丸みが余白を食うため、Button の左右余白は高さの半分弱に比例させる。
高さは上下余白ではなく `min-height` で決める。上下余白で高さを作る案は、サイズごとの line-height 差と縦位置のずれが出るため却下した。
アイコンとラベルは一つのまとまりとして中央に置く。
頻繁に使う Button の hover は操作対象のフィードバックに限り、精密ポインタ上で `duration.press`(160ms)の 1px リフトと影を出す。
`prefers-reduced-motion` では移動を止め、hover の影による状態差は残す。
高さ、最小幅、動きは `tokens/size` と `tokens/motion` を参照し、見本には数値ではなく token 名を出す。
Quiet は面と余白を持たないが、`size.target-min` で当たり領域を 24px 以上に保つ。

## Related patterns / assets

なし
