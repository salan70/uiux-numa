# 判断履歴の記録先を決める

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #1](https://github.com/salan70/uiux-numa/issues/1)

## 背景

コード差分は Git に残るため、このリポジトリでは「なぜその判断をしたか」を特に重視して記録する。
採用理由だけでなく却下理由も残す。
CLAUDE.md は記録先の決定を Issue #1 へ委ねていた。
将来は判断履歴から UI/UX の嗜好や原則を抽出し、AI Agent が参照できる状態を目指す。

## 決定

判断の種類ごとに記録先を分ける。

| 判断の種類           | 記録先                                | 必須項目                      |
| -------------------- | ------------------------------------- | ----------------------------- |
| リポジトリの設計判断 | `docs/decisions/YYYY-MM-DD-<slug>.md` | 背景、決定、却下した案、影響  |
| Experiment の判断    | 各 Experiment の記録                  | decision、rejected reasons    |
| Pattern の判断       | 各 Pattern の記録                     | when not to use、bad examples |

- ADR は dotfiles の `docs/decisions/` と同じ形式にする。
- 対象は visual design に限定せず、文章、情報構造、interaction、motion の判断も含む。
- 却下した案には理由を必ず書く。
- Experiment と Pattern の記録形式は後続 Issue で決める。この ADR は記録先と必須項目だけを定める。

## 却下した案

- GitHub Issue と PR だけに残す: リポジトリ内から検索できず、AI Agent が参照しにくい。Issue は議論の場として使い、結論はリポジトリへ写す。
- 単一の `DECISIONS.md` へ追記する: 肥大化し、Experiment の判断とリポジトリの判断が混ざる。

## 影響

CLAUDE.md の記録先の記述をこの ADR へ向ける。
Experiment format と Pattern lifecycle の Issue は、上の必須項目を形式に含める。
