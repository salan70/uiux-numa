# Catalog を公開デザインシステムサイトにする

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md)、[Catalog を成果物の見本帳へ絞り込む](2026-09-19-catalog-artifacts-only.md)、[Lab / Knowledge / Assets](../layers.md)、[公開手順](../catalog-publishing.md)

## 背景

Catalog は成果物を種別ごとに並べる見本帳だった。
全 variant を同列に掲載し、採用と却下を表示しなかった。
原則と開発者向け手順も掲載しなかった。

公開先は `https://uiux.oda79.me/` である。
利用者は Ubie Vitals に近い公開デザインシステムサイトを求めている。
採用案を正とし、token 表とライブデモと導入手順を載せる。

## 決定

- Catalog は採用案を正として掲載する。
- 却下案は比較資料として残す。
- 採用、却下、検討中のステータスを表示する。
- 原則は `docs/principles/*.md` を glob で直接読む。
- 開発者向けの導入手順を掲載する。
- 技術基盤は現行の Vite + React を継続する。
- ナビははじめに、原則、Foundations、Components、ステータス、リソースで切る。
- Foundations は Colors、Typography、Icons、Graphics とする。
- token 表は Name、値、説明、Copy を持つ。
- ADR 全文は Catalog 内で描画しない。
- Spacing、Radius、Elevation の token は新設しない。
- UX Writing とアクセシビリティのガイドラインは新規起稿しない。

## 理由

採用案を正にすると、利用者が使うものと比較資料を見分けられる。
却下案を残すと、判断の根拠が見える。
原則を glob で読むと、正本が Catalog に分かれない。
Vite + React を続けると、現行の live variant と収集処理を再利用できる。

## 却下した案

- 見本帳のまま骨格だけ変える案: 採用案が正にならず、使い方が伝わらないため却下した。
- ガイド層だけ足す案: token 表と採用状態がなく、実用的な参照先にならないため却下した。
- Astro へ移行する案: 利用者が現行の Vite + React の継続を選んだため却下した。
- token を Catalog のために新設する案: `tokens/` に定義がない値を Catalog が発明することになるため却下した。
- Catalog 内で ADR 全文を描画する案: 正本が分かれ、更新がずれるため却下した。原則は `docs/principles/*.md` を glob で直接読むため、正本は分かれない。

## 影響

Catalog の主な URL は `/`、`/getting-started`、`/principles`、`/foundations/*`、`/components`、`/status`、`/resources` になる。
旧 URL `/colors` などは 301 で新 URL へ送る。
Experiment の frontmatter に `adopted` を追加する。
公開は利用者が push を承認してから行う。
