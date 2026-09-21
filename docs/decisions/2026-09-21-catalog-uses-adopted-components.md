# Catalog 自身の UI に採用済みの Button と Card を使う

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [部品ごとの詳細ページ ADR](2026-09-21-component-detail-pages.md)
- 対象: `apps/catalog/`、`experiments/card/shared/Card.tsx`

## 背景

`experiments/button` の `pill-action` と `experiments/card` の `zoom-cover` は採用済みである。
Catalog はこれらを見本として載せるだけで、自身の一覧とボタンには独自の実装を使っていた。
利用者は、Catalog の中でも採用済みの部品を使うよう指示した。

## 決定

- `/components` の一覧を Card にする。カバーに部品の見本、要約に Experiment の lead を置く。
- Home のトピック一覧を Card にする。カバーは `experiments/card/shared/covers.tsx` の既存カバーを使い、補足に件数、要約に topic の lead を置く。
- Colors の前後送りと詳細ダイアログの「閉じる」を secondary の Button にする。前後送りの固定幅は Catalog 側に残す。
- `app-shell` に `button-pill-action` と `card-zoom-cover` を付け、採用 variant の見た目を Catalog 全体へ効かせる。CSS の import は Layout に置く。
- Card に任意の `linkAs` を足し、Catalog は自前の `Link` を渡して再読み込みなしに遷移させる。
- Card の中の見出しと段落の余白を 0 にする。置かれた画面の余白が持ち込まれると、高さを固定した文字の箱から題名が押し出される。

## 理由

採用実装を Catalog 自身が使えば、見本と実際の使われ方が食い違わない。
部品の不具合は Catalog の画面で先に見つかる。
今回は、置かれた画面の余白で題名が消える Card の不具合が見つかった。

## 却下した案

- Home のトピックに iframe の見本を残す: Card のカバーは飾りで、`inert` と `aria-hidden` にする。iframe の成果物をカバーに入れると重く、16:9 の枠にも収まらない。
- Card を Catalog 側へ複製する: Experiment の採用実装と差分が生まれる。
- Home の「この成果物を開く」を Button にする: リンクであり、`<button>` だけを描く今の Button では置き換えられない。リンク型の Button は別に判断する。
- アイコンだけの `sidebar-toggle`、トグルの variant 切り替え、色見本の押下領域を Button にする: Button はラベル付きの操作を対象とし、役割が違う。

## 影響

- Home のトピック一覧は成果物の live 標本を出さなくなる。
- `catalog-home-gallery` Experiment はトップを別案で試作中であり、その採否でトピック一覧を再び変える可能性がある。2026-09-21 に `marquee-rows` を採用し、トピック一覧は残した（[流れる帯の ADR](2026-09-21-catalog-home-marquee.md)）。
