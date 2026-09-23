# Catalog の Works に Motion を戻す

- 状態: Accepted
- 日付: 2026-09-23
- 置き換え: [無彩のナビ ADR](2026-09-20-catalog-neutral-navigation.md) の「Illustrations と Motion は公開カテゴリと通常ルートから外す」のうち、Motion の部分を置き換える。
- 参照: [topic-first ADR](2026-09-20-catalog-topic-first.md)、[削除の ADR](2026-09-21-prune-decided-experiments.md)、[掲載しない Experiment の ADR](2026-09-22-unlisted-experiments.md)、[寸法と動きの ADR](2026-09-21-size-and-motion-tokens.md)
- 対象: `apps/catalog/src/content/topics.ts`、`apps/catalog/src/router.ts`、`apps/catalog/src/pages/MotionPage.tsx`、`apps/catalog/src/components/EntranceWords.tsx`、`tokens/motion/`、`experiments/catalog-screen-entrance/`

## 背景

2026-09-20 に Motion を公開カテゴリから外した。
当時の Motion の成果物は `registration-completion-feedback` の 1 件で、2026-09-21 に削除した。
その後、motion token が `tokens/motion/` にでき、Catalog 自身も Button と Card の hover で動きを使うようになった。
利用者は 2026-09-23 に、Works に Motion を足し、画面表示時の動きも検討して加えることを求めた。

## 決定

- Works の 6 番目の topic として Motion を足す。並びは末尾にする。利用者が挙げた順で topic を並べる規則（`topics.ts`）に従う。
- URL は `/foundations/motion`、成果物の詳細は `/foundations/motion/<slug>` とする。
- topic に割り当てる domain は `animation-motion` とする。[対象領域](../scope.md)の「animation / motion design」を kebab-case にした名前で、削除の ADR が退役させた domain と同じ名前である。
- 画面の中身は、動きの Experiment の live 標本を直接並べる。並べ方は Icons と同じにする。
- 標本はサイトの模型ではなく、見出しなどのテキストで動きを例示する。利用者が 2026-09-23 に指示した。模型は画面の構成まで目に入り、動きそのものに注意が向きにくい。
- 最初の成果物は `catalog-screen-entrance`（Catalog の画面表示の動き）とする。見出しの入場の型 3 つ（`line-mask`、`blur-focus`、`char-stagger`）をすべて採用する。
- Motion 画面は 3 つの型を切り替えずに縦に並べ、型ごとに README の Variants 表の仮説と変えた軸を添える。説明の正本は README に置き、Catalog は読むだけにする。
- Catalog 自身の画面の入場には `blur-focus` を使う。利用者が選んだ。見出しは語ごとに焦点を合わせ、本文の区画はその後ろから上から順に立ち上がる。サイドバーは動かさない。
- `blur-focus` の時間、間隔、曲線を motion token に足す（`duration.entrance`、`duration.stagger`、`easing.entrance`）。公開 Catalog に実利用ができたためである。
- Home の Motion のカバーは、トップの帯で motion token に使っている `MotionCover` を流用する。

## 理由

- 公開をやめた理由は、載せる成果物が 1 件しかなく、Catalog の外の題材だったことにある。画面表示の動きは Catalog 自身に採用するものなので、Motion 画面の成果物と実装の正本が一致する。
- 動きは静止画では判断できない。Tokens 画面は時間と曲線の値を表で見せるが、動いたときの感触は見せられない。
- 採用を決める前に比べる場面を Motion 画面に置くと、利用者は公開面と同じ配色とテーマで判断できる。

## 却下した案

- Motion 画面を motion token の実演だけにする: 値の正本は Tokens 画面が持ち、内容が重なる。token の値だけでは、どこでどう動かすかの判断を見せられない。
- `/motion` の旧 URL を使う: 他の Works は Components を除き `/foundations/<topic>` の下にある。`/motion` は旧 URL として notfound を返す検査を残す。
- Motion を Tokens の中の区画にする: Works の他の topic と同じ重さで入口を持たせるという利用者の依頼に合わない。
- 画面表示の動きを Experiment を経ずに直接入れる: 採用は人間が決める（exploring-ui-variants）。比べる案が無いと、却下理由を記録できない。
- 3 つの型から 1 つだけを採用する: 利用者は 3 つとも良いと判断した。分ける単位（行、語、文字）で華やかさが違い、場面に合わせて選べる型として残すほうが再利用に効く。
- Catalog の見出しに `line-mask` を使う: エージェントの推奨だった。単位が大きく `filter` を使わないので、数十回見る画面に向くと考えた。利用者は `blur-focus` を選んだ。
- 見出しだけを動かす: 最初の適用はこの形だった。利用者は画面全体に効果を付けることを求めた。
- 本文の区画もぼかす: 大きな面のぼかしは描画の負荷が増え（未計測）、本文の細い字画ににじみが残る。見本の `blur-focus` もリードはぼかしていない。
- Motion 画面を切替チップのままにする: 見比べるたびに押し直して再生を待つ。3 つとも採用なので、並べて同時に見られるほうがよい。
- 型の説明を Catalog のコードに書く: README の Variants 表と同じ文が 2 か所になる。`collect.ts` が表の列を読む。
- `line-mask` と `char-stagger` の値も token にする: 公開 Catalog に実利用が無い。token の追加規則に反する。

## 影響

- ナビ、Home の Works のカード、撮影ルート（`scripts/catalog-shot.sh`）に Motion が加わる。
- Home の Works のカードは 6 枚になり、3 列の版面で 2 行に揃う。
- 画面ごとに本文を key 付きで描き直すので、画面を移ると本文の状態（詳細画面で選んだ variant など）は初期値に戻る。先頭へ戻す動作と同じ単位で、同じ画面の中では保たれる。
- motion token は 6 個から 11 個、token 全体は 51 個から 56 個になる。
- 見出しの `filter` と、本文の区画の `transform` の描画負荷は未計測である。
- 入場の間は本文の区画に `transform` が掛かる。区画の中に `position: fixed` の要素を置くと、その間だけ区画を基準に置かれる。現状の区画の中には無い。動き終えると `transform` は外れる。
- `animation-motion` を最初に持つ Experiment は Motion に入る。2 番目以降に持つ Experiment は、先に当たる domain の topic に入る（`topicForExperiment`）。
