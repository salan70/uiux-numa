# Catalog のトップを流れる帯にする

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [visual showcase ADR](2026-09-20-catalog-visual-showcase.md)、[採用済み部品を使う ADR](2026-09-21-catalog-uses-adopted-components.md)、[削除の ADR](2026-09-21-prune-decided-experiments.md)
- 置き換え: トップの「最終更新 1 件の hero」。トピック一覧（WORKS）は残す。

## 背景

公開 Catalog のトップは、最終更新 1 件の hero とトピックの入口だけで、成果物の幅が一目で伝わらなかった。
利用者は、定義済みの成果物がギャラリーサイトのように並び、動きを持って流れる入口を求めた。
方向は利用者が 3 つ挙げ、`catalog-home-gallery` Experiment で 1 案ずつ試作した。
3 案ともタイルは採用済みの Card（`zoom-cover`）で描き、中身を揃えて並べ方と動きだけを変えた。

## 決定

- トップの hero を、逆向きに流れる 3 段の帯（`marquee-rows`）に置き換える。
- 帯には配色、書体、token、アイコン、部品、Guidelines の要約を Card で並べる。中身は正本から読み、挿絵を新しく描かない。
- 帯は段ごとにカードの幅を揃え、段どうしで幅を変える。Card は幅で高さが決まるためである。
- 帯は `transform` ではなく横スクロールの位置を `requestAnimationFrame` で送る。キーボードで帯の外のカードへ進んだとき、ブラウザが自分でスクロールして見える位置へ出すためである。
- ポインタが乗るかフォーカスが入った段は徐々に減速して止まる。
- 帯の複製は `aria-hidden` にし、リンクを `tabindex="-1"` にする。`inert` は使わない。`inert` にすると hover と押下も届かず、帯の半分が押せない面になる。
- `prefers-reduced-motion: reduce` では流さず、複製を外して普通の横スクロールにする。
- 画面外と非表示のタブでは送りを止める。
- トピック一覧（WORKS）は帯の下に残す。
- `catalog-home-gallery` Experiment はディレクトリごと削除する。実装は `apps/catalog/src/components/MarqueeRows.tsx` と `apps/catalog/src/content/galleryTiles.tsx` に移した。

## 理由

利用者が runner 上で 3 案を操作して比べ、`marquee-rows` を採用した。
流れる帯は、スクロールしなくても成果物の幅を 1 画面で伝えられる。
減速と reduced motion の代替で、常に動くことの代償を抑えられる。
後続のデザインフィードバックにより、hero のリード文と帯の右上の「止める」Button は削除した。

## 却下した案

- `mosaic-reveal`: 2 件、3 件、4 件の段を積んだ壁に、スクロールで見えた順の登場を足す案。動くのは登場の 1 回だけで、最初の画面の印象は静かだった。
- `depth-tilt`: 同じ幅の Card のグリッドに 3 つの層を割り当て、ポインタに合わせた視差とカードの傾きで奥行きを出す案。精密ポインタ以外では静止した壁になり、案の差がほぼ消える。

2 案の却下理由は利用者から聞いていない。上の記述は試作時に書いた各案の代償である。

削除前の Experiment は commit `b10d8ef` にある。
復元は `git checkout b10d8ef -- experiments/catalog-home-gallery` で行う。

## 影響

- `worksByUpdated` とトップの hero、`.btn` の CSS は使われなくなったので削除した。
- `Link` に `tabIndex` を渡せるようにした。帯の複製のリンクを Tab から外すためである。
- Catalog の inventory テストから、topic を持たない Experiment の例外を外した。
- 帯の長さの値（段ごとの速さ、カードの幅、見本の往復 1.4s）は token にしない。利用面がトップ 1 つである。
