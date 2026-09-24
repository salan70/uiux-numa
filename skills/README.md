# UI/UX 固有 Skill

このディレクトリは UI/UX 固有 Skill の正本である。
dotfiles 由来の共通 Skill は `.claude/skills/` に配備し、ここと混ぜない。
置き場の判断は [ADR](../docs/decisions/2026-09-18-uiux-skill-source-and-principles.md)、派生元との衝突の扱いは [Emil Skill 派生の ADR](../docs/decisions/2026-09-20-emil-skill-derivation.md) に残す。

| Skill                   | role     | maturity       | 用途                                                                |
| ----------------------- | -------- | -------------- | ------------------------------------------------------------------- |
| `crafting-svg`          | `module` | `experimental` | SVG のアイコン、ロゴ、イラストを制作、比較、改善、最適化する        |
| `exploring-ui-variants` | `module` | `experimental` | 方向の異なる UI 案を named variant として実装し、実サイズで比較する |
| `crafting-motion`       | `module` | `experimental` | 動きの可否、目的、手段、中断、reduced motion を順に設計して実装する |
| `reviewing-motion`      | `module` | `experimental` | 動きを点検する。作者所見は 1 観点であり、採用判断そのものではない   |

`role` と `maturity` の意味は [docs/layers.md](../docs/layers.md#role-と-maturity) に従う。
`exploring-ui-variants`、`crafting-motion`、`reviewing-motion` は [emilkowalski/skills](https://github.com/emilkowalski/skills) の派生で、出典の commit は各 `SOURCE.md` にある。

## 読み込み経路

Claude Code は `.claude/skills/<name>` だけを読む。
正本を動かさずに読ませるため、`.claude/skills/<name> -> ../../skills/<name>` の相対 symlink を git で管理する。
Codex と Cursor は `.agents/skills -> ../.claude/skills` を経由して同じ Skill を読む。
`syncing-ai-assets` は正本にない local Skill を変更しないため、symlink は同期で消えない。
Skill から他の文書へは、リポジトリのルートからのパスを文字列で書く。symlink 経由では相対リンクの解決先がずれる。

## 追加と改善

1. `skills/<name>/SKILL.md` と `references/` を作る。frontmatter は `name` と `description` だけにする。
2. `ln -s ../../skills/<name> .claude/skills/<name>` で symlink を作り、`git add` する。
3. 上の表に行を足す。
4. Experiment で使い、README に反復の記録と未解決の点を残す。落とし穴は `SKILL.md` に足す。
5. 派生 Skill を上流に追従させるときは、記録済み commit との差分だけを読み、衝突表に反する手順は取り込まない。`SOURCE.md` の commit を更新する。

Skill の有無による効果の比較は Experiment に記録する（`experiments/hako-feature-icons/`）。
