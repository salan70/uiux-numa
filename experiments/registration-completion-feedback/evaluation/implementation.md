# implementation レビュー: 登録完了の遷移とフィードバック

- 観点: implementation
- 対象: no-skill-replace、no-skill-confirm、no-skill-next、with-skill-replace、with-skill-confirm、with-skill-next
- 入力: README、variants/、previews/、docs/evaluation/axes.md
- 担当した軸: implementation cost、perceived performance

## 判定

| 軸                    | no-skill-replace | no-skill-confirm | no-skill-next | with-skill-replace | with-skill-confirm | with-skill-next |
| --------------------- | ---------------- | ---------------- | ------------- | ------------------ | ------------------ | --------------- |
| implementation cost   | 許容             | 許容             | 許容          | 許容               | 許容               | 許容            |
| perceived performance | 保留             | 保留             | 保留          | 保留               | 保留               | 保留            |

## 観察

- 6 案とも追加 npm 依存はない。`just web-check`（`tsc --noEmit`）は通過した。
- Typography token と wasabi ライトの役割を CSS 変数として写している。
- 検証規則は on-submit と同じ関数を各ディレクトリに複製している。Brief の共有禁止に沿う。
- Skill なしセッションは 36 ターン、4.31 USD。Skill ありは 66 ターン、6.01 USD。3 案ずつ作る作業量としては増加した。
- 疑似待ちは 800ms または 900ms の固定である。体感速度の実測はない。
- `reviewing-motion` の指摘表は生成物に含まれない。評価は担当者が後から行った。

## 論点

- ターン増を Skill の確認手順の効果と見るか、コスト増と見るか。
