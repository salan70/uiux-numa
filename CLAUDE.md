# CLAUDE.md

Claude Code、Codex、Cursor 共通の指示の正本。
`AGENTS.md` はこのファイルへの symlink なので、片方だけを編集しない。

## プロジェクト

uiux-numa は UI/UX とプロダクト体験を AI エージェントで探索し、成果を個人開発へ再利用する R&D リポジトリである。
文書の地図と ADR を書く基準は `docs/README.md` にある。

## 開発環境

- Nix flake と direnv で固定する。ツールチェーンは direnv 済みシェルか `nix develop -c <cmd>` で呼び、グローバル PATH のバイナリを使わない。
- コマンドの定義元は justfile だけである。一覧は `just`、検証は `just lint`。

## AI 資産

- 共通 Skill は dotfiles の `ai-assets/skills/` が正本で、`syncing-ai-assets` で `.claude/skills/` へ配備する。
- UI/UX 固有 Skill は `skills/` が正本で、一覧と読み込み経路は `skills/README.md` にある。
- Codex と Cursor は `.agents/skills -> ../.claude/skills` と `AGENTS.md -> CLAUDE.md` で同じものを読む。
- `.claude/` と `.agents/` は lint と format の対象外にする。整形すると正本との差分が生まれ、再同期で衝突する。
- 個人設定、MCP、plugin、runtime 設定は配布しない。

## ルール

- 文書、Issue、PR、commit message は日本語で書く。コード識別子とコマンドは英語のままにする。
- 文書と Skill の読者は Opus 5.5 相当のモデルとし、言わなくても結果が変わらない説明を書かない。
- Skill にある手順をこのファイルへ転記しない。Skill 名で参照する。
- 依頼スコープ外の「ついでに改善」をしない。将来の仮想要件に備えたコードを書かない。
- 採用理由と却下理由を記録する。記録先は `docs/README.md` の ADR の節に従う。
- 静的な Markdown は 1 文 1 行で書く。文章の基準は `concise-writing` に従う。

## Git

- main へ直接 commit と push する。feature branch は任意。手順と commit 規約は `git-operations`、GitHub 操作は `collaborating-on-github` に従う。
- 実装依頼では、依頼範囲の変更と関連する検証まで続ける。
- 適用、merge、未依頼の外部操作は自動実行しない。
