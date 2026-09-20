---
name: exploring-ui-variants
description: 方向の異なる UI 案を named variant として実装し、platforms/web で実サイズ比較するときに使う。試作は Experiment に残す。既存 UI の動きレビューには reviewing-motion を使う。
---

# UI 案の分岐

要求文と Experiment の Brief から、方向の異なる案を複数作り、操作できる形で並べる。
採用は人間が決める。エージェントは勝者を先に決めない。

## 参照

必要なものだけ読む。

- 対象 Experiment の README（Brief、Constraints、評価軸）
- `docs/experiment-format.md`
- `docs/evaluation/review.md`
- `platforms/web`（hash `#<slug>/<id>`、`just web-dev`）
- 動きが課題なら `skills/crafting-motion/SKILL.md`
- 動きの点検が必要なら `skills/reviewing-motion/SKILL.md`
- `docs/principles/`: 独自の原則候補。status が `candidate` のものは未検証の仮説として扱い、`adopted` だけを採用済みとして参照する

パスはリポジトリのルートからのものである。
未導入の上流 Skill（`emil-design-eng`、`pick-ui-library`、`apple-design` など）は呼び出さない。

## 手順

### 1. 範囲を Brief で決める

Issue と Experiment の Brief を読む。
Brief が複数画面に跨るときは、勝手に 1 部品へ狭めない。
狭めると判断が変わる場合だけ確認する。

次を 1 文で書き出す。

- 何を作るか
- どこで使うか
- 利用者が達成すること

計画用の別ファイルは作らない。
記録先は対象 Experiment の README と、関連 Issue 本文にする。

### 2. 地面を読む

実装の前に次を確認する。

- 技術: React、CSS の置き場、追加依存の可否
- トークン: 色、Typography、余白。既存があればそれを使う
- 調子: Brief が求める印象。ないなら方向の差で見せる
- 文脈: 前後の画面、実利用サイズ

共有コードを Brief が禁じていれば、各 variant をディレクトリ内で完結させる。

### 3. 方向を名前で決める

既定は 3 案、最大 5 案にする。
名前は方向を表す。`a` / `b` や Option 番号は使わない。

書く軸の例は layout、density、interaction、motion、feedback である。
色や文言だけが違う案は 1 方向として数えない。
動きが軸なら、候補を複数残して根拠を書く。1 案に決め打ちしない。

完了条件: 各案に名前と軸があり、同じ軸位置を共有しない。

### 4. named variant として実装する

置き場は `experiments/<slug>/variants/<id>/index.tsx` とする。
props なしで描画できるコンポーネントを default export する。
比較は `just web-dev` の runner で行う。URL は `http://localhost:5183/#<slug>/<id>` である。

専用 picker は作らない。
runner の一覧が切り替えになる。
サムネイルだけで判断しない。実サイズと前後の文脈で操作する。

各案は操作できる状態にする。
死んだボタンと lorem ipsum は置かない。
Brief の言語と制約を守る。

### 5. 自分で操作して渡す

すべての案を切り替えて操作する。
キーボード、focus、連続操作、中断を少なくとも 1 回ずつ試す。
動きがある案は `prefers-reduced-motion` も見る。
状態を切り替えて、周りの要素が動かないことを見る。
現在地、選択、件数の表示で寸法が変わると、押すたびに次の押し先がずれる。
候補（未検証）の原則が `docs/principles/state-changes-must-not-move-layout.md` にある。
hover でしか出ない情報を作らない。focus と、hover のないポインタでも届く道を用意する。

README の Variants 表に、軸、仮説、実装パスを書く。
却下した案も残す。削除しない。

人間へ渡す表は次の列にする。勝者欄は置かない。

| id  | 軸  | 向く状況 | 代償 |
| --- | --- | -------- | ---- |

URL を添えて止める。選択は依頼者のものである。

## 落とし穴

- 上流の picker を再現すると、比較対象とハーネスが混ざる。
- 採用した案以外を消すと、却下理由が残らない。
- 既存トークンを無視して別の色と字を足すと、比較軸以外の差になる。
- キーボード操作を理由に動きを全削除すると、稀な完了フィードバックまで消える。頻度は Brief の利用状況で判断する。
- 完了をボタン近傍だけに置き、見出しへフォーカスしないと、成功後のフォーカスが `body` に落ちる。
