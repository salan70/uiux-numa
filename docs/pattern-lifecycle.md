# Pattern lifecycle

Experiment から Pattern を抽出し、検証を経て Asset へ昇格するまでの手順と記録形式を定める。
Pattern first の方針は [layers.md](layers.md) に定める。
Pattern の判断の記録先と必須項目は [判断履歴の ADR](decisions/2026-09-13-decision-records.md) に定める。
テンプレートは [docs/templates/pattern/README.md](templates/pattern/README.md) にある。
採用理由と却下した案は [Pattern lifecycle の ADR](decisions/2026-09-13-pattern-lifecycle.md) に残す。

## 用語

| 用語            | 意味                                                                                             |
| --------------- | ------------------------------------------------------------------------------------------------ |
| Pattern         | 複数の場面で再利用できる体験上の解決の形。visual component に限定しない                          |
| anti-pattern    | 避けるべき形。却下理由が一般化できたときに記録する                                               |
| 由来 Experiment | Pattern の根拠となった Experiment。Pattern は 1 件以上の由来 Experiment を持つ                   |
| Asset           | 他プロジェクトで再利用できる形に昇格したもの。Skill、Design Tokens、Design System、Template など |

## 抽出の基準

次のいずれかを満たしたときに Pattern の候補にする。

- 複数の variant または複数の Experiment で有効と確認できた形がある。
- 1 件の Experiment でも、採用理由が対象領域の原則として一般化できる。
- 却下理由が特定の画面に依存せず一般化できる。この場合は anti-pattern にする。

次は Pattern にしない。

- 1 つの variant にしか現れず、一般化の根拠がない。
- 実装の都合だけで決まり、体験の判断を含まない。
- 既存の Pattern と同じ形。既存 Pattern の `sources` に Experiment を追加する。

## 抽出の手順

1. 由来 Experiment の status が `decided` になってから始める。Decision、Rejected reasons、Learnings を読む。
2. Learnings から候補を挙げ、抽出の基準に照らして選ぶ。
3. `patterns/<slug>/README.md` をテンプレートから作る。status は `candidate` にする。
4. 由来 Experiment の variant、previews、evaluation へリンクする。リンクは Good examples、Bad examples、Implementation examples に書く。
5. When not to use と Bad examples を必ず書く。Rejected reasons が根拠になる。
6. Accessibility considerations を必ず書く。evaluation の accessibility の観察が根拠になる。
7. Experiment の Related patterns / assets から Pattern へリンクし、Experiment の status を `extracted` にする。

抽出は人間が判断する。
AI agent が候補を挙げてもよいが、README を作る前に人間が候補を確認する。

## ディレクトリ構成

```text
patterns/<slug>/
└── README.md      # Pattern の記録。これ以外のファイルは置かない
```

- 画像とコードは複製せず、由来 Experiment の `previews/` と `variants/` へリンクする。
- Pattern 固有の実装を置きたくなったら、Asset への昇格を検討する。
- anti-pattern も `patterns/` に置き、frontmatter の `kind` で区別する。

## slug

- slug は小文字の英数字とハイフンだけの kebab-case にする（例: `inline-validation`）。
- 形の名前を付ける。由来 Experiment の slug や画面名を付けない。
- anti-pattern は避ける形の名前にする（例: `submit-only-validation`）。接頭辞は付けない。
- リポジトリ内で一意にする。

## frontmatter

一覧と絞り込みに使う項目だけを持つ。

```yaml
---
title: inline validation
kind: pattern
status: candidate
created: 2026-09-13
updated: 2026-09-13
platforms:
  - web
domains:
  - forms-input-ux
  - ux-writing
sources:
  - form-inline-validation
---
```

