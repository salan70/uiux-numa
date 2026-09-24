# topic に当たらない Experiment を Catalog に載せず、削除もしない

- 状態: Accepted
- 日付: 2026-09-22
- 置き換え先: [規約と記録の組み直し](2026-09-24-minimal-docs.md)。対象は 1 件に限らず、topic に当たらない Experiment 全般とした。
- 置き換え: [削除の ADR](2026-09-21-prune-decided-experiments.md) の「判断済みで Catalog に載せない Experiment は、ディレクトリごと削除する」を、topic に当たらない Experiment について置き換える。
- 参照: [topic-first ADR](2026-09-20-catalog-topic-first.md)、[visual showcase の ADR](2026-09-20-catalog-visual-showcase.md)、[Experiment lifecycle](../experiment.md)、[対象領域](../scope.md)
- 対象: `apps/catalog/src/content/inventory.test.ts`、`docs/layers.md`

## 背景

`cornix-product-ui` を 2026-09-22 に追加した。
domains は `visual-design`、`information-architecture`、`interaction-design`、`states-design`、`accessibility` である。
`topics.ts` の 5 topic はどれもこれらの domain を持たないので、`topicForExperiment` は `null` を返す。
Catalog は topic 経由でしか Experiment を描画しないため、この Experiment はどの画面にも現れない。

`inventory.test.ts` は「残る Experiment はすべて topic を持つ」と検査していた。
これは削除の ADR の前提（載せない Experiment は削除したので、残るものは必ず載る）をそのまま写したものである。
`cornix-product-ui` の追加でこの検査が落ちた。

削除の ADR の影響欄は、新しい domain の Experiment を置いたときの載せ方を保留していた。
本 ADR はその保留に答える。

## 決定

- topic に当たらない Experiment は Catalog に載せない。
- 載せない Experiment を削除しない。
- 載せない Experiment の slug は `inventory.test.ts` に明示する。
- 現時点の対象は `cornix-product-ui` の 1 件である。
- 載せ方は、適用事例が複数になってから決める。

## 理由

### 削除しない

削除の ADR が消した 7 件は、判断が済み、後続が無く、保守だけが残ったものだった。
`cornix-product-ui` は Asset を実プロダクトへ適用した事例であり、Cornix 側への反映という後続を持つ。
削除の規則は、判断の古さではなく後続の有無で効く。

### 載せない

Catalog の Works は、再利用する成果物を topic で分ける。
全面 UI の適用事例は部品ではなく、Colors、Typography、Tokens、Components、Icons のどれでもない。
性質の違うものを既存の topic へ入れると、topic の定義が緩む。

### 明示する

slug を検査に書くと、新しい Experiment が topic を持たないまま黙って消えることを防げる。
削除の ADR が消した除外リストを復活させるわけではない。
Catalog の実装は topic だけを見る。掲載しないものを知るのは検査だけである。

## 却下した案

- Works に 6 つ目の topic を作る。1 件の Experiment のために IA を広げることになる。2 件目、3 件目の適用事例が出てから形を決めるほうが、topic の定義が決まる。波及先も Sidebar、ホームの件数、詳細 route、live variant の導線に及ぶ。
- `cornix-product-ui` の domains に `layout` を足して Components へ入れる。コード変更は最小だが、Components の「画面を組む部品」という定義に全面プロトタイプが混ざる。
- 削除の ADR に従って `cornix-product-ui` を削除する。後続がある成果を消す。
- 検査から topic の条項を外す。掲載されない Experiment を検出できなくなる。

## 影響

- `inventory.test.ts` の topic の検査を、`unlisted()` の明示へ変える。
- 同じ検査の Experiment 件数を 9、live variant 件数を 25 にし、adopted 一覧へ `cornix-product-ui/chromatic-rail` を足す。
- `docs/layers.md` の Catalog 節に、載せない Experiment がある旨を書く。
- トップの最終更新日は `catalog.experiments` 全件から採るので、載せない Experiment の更新日も反映される。今回は変えない。
- `cornix-product-ui` を Catalog で見せる方法は未決である。
