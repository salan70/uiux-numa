# UI/UX NUMA の公開手順

公開サイト「UI/UX NUMA」は `apps/catalog/` を Cloudflare Pages で `https://uiux.oda79.me/` に公開する。
Git 連携と custom domain の設定は利用者が Cloudflare dashboard で 1 回行う。
エージェントは認証、project 作成、domain 追加を実行しない。
公式手順は [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)、[GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)、[Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/) にある。

## 前提

- `oda79.me` は Catalog と同じ Cloudflare account の zone にある。apex domain は使わない。
- Cloudflare Pages Free plan の範囲で運用する。
- GitHub App の Repository access は **Only select repositories** にし、`salan70/uiux-numa` だけを許可する。

## Pages project の設定

| 項目                   | 値             |
| ---------------------- | -------------- |
| Project name           | `uiux-numa`    |
| Production branch      | `main`         |
| Framework preset       | None           |
| Root directory         | `apps/catalog` |
| Build command          | `pnpm build`   |
| Build output directory | `dist`         |

v3 build image は `package.json` の `engines` を見ず、pnpm の既定は 10 系である。
Environment variables に次を入れる。

| 変数           | 値        |
| -------------- | --------- |
| `NODE_VERSION` | `22.16.0` |
| `PNPM_VERSION` | `9.15.9`  |

`.node-version`、`.nvmrc`、`packageManager` と同じ値にする。

## custom domain

Pages project の **Custom domains** から `uiux.oda79.me` を追加する。
zone が同じ account にあるので CNAME は自動で付く。
先に CNAME だけを手で足すと 522 になる。

## 公開後の確認

- `https://uiux.oda79.me/` が HTTPS で開き、`noindex` がない。preview deployment には `noindex` がある。
- 次の URL を直リンクで開ける。
  - `/`、`/foundations/colors`、`/foundations/colors/<採用した配色>`（ダイアログが開いた状態で出る）
  - `/foundations/typography`、`/foundations/typography/product-ui-typography`
  - `/foundations/tokens`
  - `/foundations/icons`、`/foundations/icons/<Experiment>`
  - `/components`、`/components/button`、`/components/card`
  - `/guidelines`（先頭の文書へ置き換わる）、`/guidelines/<slug>`
- 次の URL が NotFound になる。
  - `/foundations/graphics`、`/foundations/graphics/class-doc-logo`、`/graphics`
  - `/getting-started`、`/principles`、`/status`、`/resources`、`/motion`
  - `/foundations/colors/<却下した配色>`、廃止した Component の詳細 URL
- `/colors`、`/typography`、`/icons` の旧 URL が新 URL へ 301 される。
- サイドバーが Works 5 件と Guidelines 7 件の 2 群で、最下段の配色と明暗の選択がサイト全体へ反映され、再読み込み後も保たれる。
- 選べる配色が採用したものだけで、ライト / ダークの切り替えで値が変わる。
- 配色の詳細を開くと URL が変わり、Esc、背景、閉じるボタンのどれでも一覧へ戻る。開閉でスクロール位置が動かない。
- `/components/<slug>` では採用実装がページ本文へ直接表示され、Home の live は `/preview/<exp>/<variant>` の iframe で表示される。
- Icons の SVG が表示され、方針の本文中の相対リンクがリポジトリの該当ファイルへ解決される。
- preview PNG が Catalog の画面へ収集されていない。
- 遷移と状態変更で layout-shift が起きない（帯の hover 展開、配色切替、ダイアログの開閉、表示幅）。

## ローカル確認

```bash
just catalog-install
just catalog-dev      # catalog-shot の前に起動する
just catalog-check
just catalog-test
just catalog-build
just catalog-shot
```
