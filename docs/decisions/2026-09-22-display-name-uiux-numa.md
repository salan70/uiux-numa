# 公開表示名を「UI/UX NUMA」にする

- 状態: Accepted
- 日付: 2026-09-22
- 参照: [UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md)、[画面文言の日本語表記を Japanese Notation として定める](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-22-japanese-notation-guideline.md)、[Catalog を成果物の visual showcase にする](2026-09-20-catalog-visual-showcase.md)
- 更新: 2026-09-23。「ロゴと favicon は未着手」は、[UI/UX NUMA のロゴ](../../experiments/uiux-numa-logo/README.md) で `nu-round` を採用し、Catalog へ適用した。
- 対象: `apps/catalog/src/site.ts`、`apps/catalog/index.html`、`apps/catalog/preview.html`、`apps/catalog/src/components/Sidebar.tsx`、`README.md`、`docs/layers.md`、`docs/catalog-publishing.md`、`docs/guidelines/japanese-notation.md`

## 背景

[構成と公開先の ADR](2026-09-19-uiux-rd-catalog.md) は、人が見る表示名を「UI/UX 沼」と決めた。
利用者は 2026-09-22 に、この表示名の字面を良くないと判断した。

理由は名前の意味ではなく字面である。
`UI/UX` というラテン大文字の並びに、漢字 1 文字が接ぎ木されている。
Catalog はタイポグラフィを主題の 1 つに置くサイトであり、表示名自体が不揃いなままだと主題と矛盾する。

リポジトリ名と slug は `uiux-numa` であり、表示名だけが別系統だった。

## 決定

- 公開表示名を「UI/UX NUMA」とする。
- ローマ字は全大文字で書く。
- slug とリポジトリ名は `uiux-numa` のまま変えない。
- production URL `https://uiux.oda79.me/` は変えない。
- 過去の ADR 本文は当時の表記のまま残す。
- `Sidebar.tsx` の全角スラッシュを半角へ直す。
- ロゴの wordmark は本 ADR では決めない。

## 理由

### 字面

全大文字にすると `UI/UX NUMA` が大文字だけの一続きになる。
スラッシュ前後の字種と字高が揃い、改名の動機をそのまま満たす。

### ローマ字

日本語の普通名詞をローマ字化して固有名にする手法は、Qiita、Zenn、esa で定着している。
意味は知る人に伝わり、知らない人には固有名として通る。
「沼」が表す深掘りと反復という実態は変えない。呼び名の字面だけを変える。

### slug との一致

表示名とリポジトリ名の綴りが一致し、二重の名前を管理しなくて済む。
大文字の表示名と小文字の slug の対応は一般的である。

### 表記規則

`docs/guidelines/japanese-notation.md` は英字の大小に規定を持たない。
全大文字は既存の ADR、UX、SVG と同じ調子であり、和文中で浮かない。

## 却下した案

- 「Agile UI/UX」「agile-uiux」へ改名する。Agile UX と Lean UX は、スクラムチームで UX を回す方法論を指す確立した語である。このリポジトリは複数案を実装して比較し、採否理由を ADR に残す R&D lab であり、名前から期待される内容と実物がずれる。一般名詞の組み合わせなので固有性も失う。
- 「UI/UX Numa」と Capitalized で書く。`NUMA` が Non-Uniform Memory Access と読まれる余地は消えるが、大文字の並びに小文字が混ざり、字面を揃えるという目的を満たさない。
- 「UI/UX 沼」を維持する。字面の不揃いが残る。
- slug とリポジトリ名も変える。動機は表示名の字面であり、slug は既にラテン文字で揃っている。リポジトリ名、ローカル path、Cloudflare Pages の連携が動く割に得るものがない。

## 残る論点

`NUMA` は Non-Uniform Memory Access の略語として既に使われている。
`UI/UX NUMA` と並ぶ限り、読者が開発者でも文脈で吸収される。
ロゴを `NUMA` 単体にすると、この誤読が最大化する。
wordmark を単体で使うなら `Numa`、`UI/UX` を付けたまま使うなら `NUMA` という分岐になる。
ロゴは別途決める。

## 影響

- [構成と公開先の ADR](2026-09-19-uiux-rd-catalog.md) の表示名の決定を、本 ADR が置き換える。
- [Japanese Notation の ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-22-japanese-notation-guideline.md) は `Sidebar.tsx` の全角スラッシュを悪い例として残すと決めていた。表示名を書き換える箇所と同じなので、本 ADR で半角へ直す。悪い例は `japanese-notation.md` の記述だけで示す。
- `japanese-notation.md` の良い例と悪い例の文字列を「UI/UX NUMA」へ差し替える。規則そのものは変えない。
- `docs/records/catalog-editorial/rationale/chronicle-column.md` の「この沼は」は普通名詞の用法であり、変えない。
- ロゴと favicon は未着手である。
