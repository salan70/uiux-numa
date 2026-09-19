# Experiment の記録形式

1 Experiment を `experiments/<slug>/` に閉じ、記録の入口を `README.md` にする。
README は YAML frontmatter と本文で構成する。
本文は [Experiment lifecycle](experiment-lifecycle.md) の 11 項目を同じ順で持つ。
テンプレートは [docs/templates/experiment/README.md](templates/experiment/README.md) にある。
採用理由と却下した案は [Experiment 記録形式の ADR](decisions/2026-09-13-experiment-format.md) に残す。
名前で選ぶ variant と評価を経ない判断の扱いは、[補足の ADR](decisions/2026-09-17-named-variants-and-unevaluated-decisions.md) に残す。

## ディレクトリ構成

```text
experiments/<slug>/
├── README.md                    # 記録の入口
├── evaluation.md                # 評価の入口。形式は docs/evaluation/ に従う
├── evaluation/                  # 観点別の評価ファイル（任意）
├── variants/
│   └── <variant-id>/
│       ├── index.tsx            # variant の入口。React コンポーネントを default export する
│       ├── *.css, *.ts, *.tsx   # この variant だけが使う補助ファイル
│       ├── source/*.svg         # SVG を扱う Experiment だけ。編集用の原本
│       └── dist/*.svg           # SVG を扱う Experiment だけ。配布用（`just svg-optimize` の出力）
└── previews/
    ├── <variant-id>-<state>.png
    └── compare-<state>.png      # variant を横断する比較画像（任意）
```

- `README.md` と `variants/` は必須にする。`evaluation.md` は評価の開始時に作る。`previews/` は preview の取得時に作る。
- `evaluation.md` と `evaluation/` の内部形式は `docs/evaluation/` の文書で定める。README からはリンクするだけにする。
- `variants/<variant-id>/` に Markdown を置かない。variant の説明と判断は README に集める。
- Web の実行基盤は `experiments/*/variants/*/index.tsx` を glob で読む。`index.tsx` は props なしで描画できるコンポーネントを default export する。
- SVG を扱う Experiment は、編集用の原本を `source/`、配布用を `dist/` に置く。`index.tsx` は `dist/` の SVG を利用画面のモックに埋め込む。手順とツールは [SVG 制作の実行基盤の ADR](decisions/2026-09-18-svg-toolchain.md) に従う。

## slug と variant-id

- slug は小文字の英数字とハイフンだけの kebab-case にする（例: `form-inline-validation`）。
- 日付 prefix を付けない。作成日は frontmatter の `created` に持つ。
- slug はリポジトリ内で一意にし、内容が分かる名前にする。
- variant-id も同じ規則にし、変えた軸が分かる名前にする（例: `on-blur`、`on-submit`、`realtime`）。
- variant を名前で選ぶ選択肢として残す場合は、その名前を variant-id にしてよい（例: 配色の `wasabi`、`yuzu`）。変えた軸は Variants の表に書く。
- `a`、`b` のような連番は使わない。

## frontmatter

一覧と絞り込みに使う項目だけを持つ。
本文と重複する情報は持たない。

```yaml
---
title: フォームの inline validation
status: draft
created: 2026-09-13
updated: 2026-09-13
platforms:
  - web
domains:
  - ux-writing
  - forms-input-ux
  - states-design
  - accessibility
adopted: []
---
```

| 項目        | 必須 | 内容                                                                                           |
| ----------- | ---- | ---------------------------------------------------------------------------------------------- |
| `title`     | 必須 | 日本語の題名                                                                                   |
| `status`    | 必須 | 下の status の値                                                                               |
| `created`   | 必須 | 作成日（`YYYY-MM-DD`）                                                                         |
| `updated`   | 必須 | 最終更新日（`YYYY-MM-DD`）                                                                     |
| `platforms` | 必須 | 対象プラットフォーム。`platforms/` のディレクトリ名と同じ小文字にする（例: `web`）             |
| `domains`   | 必須 | [対象領域](scope.md)の項目名を kebab-case にしたもの（例: `ux-writing`、`interaction-design`） |
| `adopted`   | 必須 | 採用した variant-id の配列。Decision 節から転記する                                            |

