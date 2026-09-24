# Catalog を成果物の visual showcase にする

- 状態: Accepted
- 日付: 2026-09-20
- 置き換え: Components の Button 表示と個別コンポーネントの掲載方針は [Components と Button の ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-21-components-button-only.md) が置き換える。
- 参照: [Issue #8](https://github.com/salan70/uiux-numa/issues/8)、[Asset composition model](2026-09-20-asset-composition-model.md)、[UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md)、[Catalog のホスト](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-host.md)、[公開手順](../catalog-publishing.md)
- 置き換え: [公開デザインシステムサイト](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-design-system-site.md) の全体。[見本帳へ絞る ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-artifacts-only.md) の掲載対象（採用成果に限る点）。[ホスト ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-host.md) の「Catalog 全体を 3 案 Experiment にしない」条項。
- 更新: 公開殻と情報設計の決定は [topic-first ADR](2026-09-20-catalog-topic-first.md) が置き換えた。

## 背景

Catalog は公開 Design System サイト、または採用成果だけの見本帳と定義されていた。
前者は原則と導入手順を主役にし、後者は採用以外の探索成果を隠す。
どちらも、R&D で生まれた実際の UI/UX を眺めて使いたいものを見つける目的とずれる。

正本の二重管理を避け、視覚確認を優先する判断は今も有効である。
ホストの顔、Vite + React、live specimen の隔離、Cloudflare Pages も維持する。

見た目の方向は本番サイトで先に決めない。
`experiments/` の named variant で比較し、人間が採用する。

## 決定

- Catalog は成果物の visual showcase とする。仕様書や Asset の正本にしない。
- 第一目的は、説明文より先に成果物を見て触れ、使いたいものを見つけることである。
- 掲載対象は採用成果に限らない。`role` と `maturity` で再利用の前提を示す。
- 正本は `experiments/`、`patterns/`、`tokens/`、`skills/`、`docs/` に置く。Catalog は glob で表示する。
- Principles、導入手順、status table は主役にしない。必要な場合だけ二次情報にする。
- ADR 全文は Catalog 内で描画しない。
- live variant は専用 route と同一 origin の iframe へ隔離する。
- 技術基盤は Vite + React を継続する。
- 公開名「UI/UX 沼」、ホスト `apps/catalog/`、Cloudflare Pages、production URL は維持する。
- ホストが固有のブランド色を持たない判断は [ホスト ADR](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-host.md) を維持する。`playful-chroma` から借りる色はホスト専用パレットにせず、scheme の `--color-*` へ混ぜる。
- token の取り込み規則と余白 token もホスト ADR を維持する。
- Catalog 全体の見た目は、公開面を止めて 3 案にしない。比較は `experiments/catalog-redesign/` で行った。
- 公開殻は [soft-component-kit](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-soft-component-kit.md) の `hairline-float` とする。既存 Catalog chrome を続ける。
- 情報設計は `quiet-hierarchy` の役割だけを借りる。静かな殻、1 度に 1 つの主役、説明より specimen を先にする。
- 色面は `playful-chroma` から借りる。グラデの紙、温かい面と冷たい面、カードの色の出方である。
- `playful-chroma` の表層レイアウトと遊び copy は公開面に入れない。
- 3 つの catalog-redesign 案を公開サイトの正にも同居にもしない。判断の正本は Experiment README の Decision である。

## 理由

showcase にすると、参考成果も探索でき、採用だけを正にしない。
metadata を出すと、コピーしてよいものと観察だけのものが分かれる。
正本を Git に残すと、Catalog 用の写しが生まれない。
見た目の比較を Experiment に置くと、公開面の改修が判断前に止まらない。

## 却下した案

- 公開 Design System サイトへ戻す: ドキュメントが主役になり、R&D の成果物探索とずれる。
- 採用成果だけを載せる見本帳のままにする: `reference` と `experimental` が見えない。
- Catalog を Asset の正本にする: Git 上の記録と表示が分岐する。
- 公開 `apps/catalog/` を 3 スキンで同時運用する: 比較軸がサイト単位になり、公開面が止まる。人間判断でも却下した。
- `precision-keyboard` を公開殻にする: 暗い精密さが成果物より先に来る。
- `quiet-hierarchy` の表層を写す: 造形は `hairline-float` が正であり、借りるのは階層の役割だけである。
- `playful-chroma` を公開殻にする: 入口 / 棚と遊び copy が標本と並走する。
- `playful-chroma` の色を足さない: 殻が均一だと入口と階層が弱い。利用者の修正判断である。
- 人間味 copy を足す: 静かな殻と成果物主役の方針と反する。
- Astro へ移行する: 現行の live variant と収集処理を捨てる理由がない。

## 影響

README と `docs/layers.md` と公開手順の Catalog 定義を本 ADR へ向ける。
本番 Catalog の情報設計は、本 ADR と `experiments/catalog-redesign/` の Decision に従う。
ナビは配色、文字、アイコン、図、UI、動きなど、見て辿る種別にする。
`catalog-redesign` 自体は公開ナビに出さない。比較記録として metadata だけ集める。
