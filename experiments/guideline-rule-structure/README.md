---
title: 方針の規則ブロックの構造
status: draft
role: module
maturity: experimental
created: 2026-09-21
updated: 2026-09-21
platforms:
  - web
domains:
  - information-architecture
  - visual-design
  - typography
sources:
  - docs/decisions/2026-09-21-catalog-guideline-rule-structure.md
adopted:
  - contrast-pair
---

## Problem

公開 Catalog の方針画面（`/guidelines/:slug`）で、規則 1 件の中が読み取れない。
利用者の評価は「ここ見づらい。各情報がぱっとみで何を表しているか、どういう構造かがわからない」である。

現状の規則 1 件は、題名、分類（foundation / module と結び付くコア）、根拠、bad、good、例外、出典の 7 つを持つ。
bad と good だけがラベルを持ち、残りは素の段として並ぶ。
そのため、根拠と例外と出典が同じ強さで積まれ、どれが規則の何なのかが形から読めない。
例外を持たない規則も、出典を持たない規則も、図版を持たない規則もあるので、並びの長さだけでは当てにならない。

直前の 2 回の修正（[箱をやめる ADR](../../docs/decisions/2026-09-21-catalog-guideline-plain-layout.md)、
[規則の構造 ADR](../../docs/decisions/2026-09-21-catalog-guideline-rule-structure.md)）で
枠と面を落とし、bad / good を軸にしたところまでは進んだ。
残っているのは、bad と good 以外の 5 つに役割の名が無いことである。

## Target

方針を読んで自分のプロジェクトに当てはめる開発者。
規則を上から通して読む場合と、特定の規則だけを拾い読みする場合の両方がある。
作った本人が、なぜこの規則があるかを読み返す用途も含む。

## Scope / Domains

対象は information architecture、visual design、typography。
変えるのは規則ブロック 1 件の中の組み方だけにする。

変えないもの。

- 規則が持つ情報の種類と数（題名、分類、コア、根拠、bad、good、例外、出典、標本）
- 正本の書式（`docs/guidelines/*.md`）
- 配色、書体、余白の値
- 画面の版面（見出し、罫、桁の幅）

配色は `aizome` のライトに固定する。この Experiment の軸ではない。

## Constraints

- 比較は `just web-dev` の実サイズで行う。URL は `http://localhost:5183/?bare#guideline-rule-structure/<id>`。
- データは `docs/guidelines/states-and-feedback.md` の実データだけを使う。Tips 8 件をそのまま描く。
  図版つき、出典つき、例外なし、どれも無しが混ざるので、条件の違いがそのまま比較に乗る。
- variant の根は `position: fixed; inset: 0; overflow: auto` にして、実行基盤の `.runner-main` の余白から切り離す。
- `experiments` から `apps/` へ import しない。解析は `shared/rules.ts` に規則 1 件分だけを書く。
- 版面、配色、文字、標本、データは `shared/Frame.tsx` が持ち、案ごとに変えるのは規則ブロックの中だけにする。
- WCAG 2.2 AA を守る。本文は 4.5:1、罫は 3:1。
- bad と good を色だけで分けない。配色によっては両者が同じ色になる。
- 390 幅と 1280 幅の両方で崩れないようにする。
- 最終案は人間が決める。

## Hypothesis

規則が読めないのは情報量ではなく、役割の示し方である。
役割は、語で名指しする、位置で示す、対比の形にする、の 3 通りで示せる。
どれを採るかで、通読のしやすさ、拾い読みのしやすさ、縦の占有が入れ替わる。

## Variants

| id                | 仮説                                                                  | 変えた軸   | 実装                        |
| ----------------- | --------------------------------------------------------------------- | ---------- | --------------------------- |
| `labelled-column` | すべての行に役割の名を付け、左端に桁を 1 本通せば、読まずに当てられる | labelling  | `variants/labelled-column/` |
| `heading-blocks`  | 役割を行の横ではなく見出しとして立てれば、規則の中に読む順ができる    | hierarchy  | `variants/heading-blocks/`  |
| `meta-aside`      | 分類と出典を本文の桁から外せば、規則そのものが 1 本の読み筋になる     | layout     | `variants/meta-aside/`      |
| `contrast-pair`   | good と bad を横に並べれば、規則の中身は 1 度の視線移動で比べられる   | comparison | `variants/contrast-pair/`   |

人間が選ぶための表。

| id                | 軸         | 向く状況                                                       | 代償                                                                           |
| ----------------- | ---------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------ |
| `labelled-column` | labelling  | 拾い読み。左端の桁を縦に走らせて、要る役割の行だけを取れる     | ラベルの桁ぶん本文が右へ寄る。役割が増えるとラベルの語が増える                 |
| `heading-blocks`  | hierarchy  | 通読。上から順に「なぜ→やってはいけない→こうする」と読める     | 1 件の縦が最も長い。見出しと本文で 2 行使うため、8 件並ぶと画面数が増える      |
| `meta-aside`      | layout     | 本文に集中したいとき。分類と出典が読む筋の外にある             | 桁が 2 本要る。狭い幅ではメタが本文の下へ落ちて、結局縦に積まれる              |
| `contrast-pair`   | comparison | good と bad の差そのものを見たいとき。規則 1 件が 4 段に収まる | 行長が半分になり和文が折り返す。長い文を持つ側だけ桁が伸び、対の高さが揃わない |