`adopted` は variant-id だけを持つ。
本文の採用理由は Decision 節に残す。
`status` が `decided` 以外なら空にする。
`status` が `decided` で空なら、全案却下である。
Variants 表にない ID を書くと Catalog の build が失敗する。

## status

| 値             | 意味                                                  | lifecycle の手順 |
| -------------- | ----------------------------------------------------- | ---------------- |
| `draft`        | Brief を書いている                                    | 1〜2             |
| `implementing` | variant を実装している                                | 3                |
| `evaluating`   | 評価している                                          | 4                |
| `decided`      | 人間が判断し、decision と rejected reasons を記録した | 5〜7             |
| `extracted`    | 知見を抽出し、Pattern / Asset への昇格を終えた        | 8〜9             |
| `abandoned`    | 判断前に中止した。理由を Decision に書く              | 任意             |

status は上から順に進める。
`abandoned` はどの状態からでも遷移できる。
status を変えたら `updated` も更新する。

## 本文の節

本文に H1 を置かない。題名は frontmatter の `title` だけに持つ。
見出しは次の 11 個を英語のまま、この順で置く。
未到達の節は見出しを残し、本文に `未定` と書く。

| 節                        | 書くこと                                                                                                   |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Problem                   | 解決したい課題と現状                                                                                       |
| Target                    | 想定ユーザーと利用状況                                                                                     |
| Scope / Domains           | 対象領域と、variant で変える軸（見た目、copy、情報構造、操作、motion、feedback）                           |
| Constraints               | 技術、アクセシビリティ、プラットフォーム、時間などの制約                                                   |
| Hypothesis                | variant 共通で検証したい仮説                                                                               |
| Variants                  | 下の表                                                                                                     |
| Evaluation                | `evaluation.md` へのリンクと、選んだ評価軸と観点の要約。評価を行わずに判断した場合は、そのことと判断の根拠 |
| Decision                  | 採用した variant、理由、判断者、判断日。複数を採用してよい。評価を行わずに判断した場合は、未評価の軸も書く |
| Rejected reasons          | 却下した variant ごとの理由。評価の前に却下した場合は、判断者と判断日も書く                                |
| Learnings                 | 一般化できる知見と Pattern 候補                                                                            |
| Related patterns / assets | 抽出した Pattern と昇格した Asset へのリンク。なければ `なし`                                              |

### Variants の表

| id        | 仮説                                         | 変えた軸             | 実装                |
| --------- | -------------------------------------------- | -------------------- | ------------------- |
| `on-blur` | フィールド離脱時の検証は入力の流れを妨げない | 検証タイミング、文言 | `variants/on-blur/` |

- `id` は variant-id と同じにする。
- `変えた軸` は Scope / Domains で挙げた軸から選ぶ。
- 基準となる variant がある場合は、仮説の先頭に `基準:` と書く。
- 評価の前に却下した variant も `variants/` と表に残し、仮説の先頭に `却下:` と書く。評価の対象には含めない。

### 反復の記録

AI エージェントが variant を反復して改善した場合は、Variants の表の後に round ごとの記録を置く。
round、観察、変更、参照した知識、終了理由を表にする。
改善前後の preview は `<variant-id>-first-<state>.png` と `<variant-id>-final-<state>.png` で残す。

## previews

- ファイル名は `<variant-id>-<state>.png` にする。
- `state` は小文字の kebab-case にする。比較のため、すべての variant で同じ名前を揃える（例: `initial`、`error`、`success`）。
- 静止画で判断できない motion は動画を置いてもよい。拡張子以外は同じ規則にする。
- variant を横断する比較画像（比較シートなど）は `compare-<state>.png` にする。
