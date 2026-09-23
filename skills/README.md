# UI/UX 固有 Skill

このディレクトリは UI/UX 固有 Skill の正本である。
dotfiles 由来の共通 Skill は `.claude/skills/` に配備し、ここと混ぜない。
置き場と読み込み経路の判断は [ADR](../docs/decisions/2026-09-18-uiux-skill-source-and-principles.md) に残す。

## 一覧

| Skill                   | role     | maturity       | 用途                                                                |
| ----------------------- | -------- | -------------- | ------------------------------------------------------------------- |
| `crafting-svg`          | `module` | `experimental` | SVG のアイコン、ロゴ、イラストを制作、比較、改善、最適化する        |
| `exploring-ui-variants` | `module` | `experimental` | 方向の異なる UI 案を named variant として実装し、実サイズで比較する |
| `crafting-motion`       | `module` | `experimental` | 動きの可否、目的、手段、中断、reduced motion を順に設計して実装する |
| `reviewing-motion`      | `module` | `experimental` | 動きを点検する。作者所見は 1 観点であり、採用判断そのものではない   |

`exploring-ui-variants`、`crafting-motion`、`reviewing-motion` は Issue #9 の派生版である。
役割は明示的に選ぶ `module` である。Issue #8 の metadata キーは `SKILL.md` に持たない。
出典と衝突の扱いは [ADR](../docs/decisions/2026-09-20-emil-skill-derivation.md) に残す。

Asset の `role` と `maturity` の意味は [docs/asset-model.md](../docs/asset-model.md) に従う。
Skill の表で使う成熟度は次のとおり。
Pattern lifecycle の `promoted` とは別の語である。

- `experimental`: R&D 中の制作手順。利用前提を置かない。
- `candidate`: 実利用で検証中。
- `stable`: 十分に検証され、再利用候補として扱える。
- `deprecated`: 新規利用を推奨しない。

## 読み込み経路

Claude Code は `.claude/skills/<name>` だけを読む。
正本を動かさずに読ませるため、`.claude/skills/<name> -> ../../skills/<name>` の相対 symlink を git で管理する。
Codex と Cursor は `.agents/skills -> ../.claude/skills` を経由して同じ Skill を読む。
`syncing-ai-assets` は正本にない local Skill を変更しないため、symlink は同期で消えない。

新しい Skill を追加する手順は次のとおり。

1. `skills/<name>/SKILL.md` と `references/` を作る。frontmatter は `name` と `description` だけにする。
2. `ln -s ../../skills/<name> .claude/skills/<name>` で symlink を作り、`git add` する。
3. この一覧に `role`、`maturity`、用途を書く。

## 使い方

Claude Code では `/crafting-svg` と入力するか、要求文に SVG の制作を書けば Skill が読み込まれる。
動きの分岐は `/exploring-ui-variants`、実装は `/crafting-motion`、点検は `/reviewing-motion` を使う。
新しいプロセスで確かめるには、リポジトリのルートで次を実行する。

```bash
nix develop -c claude -p "/crafting-svg <要求文>" --permission-mode acceptEdits --allowedTools "Bash(just *)"
```

Skill から他の文書へは、リポジトリのルートからのパスを文字列で書く。
symlink 経由では相対リンクの解決先がずれるためである。

## 新規プロセスでの動作確認（2026-09-19）

`skills/` を正本、`.claude/skills/` の symlink を読み込み経路とする構成が、新しいプロセスで働くことを確かめた。

```bash
nix develop -c claude -p "/crafting-svg 授業資料サイトのサイドバーに 9 個目のアイコンを足します。意味は「設定」です。…" \
  --model claude-opus-5 --permission-mode acceptEdits --allowedTools "Bash(just *)" …
```

結果は次のとおり。

