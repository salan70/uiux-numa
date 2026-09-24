# Experiment

同じ課題に複数案を実装し、比較して、人間が判断し、理由を残す。
1 Experiment を `experiments/<slug>/` に閉じ、記録の入口を `README.md` にする。
雛形は [templates/experiment.md](templates/experiment.md) にある。

## 流れ

1. Problem を書く。
2. variant を実装する。見た目だけでなく、copy、情報構造、操作、motion、feedback も独立した variant にしてよい。
3. 必要なら評価する。手順は [evaluation.md](evaluation.md) にある。評価せずに判断してもよい。
4. 人間が判断し、Decision と Rejected reasons を書く。
5. 判断後は却下 variant のコードと専用の preview を削除する。理由は README に残る。コードは Git 履歴で辿る。
6. 一般化できる知見は Learnings に書き、仮説として育てるなら [原則候補](principles/README.md) に立てる。

判断済みで後続の無い Experiment はディレクトリごと削除してよい。
削除した Experiment を他の文書が出どころにしている場合は、削除前の commit への permalink で指す。
Catalog の topic に当たらない Experiment は削除せず、載せないまま置く（[ADR](decisions/2026-09-22-unlisted-experiments.md)）。

## ディレクトリ構成

```text
experiments/<slug>/
├── README.md                    # 記録の入口
├── evaluation.md                # 多観点評価を行ったときだけ置く
├── shared/                      # variant が共有するコード（任意）
├── variants/
│   └── <variant-id>/
│       ├── index.tsx            # props なしで描画できる React コンポーネントを default export する
│       ├── *.css, *.ts, *.tsx   # この variant だけが使う補助ファイル
│       ├── source/*.svg         # SVG を扱う Experiment だけ。編集用の原本
│       └── dist/*.svg           # SVG を扱う Experiment だけ。`just svg-optimize` の出力
└── previews/
    ├── <variant-id>-<state>.png
    └── compare-<state>.png      # variant を横断する比較画像（任意）
```

- `README.md` と `variants/` は必須にする。
- `variants/<variant-id>/` に Markdown を置かない。説明と判断は README に集める。
- Web の実行基盤（`platforms/web`）と Catalog は `experiments/*/variants/*/index.tsx` を glob で読む。README の Variants 表にある id には `index.tsx` が要る。
- SVG は `source/` に原本、`dist/` に `just svg-optimize` の出力を置く。`index.tsx` は `dist/` を利用画面のモックに埋め込む。多色にする面は `part-<asset>-<name>` の id を持ち、色は利用画面の CSS が与える。道具は [SVG toolchain の ADR](decisions/2026-09-18-svg-toolchain.md) に従う。
- preview は README が根拠にするものだけを commit する。ファイル名は `<variant-id>-<state>.png` にし、`state` は variant 間で揃える。

## slug と variant-id

- 小文字の英数字とハイフンだけの kebab-case にする。日付 prefix と連番（`a`、`b`）は使わない。
- variant-id は変えた軸が分かる名前にする（例: `on-blur`、`realtime`）。名前で選ぶ選択肢なら、その名前でよい（例: 配色の `wasabi`）。

## frontmatter

一覧と絞り込みに使う項目だけを持つ。
Catalog が読み、不正なら build が落ちる。

```yaml
---
title: フォームの inline validation
status: draft
role: module
maturity: experimental
created: 2026-09-13
updated: 2026-09-13
platforms:
  - web
domains:
  - ux-writing
  - forms-input-ux
sources: []
adopted: []
---
```

| 項目        | 内容                                                                                           |
| ----------- | ---------------------------------------------------------------------------------------------- |
| `title`     | 日本語の題名。本文に H1 を置かない                                                             |
| `status`    | 下の status                                                                                    |
| `role`      | [role](layers.md#role-と-maturity)。`foundation` / `module` / `reference`                      |
| `maturity`  | [maturity](layers.md#role-と-maturity)。`experimental` / `candidate` / `stable` / `deprecated` |
| `created`   | 作成日（`YYYY-MM-DD`）                                                                         |
| `updated`   | 最終更新日。status を変えたら更新する                                                          |
| `platforms` | 対象プラットフォーム。`platforms/` のディレクトリ名（現在は `web` だけ）                       |
| `domains`   | [対象領域](scope.md)の項目名を kebab-case にしたもの。Catalog の topic はここから決まる        |
| `sources`   | 由来の slug やパス。自身が起点なら空配列                                                       |
| `adopted`   | 採用した variant-id。`decided` 以外では空。`decided` で空なら全案却下                          |

## status

| 値             | 意味                                                |
| -------------- | --------------------------------------------------- |
| `draft`        | Problem を書いている                                |
| `implementing` | variant を実装している                              |
| `evaluating`   | 評価している                                        |
| `decided`      | 人間が判断し、Decision と Rejected reasons を書いた |
| `abandoned`    | 判断前に中止した。理由を Decision に書く            |

## 本文の節

次の 11 個を英語のまま、この順で置く。
未到達の節は見出しを残し、本文に `未定` と書く。

| 節               | 書くこと                                                                                                    |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| Problem          | 解決したい課題と現状。先頭の 1 文は Catalog の見出し下に出る                                                |
| Target           | 想定ユーザーと利用状況                                                                                      |
| Scope / Domains  | 対象領域と、variant で変える軸                                                                              |
| Constraints      | 技術、アクセシビリティ、プラットフォーム、時間などの制約                                                    |
| Hypothesis       | variant 共通で検証したい仮説                                                                                |
| Variants         | 下の表                                                                                                      |
| Evaluation       | 評価したか。行ったなら `evaluation.md` へのリンクと要点。行わずに判断したなら、そのことと何を見て判断したか |
| Decision         | 採用した variant、理由、判断者、判断日。複数を採用してよい                                                  |
| Rejected reasons | 却下した variant ごとの理由。評価の前に却下した場合は、判断者と判断日も書く                                 |
| Learnings        | 一般化できる知見と原則候補                                                                                  |
| Related          | 関連する Experiment、原則候補、token、ADR へのリンク。なければ `なし`                                       |

### Variants の表

| id        | 仮説                                         | 変えた軸             | 実装                |
| --------- | -------------------------------------------- | -------------------- | ------------------- |
| `on-blur` | フィールド離脱時の検証は入力の流れを妨げない | 検証タイミング、文言 | `variants/on-blur/` |

- Catalog はこの表の `id`、`仮説`、`変えた軸` を読む。列の順を変えない。
- 基準となる variant は仮説の先頭に `基準:` と書く。
- 評価の前に却下した variant は、判断までは表に残し、仮説の先頭に `却下:` と書く。
- 判断後に削除した variant は表から外し、仮説と変えた軸を「削除した variant」の箇条書きへ移す。

### 反復の記録

AI エージェントが variant を反復して改善した場合は、Variants の表の後に round ごとの記録を置く。
round、観察、変更、参照した知識、終了理由を表にする。