| 項目        | 必須 | 内容                                                                              |
| ----------- | ---- | --------------------------------------------------------------------------------- |
| `title`     | 必須 | Pattern の名前。英語名が一般的なら英語のまま書く                                  |
| `kind`      | 必須 | `pattern` または `anti-pattern`                                                   |
| `status`    | 必須 | 下の status の値                                                                  |
| `created`   | 必須 | 作成日（`YYYY-MM-DD`）                                                            |
| `updated`   | 必須 | 最終更新日（`YYYY-MM-DD`）                                                        |
| `platforms` | 必須 | 有効性を確認したプラットフォーム。`platforms/` のディレクトリ名と同じ小文字にする |
| `domains`   | 必須 | [対象領域](scope.md)の項目名を kebab-case にしたもの                              |
| `sources`   | 必須 | 由来 Experiment の slug。1 件以上                                                 |

## status

| 値          | 意味                           | 遷移の条件                                                                   |
| ----------- | ------------------------------ | ---------------------------------------------------------------------------- |
| `candidate` | 1 件の Experiment から抽出した | 抽出の手順を終えた                                                           |
| `validated` | 再利用価値を確認した           | 2 件目の Experiment または実プロジェクトで有効と確認し、`sources` に追加した |
| `promoted`  | Asset へ昇格した               | 昇格の条件を満たし、ADR と Asset へのリンクを Sources に書いた               |
| `retired`   | 使わないと判断した             | 理由と代替を When not to use に書いた                                        |

status は `candidate`、`validated`、`promoted` の順に進める。
`retired` はどの状態からでも遷移できる。
status を変えたら `updated` も更新する。

## 本文の節

本文に H1 を置かない。題名は frontmatter の `title` だけに持つ。
見出しは次の 8 個を英語のまま、この順で置く。
書くことがない節は見出しを残し、本文に `なし` と書く。

| 節                           | 書くこと                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------ |
| When to use                  | 使う状況と条件                                                                       |
| When not to use              | 使わない状況と、代わりに使う形。必須                                                 |
| Good examples                | 良い例。由来 Experiment の variant と preview へのリンクと、何が良いか               |
| Bad examples                 | 悪い例。却下した variant と理由へのリンク。必須                                      |
| Platform considerations      | プラットフォームごとの差異と慣習                                                     |
| Accessibility considerations | 支援技術、キーボード、reduced motion などの配慮。必須                                |
| Implementation examples      | 実装例へのリンク。Experiment の `variants/<variant-id>/` を指す                      |
| Sources                      | 由来 Experiment の README と evaluation へのリンク。昇格後は ADR と Asset へのリンク |

anti-pattern は同じ節を使い、次のように読み替える。

| 節              | anti-pattern で書くこと                |
| --------------- | -------------------------------------- |
| When to use     | `なし`                                 |
| When not to use | 避けるべき理由と、代わりに使う Pattern |
| Good examples   | 代わりの形の例                         |
| Bad examples    | 観測した悪い例                         |

## Asset への昇格

昇格は Pattern を他プロジェクトで再利用できる形に変えることを指す。
昇格しても Pattern は Knowledge の正本として残し、Asset は再利用の形として別に置く。

共通の条件は次のとおり。

- status が `validated` である。
- When not to use、Bad examples、Accessibility considerations が `なし` でない。
- Implementation examples が 1 つ以上のプラットフォームにある。

昇格先ごとの条件は次のとおり。

| 昇格先               | 置き場              | 追加の条件                                                                        |
| -------------------- | ------------------- | --------------------------------------------------------------------------------- |
| Skill                | `skills/`           | 使う判断と手順を AI agent への指示として書ける                                    |
| Design System の部品 | `design-systems/`   | 複数のプラットフォームで同じ形が有効、または差異が Platform considerations にある |
| Design Tokens        | `tokens/`           | 値の候補が複数の Pattern で共通に使われる                                         |
| Template             | 昇格の ADR で決める | 実装例をそのまま流用できる                                                        |

昇格の手順は次のとおり。

1. 昇格先と理由を ADR に書く。却下した昇格先も理由と共に書く。
2. Asset を作る。Asset から Pattern の README へリンクする。
3. Pattern の Sources に ADR と Asset へのリンクを書き、status を `promoted` にする。

昇格は人間が判断する。
Experiment 数などの閾値で自動判定しない。
由来 Experiment の記録は変更しない。
