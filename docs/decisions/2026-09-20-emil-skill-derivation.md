# Emil Kowalski の Skill を全面導入せず、衝突を直した派生版にする

- 状態: Accepted
- 日付: 2026-09-20
- 参照: [Issue #9](https://github.com/salan70/uiux-numa/issues/9)、[Issue #8](https://github.com/salan70/uiux-numa/issues/8)、[UI/UX 固有 Skill の正本](2026-09-18-uiux-skill-source-and-principles.md)、[Web 実行基盤](2026-09-13-web-runner.md)、[評価の実行手順](../evaluation/review.md)

## 背景

Issue #9 は、[emilkowalski/skills](https://github.com/emilkowalski/skills) の `prototype`、`animate`、`review-animations` を制作とレビューへ入れることを求めている。
上流の初回調査コミットは `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3` である。
実装時の `HEAD` も同じコミットだった。
本 ADR の派生版はこのコミットを出典とする。

上流は製品コードへ 1 案を昇格する作業向けである。
本リポジトリは Experiment で複数案を残し、人間が採否を決める。
専用 picker、試作削除、未導入 Skill への依存、作者の Block / Approve をそのまま入れると、既存の記録形式と評価手順と衝突する。

Issue 8 は Asset の `role` / `maturity` と Catalog を扱う。
本 Issue では SKILL.md の frontmatter に #8 の metadata キーを足さない。
成熟度は `skills/README.md` に `experimental` と書く。
役割は prose で `module` とする。

## 決定

- 全面導入と原文ラッパーは採用しない。必要な手順だけを、既存の Experiment 運用へ合わせて書き直す。
- 派生名は上流と衝突しない次の 3 つにする。`exploring-ui-variants`（上流 `prototype`）、`crafting-motion`（上流 `animate`）、`reviewing-motion`（上流 `review-animations`）。
- 正本は `skills/<name>/` に置く。読み込みは既存どおり `.claude/skills/<name> -> ../../skills/<name>` の相対 symlink にする。
- 呼び出しは `/exploring-ui-variants`、`/crafting-motion`、`/reviewing-motion` と、要求文での用途一致とする。frontmatter は `name` と `description` だけにする。
- `emil-design-eng`、`apple-design`、`mobile-native`、`pick-ui-library`、`improve-animations`、`find-animation-opportunities`、`animate-expo` は導入しない。参照は既存の Experiment 手順、`platforms/web`、`docs/evaluation/`、トークンへ置き換える。
- 出典 URL、元コミット、変更理由、MIT の著作権表示とライセンス文を各 Skill に残す。
- 衝突の扱いを次の表で固定する。

| 上流の方針                                 | 本プロジェクトでの扱い                                                                                   |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------- |
| 採用後に試作を削除する                     | 却下案と判断理由を Experiment に残す                                                                     |
| 専用 picker を指定どおり作る               | `platforms/web` の hash `#<slug>/<id>` で実サイズ比較する                                                |
| 原則 1 部品へ範囲を絞る                    | Experiment の Brief を優先する                                                                           |
| 動きの候補を提示せず実装を決める           | 実験では複数案を許容し、各案の根拠を示す                                                                 |
| キーボード操作や特定の数値を一律に禁止する | 利用頻度と目的に応じて検証する。数値は出発点であり必須要件ではない                                       |
| 作者の基準で Block / Approve を判定する    | `docs/evaluation/review.md` の 1 観点として記録する。採用判断は人間が行う                                |
| 独自の計画ファイル群を作る                 | Issue #9 と既存の実験記録を使う                                                                          |
| 未導入 Skill を呼び出す                    | 既存手順へ置き換える。依存を満たすためだけの一括導入はしない                                             |
| 作者の好みと a11y を同じ「必須」にする     | `prefers-reduced-motion`、キーボード、支援技術は要件として扱う。ease の好みや 300ms 上限は仮説として扱う |
| 独自の easing token を新設する             | 既存トークンがあればそれを使う。なければ variant 内の局所値にし、並行定義を増やさない                    |
| 性能をコードだけで断定する                 | 未計測なら未計測と書く。必要な箇所だけ実測する                                                           |

初期の位置付けは、明示的に選ぶ `module` であり、成熟度は `experimental` である。
1 件の比較だけで `stable` にしない。

## 却下した案

- 上流 3 Skill を名前ごと全面コピーする: picker 削除、試作削除、未導入 Skill 参照が残り、Experiment の記録義務と衝突する。
- 原文を読み、衝突箇所だけ「本リポジトリでは無視する」と書くラッパーにする: 無視指示は抜けやすく、専用 picker や Block 判定が再発する。
- `emil-design-eng` を第 4 Skill として導入する: Issue #9 は必要な部分の参照に留め、一括導入を対象外にしている。判断材料は派生 3 Skill の参照へ写す。
- 上流名のまま `prototype` / `animate` / `review-animations` を置く: 上流更新や他エージェントの同名 Skill と衝突し、派生であることが分からない。
- #8 の `role` / `maturity` を SKILL.md frontmatter に足す: #8 は Phase 0 であり、metadata の新形式を先行して増やさない。`crafting-svg` と同じく `name` と `description` だけにする。
- Catalog 全体の再設計を最初の検証課題にする: #8 の作業を重複させ、Skill の効果が見えなくなる。

## 影響

- Issue #9 の比較実験は、登録完了の遷移とフィードバックを扱う。Catalog 改修は #8 に残す。
- 派生 Skill の更新は、上流差分を読んで取り込む。全 Skill の自動更新はしない。
- 採否は人間が決める。判断前に自動読み込みを外したり、Phase 5 の知見整理へ進んだりしない。
