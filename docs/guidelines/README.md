# ガイドライン

個人開発のプロダクト群に共通する UI/UX の作り方の指針。
機能や画面を設計・実装するとき、判断に迷ったときの根拠にする。
現時点の記述は Web を前提とする。他の platform では同等の概念へ読み替える。
判断の背景や検証手順はリポジトリ内の Experiment や原則候補へ結び付ける。

この文書は読み手向けの入口である。
書式の仕様と文書を足す手順は [Guideline の記録形式](../guideline-format.md) にある。

## docs/principles/ との違い

| 項目   | docs/principles/               | docs/guidelines/                      |
| ------ | ------------------------------ | ------------------------------------- |
| 目的   | 仮説を立てて検証する           | 主題ごとに規則をまとめて参照する      |
| 単位   | 1 原則 1 ファイル              | 1 主題 1 ファイル（中に規則を並べる） |
| status | candidate / adopted / rejected | draft / adopted                       |
| 内容   | 目指す印象、必要な値、検証結果 | 思想、場面ごとの規則、良い例、悪い例  |
| 関係   | 規則の詳細や検証結果の参照先   | 原則候補を 1 文で引く                 |

内容の重複は避ける。
ガイドラインは規則を簡潔に述べ、詳細な値や検証結果は原則候補を指す。

## 読み方

1 文書は Purpose、Core、Tips の 3 層でできている。
上から通して読んでも、Tips だけを拾い読みしてもよい。

### Purpose

その主題で目指す状態。
自分のプロジェクトにこの主題が関係するかを、ここで判断する。

### Core

主題の思想。3〜5 件ある。
番号は優先順位を表す。コア同士が衝突したら上が勝つ。

Core は具体的な部品や値を持たない。
Tips に無い場面に出会ったとき、Core だけで判断する。

### Tips

具体的な場面の規則。8 件までを目安にする。
規則 1 件は 4 段で固定されており、規則ごとに形が変わらない。

| 段  | 内容                                     |
| --- | ---------------------------------------- |
| 1   | 題名と適用（`foundation` / `module`）    |
| 2   | 根拠。なぜこの規則があるか               |
| 3   | good と bad の対。good が左、bad が右    |
| 4   | 例外。規則が効かない場面。無い規則もある |

good を左に置くのは、bad から読むと正しい形へ辿り着くまで 2 度読むことになるからである。
色だけに頼らないよう、`good` と `bad` の語そのものを残す。

適用は、その規則をどこまで持ち出すかを表す。

| 値           | 意味                                       |
| ------------ | ------------------------------------------ |
| `foundation` | すべてのプロジェクトで守る                 |
| `module`     | その主題を重視するプロジェクトで選んで守る |

`foundation` の規則が先、`module` の規則が後に並ぶ。

### 画面に出ない記録

Catalog には規則を使うために要る情報だけを出す。
次の 3 つは正本の Markdown にあり、画面には出ない。

- 結び付くコア: 規則がどの思想から来たか
- 実験: リポジトリ内の出どころ（Experiment、ADR、原則候補）
- 出典: 外部文献や WCAG 達成基準

規則の出どころを辿るときは、下の文書一覧から正本の Markdown を開く。

### status の読み方

`draft` は未採用である。人間の確認を経ていない仮説として扱う。
`adopted` は確認済みで、判断者と理由が [ADR](../decisions/) にある。
現在はすべての文書が `draft` である。

## 改訂の手順

1. 変更の理由と根拠を明らかにする。外部文献は原典を開き、URL が生きていること、その主張が規則と一致することを確かめる。
2. リポジトリ内の実験で確かめた知見があれば出どころに結び付ける。
3. 文書を作成または修正し、[Guideline の記録形式](../guideline-format.md)の機械検査と文体基準を通す。
4. 人間が内容を確認し、status を `adopted` に変更する。判断者、判断日、理由は ADR に残す。

## 文書一覧

文書名は Catalog の表示と揃えて英語にする。本文は日本語で書く。

| 文書                                                       | title                    | 主題                 | status  |
| ---------------------------------------------------------- | ------------------------ | -------------------- | ------- |
| [ux-writing.md](ux-writing.md)                             | UX Writing               | UX ライティング      | `draft` |
| [information-architecture.md](information-architecture.md) | Information Architecture | 情報設計             | `draft` |
| [design-four-principles.md](design-four-principles.md)     | Design Principles        | デザイン 4 原則      | `draft` |
| [accessibility.md](accessibility.md)                       | Accessibility            | アクセシビリティ     | `draft` |
| [states-and-feedback.md](states-and-feedback.md)           | States & Feedback        | 状態とフィードバック | `draft` |
| [color.md](color.md)                                       | Color                    | 色の使い方           | `draft` |

[states-and-feedback.md](states-and-feedback.md) が書式の見本である。