- `/crafting-svg` が展開され、SKILL.md の手順に従って実行された。参照資料からは知識 ID を 14 件引用した（`ICON-02`、`ICON-06`、`SVG-01`、`FORM-11`、`UIFIT-07` など）。
- `docs/principles/` の原則候補 2 件を読み、どちらも `candidate` なので未検証の仮説として扱った。Skill の指示どおりである。
- `just svg-check`、`just svg-sheet`、`just svg-optimize` を実行し、編集用と配布用の両方が検査を通った。`part-*` の id 2 個が保持された。
- 比喩の候補（歯車 3 種とスライダー）を先に描いて比べ、外した理由を残した。手順 2 の追記が働いた。
- 反復を 3 回行い、観察、変更、参照 ID を記録した。既存 8 個と root の属性が 1 文字も違わないことを確かめた。
- 組の規則から外れた点（斜めの歯が 0.5 刻み）を自分で申告し、理由を書いた。
- 利用画面の撮影は行えなかった。`just web-shot` は `experiments/` に variant を足す必要があり、今回は変更を禁じていたためである。未検証として報告された。
- 費用は 2.84 USD、41 ターンだった。

この実行は Experiment には記録しない。Skill の動作確認が目的である。

## 改善手順

1. Experiment で Skill を使い、README に反復の記録と未解決の点を残す。
2. 反復の記録で繰り返し参照された知識と、参照されなかった知識を数える。使われない項目は削るか、適用場面を書き直す。
3. 落とし穴（検査で拾えず、描画で初めて分かる失敗）を `SKILL.md` の落とし穴に足す。
4. 原則候補が `adopted` になったら、参照資料から採用済みとして参照する。`rejected` になったら参照を外す。
5. 同じ要求文とモデルで Skill なしの実行と比べ、効果と限界を `skills/README.md` に書き足す。

Skill なし実行との比較は、Experiment `experiments/hako-feature-icons/` の Variants と Learnings に記録する。

## 知識 ID の引用状況（2026-09-22 時点）

改善手順 2 の集計である。
`skills/crafting-svg/references/` は 58 個の知識 ID を定義し、Experiment と原則候補が引用したのは 26 個だった。

引用が多い順に `ICON-06`（25 回）、`ICON-08`（14 回）、`ICON-02`（11 回）、`ICON-10`（9 回）、`ICON-09`（9 回）、`FORM-03`（8 回）である。
アイコンの制作は、見かけの大きさ、内側の隙間、比喩、色、格子の 5 項目に議論が集中する。

未引用は 32 個だが、**これを削る根拠にはしない**。
理由は 2 つある。

- LOGO 10 件と ILLUS 8 件は、由来 Experiment（`class-doc-logo`、`class-chapter-illustration`）が判断後に削除されたため、引用元が残っていない。知識の要否とは別である。
- `UIFIT-04`（`role="img"` と `<title>`）や `SVG-06`（基本図形から始める）のように、毎回守られているが議論にならない項目は引用されない。引用数は「使われた量」ではなく「議論になった量」を測る。

したがって改善手順 2 は、未引用を削除の基準にせず、引用の偏りから「どの項目が判断の中心か」を読む用途に使う。

## 派生 3 Skill の読み込み確認（2026-09-20）

symlink の解決は次を確認した。
`.claude/skills/<name>` と `.agents/skills/<name>` は同じ `skills/<name>/SKILL.md` を指す。

| エージェント | 確認   | 内容                                                                      |
| ------------ | ------ | ------------------------------------------------------------------------- |
| Cursor       | 済み   | `.agents/skills` 経由で 3 本の `SKILL.md` が実体へ解決した                |
| Claude Code  | 済み   | `nix develop -c claude -p "/exploring-ui-variants …"` が Skill 名を返した |
| Codex        | 未確認 | 同じ symlink 経路を使う想定。起動確認はしていない                         |

読み込み確認はデザイン上の効果の確認ではない。
効果の比較は Experiment `registration-completion-feedback`（削除済み）で行った。

