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
