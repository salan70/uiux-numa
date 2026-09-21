# Catalog の詳細ページの題字に WIP を付ける

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [Asset composition model](../asset-model.md)、[Experiment の記録形式](../experiment-format.md)、[Guideline の記録形式](../guideline-format.md)
- 対象: `apps/catalog/`

## 背景

Catalog には判断を終えた成果物と、実装中や判断前の成果物、draft の方針が同じ見た目で並んでいた。
読み手は、決まったものとまだ決まっていないものを見分けられなかった。

## 決定

詳細ページの題字に `WIP` の印を付ける。
判定は正本の既存 status から導出し、新しい項目を足さない。

| 対象       | WIP にする条件                                    | 表示するページ                                    |
| ---------- | ------------------------------------------------- | ------------------------------------------------- |
| Experiment | `status` が `draft`、`implementing`、`evaluating` | Icons と Typography の詳細、Components の部品詳細 |
| Guideline  | `status` が `draft`                               | Guidelines の各文書                               |

- `abandoned` は進行中ではないので付けない。
- 配色の詳細と Tokens は対象外にする。配色は判断済みの Experiment から来ており、Tokens は status を持たない。
- 印は `h1` の中に置き、読み上げでも題字と一緒に聞こえるようにする。
- 印の色は muted の文字と罫線にする。WIP は注意や警告ではなく未確定という中立の情報なので、accent や good / bad を借りない。
- display 寸法の題字では印を題字の直前に置く。末尾に置くと印だけが次の行へ落ち、横に並べると題字から離れた。

## 却下した案

- frontmatter に `wip` の項目を足す: status と二重管理になり、片方だけ更新されてずれる。
- `maturity` で判定する: `maturity` は再利用してよいかの軸で、判断の進み具合ではない（[Asset composition model](../asset-model.md)）。
- 一覧、カード、ナビにも出す: 今回、利用者が詳細ページの見出しに絞った。

## 影響

- 現時点では `experiments/hako-feature-icons` と Guidelines の 6 文書すべてに印が付く。
- 方針を `adopted` にするか、Experiment を `decided` にすれば、印は自動で消える。