## 派生 3 Skill の効果と限界（2026-09-20）

同じ要求文とモデル（`claude-fable-5-1`）で、Skill の有無を比べた。
Experiment は判断後に削除した。記録は commit `eff731b` の `experiments/registration-completion-feedback/README.md` で辿る。
人間判断は 3 本とも継続利用である。成熟度は `experimental` のままである。

| 項目       | Skill なし                          | Skill あり                                       |
| ---------- | ----------------------------------- | ------------------------------------------------ |
| 費用       | 4.31 USD                            | 6.01 USD                                         |
| ターン数   | 36                                  | 66                                               |
| 方向の数   | 差し替え、同面確認、次操作の 3 方向 | 同じ 3 方向。軸と代償の表を報告に残した          |
| 動きの根拠 | 実装のみ                            | 目的と例外（350ms、`stroke-dashoffset`）を文章化 |
| 点検       | 担当者が後から評価                  | 生成中は点検表なし。評価は `review.md` で実施    |

使い分けは次のとおり。

- 案の分岐と比較画面: `/exploring-ui-variants`
- 動きの目的、手段、中断、reduced motion: `/crafting-motion`
- 動きの点検メモ: `/reviewing-motion`。採否は人間と複数観点レビューが決める

限界は次のとおり。

- 方向の数は Skill なしでも足りた。増えたのは根拠文と費用である。
- 生成中の点検は自動では起きない。
- ボタン近傍だけに完了を置くと、成功後のフォーカスが落ちうる。
- 性能は未計測である。1 比較を一般化しない。

### 上流の更新

出典は [emilkowalski/skills](https://github.com/emilkowalski/skills) の commit `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3` である。
更新するときは次の順にする。

1. 上流の対象ディレクトリだけを、記録済みコミットとの差分で読む。
2. 衝突表（[ADR](../docs/decisions/2026-09-20-emil-skill-derivation.md)）に反する手順は取り込まない。
3. 取り込んだ箇所は SOURCE.md のコミットを更新し、変更理由を残す。
4. 読み込み確認と、影響する Experiment の操作確認を再実行する。
5. 全 Skill の自動更新はしない。

## 効果と限界（2026-09-19 時点）

同じ要求文とモデル（`claude-fable-5-1`）で、Skill の有無を比べた。
記録は `experiments/hako-feature-icons/README.md` にある。

| 項目           | Skill なし（`no-skill`） | Skill あり（`with-skill`）                                      |
| -------------- | ------------------------ | --------------------------------------------------------------- |
| 費用           | 7.35 USD                 | 8.37 USD                                                        |
| ターン数       | 79                       | 93                                                              |
| 読んだ参照資料 | なし                     | 5 本と `docs/principles/`                                       |
| 造形の根拠     | 文章で説明               | 知識 ID（`ICON-06` など）で引用                                 |
| 反復の確認     | シートを 3 回            | シートに加えて、別 agent へのラベルなしの読み取りを自発的に実施 |
| 16px の整列    | 線幅 1.5 で 1px に乗せた | 線の中心を 0.75 + 1.5n に置き、16px で整数ピクセルに乗せた      |

効果は次の 3 つが確かめられた。

- 造形の判断に根拠が残る。どの知識を使ったかが ID で追え、後から検証できる。
- 確認の手順が増える。Skill なしの実行は利用画面の撮影を行わなかったが、Skill ありは self-review の項目に沿って確認した。
- 落とし穴を先に避ける。`var()` を使わない、`aria-labelledby` を使わないなどを、失敗する前に守った。

限界は次の 3 つである。

- 意味の伝達は改善しない。`api` と `test` は Skill の有無に関係なく意味に届かなかった。
- 費用は 14% 増えた。参照資料を読む分と、確認の手順が増える分である。
- ブランドを表す成果物（ロゴ、挿絵）では、Skill があっても採用に至らなかった。比喩と調子は Skill の知識では決まらない。
