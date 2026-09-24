# 方針の書式をコアは思想、Tips は具体に分ける

- 状態: Accepted
- 日付: 2026-09-20
- 置き換え先: [規約と記録の組み直し](2026-09-24-minimal-docs.md)。frontmatter の `axes` を廃止し、書式は docs/guideline.md に置いた。
- 参照: [Catalog に方針を載せる ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-20-catalog-guidelines.md)、[asset-model](../layers.md)
- 更新: コアに主題全体へ効く数値を書けるようにした。[コアの数値 ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-21-guideline-core-values.md) を参照する。

## 背景

`docs/guidelines/` の 6 文書は、コアと Tips を同じ書式で書いていた。
書式が同じなので境界が曖昧になり、States & Feedback では同じ規則がコアと Tips の両方にあった。
Tips は 1 文書あたり 6〜15 件、合計 59 件あり、読む量が多い。
確認項目は Tips の言い換えで、判断の節は draft の間ずっと空だった。

## 決定

- 節は目的、コア、Tips の 3 つにする。適用範囲、確認項目、出典、判断の節は置かない。
- コアは思想を書く。見出しと本文 1〜3 文だけにし、例、図、出典を持たせない。3〜5 件にする。
- コアの並び順を、衝突したときの優先順位にする。
- Tips は具体的な場面の規則を書く。8 件までを目安にする。
- Tips に適用（`foundation` か `module`）と、関連するコアの見出しを必ず付ける。
- `adopted` にしたときの判断者、判断日、理由は ADR に残す。
- まず States & Feedback だけを新書式へ移す。残り 5 文書は内容を確かめてから移す。
- 移行が終わるまで、解析器は未移行の文書だけ旧書式で読む。

[Catalog に方針を載せる ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-20-catalog-guidelines.md) のうち、「2 層を同じ書式で書く」ことと「規則の必須項目」はこの決定で置き換える。

## 理由

コアを思想に限ると、具体的な値や場面を持つ規則はすべて Tips に入り、置き場に迷わない。
書式が違えば、コアの言い換えを Tips に書く重複が起きにくい。
優先順位とトレードオフをコアに書くと、Tips に無い場面でも判断できる。
Tips にコアを付けると、規則がなぜあるかを思想までたどれる。
適用を付けると、他のプロジェクトへ持ち出すときに、守るものと選ぶものを分けられる。
確認項目は `foundation` の Tips を読めば足りる。

## 却下した案

- コアにも良い例と悪い例を残す: 具体例を持つとコアと Tips の違いが再び層の名だけになり、重複が残る。
- 適用に評価軸の重み（必須、重要、参考）を流用する: variant の採否を決める重みと、規則を守る範囲が混同される。
- 適用に新しい 2 段階の語を作る: 共通適用か選択かを表す語がすでに role にあり、語が増える。
- `reference` も適用に使う: 規則は守るか守らないかの 2 値で足りる。
- 6 文書を一度に書き換える: 書式を試す前に量を書くことになり、書式の直しが 6 倍になる。
- 判断を frontmatter に残す: draft の間は空の項目が並ぶ。

## 影響

- `experiments/catalog-editorial/shared/guidelines.ts` の型と検証を新書式へ合わせる。
- `topic-first` の方針画面は、コアを番号付きの一覧で、Tips を適用とコアのタグ付きで描く。
- 残り 5 文書の移行時に、旧書式の読み込みと確認項目、出典の描画を消す。
