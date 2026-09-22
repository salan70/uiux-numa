# 原則候補

個人開発のプロダクト群に共通するデザイン原則を、仮説として育てる場所。
「目指す体験・印象」「それを実現する視覚表現」「再現する手順や値」を結び付ける。
Experiment の比較から候補を抽出し、採用、修正、棄却を人間が判断する。
置き場と Pattern との関係は [ADR](../decisions/2026-09-18-uiux-skill-source-and-principles.md) に決めた。

## ディレクトリ構成

```text
docs/principles/
├── README.md      # この文書
└── <slug>.md      # 原則候補 1 件
```

slug は kebab-case にする。

## 記録の形式

各原則候補は YAML frontmatter と本文で構成する。

```yaml
---
title: <原則の題名>
status: candidate
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

本文の節は次の 7 個を、この順で置く。

| 節       | 書くこと                                                                         |
| -------- | -------------------------------------------------------------------------------- |
| 仮説     | 目指す印象と、それを生む視覚表現の結び付き。1〜3 文                              |
| 適用条件 | どのプロダクト、どの成果物（アイコン、ロゴ、イラスト）、どの表示サイズで使うか   |
| 必要な値 | 再現に必要な手順と値。数値は「この候補の値」であり、普遍の正解ではないと明記する |
| 作例     | 由来 Experiment の variant と preview へのリンク。良い例と、あれば悪い例         |
| 例外     | 使わない場面と、使うと壊れるもの                                                 |
| 検証結果 | Experiment ごとの観察。評価の判定、利用者の選択、未検証の点を分けて書く          |
| 判断     | status を変えた判断者、判断日、理由。`candidate` のままなら `未定`               |

## status

| 値          | 意味                                                               |
| ----------- | ------------------------------------------------------------------ |
| `candidate` | 仮説。1 件以上の Experiment から抽出した                           |
| `adopted`   | 人間が採用した。2 件以上の Experiment または別プロダクトで確認した |
| `rejected`  | 人間が棄却した。理由を判断に書く                                   |

修正は status ではなく出来事として扱う。
仮説や値を変えたら本文を更新し、検証結果に変えた理由を残す。

## 改善手順

1. Experiment の Learnings から候補を挙げる。AI エージェントが挙げてよい。
2. 候補を `docs/principles/<slug>.md` に `candidate` で書く。作例は由来 Experiment にリンクする。
3. 別の Experiment、または別プロダクト想定の画面で試す。結果を検証結果に追記する。
4. 人間が採用、修正、棄却を判断し、判断の節に記録する。
5. `adopted` になった候補は、Skill の references から「採用済み」として参照する。`candidate` は「候補（未検証）」として参照する。

## 原則候補の一覧

| 原則                                                                                 | status      | 由来                                                                              |
| ------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------- |
| [組の一貫性は少数のパラメータで縛る](icon-set-consistency-by-few-parameters.md)      | `candidate` | `experiments/class-tech-icons/`                                                   |
| [比喩は描き方より先に効く](metaphor-decides-before-style.md)                         | `candidate` | `experiments/class-tech-icons/`、`class-doc-logo/`、`class-chapter-illustration/` |
| [状態は色で示し、寸法で示さない](state-changes-must-not-move-layout.md)              | `candidate` | `docs/records/catalog-editorial/`                                                 |
| [段の数は任意項目の有無で変えない](block-shape-must-not-vary-by-optional-parts.md)   | `candidate` | `docs/records/guideline-rule-structure/`                                          |
| [良し悪しの色に画面の強調色を借りない](semantic-color-must-not-borrow-the-accent.md) | `candidate` | `docs/records/guideline-rule-structure/`                                          |
| [テーマ色の塗りに意味を担わせない](theme-color-fill-carries-no-meaning.md)           | `candidate` | `experiments/catalog-theme-icons/`                                                |
