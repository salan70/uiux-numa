# UI/UX 沼の構成と公開先を決める

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [初期ディレクトリ構成](2026-09-13-initial-directory-layout.md)、[Web 実行基盤](2026-09-13-web-runner.md)、[Lab / Knowledge / Assets](../layers.md)、[公開手順](../catalog-publishing.md)

## 背景

成果物を横断して閲覧する Catalog が未実装だった。
`docs/layers.md` は Catalog を成果の archive と定め、Cloudflare 利用を想定していた。
初期ディレクトリ構成は置き場を `apps/catalog/` とし、作成時期を Catalog MVP としていた。

公開後は `https://uiux.oda79.me/` で成果を共有する。
詳細記録の正本は Git 上の Markdown と JSON のままにする。

## 決定

- Catalog は `apps/catalog/` に閉じた Vite + React + TypeScript の静的サイトにする。
- 人が見る表示名は「UI/UX 沼」とする。
- 掲載対象は Tokens、Experiments、原則、Skills とする。
- 一覧は手書きせず、canonical JSON と Markdown を `import.meta.glob` で読む。
- frontmatter や参照先が不正なら build を失敗させる。
- 詳細は概要だけを示し、全文は GitHub の原文へ送る。
- ADR と運用文書は Catalog 内で全文表示しない。
- live variant は専用 route で描画し、同一 origin の iframe へ隔離する。
- 公開は Cloudflare Pages の Git 連携にする。
- Pages project 名は `uiux-numa` とする。
- Root directory は `apps/catalog`、build command は `pnpm build`、output directory は `dist` とする。
- production は `main`、その他の branch と PR は preview deployment とする。
- production URL は `https://uiux.oda79.me/` とする。
- apex domain は使わない。
- GitHub App の権限は `salan70/uiux-numa` だけに限る。
- Node.js 22.16.0 と pnpm 9.15.9 を Pages 側でも固定する。
- SPA fallback は `_redirects` で行う。
- preview URL には noindex を付ける。
- コマンドは `justfile` の `catalog-*` recipe を正本とする。

## 理由

Catalog を `apps/catalog/` に閉じると、実行基盤 `platforms/web/` と責務が分かれる。
glob で読むと、件数の手書き一覧が記録とずれる経路がなくなる。
概要と GitHub リンクにすると、Catalog が正本を二重に持たない。

iframe と専用 route なら、variant の CSS が Catalog 本体へ漏れない。
Cloudflare Pages は、同じ account の zone `oda79.me` で CNAME と TLS を管理できる。
Free plan の範囲で production と preview を分けられる。
Git 連携なら、main への push が公開手順になる。

## 却下した案

- GitHub Pages: custom domain と HTTPS は使える。
  preview deployment と PR 連携は Cloudflare Pages より弱い。
  `oda79.me` の DNS と TLS を Pages と別管理にする必要が出る。
- Vercel: preview と SPA は強い。
  DNS と TLS が Cloudflare zone の外に分かれ、アカウントが増える。
  個人開発の公開先を Cloudflare に揃える方針と反する。
- `platforms/web/` に Catalog を載せる: 実行基盤の責務が閲覧 UI まで広がる。
- Experiment ごとの静的 HTML: 件数と frontmatter の検査を共通化できない。
- Catalog 内で ADR や記録の全文を描画する: 正本が分かれ、更新がずれる。
- Patterns と Design Systems の空ナビ: 実体がない項目を先に出すと、成果の見取り図が空になる。

## 影響

ローカルでは `just catalog-install` のあと `just catalog-dev` で閲覧する。
公開は利用者が 1 回 Cloudflare に認証し、Git 連携と custom domain を設定する。
手順は [公開手順](../catalog-publishing.md) に残す。
Git 連携が終わるまで `https://uiux.oda79.me/` は未公開である。
