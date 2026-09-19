# UI/UX 固有 Skill

このディレクトリは UI/UX 固有 Skill の正本である。
dotfiles 由来の共通 Skill は `.claude/skills/` に配備し、ここと混ぜない。
置き場と読み込み経路の判断は [ADR](../docs/decisions/2026-09-18-uiux-skill-source-and-principles.md) に残す。

## 一覧

| Skill          | 成熟度         | 用途                                                         |
| -------------- | -------------- | ------------------------------------------------------------ |
| `crafting-svg` | `experimental` | SVG のアイコン、ロゴ、イラストを制作、比較、改善、最適化する |

成熟度の意味は次のとおり。

- `experimental`: 制作手順の試作。Pattern から昇格した Asset ではない。Issue の Experiment で使いながら改善する。
- `promoted`: Pattern lifecycle の昇格の条件を満たし、ADR で昇格を決めた。

## 読み込み経路

Claude Code は `.claude/skills/<name>` だけを読む。
正本を動かさずに読ませるため、`.claude/skills/<name> -> ../../skills/<name>` の相対 symlink を git で管理する。
Codex と Cursor は `.agents/skills -> ../.claude/skills` を経由して同じ Skill を読む。
`syncing-ai-assets` は正本にない local Skill を変更しないため、symlink は同期で消えない。

新しい Skill を追加する手順は次のとおり。

1. `skills/<name>/SKILL.md` と `references/` を作る。frontmatter は `name` と `description` だけにする。
2. `ln -s ../../skills/<name> .claude/skills/<name>` で symlink を作り、`git add` する。
3. この一覧に成熟度と用途を書く。

## 使い方

Claude Code では `/crafting-svg` と入力するか、要求文に SVG の制作を書けば Skill が読み込まれる。
新しいプロセスで確かめるには、リポジトリのルートで次を実行する。

```bash
nix develop -c claude -p "/crafting-svg <要求文>" --permission-mode acceptEdits --allowedTools "Bash(just *)"
```

Skill から他の文書へは、リポジトリのルートからのパスを文字列で書く。
symlink 経由では相対リンクの解決先がずれるためである。

## 改善手順

1. Experiment で Skill を使い、README に反復の記録と未解決の点を残す。
2. 反復の記録で繰り返し参照された知識と、参照されなかった知識を数える。使われない項目は削るか、適用場面を書き直す。
3. 落とし穴（検査で拾えず、描画で初めて分かる失敗）を `SKILL.md` の落とし穴に足す。
4. 原則候補が `adopted` になったら、参照資料から採用済みとして参照する。`rejected` になったら参照を外す。
5. 同じ要求文とモデルで Skill なしの実行と比べ、効果と限界を `skills/README.md` に書き足す。

Skill なし実行との比較は、Experiment `experiments/hako-feature-icons/` の Variants と Learnings に記録する。

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
