# UI/UX 固有 Skill の正本と読み込み経路、原則候補の記録形式を決める

- 状態: Accepted
- 日付: 2026-09-18
- 参照: [Issue #7](https://github.com/salan70/uiux-numa/issues/7)、[初期ディレクトリ構成](2026-09-13-initial-directory-layout.md)、[Pattern lifecycle](../pattern-lifecycle.md)、[Lab / Knowledge / Assets](../layers.md)

## 背景

Issue #7 は、SVG を制作する Skill の正本を本リポジトリに置き、同期済みの共通 Skill を上書きせずに読み込み経路を設けることを求めている。
初期ディレクトリ構成の ADR は `skills/` を UI/UX 固有 Skill の正本とし、dotfiles 由来の共通 Skill は `.claude/skills/` に配備して混ぜないと決めている。
Claude Code は `.claude/skills/<name>` だけを読み、symlink でもよい。
Pattern lifecycle は、Skill への昇格を `validated` な Pattern と ADR を前提にしている。
一方で Issue #7 の Skill は、Pattern から昇格した知見ではなく、制作の手順と道具を束ねた試作である。
独自の原則候補（仮説、適用条件、作例、必要な値、例外、検証結果）の置き場と形式も決まっていない。

## 決定

- UI/UX 固有 Skill の正本は `skills/<name>/` に置く。最初の Skill は `skills/crafting-svg/` とする。
- 読み込み経路は `.claude/skills/<name> -> ../../skills/<name>` の相対 symlink にし、git で管理する。既存の `.agents/skills -> ../.claude/skills` を経由して Codex と Cursor にも届く。
- `syncing-ai-assets` は正本にない local Skill を変更しないため、symlink は同期で消えない。dotfiles 側の registry には登録しない。
- Skill から他の文書を参照するときは、相対リンクではなくリポジトリルートからのパスを文字列で書く。symlink 経由では相対リンクの解決先がずれるためである。
- `skills/` はトップレベルにあるため、lint と format の対象にする。`.claude/` の除外は変えない。
- `crafting-svg` は Pattern から昇格した Asset ではなく、制作手順の試作である。成熟度は `skills/README.md` に `experimental` と記録する。Pattern から Skill への昇格の条件と手順は変えない。
- 独自の原則候補は `docs/principles/<slug>.md` に置く。形式と status（`candidate`、`adopted`、`rejected`）と改善手順は `docs/principles/README.md` に定める。
- 原則候補は AI エージェントが書いてよい。採否は人間が決め、判断者と判断日を記録する。
- Skill の references は、原則候補を「候補（未検証）」として参照し、検証済みの知見と区別する。

## 却下した案

- `.claude/skills/` に実体を置く: dotfiles 由来の vendor 資産と混ざり、lint と format の対象外になる。
- `experiments/` の配下に Skill を置く: Experiment の記録形式に合わず、複数の Experiment から使う Skill の置き場にならない。
- 正本を `.claude/skills/` にコピーして同期する: 二重管理になり、同期のたびに差分が生まれる。
- Skill を Pattern の昇格として扱う: 由来 Experiment も `validated` な Pattern もまだない。制作手順の試作を昇格と呼ぶと、Pattern lifecycle の条件が形骸化する。
- 原則候補を `patterns/` に置く: Pattern は再利用できる UI の解決策で、抽出には人間の確認が要る。原則候補は印象と表現と手順を結ぶ仮説で、粒度が異なる。
- 原則候補を Skill の references に直接書く: Knowledge 層の正本が Assets 層に置かれ、層の定義に反する。

## 影響

- `skills/` と `docs/principles/` をこの Issue で作る。空ディレクトリを先に置かない方針に従い、最初の中身と同時に作る。
- 新しい UI/UX 固有 Skill を追加するときは、同じ symlink の経路を使い、`skills/README.md` に成熟度を書く。
- 原則候補が `adopted` になっても、Pattern や Asset への昇格は別に判断する。
