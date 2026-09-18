# CLAUDE.md

このファイルは Claude Code、Codex、Cursor 共通の指示の正本です。
`AGENTS.md` は本ファイルへの symlink です。片方だけを編集しないでください。

## プロジェクト

uiux-numa は UI/UX とプロダクト体験を探索する R&D リポジトリです。
AI エージェントで実験を反復し、成果を個人開発へ再利用できる形に育てます。
思想と責務は README に定義します。
対象領域、3 層構成、Experiment lifecycle、評価方針は `docs/` に定義します。

## クイックリファレンス

開発環境は Nix flake + direnv で固定します。初回は `direnv allow` を実行してください。
コマンドは justfile が唯一の定義元です。`flake.nix` はツールチェーンの固定だけを担います。

```bash
nix develop     # direnv 未設定の場合の devShell
just            # コマンド一覧（just --list）
just setup      # pre-commit フックの導入
just lint       # pre-commit を全ファイルへ適用
just format     # Markdown / JSON / YAML の整形
```

ツールチェーンは direnv 済みシェルか `nix develop -c <cmd>` で呼び出します。
グローバル PATH のバイナリは使いません。

## AI 資産

- 共通 Skill: `.claude/skills/`（`syncing-ai-assets` で配備する）
- Skill の正本: dotfiles の `ai-assets/skills/`
- UI/UX 固有 Skill の正本: `skills/`（成熟度と改善手順は `skills/README.md`）
- UI/UX 固有 Skill の読み込み経路: `.claude/skills/<name> -> ../../skills/<name>` の symlink
- Codex / Cursor 用 Skill: `.agents/skills -> ../.claude/skills`
- Codex / Cursor 用指示: `AGENTS.md -> CLAUDE.md`
- 個人設定、MCP、plugin、runtime 設定は配布しない
- `.claude/` と `.agents/` は lint と format の対象外にする。整形すると正本との差分が生まれ、再同期で衝突する。

## プロジェクト固有ルール

- 文書、Issue、PR、commit message は日本語で書く。コード識別子とコマンドは英語表記を維持する。
- Skill で定義済みの手順をこのファイルへ転記しない。Skill 名で参照する。
- 依頼スコープ外の「ついでに改善」を禁止する。
- 将来の仮想要件に備えたコードを禁止する。
- 採用理由だけでなく却下理由も記録する。リポジトリの設計判断は `docs/decisions/` の ADR に残す。Experiment と Pattern の判断は各記録に残す。

## Git 運用

main へ直接 commit と push を行います。feature branch は任意です。
手順と commit 規約は `git-operations` に従います。
GitHub 操作は `collaborating-on-github` に従います。

## 完了条件

実装依頼では、依頼範囲の変更と関連検証まで続けます。
将来の変更で参照する設計判断は、必要に応じて ADR または設計文書へ残します。
適用、merge、未依頼の外部操作は自動実行しません。

## 文章規範

- 結論と必要な行動を先に書き、前置き、賛辞、定型の報告枠を使わない。
- 承認依頼、失敗、未完了、破壊的操作の予告は必ず明示する。
- 静的な Markdown は 1 文 1 行で書く。Issue、PR、コメント、回答は段落内で改行しない。
- 文章の基準と推敲手順は `concise-writing` に従う。
