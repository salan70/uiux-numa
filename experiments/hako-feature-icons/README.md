---
title: Hako の機能アイコン
status: implementing
created: 2026-09-18
updated: 2026-09-18
platforms:
  - web
domains:
  - iconography
  - visual-design
  - consistency
  - accessibility
---

## Problem

Hako の LP の機能アイコン 3 個は、Feather 風の汎用のストロークをそのまま置いている。
既製に見え、Hako の性格を表していない。
AI エージェントが要求文から SVG アイコンを作る手順と知識（Skill）もなく、品質を再現できない。
この Experiment は Issue #7 の最初の実証として、次の 2 つを確かめる。

- 方向性の異なる案を作り、単体と利用画面内で比較し、改善前後を残す。
- 同じ要求文とモデルで Skill の有無を比べ、制作手法の効果と限界を記録する。

## Target

- 開発者: 個人開発で LP とアプリのアイコンを AI エージェントに依頼する。デザインの専門知識はない。
- 利用者: LP を初めて訪れ、機能の見出しとアイコンを 1 秒程度で流し読みする。アプリ内では 16px のアイコンをラベルと一緒に見る。

## Scope / Domains

対象領域は iconography、visual design、consistency、accessibility。
variant で変える軸は次の 2 つ。

- 造形の方向: 線の太さ、端点と角、塗りか線か、比喩の選び方
- 制作手法: Skill の有無、既存のアイコンをそのまま使う

意味（担当を決める、期限を知らせる、進み具合を見る）、24px の viewBox、単色、3 個 1 組は全 variant で共通にする。
利用画面のモック（`Mock.tsx`、`mock.css`）も全 variant で同一にし、`diff` で確認する。

## Constraints

- viewBox は `0 0 24 24`。単色で、fill と stroke は `currentColor` か `none` だけを使う。
- 自己完結した静的 SVG にする。`script`、外部参照、`text`、アニメーションを使わない。`just svg-check --mono --viewbox "0 0 24 24"` を通す。
- 3 個で見かけの大きさと線の太さを揃える。
- 利用画面は LP の機能セクション（40px の角丸の面の上に 24px）と、アプリ内のタスク詳細（16px、ラベル併記）。配色は color-schemes の `wasabi` のライト。
- 編集用の原本を `variants/<id>/source/`、配布用を `variants/<id>/dist/` に置く。配布用は `just svg-optimize` で作る。
- `index.tsx` は配布用を `?raw` で inline に展開する。
- モックは React + TypeScript で、追加の npm 依存を入れない。

Skill の有無を比べる variant には、次の要求文をそのまま渡す。
出力先の 1 行だけを variant ごとに置き換える。

```text
Hako は小さなチーム向けのタスク共有アプリです。その LP の機能セクションに置く機能アイコンを 3 個、1 組として SVG で作ってください。

- 機能と意味: 「担当を決める」（タスクごとに担当者を 1 人決める）、「期限を知らせる」（期限が近いタスクを前日に通知する）、「進み具合を見る」（チーム全体の完了率を週ごとに確認する）
- 利用画面: 各機能カードの見出しの上に 24px で置く。40px の角丸の面（配色 wasabi の --color-accent-subtle: #d6e9ca）の上に、--color-accent-strong（#006e54）を currentColor として受けて描く。アプリ内では 16px でも使う。
- 制約: viewBox は 0 0 24 24。単色で、fill と stroke は currentColor か none だけを使う。自己完結した静的 SVG にする（script、外部参照、text、アニメーションを使わない）。3 個で見かけの大きさと線の太さを揃える。
- 目指す印象: 小さなチームの実務に合う、落ち着いた印象。既製のアイコン集をそのまま使ったように見えないこと。
- 出力: 編集用の原本を <出力先>/source/assign.svg、deadline.svg、progress.svg として置く。配布用の最適化は行っても行わなくてもよい。最後に、造形の理由と確認した内容を報告する。
```

## Hypothesis

手順と知識（Skill）を与えると、既製のアイコン集に似た造形が減り、3 個の見かけの大きさと太さが揃い、16px でも識別できる。
造形の方向は印象を変えるが、意味の伝達は比喩の選び方に依存し、方向だけでは決まらない。
利用画面では、面の上の 24px と、ラベル併記の 16px で求められる細部の量が異なる。

## Variants

| id                | 仮説                                                                                             | 変えた軸                             | 実装                        |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------ | --------------------------- |
| `current-feather` | 基準: 既存の Feather 風の線画。既製に見え、Hako の性格を表さない                                 | 制作手法 = 既存の SVG をそのまま使う | `variants/current-feather/` |
| `no-skill`        | 基準: Skill なしでも要求文だけで実務的な組を作れるが、造形の根拠と一貫性は制作者の裁量に依存する | 制作手法 = Skill なし（`claude -p`） | `variants/no-skill/`        |

### Skill なし実行の条件

`no-skill` は、Skill `crafting-svg` がリポジトリに存在しない時点で、新しいプロセスの `claude -p` に要求文を渡して作った。

- 実行日: 2026-09-18
- モデル: `claude-fable-5-1`
- 権限: `--permission-mode acceptEdits`、`Bash` は `just`、`ls`、`cat`、`mkdir`、`resvg`、`svgo`、`xmllint`、`file` だけを許可
- 環境: リポジトリのルートで `nix develop -c` 経由。`CLAUDE.md`、この README、`current-feather`、`scripts/`、SVG 制作の ADR を読める状態
- 結果: 79 ターン、約 19 分、費用 7.35 USD。ツール呼び出し 77 回（Bash 41、Read 23、Write 12、Edit 1）
- session_id: `08f5138b-b6b2-4a03-b068-7ece1ae05fa9`

実行の記録から分かった行動は次のとおり。

- 既存の README、`current-feather`、`scripts/` の 3 本、SVG 制作の ADR を読み、`part-<asset>-<role>` の id と `role="img"` の規約を自力で採用した。
- `just svg-sheet` で 16、24、48px を描画し、3 回反復した。resvg で利用画面の色を再現した比較画像も作った（規則外の名前だったため保存していない）。
- Chrome での利用画面の撮影と `index.tsx` は作らなかった。`index.tsx` と in-context の preview は、担当者が同じモックで後から加えた。
- `just svg-check --viewbox` の引数が分割される不具合を報告した。recipe を修正した。

`no-skill` の造形の理由（実行の報告から要約）は次のとおり。

- stroke 1.5、round の端点。24px で線が軽く、16px で 1px になる。基準の Feather 風（2px）より細くして落ち着きに寄せた。
- 各アイコンに塗りの要素を 1 つだけ置き、「線画 + 1 点の塗り」で組として見せる。
- assign: 塗りの頭と左右対称の肩の弧に、右上のチェックで「決まった」を示す。deadline: 縁の線で閉じた鐘と塗りの舌。progress: 台の線に立つ 3 本のバーで、今週だけ塗り。高さは等間隔を避けて電波表示と区別した。
- 却下した案: 肩の弧をチェックへ続ける形（48px で波に見えた）、呼び鈴（縦長だとランプに見え、平たいと組の大きさが揃わない）、カレンダー + 日付の点（「知らせる」が消える）、折れ線と円グラフ（推移か完了率のどちらかが落ちる）。

## Evaluation

未定

## Decision

未定

## Rejected reasons

未定

## Learnings

未定

## Related patterns / assets

なし
