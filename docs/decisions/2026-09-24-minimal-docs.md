# 規約と記録を、使われている形だけに組み直す

- 状態: Accepted
- 日付: 2026-09-24
- 参照: [文書の地図](../README.md)、[experiment.md](../experiment.md)、[guideline.md](../guideline.md)、[evaluation.md](../evaluation.md)、[layers.md](../layers.md)
- 置き換え元: [判断履歴の記録先](2026-09-13-decision-records.md)の Pattern の行と ADR の対象、[削除の ADR](2026-09-21-prune-decided-experiments.md)の `docs/records/` の条項、[掲載しない Experiment の ADR](2026-09-22-unlisted-experiments.md)の対象件数

## 背景

作成から 11 日で、`docs/` と `skills/` の散文が約 10,900 行になり、`experiments/` のコードと同じ規模になっていた。
過剰設計の調査で次が分かった。

- ADR が 51 本あり、commit の 3 割が ADR を触っていた。後で参照する構造の判断は 20 本ほどで、残りは Catalog の画面、Guideline の改稿、1 行の設定変更の記録だった。同日に 3〜5 本が順に前の本を置き換える連鎖が 5 系統あった。
- Pattern lifecycle（257 行、参照 30 箇所）の対象となる `patterns/` と `design-systems/` は存在せず、Experiment の status `extracted` の使用は 0 件だった。実際に Experiment をまたぐ知見の置き場になっていたのは `docs/principles/` だった。
- 17 軸 7 観点の多観点評価を使った Experiment は 18 件中 2 件で、9 月 19 日以降は 0 件だった。
- `docs/records/`（2,378 行）は削除した Experiment の README の丸写しで、Guideline の `- 実験:` のリンク先になる以外に用途が無かった。
- `asset-model.md` の `stable`、`deprecated`、他プロジェクトでの利用手順は使用実績が無く、同じ説明が README、`layers.md`、ADR に分散していた。
- Guideline の frontmatter `axes` は解析器が 17 軸との一致を検査するが、画面にも Skill にも消費先が無かった。
- `skills/README.md` の 179 行のうち約 120 行が日付付きの動作確認ログと費用表だった。

利用者は、既存の構成にとらわれず、AI と人間の双方にとって必要最低限の運用に組み直すことを求めた。

## 決定

書き手が対象ごとに何を決めるかから規約を導き直し、次の形にする。

| 対象             | 決めること                                   | 記録先                             |
| ---------------- | -------------------------------------------- | ---------------------------------- |
| Experiment       | 課題、variant、判断、却下理由                | `experiments/<slug>/README.md`     |
| 評価（任意）     | 軸、重み、観点別の判定                       | `experiments/<slug>/evaluation.md` |
| Guideline        | 主題の思想と場面ごとの規則                   | `docs/guidelines/<slug>.md`        |
| 原則候補         | 検証中の仮説と検証結果                       | `docs/principles/<slug>.md`        |
| token            | 階梯と値                                     | `tokens/<family>/` と ADR          |
| Skill            | 手順と落とし穴                               | `skills/<name>/SKILL.md`           |
| Catalog の画面   | 画面に閉じた判断                             | `apps/catalog/README.md`           |
| リポジトリの構造 | ディレクトリ、ツールチェーン、記録形式、公開 | `docs/decisions/`                  |

