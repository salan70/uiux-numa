# Information Architecture を構造と画面内の順序から組み直す

- 状態: Accepted
- 日付: 2026-09-22
- 参照: [UX Writing を部品と状態の文言に絞って組み直す](2026-09-22-ux-writing-redesign.md)、[コアに主題全体へ効く数値を書き、UX Writing の区切りをコアへ上げる](2026-09-21-guideline-core-values.md)
- 対象: `docs/guidelines/information-architecture.md`、`docs/guidelines/design-four-principles.md`、`docs/guidelines/README.md`

## 背景

Information Architecture は `draft` のままで、Catalog の題字に WIP が付いていた。
Tips は 15 件あり、書式の目安 8 件の約 2 倍だった。
15 件のうち 11 件は `- 実験:` で catalog-editorial の記録を引いていた。
これらは Catalog 見本帳を作ったときの判断から書き起こしていた。
コアの数値「階層は 3 段まで」「同じ段の選択肢は 7 件まで」「主要な対象へ 3 操作以内」には一次資料が無かった。
「7 件まで」の根拠とされがちな Miller の短期記憶の研究について、NN/g はメニューの件数制限への適用を誤解としている。
1 件の置き場を扱う Tip が 3 件あり、互いに言い換えになっていた。
「分類は重なりなく漏れなく」「その他を作らない」「1 件の置き場は 1 つ」の 3 件である。
Design Principles は目的で「何を主役に置くかの決定は information-architecture」と書くが、IA 側には画面の中身の順を扱う規則が無かった。

利用者は 2026-09-22 に、既存にとらわれず 0 から設計し直すと決めた。
進め方は UX Writing と同じで、広く洗い出したあと 3 巡で収束させた。

1. 範囲と Design Principles との境界、コアの組み合わせ、評価軸
2. コアの数値、Tips の構成
3. 戻り先の手段、画面の中身の順の場面、絞り込みの判定

本文の執筆は agy（Gemini 3.8 Flash）が担った。
Claude が設計、出典の確認、検査を担った。

## 決定

- 範囲はプロダクト全体の入口、分類、階層、ラベル、並び順、戻り先、検索と絞り込みとする。
  加えて、1 画面の中で何をどの順に出し何を出さないかを扱う。
- 位置、余白、大きさでの見せ方は Design Principles、文言は UX Writing が扱う。
  Design Principles の目的の境界 1 文を「何をどの順に出すかの決定は information-architecture、文言の作成は ux-writing が扱う。」に直す。
- コアは 4 件にする。
  優先順は次のとおり。
  1. 利用者の探す語で 1 か所に分ける
  2. 大事なものから先に置く
  3. 件数に合わせて浅く保つ
  4. 場所と道を変えない
- コアに数値を置かない。
- 既存 Tips はすべて捨てる。
  対象ごとに書き手が決めることから 10 件を導く。
  foundation 8 件、module 2 件とする。
  目安の 8 件を 2 件超えるが、foundation は削らない。
  module 2 件は見本帳を作るプロジェクトに限るためである。
- axes に information density を足し、visual hierarchy を外す。
- 戻り先は親へのリンク 1 つを基本にする。
  パンくずは 3 段以上の階層の例外にする。
- 絞り込みの要否は件数では判定しない。
  最も狭い対象幅で 1〜2 画面のスクロールに収まるかで判定する。

## 理由

### 範囲と境界

画面の中身の順と取捨は、何を出すかという構造の判断である。
見せ方の判断とは別なので IA が持つ。
visual hierarchy は視線の順序の軸である。
見せ方を扱う Design Principles がこれを受け持つ。
information density は「画面あたりの情報量が目的に合うか」の軸である。
件数に合わせることや、出さないものを決めることに対応する。

### コアの組み合わせ

1 件の置き場を独立したコアにする 5 件案もあった。
置き場は探す語で分けた結果として決まる。
そのため 1 件目に畳んだ（利用者の判断）。

### Tips の導き方

既存 Tips を縮める方法では、書き足した順の偏りが残る。
対象ごとに書き手が決めることを挙げ、そこから規則を導いた。

| 対象             | 書き手が決めること             | Tip                                                        |
| ---------------- | ------------------------------ | ---------------------------------------------------------- |
| 入口、分類       | 切り口、行き場のない件の扱い   | 分類の切り口は利用者が探す目的で決め、「その他」を作らない |
| 分類             | 複数に当てはまる件の置き場     | 複数に当てはまる件は、置き場の決め方を先に 1 つ決める      |
| 入口、一覧       | ラベルの語と品詞               | 入口と一覧のラベルは中身を指す具体的な名詞にする           |
| 一覧、詳細       | 中身の順と取捨                 | 画面の中身は、選ぶための手がかりから順に並べる             |
| 階層             | 中間画面の要否                 | 入口は中身が始まる場所にし、リンクだけの中間画面を挟まない |
| 検索と絞り込み   | 足す時期と判定                 | 検索と絞り込みは、一望できない件数になってから足す         |
| 並び順           | 固定か動的か、順序の規則       | 並び順は規則で固定し、更新で入れ替えない                   |
| 戻り先、URL      | 戻り先の決め方、URL の形と寿命 | 戻り先は階層の親にし、URL は階層を映して変えない           |
| 見本帳の見本     | 見本の名前                     | 見本にはそれが何かの名前を添える                           |
| 見本帳の中身の形 | 枠の揃え方                     | 形の違う中身は、形に合った組み方で並べる                   |

