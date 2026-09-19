# 出典

- 上流: [emilkowalski/skills](https://github.com/emilkowalski/skills)
- 元 Skill: `skills/prototype/`
- 採用コミット: `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3`（実装時の `HEAD` と同じ）
- ライセンス: MIT。著作権は Emil Kowalski。全文は `LICENSE`
- 派生の判断: `docs/decisions/2026-09-20-emil-skill-derivation.md`

## 変更理由

- 専用 picker を作らず、`platforms/web` で named variant を実サイズ比較する。
- 採用後に試作を削除せず、Experiment に残す。
- 1 部品への縮小より Brief を優先する。
- 独自の計画ファイルを増やさず、Issue と Experiment 記録を使う。
