# UI/UX 沼の公開手順

公開サイト「UI/UX 沼」のコードは `apps/catalog/` にある。
Catalog は成果物の visual showcase である。
配色、文字、token、部品、アイコンの 5 トピックと、方針を掲載する。
`role` と `maturity` で再利用の前提を示す。
判断は [visual showcase の ADR](decisions/2026-09-20-catalog-visual-showcase.md) と [topic-first ADR](decisions/2026-09-20-catalog-topic-first.md) に残す。
production URL は `https://uiux.oda79.me/` とする。
Git 連携と custom domain には、利用者による Cloudflare 認証が 1 回必要である。
この文書はその手動手順だけを残す。
エージェントは認証、project 作成、domain 追加を実行しない。

公式手順の参照先は次のとおり。

- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Language support and tools](https://developers.cloudflare.com/pages/configuration/language-support-and-tools/)

## 前提

- `oda79.me` は Catalog と同じ Cloudflare account の zone にある。
- apex domain は使わない。
- 運用は Cloudflare Pages Free plan の範囲とする。
- リポジトリは `salan70/uiux-numa` である。

## 1. Cloudflare にサインインする

1. [Cloudflare dashboard](https://dash.cloudflare.com/) を開く。
2. Catalog を置く account でサインインする。
3. 未ログインなら、ここで認証する。

## 2. GitHub App の権限を 1 リポジトリに限る

1. Workers & Pages で **Create application > Pages > Connect to Git** を選ぶ。
2. GitHub への Install & Authorize を求められたら進む。
3. Repository access は **Only select repositories** にする。
4. 許可するリポジトリは `salan70/uiux-numa` だけにする。
5. 既存インストールを直す場合は [GitHub の Applications](https://github.com/settings/installations) から **Cloudflare Workers and Pages** を開く。

公式の注意どおり、GitHub account は 1 つの Cloudflare account に対応させる。

## 3. Pages project を作る

Connect to Git のあと、次の値を入れる。

| 項目                   | 値             |
| ---------------------- | -------------- |
| Project name           | `uiux-numa`    |
| Production branch      | `main`         |
| Framework preset       | None           |
| Root directory         | `apps/catalog` |
| Build command          | `pnpm build`   |
| Build output directory | `dist`         |

その他の branch と PR は preview deployment になる。
この対応は Pages の既定である。

## 4. Node.js と pnpm を固定する

Root directory は `apps/catalog` である。
同ディレクトリの `.node-version` と `.nvmrc` は `22.16.0` である。
`package.json` の `packageManager` は `pnpm@9.15.9` である。

v3 build image は `package.json` の `engines` を見ない。
pnpm の既定も 10 系である。
そのため Environment variables にも次を入れる。

| 変数           | 値        |
| -------------- | --------- |
| `NODE_VERSION` | `22.16.0` |
| `PNPM_VERSION` | `9.15.9`  |

**Save and Deploy** を押す。
最初の production build が通るまで待つ。

## 5. custom domain を追加する

1. Pages project `uiux-numa` の **Custom domains** を開く。
2. **Set up a domain** を選ぶ。
3. `uiux.oda79.me` を入力して続ける。
4. zone が同じ account にあるので、確認後に CNAME が自動で付く。
5. Pages に domain を関連付けてから DNS を触る。
6. 先に CNAME だけを手で足すと、公式どおり 522 になる。

Cloudflare が CNAME と TLS を管理する。
証明書の発行が終わるまで HTTPS は待ってから確認する。

## 6. 公開後に確認する

production の完了条件は `https://uiux.oda79.me/` が新しい Catalog として表示されることである。

確認項目は次のとおり。

- `https://uiux.oda79.me/` が HTTPS で開く
- 次の URL を直リンクで開ける
  - `/`、`/foundations/colors`、`/foundations/colors/<採用した配色>`（ダイアログが開いた状態で出る）
  - `/foundations/typography`、`/foundations/typography/product-ui-typography`
  - `/foundations/tokens`
  - `/foundations/icons`、`/foundations/icons/<Experiment>`
  - `/components`、`/components/button`、`/components/card`
  - `/guidelines`（先頭の文書へ置き換わる）、`/guidelines/<slug>`
- 次の URL が NotFound になる
  - `/foundations/graphics`、`/foundations/graphics/class-doc-logo`、`/graphics`
  - `/getting-started`、`/principles`、`/status`、`/resources`、`/motion`
  - `/foundations/colors/<却下した配色>`
- `/colors`、`/typography`、`/icons` の旧 URL が新 URL へ 301 される
- サイドバーが Works 5 件と Guidelines 6 件の 2 群である
- サイドバー最下段の配色と明暗の選択がサイト全体へ反映され、再読み込み後も保たれる
- 選べる配色が採用したものだけである
- ライト / ダークの切り替えで選択中の配色の値が変わる
- 配色の詳細を開くと URL が変わり、Esc、背景、閉じるボタンのどれでも一覧へ戻る
- 配色の詳細を開閉しても、ページのスクロール位置が動かない
- Components の一覧に Button と Card のカードが出て、カードから `/components/button` と `/components/card` へ移れる
- `/components/button` と `/components/card` では採用実装がページ本文へ直接表示され、Home の live は `/preview/<exp>/<variant>` の iframe で表示される
- 廃止した Component の詳細 URL が NotFound になる
- Icons の SVG が表示される
- 方針の索引から規則へ飛べる。本文中の相対リンクがリポジトリの該当ファイルへ解決される
- preview PNG が Catalog の画面へ収集されていない
- preview deployment の HTML に `noindex` がある
- production の `uiux.oda79.me` には `noindex` がない
- 遷移と状態変更で layout-shift が起きない（帯の hover 展開、配色切替、ダイアログの開閉、表示幅）

## ローカル確認

```bash
just catalog-install
just catalog-dev
just catalog-check
just catalog-test
just catalog-build
just catalog-shot
```

`catalog-shot` の前に `catalog-dev` を起動する。
