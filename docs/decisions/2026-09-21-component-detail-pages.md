# Components は部品ごとの詳細ページと見本のカード一覧にする

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [Components は Button だけを直接掲載する](2026-09-21-components-button-only.md)
- 置き換え: 上記 ADR の本文直載と詳細 route 削除の条項。

## 背景

`/components` は採用 Button の見本を本文へ直接載せていた。
利用者は、部品 1 つにつき詳細ページを 1 つ作る運用に変えると決めた。
`/components` には、各部品へのリンクと小さな見本だけを置く。

## 決定

- 部品ごとに `/components/<slug>` の詳細ページを置く。
- 最初の詳細ページは `/components/button` とし、旧本文の「役割とサイズ」と「状態とアイコン」を移す。
- 詳細の見本は iframe に入れず本文へ置き、親ページの token、配色、明暗を継承させる。
- 詳細の crumb に Components へのリンク、role、maturity、更新日を出す。
- `/components` は見本と名前のカードを並べる一覧にする。
- Button のカードには Primary、Secondary、Quiet、Danger の M サイズを並べる。
- カードの見本は `inert` の飾りにし、押す先は名前のリンクだけにする。リンクの判定はカード全面へ広げる。
- 掲載する部品と、その見本と本文は `apps/catalog/src/content/components.tsx` の 1 か所で持つ。
- 見本の見出しは詳細の h1 に続くよう h2 と h3 にする。
- 登録にない `/components/<slug>` は NotFound にする。

## 理由

部品が増えても `/components` の長さが部品の数だけで決まり、1 部品の仕様量に左右されない。
詳細ページに URL があれば、部品を個別に共有し参照できる。
見本を本文に置く判断は前 ADR と同じで、内部スクロールを作らない。
カードの見本を操作させないのは、リンクの中にボタンを入れ子にしないためである。

## 却下した案

- 本文直載を続ける: 部品が増えるたびに一覧が長くなり、目的の部品を探しにくい。
- 詳細を iframe で表示する: 前 ADR が除いた内部スクロールが戻る。
- 行の一覧にする: 見本が小さくなり、部品の見た目を比べにくい。
- 見本を Primary 1 つだけにする: 役割の違いが一覧から読めない。

## 影響

- `workHref` は Components でも `/components/<slug>` を返す。
- 廃止した Component の旧詳細 URL は、登録にないため引き続き NotFound になる。
