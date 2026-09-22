# 判断済みの Experiment と却下 variant のコードを削除する

- 状態: Accepted
- 日付: 2026-09-21
- 参照: [Experiment lifecycle](../experiment-lifecycle.md)、[Experiment の記録形式](../experiment-format.md)、[topic-first ADR](2026-09-20-catalog-topic-first.md)、[配色の役割 ADR](2026-09-20-catalog-material-color-roles.md)
- 置き換え: 2026-09-22。「判断済みで Catalog に載せない Experiment は、ディレクトリごと削除する」は、topic に当たらない Experiment について [掲載しない Experiment の ADR](2026-09-22-unlisted-experiments.md) が置き換える。
- 置き換え: 「却下した variant も学習材料として残す」（lifecycle）、「`experiments/catalog-editorial/shared/*` の写しは残して凍結する」（topic-first ADR）、「`experiments/color-schemes` は削除しない」（配色の役割 ADR）

## 背景

Web runner（`platforms/web`）は `experiments/*/variants/*/index.tsx` を列挙し、13 Experiment、74 variant を並べていた。
うち 7 Experiment、40 variant は判断済みで、公開 Catalog にも出ていなかった。
Catalog は `topics.ts` の除外リスト 3 つ（`UNCATEGORIZED_SLUGS`、`SUPERSEDED_SLUGS`、`RETIRED_DOMAINS`）でこれらを隠していた。
`catalog-editorial` の `topic-first` は `apps/catalog` と同じ画面を持ち、凍結の決定後も 26 commit で並行して直されていた。
掲載中の 4 Experiment にも、採用後に使われていない却下 variant が 12 個あった。
利用者は一覧から不要なものを除き、正本を 1 つにすることを求めた。

## 決定

- 判断済みで Catalog に載せない Experiment は、ディレクトリごと削除する。
- 掲載中の Experiment は、判断後に採用 variant だけを残す。却下 variant のコードと専用の preview を削除する。
- 却下理由は README の Rejected reasons に残す。削除した variant の仮説と変えた軸は、README の「削除した variant」へ移す。
- 他の文書が Markdown リンクで出どころにしている記録文書は、`docs/records/<slug>/` へ移す。
- 判断待ちの Experiment は削除しない。`hako-feature-icons` は Decision が未定なので全 variant を残す。
- 一覧面の variant は比較案ではないので残す。`color-schemes-material` の `overview` がこれに当たる。
- runner は残す。一覧は glob から作るので、削除に追従する。
- Catalog の除外リスト 3 つを削除する。

削除した Experiment は次の 7 件である。

| Experiment                         | 判断                            | 記録の移動先                             |
| ---------------------------------- | ------------------------------- | ---------------------------------------- |
| `catalog-editorial`                | `topic-first` を採用            | `docs/records/catalog-editorial/`        |
| `catalog-redesign`                 | 採用なし                        | なし                                     |
| `guideline-rule-structure`         | `contrast-pair` を採用          | `docs/records/guideline-rule-structure/` |
| `color-schemes`                    | 後継は `color-schemes-material` | `docs/records/color-schemes/`            |
| `class-chapter-illustration`       | 採用なし                        | なし                                     |
| `class-doc-logo`                   | 採用なし                        | なし                                     |
| `registration-completion-feedback` | Skill 3 本を継続利用            | なし。要点は `skills/README.md` にある   |

却下 variant を削除した Experiment は `class-tech-icons`、`form-inline-validation`、`product-ui-typography`、`soft-component-kit` である。
`soft-component-kit` が借りていた `color-schemes` の `sumi` の配色は、`soft-component-kit/shared/scheme.css` へ移した。

削除前の状態は commit `eff731b` にある。
復元は `git show eff731b:experiments/<slug>/<path>`、または `git checkout eff731b -- experiments/<slug>` で行う。

## 理由

判断後の比較案は、読まれないまま保守の対象になっていた。
型検査、token の変更、共通 CSS の変更のたびに、使わないコードも直す必要があった。
凍結と決めた写しも、同じ画面である限り並行して直された。決めごとでは二重管理を止められなかった。

学習材料として効くのは理由であり、動くコードではない。
理由は README と ADR に文章で残っている。
コードが要る場面は git 履歴で足りる。

除外リストは、載せないものを残すために必要だった。
残さなければ、Catalog は `experiments/` にあるものをそのまま載せればよい。

## 却下した案

- コードだけ削除して README を `experiments/` に残す: Catalog は README ごとに live variant を要求する。検査を緩めると、試作の書き忘れを検出できなくなる。
- runner の一覧から隠すだけにする: 二重管理と除外リストが残る。
- runner を Catalog の `/preview` へ統合して廃止する: Skill 2 本、justfile、runner の ADR まで波及する。今回の主題は中身の整理なので、別の判断として扱う。
- Guideline の `- 実験:` 行を削除する: 約 55 件の Tips からリポジトリ内の根拠が消える。
- 記録文書を移さず git 履歴だけにする: `- 実験:` は Markdown リンクを要求する（[Guideline の書式](../guideline-format.md)）。

## 影響

- runner の一覧は 6 Experiment、22 variant になる。
- `docs/records/` が増える。削除した Experiment の記録のうち、他の文書がリンクするものだけを置く。
- `docs/records/` の README が指す `variants/`、`shared/`、`previews/` は現行の tree に無い。各 README の冒頭に commit を書いた。
- 評価記録（`evaluation/*.md`）が根拠として挙げる却下 variant のパスも、現行の tree に無い。記録は改変しない。
- `RETIRED_DOMAINS` を消したので、`logo-brand-identity`、`illustration-svg`、`animation-motion` の Experiment を新たに置くと、2 番目以降の domain の topic に入る。載せ方はその時に決める。
- 過去の ADR の本文は書き換えない。リンク切れだけを直し、置き換えた条項には各 ADR の冒頭で本 ADR を指す。
