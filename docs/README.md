# 文書の地図

各行の文書が、その内容の正本である。

- [scope.md](scope.md): 対象領域と、frontmatter の `domains` に使う語彙
- [layers.md](layers.md): 置き場、`role` と `maturity`、Catalog の責務
- [experiment.md](experiment.md): Experiment の進め方と記録形式
- [evaluation.md](evaluation.md): 多観点評価の手順（任意）
- [guideline.md](guideline.md): Guideline の書式と機械検査
- [guidelines/](guidelines/README.md): 主題ごとの指針
- [principles/](principles/README.md): 検証中の原則候補
- [decisions/](decisions/): リポジトリの設計判断（ADR）
- [templates/](templates/): Experiment と Guideline の雛形
- [catalog-publishing.md](catalog-publishing.md): Catalog の公開手順
- [../apps/catalog/README.md](../apps/catalog/README.md): Catalog の画面の設計判断
- [../skills/README.md](../skills/README.md): UI/UX 固有 Skill の一覧と読み込み経路

## ADR

ADR は次のどれかを変える判断だけに書く。

- ディレクトリ構成と置き場
- ツールチェーン、外部依存、公開基盤
- 記録形式（Experiment、Guideline、ADR、token）
- token の階梯と値

それ以外は対象の記録に書く。
Experiment は README の Decision と Rejected reasons、Guideline の改稿は commit message、Catalog の画面は `apps/catalog/README.md`、Skill の手順は `SKILL.md` に書く。
どこでも却下した案と理由を残す。

ファイル名は `YYYY-MM-DD-<slug>.md` にし、見出しに `状態`、`日付`、`参照` を置き、本文は背景、決定、却下した案、影響の 4 節にする。
判断を変えるときは新しい ADR を書き、古い ADR の見出しに `置き換え先:` を足す。
決定の過半が置き換わったら古い ADR の `状態` を `Superseded` にする。