- ADR は上の「リポジトリの構造」に当たる判断だけに書く。基準は [文書の地図](../README.md#adr) に置く。
- `docs/experiment-lifecycle.md` と `docs/experiment-format.md` を `docs/experiment.md` に統合し、`docs/guideline-format.md` を `docs/guideline.md` に、`docs/evaluation/` の 3 文書を `docs/evaluation.md` に畳む。`docs/asset-model.md` は `docs/layers.md` の 2 表にする。
- Pattern lifecycle、`patterns/`、`design-systems/`、Experiment の status `extracted`、README の節 `Related patterns / assets` を廃止する。節は `Related` にする。Experiment をまたぐ知見は `docs/principles/` で持つ。
- 評価は任意にする。README の Evaluation には、評価したか、しなかったなら何を見て判断したかを書く。
- `docs/records/` を廃止する。削除した Experiment を出どころにするリンクは、削除前の commit への permalink にする。
- Guideline の frontmatter から `axes` を外し、解析器の検査も外す。`adopted` の判断は commit message に書く。
- 原則候補の `判断` 節は `candidate` のうちは省いてよい。
- `skills/README.md` は一覧、読み込み経路、追加手順だけにする。
- Catalog の画面に閉じた ADR 16 本は `apps/catalog/README.md` の表へ移す。Guideline の改稿記録 7 本と、記録形式の補足 3 本は下の表に要点を残して削除する。原文は commit `5215a3c` の `docs/decisions/` にある。

## 却下した案

- ADR の見出し表記の統一と Superseded の付け直しだけ行う: 本数が減らず、切り出しの基準が無いままでは同じ形で増える。
- 既存 ADR を残し、基準だけ決めて新規分を止める: 51 本の中から効く 20 本を探す負担が残る。移す先（Catalog の README と本 ADR の表）が用意できるので、今回まとめて移す。
- `docs/records/` を Decision と Rejected reasons だけの短縮版にする: 短縮版の保守が残る。permalink は保守が要らず、README の全文が読める。
- 原則候補を Guideline の Tips へ吸収する: 原則候補は Skill 3 本と Experiment 5 件から参照され、Guideline より粒度が細かい。境界は「検証中か、採用済みか」で足りる。
- Pattern lifecycle を最初の Pattern が出るまで残す: 11 日間で 18 Experiment を経て 1 件も出ず、代わりに原則候補が 6 件出た。要るときに原則候補から導けばよい。
- 評価の軸を使われた 11 軸に減らす: Skill が motion appropriateness などを名指ししており、軸の一覧は 1 行ずつなら 17 行で済む。減らすのは目安の 3 段階の記述にした。
- `maturity` を `experimental` と `candidate` の 2 値にする: Catalog の検証コードが 4 値を持ち、docs と食い違う。4 値のまま表を 4 行にした。

## 影響

削除した ADR の要点は次のとおりである。
Catalog の画面の 16 本は [apps/catalog/README.md](../../apps/catalog/README.md) にある。

| 日付       | 判断                                                                                    | 理由                                                                    | 却下した案                                                                                      |
| ---------- | --------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| 2026-09-13 | Pattern は `patterns/<slug>/README.md` だけで記録し、抽出と昇格は人間が判断する（廃止） | Experiment をまたぐ知見の正本を 1 つにする                              | 閾値で自動昇格すると再利用価値の文脈を無視する                                                  |
| 2026-09-17 | 名前で選ぶ variant は名前を id にし、評価前の却下と評価を経ない判断も記録する           | 呼び名と id が分かれると対応を追えない                                  | 評価の必須化は人間の最終判断に反する                                                            |
| 2026-09-21 | ボタンは文脈で分かる対象を省き 2〜8 字にする                                            | 対象を毎回書くと語の差が役割の差より目立つ                              | 「変更を保存」は文脈で分かる対象まで繰り返す                                                    |
| 2026-09-21 | コアに主題全体へ効く数値を許し、UX Writing の 1 文 50 字をコアに上げる                  | 数値があればコアを守れたかを確かめられる                                | 1 文 40〜60 字は出典をたどれない                                                                |
| 2026-09-22 | Design Principles を視覚設計で決める場面から Core 4 件と Tips 8 件へ再設計する          | 旧稿の一律の数値や形の制限は全画面へ適用する根拠が無い                  | 余白差 1.5 倍や 8px 倍数は出典が無い。基準線 2 本は多列の表や RTL を排除する                    |
| 2026-09-22 | 横断レビュー R01〜R20 を判定し、採用済みの値を変えず条件と例外の明確化として反映する    | 指摘の多くは値ではなく、普遍的な閾値に読める点と例外の欠落だった        | 全ガイドラインの優先順位表は文書間の衝突を対象と条件で解けばよい                                |
| 2026-09-22 | Information Architecture をコア 4 件と Tips 10 件へ 0 から組み直す                      | 既存 Tips を縮めると偏りが残り、コアの数値に一次資料が無かった          | 「階層 3 段」「7 件まで」は根拠となる研究の誤用                                                 |
| 2026-09-22 | 画面文言の表記を Japanese Notation として定め、日付は `2026.09.22` にする               | 文書と画面で基準が 1 つになる                                           | 日本語と英数字の間に空白を入れない案は concise-writing から離れる                               |
| 2026-09-22 | 多色 SVG の原本は `currentColor` の単色線画にし、色は利用画面の part で与える           | 色の差だけで領域を意味付けすると面に溶ける配色が生まれる                | hex を焼くと領域を個別に差し替えられない。SVG 内の `var()` は svg-check と resvg で描画できない |
| 2026-09-22 | UX Writing を部品と状態の文言に絞り、コア 5 件と Tips 8 件へ組み直す                    | 画面外まで含めると 8 件に収まらず、既存 Tips はコアの言い換えが多かった | 体言止め統一は「続ける」を漢語に置き換える                                                      |

- `apps/catalog/src/content/guidelines.ts` から `axes` の検査を外し、`parseFrontmatter.ts` から `extracted` を外す。
- 13 Experiment の README の節 `Related patterns / assets` を `Related` にする。
- Guideline と原則候補の `docs/records/` へのリンクは commit `5215a3c` の permalink にする。
- `docs/templates/` は `experiment.md` と `guideline.md` の 2 ファイルにする。
- 残す ADR のリンク切れは直す。本文の判断は変えない。
