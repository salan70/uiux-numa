# Catalog を視覚確認専用の見本帳へ絞る

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [Catalog のホストを見本帳にする](2026-09-19-catalog-host.md)、[UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md)、[Lab / Knowledge / Assets](../layers.md)、[公開手順](../catalog-publishing.md)

## 背景

Catalog は token と部品を視覚的にざっと確認する見本帳である。
熟読しながら開発するドキュメントサイトは想定しない。
はじめに、原則、ステータス、リソース、Experiment 本文、サイト内検索、前後ナビが目立ち、視覚確認に寄与しない情報が多かった。

## 決定

- Catalog の掲載対象は token、配色、文字、アイコン、図、部品の視覚サンプルだけにする。
- トップは紙の見本（SchemeSpecimen）と 5 ページへのリンクだけにする。
- サイドバーは土台（配色、文字、アイコン、図）と部品だけを示す。
- Experiment 詳細は採用案のプレビュー（LivePreview または SvgGrid）だけを示す。
- adopted が無い Experiment は全 variant を示す。
- 配色詳細のコントラスト比、CopyButton、TokenTable の列構成、Typography の試し書き、表示幅とサイズの切替は維持する。
- Experiment 本文、原則、開発者向け手順、ステータス一覧は Catalog 内で描画しない。
- 正本は Git 上の Markdown、JSON、README のままにする。
- 削除した URL（`/getting-started`、`/principles`、`/status`、`/resources` など）は NotFound とする。

## 理由

見本帳の目的は採用成果の見た目を素早く確かめることである。
文章ページと検索は正本の二重管理を招き、更新がずれる。
Experiment 詳細から本文を外すと、プレビューが画面の主役になる。
トップを紙とリンクだけにすると、初回訪問の導線が短くなる。

## 却下した案

- 文章ページを残す: ドキュメントサイトの骨格が残り、見本帳の目的とずれる。
- 概要 1 行だけ残す: 依然として README の写しが生まれ、正本が二重になる。
- トップを廃止しサイドバー起点にする: 紙の見本という比喩の入口がなくなる。

## 影響

`apps/catalog/` から説明ページ、検索、前後ナビ、Markdown 描画、minisearch、marked を外す。
[公開手順](../catalog-publishing.md) の確認ルートを視覚確認ページだけに更新する。
[UI/UX 沼の構成と公開先](2026-09-19-uiux-rd-catalog.md) の掲載方針（Experiment 本文、原則、開発者向け手順の掲載）は本 ADR に置き換える。
