# 公開 Catalog の表示層を topic-first へ置き換える

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [visual showcase ADR](2026-09-20-catalog-visual-showcase.md)、[無彩のナビ ADR](2026-09-20-catalog-neutral-navigation.md)、[方針の掲載 ADR](2026-09-20-catalog-guidelines.md)、[ホスト ADR](2026-09-19-catalog-host.md)

## 背景

公開 Catalog は 6 種別のナビと、一覧から詳細へ送る 2 段の構成だった。
[catalog-editorial](../../experiments/catalog-editorial/README.md) で情報設計を作り直し、`topic-first` が A1 から A10 の反復を経て実装が揃った。
この案は入口をトピックにし、トピックの画面が中身そのものを出す。
方針（Guidelines）の画面も持つが、公開面には出ていなかった。

## 決定

- 公開 Catalog の表示層を `topic-first` の構造へ全面的に置き換える。
- 入口は Works（Colors / Typography / Tokens / Components / Icons）と Guidelines の 2 群にする。6 種別ナビは廃止する。
- トピックの画面は一覧を挟まず中身そのものを出す。
- URL は path ベースを維持する。`topic-first` の query 設計（`?screen=` / `item=` / `filter=`）は採らない。
- `/foundations/tokens`、`/guidelines`、`/guidelines/:slug` を足す。`/guidelines` は先頭の文書へ置き換える。
- Graphics と Illustrations は公開面から外す。graphics 系の URL は `notfound` にし、`/graphics` の 301 も削除する。
- 配色の詳細はダイアログのままとし、開いた状態を `/foundations/colors/:scheme` へ同期する。却下した配色は掲載しない。
- `experiments/catalog-editorial/shared/*` の写しは残して凍結する。正本は `apps/catalog/src/content/*` である。
- `topic-first` で決めた値（送り 8rem、数字 4.5rem、角丸 0.375rem、最小ターゲット 2.5rem、transition 120ms）は token にしない。

## 理由

入口の語彙は、作り手の分類ではなく利用者の探し方に合わせる。
「配色を見たい」「token の値を知りたい」と考えて来る人に、種別の名を先に通させない。
一覧を挟まないことで、成果物に届くまでの操作が 1 回減る。

path を維持すれば、既存の 3 本の 301、`scripts/catalog-shot.sh`、Cloudflare Pages の `_redirects` がそのまま生きる。
query 設計は実行基盤の hash と同居するための措置であり、公開サイトにはその事情がない。
共有と再訪も path のほうが素直である。

配色の詳細をリンクにすると、中クリックと新規タブが効き、深いリンクの存在が画面から読める。
ダイアログの開閉を URL に寄せることで、pushState、popstate、直リンクが 1 本の経路に乗る。

値を token にしない根拠は [ホスト ADR](2026-09-19-catalog-host.md) の規則 2 である。
token 化は「役割名があり、利用面が 2 つある」ことを求める。
公開面は 1 面であり、`experiments/catalog-editorial` 側は記録として凍結するため利用面に数えない。
これは Experiment の Learnings が「段階 C で 2 面になる値だけを改めて検討する」と記した分の結論である。

## 却下した案

- query 設計をそのまま採る: 共有と再訪に向かず、301 と撮影スクリプトの資産を捨てることになる。
- 画面ごとに段階を分けて置き換える: 2 つの情報設計が同時に生き、サイドバーが両方を持つ期間ができる。片方の画面だけ新しい殻という状態が最も読みづらい。
- Graphics を残す: `class-doc-logo` の domain は `logo-brand-identity` であり、トピック 5 種のどれにも当たらない。Illustrations と Motion を外した判断と揃える。
- `/graphics` を 404 へ 301 で送る: 往復が増えるだけである。`/motion` を素の notfound にした前例と揃える。
- 却下した配色も比較資料として出す: 選ぶ面として迷う。記録は `experiments/color-schemes` にある。
- `shared/*` を `apps/` から import して二重実装を消す: Experiment の Constraint 違反であり、apps の変更で却下 4 案ごと壊れる。
- 評価を実施してから採用する: 却下 4 案は 2026-09-20 に評価なしで却下済みで、比較対象が残っていない。

## 影響

- `docs/layers.md` の Catalog 層から、`hairline-float` と `catalog-redesign` を正本とする記述を外す。
- `docs/catalog-publishing.md` の公開後の確認項目を新しいルートに合わせる。
- `apps/catalog/src/content/category.ts` を `topics.ts` に置き換える。`guidelines.ts`、`palette.ts`、`typeface.ts` を足す。
- `apps/catalog/src/catalog.css` を `variant.css` の造形で置き換える。変数は `--cat-*` にする。
- 公開面の live iframe は `/preview/<exp>/<variant>` を使う。実行基盤の `/?bare#` は使わない。
- `experiments/catalog-editorial/shared/*` は Experiment 再実行のための写しとして凍結する。
