# 名前で選ぶ variant と、評価を経ない判断の記録を決める

- 状態: Accepted
- 日付: 2026-09-17
- 参照: [Experiment の記録形式](../experiment-format.md)、[Experiment 記録形式の ADR](2026-09-13-experiment-format.md)、[color-schemes](../../experiments/color-schemes/README.md)

## 背景

Experiment `color-schemes` で、記録形式に定めのない扱いが 3 つ生じた。

- 利用者は、配色を和名（わさび、ゆずなど）で保持することを求めた。variant-id の規則「変えた軸が分かる名前」とは合わない。
- 最初の 4 variant は、既製の配色に見えるという人間の判断で、評価の前に却下した。記録形式は、評価の後の却下だけを想定していた。
- 利用者は色見本と preview を見て、多観点の評価を経ずに 10 variant の採用を判断した。Evaluation 節は `evaluation.md` へのリンクを前提にしていた。

## 決定

- variant を名前で選ぶ選択肢として残す場合は、その名前を variant-id にしてよい。変えた軸は Variants の表に書く。
- 評価の前に却下した variant も `variants/` と表に残す。仮説の先頭に `却下:` と書き、評価の対象に含めない。理由、判断者、判断日は Rejected reasons に書く。
- 人間は評価を経ずに判断してよい。その場合は、評価を行っていないことと判断の根拠を Evaluation に書き、未評価の軸を Decision に書く。
- Decision では複数の variant を採用してよい。
- 詳細は [Experiment の記録形式](../experiment-format.md) に反映した。

## 却下した案

- variant-id を軸の名前にし、和名は表だけに書く: 利用者は和名で配色を選ぶ。呼び名と id が分かれると、variant、preview、将来の token の対応を追いにくい。
- 評価の前に却下した variant を削除する: 却下した案も学習材料として残す方針（[Lab / Knowledge / Assets](../layers.md)）に反する。既定パレットに寄った配色は、anti-pattern の根拠になる。
- 評価の前に却下した variant を別の節や別のディレクトリに分ける: variant の一覧が 2 か所に分かれる。表の中で `却下:` の接頭辞により区別できる。
- 評価を必須にし、評価を経ない判断を認めない: 最終判断は人間が行う方針に反する。評価を行っていない事実を記録すれば、判断の根拠は追える。

## 影響

- `color-schemes` の README は、この決定に沿って記録した。
- [Pattern lifecycle](../pattern-lifecycle.md) は、Accessibility considerations の根拠に evaluation の観察を使う。そのため、評価を経ずに判断した Experiment から Pattern を抽出するときは、必要な評価を先に行う。