いずれの案も動きを持たない。状態が変わる箇所が無いので、寸法が動く箇所も無い。
hover でしか出ない情報は置いていない。

2026-09-21 に利用者が `contrast-pair` を「強いて言えば良さそう」と選び、次の 5 点を直した。
他の 3 案は選ばれなかった時点の形で残す。

- good を左、bad を右にする。採る側を先に読ませる。bad から読むと正しい形に辿り着くまで 2 度読む。
- `foundation` / `module` を規則の題名のすぐ横へ移す。どのプロジェクトで守るかは題名と対で読む情報である。
- 結び付くコアの記載をやめる。規則を読む側の判断は変わらない。
- good と bad の語に正本の 24 役割から `--color-success` と `--color-error` を当てる。
  画面の強調色（primary）を good に使うと、配色を変えたときに「その配色の色」と「良し悪し」が同じ色で出る。
  `aizome` のライトで背景に対し success 5.9:1、error 7.6:1 で、いずれも AA を満たす。
  色だけに頼らないよう、`good` / `bad` の語そのものも残す。
- 参考リンク（出典）の欄をやめる。

続けて 2 点を直した。

- 標本（実際の UI を組んだ見本）を置かない。規則が扱うのは場面であって、特定の画面の見た目ではない。
  `shared/specimens.tsx` は他の 3 案が使うので残す。
- good と bad の溝を 2.5rem から 2rem へ詰め、罫を溝の中央に置いて左右の文から等距離にする。
  溝が広いと 2 つの桁が別々の節に見え、対であることが読めない。

## Evaluation

評価は実施しない。
4 案は 2026-09-21 に評価を経ずに判断済みであり、比較する対象が残っていない
（[named variants ADR](../../docs/decisions/2026-09-17-named-variants-and-unevaluated-decisions.md)）。

比較に使う観点は次を想定する。総合点と順位は付けない。

| 軸                       | 見る点                                          |
| ------------------------ | ----------------------------------------------- |
| information architecture | 役割が形から読めるか                            |
| visual hierarchy         | 規則の題名と中身の強弱が付いているか            |
| discoverability          | 8 件の中から目的の規則を拾えるか                |
| localization robustness  | 和文の折返し。特に `contrast-pair` の半分の行長 |
| accessibility            | 見出しの階層、コントラスト、キーボード到達      |

## Decision

`contrast-pair` を採用する。
判断者は利用者である。
判断日は 2026-09-21 である。
評価は実施していない。未評価の軸は Evaluation に書いた。

公開 Catalog の方針画面をこの案の構造へ置き換えた。
判断は [対比の対 ADR](../../docs/decisions/2026-09-21-catalog-guideline-contrast-pair.md) に残す。

## Rejected reasons

判断者は利用者である。
判断日は 2026-09-21 である。
4 案とも実データで組んだ画面を見た時点で、評価を経ずに判断した。

- `labelled-column` を採らない: 拾い読みには最も強いが、ラベルの桁ぶん本文が右へ寄る。役割が増えるとラベルの語も増える。
- `heading-blocks` を採らない: 通読の順は最も明確だが、見出しと本文で 2 行使うため 1 件の縦が最も長い。8 件並ぶと画面数が増える。
- `meta-aside` を採らない: 本文は 1 本の読み筋になるが、桁が 2 本要る。狭い幅ではメタが本文の下へ落ちて結局縦に積まれる。

## Learnings

- 「見づらい」の原因は情報量ではなく、役割の示し方だった。情報の種類も数も変えずに読めるようになった。
- 規則ごとに段の数が変わると、形そのものが読みにくさになる。例外と図版と出典の有無で 4 段から 7 段まで揺れていた。
  段を 4 つに固定したら、8 件が同じ形で積まれるようになった。
- 図版は規則を特定の画面の見た目へ縛っていた。規則が扱うのは場面であって、タブが何 px 動くかではない。
  キャプションも規則の bad / good の文とほぼ同じことを書いていた。
- 対を並べるときは、溝の広さが対であることの読みやすさを決める。2.5rem では 2 つの桁が別々の節に見えた。
- 良し悪しの色に画面の強調色を使ってはいけない。配色を切り替えたときに
  「その配色の色」と「良し悪し」が同じ色で出て読み分けられない。意味の役割（success / error）から引く。
- 4 案とも「いまいち」という評価だった。方向の違う案を並べても、利用者が求めていた形がその中に無いことはある。
  そのときは選ばれた案を起点に直していくほうが、案を出し直すより早かった。

## Related patterns / assets

- 抽出した原則候補: [段の数は任意項目の有無で変えない](../../docs/principles/block-shape-must-not-vary-by-optional-parts.md)、[良し悪しの色に画面の強調色を借りない](../../docs/principles/semantic-color-must-not-borrow-the-accent.md)

- 公開実装: `apps/catalog/src/pages/GuidelinesPage.tsx`
- 直前の判断: [箱をやめる ADR](../../docs/decisions/2026-09-21-catalog-guideline-plain-layout.md)、[規則の構造 ADR](../../docs/decisions/2026-09-21-catalog-guideline-rule-structure.md)
- 規則の書式: [方針の書式 ADR](../../docs/decisions/2026-09-20-guideline-format.md)
- 造形の出どころ: [catalog-editorial](../catalog-editorial/README.md)
