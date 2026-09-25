---
name: exploring-ui-variants
description: 方向の異なる UI 案を named variant として実装し、platforms/web で実サイズ比較するときに使う。試作は Experiment に残す。既存 UI の動きレビューには reviewing-motion を使う。
---

# UI 案の分岐

要求文と Experiment の Brief から、方向の異なる案を複数作り、操作できる形で並べる。
採用は人間が決める。勝者を先に決めない。

## 参照

パスはリポジトリのルートからのものである。

- 対象 Experiment の README の Brief、Constraints、評価軸
- `docs/experiment.md`、`docs/evaluation.md`
- `docs/guidelines/`: `adopted` だけを採用済みとして参照し、`draft` は未採用として扱う
- `docs/principles/`: `adopted` だけを採用済みとして参照し、`candidate` は未検証の仮説として扱う
- 動きが軸なら `skills/crafting-motion/SKILL.md`、点検は `skills/reviewing-motion/SKILL.md`

## 手順

1. Brief の範囲を守る。複数画面に跨る Brief を 1 部品へ狭めない。狭めると判断が変わる場合だけ確認する。
2. 既存の token（色、typography、余白）を使い、比較軸以外の差を作らない。共有コードを Brief が禁じていれば variant ごとに閉じる。
3. 既定 3 案、最大 5 案にする。名前は方向を表す語にし、`a` / `b` や番号は使わない。色や文言だけが違う案は 1 方向と数えない。動きが軸なら候補を複数残し、根拠を書く。
4. `experiments/<slug>/variants/<id>/index.tsx` に、props なしで描画できるコンポーネントを default export する。死んだボタンと lorem ipsum は置かない。
5. `just web-dev` の runner（`http://localhost:5183/#<slug>/<id>`）で実サイズと前後の文脈で操作する。専用の picker と計画用の別ファイルは作らない。runner は起動後に足した Experiment を拾わないので再起動する。

## 渡す前の操作

- キーボード、focus、連続操作、中断を 1 回ずつ試す。動きがあれば `prefers-reduced-motion` も見る。
- 状態を切り替えて周りの要素が動かないことを見る（`docs/principles/state-changes-must-not-move-layout.md`）。
- hover でしか出ない情報を作らない。

## 記録

README の Variants 表に軸、仮説、実装パスを書く。却下した案も消さない。
人間へ渡す表は `id`、`軸`、`向く状況`、`代償` の 4 列にし、勝者欄と順位を置かない。
runner の URL を添えて止める。
