# 出典

- 上流: [emilkowalski/skills](https://github.com/emilkowalski/skills)
- 元 Skill: `skills/animate/`（補助 `RECIPES.md`）
- 採用コミット: `85e8e2363b713506e1d5b6e07a0eb2da66be1bc3`（実装時の `HEAD` と同じ）
- ライセンス: MIT。著作権は Emil Kowalski。全文は `LICENSE`
- 派生の判断: `docs/decisions/2026-09-20-emil-skill-derivation.md`

## 変更理由

- キーボード禁止と 300ms 上限を必須にしない。頻度と目的で検証する。
- 未導入 Skill を呼び出さず、既存 Experiment とトークンへ向ける。
- 実験では動きの候補を複数残して根拠を書く。
- 並行する easing token を新設しない。