### 出典

すべて 2026-09-22 に原典を開いて主張を確かめた。

[NN/g: Flat vs. Deep Website Hierarchies](https://www.nngroup.com/articles/flat-vs-deep-hierarchy/) は階層の深さに単一の正解は無いとする。
数値基準は示さない。
これがコアに段数を置かない根拠である。

[NN/g: Short-Term Memory and Web Usability](https://www.nngroup.com/articles/short-term-memory-and-web-usability/) はメニューを 7 件に限るのは誤解とする。
長いメニューでもよいとする。

[NN/g: Progressive Disclosure](https://www.nngroup.com/articles/progressive-disclosure/) は開示が 2 段を超えると使いにくいとする。
開示の話であり、ページ階層の話ではない。
そのためコアの数値には採らなかった。

[NN/g: Breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/) と [GOV.UK Design System: Breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/) はパンくずが履歴ではなく階層を示すとする。
平らな構造には要らないとする。
外部リンクで途中の段を飛ばして来た利用者の位置把握を助ける。
これが例外を 3 段以上にした根拠である。

[NN/g: URL as UI](https://www.nngroup.com/articles/url-as-ui/) は URL が構造を映し、変えないものとする。
Tip は出典 1 つに限る。
そのためパンくずの記事を出典にし、こちらは ADR に残す。

[NN/g: Filters vs. Facets](https://www.nngroup.com/articles/filters-vs-facets/) は必要かを確かめてから導入するとする。
件数の基準は示さない。
そのため判定を画面に収まるかにした。

[NN/g: Inverted Pyramid](https://www.nngroup.com/articles/inverted-pyramid/) は最も重要な情報を最初に置くとする。

[NN/g: Information Scent](https://www.nngroup.com/articles/information-scent/) はリンク名を明確で自己説明的にするとする。

[NN/g: Card Sorting](https://www.nngroup.com/articles/card-sorting-definition/) は利用者のメンタルモデルに合う分類を作る方法である。

## 却下した案

- コアに「階層は 3 段まで」「1 段 7 件まで」「3 操作以内」を置く: 一次資料が無い。
  7 件は根拠とされる研究の誤用である。
- 開示は 2 段までをコアに置く: 開示の段の話である。
  ページの階層にそのまま当てはまらない。
- 置き場を独立したコアにし 5 件にする: 探す語で分けた結果として決まる。
  コア同士が言い換えになる。
- 最短で着くことを優先順の先頭にする: 手数を減らすために探す語から外れた分類を作る判断を許してしまう。
- コアを 6 件にし、現在地を示すことを独立させる: 書式の 3〜5 件を超える。
- 1 画面の主役の決定も IA へ移す: Design Principles の Tip の変更まで範囲が広がる。
  今回は境界の 1 文だけを直した。
- Catalog 見本帳の規則を捨てる: 利用者が module で残すと決めた。
- Tips を foundation 7 件、module 1 件の 8 件に畳む: 2 つの判断を 1 件に詰めることになる。
- 絞り込みの要否を件数（例えば 30 件）で書く: 外部の根拠が無い。
  表示幅で一望できるかが変わる。
- 詳細に常にパンくずを置く: 平らな構造には要らないと NN/g と GOV.UK が述べる。
- Catalog の旧 URL の転送を Tip の良い例と実験に引く: 利用者の判断で使わなかった。
- 多軸の分類を勧める Dan Brown の multiple classification に反対する記述を Tip に残す: 原典を開けなかった。
  そのため主張を確かめられなかった。

## 出典として使えなかったもの

- Dan Brown「Eight Principles of Information Architecture」（doi 10.1002/bult.2010.1720360605）: 出版社のページが 403 を返し、本文を開けなかった。
  旧 Tips の 1 件が出典にし、1 件が意図と根拠で引いていた。
- Apple Human Interface Guidelines の Tab bars: 本文を取得できず、タブの件数の記述を確かめられなかった。
- 『Information Architecture』第 4 版（O'Reilly）: 書籍で本文を確かめられず、旧 Tips 3 件が出典にしていた。

## 影響

- Tips は 15 件から 10 件になった。
- 旧 15 件はすべて捨てて導き直した。
- 旧 Tips「同じ内容を 2 度見せず、同じ操作を 2 か所に置かない」のうち、一覧への重複は複数に当てはまる件の Tip が受ける。
  1 画面の中で同じ操作を 2 か所に置く問題は、今回の 10 件に置いていない。
- 旧 Tips「件数に見合った構造にする」は、絞り込みの Tip とコア「件数に合わせて浅く保つ」に置き換わった。
- Design Principles は目的の境界 1 文だけを直し、Tips は変えていない。
- Catalog の実装は変えていない。
- status は利用者の確認まで draft のままにする。
