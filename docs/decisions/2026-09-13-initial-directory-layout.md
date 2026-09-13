# 初期ディレクトリ構成を決める

- 状態: Accepted
- 日付: 2026-09-13
- 参照: [Issue #1](https://github.com/salan70/uiux-numa/issues/1)
- 補足: `platforms/` の作成時期は [Web 実行基盤の ADR](2026-09-13-web-runner.md) で「最初の Web Experiment」に改めた。
- 補足: テンプレートは `docs/templates/<kind>/` に置く。[Experiment format の ADR](2026-09-13-experiment-format.md) で決めた。

## 背景

Issue #1 で初期ディレクトリ案を示し、実装開始前に必要性を再確認するとした。
空ディレクトリや boilerplate を先に大量作成しないことは non-goal として定めた。
[3 層構成](../layers.md)に対応する置き場を確定する必要がある。

## 決定

トップレベルの構成を次のとおり定める。

```text
uiux-numa/
├── apps/
│   └── catalog/        # Catalog サイト
├── experiments/        # Lab: Experiment
├── patterns/           # Knowledge: Pattern と anti-pattern
├── docs/               # Knowledge: 運用文書、原則、評価、設計判断
│   ├── principles/
│   ├── evaluation/
│   └── decisions/
├── tokens/             # Assets: Design Tokens
├── design-systems/     # Assets: Design System
├── skills/             # Assets: UI/UX 固有 Skill の正本
├── platforms/          # 各プラットフォームの実行基盤
├── flake.nix
├── justfile
└── README.md
```

各ディレクトリの役割と作成時期は次のとおり。

| ディレクトリ      | 層        | 役割                                                                                | 作成時期                    |
| ----------------- | --------- | ----------------------------------------------------------------------------------- | --------------------------- |
| `experiments/`    | Lab       | 1 Experiment を 1 ディレクトリに閉じ、variant と記録を同居させる                    | 最初の Experiment           |
| `patterns/`       | Knowledge | Experiment から抽出した Pattern と anti-pattern                                     | 最初の Pattern              |
| `docs/`           | Knowledge | 運用文書は直下、原則は `principles/`、評価は `evaluation/`、設計判断は `decisions/` | 本決定で作成                |
| `tokens/`         | Assets    | canonical token source                                                              | Design Tokens foundation    |
| `design-systems/` | Assets    | Pattern から昇格した Design System                                                  | 昇格時                      |
| `skills/`         | Assets    | UI/UX 固有 Skill の正本                                                             | UI/UX agent skills          |
| `platforms/`      | 基盤      | Experiment を動かすアプリ殻や共通設定                                               | Web 以外の最初の Experiment |
| `apps/catalog/`   | 基盤      | Catalog サイト                                                                      | Catalog MVP                 |

- ディレクトリは最初の中身ができた時点で作る。空ディレクトリや `.gitkeep` を先に置かない。
- `docs/principles/` も最初の原則ができた時点で作る。
- `platforms/` と `apps/` は 3 層の外に置く実行基盤とする。
- 各 Experiment の実装は `experiments/<name>/` 内に閉じる。`platforms/` には Experiment 固有の実装を置かない。
- dotfiles 由来の共通 Skill は `.claude/skills/` に配備し、`skills/` と混ぜない。

## 却下した案

- 対象領域ごとのディレクトリ: 領域は Experiment の metadata で表す。分類を固定するとディレクトリ移動が頻発する。
- 空ディレクトリを先に全部作る: Issue #1 の non-goal。中身のない構成は判断の材料にならない。
- `platforms/` の削除: 実行基盤の置き場が `apps/` と混ざる。役割を実行基盤に限定して残す。
- `docs/adr/` の命名: dotfiles の `docs/decisions/` と揃える。

## 影響

後続 Issue はこの構成を前提にディレクトリを作る。
構成を変える場合は新しい ADR を追加する。
