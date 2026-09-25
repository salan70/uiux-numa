# 原則候補

Experiment の Learnings から立てた仮説を、別の Experiment で試し、人間が採否を決める場所。
「目指す印象」「それを生む視覚表現」「再現する手順や値」を結び付ける。
採用された原則は Guideline の Tips から `- 実験:` で引く。

## 記録の形式

`docs/principles/<slug>.md` に 1 件ずつ書く。

```yaml
---
title: <原則の題名>
status: candidate
created: YYYY-MM-DD
updated: YYYY-MM-DD
---
```

| 節       | 書くこと                                                               |
| -------- | ---------------------------------------------------------------------- |
| 仮説     | 目指す印象と、それを生む視覚表現の結び付き。1〜3 文                    |
| 適用条件 | どの成果物、どの表示サイズで使うか                                     |
| 必要な値 | 再現に必要な手順と値。数値は「この候補の値」であり、普遍の正解ではない |
| 作例     | 由来 Experiment の variant と preview へのリンク                       |
| 例外     | 使わない場面と、使うと壊れるもの                                       |
| 検証結果 | Experiment ごとの観察。未検証の点も書く                                |
| 判断     | status を変えた判断者、判断日、理由。`candidate` のうちは省いてよい    |

| status      | 意味                                                               |
| ----------- | ------------------------------------------------------------------ |
| `candidate` | 仮説。1 件以上の Experiment から抽出した                           |
| `adopted`   | 人間が採用した。2 件以上の Experiment または別プロダクトで確認した |
| `rejected`  | 人間が棄却した。理由を判断に書く                                   |

Skill は `candidate` を未検証の仮説、`adopted` を採用済みとして参照し、`rejected` になったら参照を外す。

## 一覧

| 原則                                                                                 | status      | 由来                                                                                                    |
| ------------------------------------------------------------------------------------ | ----------- | ------------------------------------------------------------------------------------------------------- |
| [組の一貫性は少数のパラメータで縛る](icon-set-consistency-by-few-parameters.md)      | `candidate` | `experiments/class-tech-icons/`                                                                         |
| [比喩は描き方より先に効く](metaphor-decides-before-style.md)                         | `candidate` | `experiments/class-tech-icons/`、`class-doc-logo`（削除済み）、`class-chapter-illustration`（削除済み） |
| [状態は色で示し、寸法で示さない](state-changes-must-not-move-layout.md)              | `candidate` | `catalog-editorial`（削除済み）                                                                         |
| [段の数は任意項目の有無で変えない](block-shape-must-not-vary-by-optional-parts.md)   | `candidate` | `guideline-rule-structure`（削除済み）                                                                  |
| [良し悪しの色に画面の強調色を借りない](semantic-color-must-not-borrow-the-accent.md) | `candidate` | `guideline-rule-structure`（削除済み）                                                                  |
| [テーマ色の塗りに意味を担わせない](theme-color-fill-carries-no-meaning.md)           | `candidate` | `experiments/catalog-theme-icons/`                                                                      |

削除済みの Experiment は、各原則候補の本文にある commit permalink で辿る。
