# Flutter の実行基盤に、端末の枠の外の操作盤を置く

- 状態: Accepted
- 日付: 2026-09-30
- 参照: [Flutter 実行基盤の ADR](2026-09-28-flutter-runner.md)、`experiments/baseball-journey-app/`

## 背景

Baseball Player Journey の UI を確かめる利用者が、各画面へすぐ移れるメニューを、端末の枠の外に置くよう求めた。
起動の query `route` で画面を開けるが、URL を書き換えるたびに読み込み直しになり、行き先の名前も覚えておく必要があった。
最初は端末の状態バーの位置に札を置いたが、端末の中に試作以外の UI が混ざる。

## 決定

- variant の `index.dart` は、`buildVariant` に加えて任意の top-level 関数 `Widget buildPanel()` を持てる。
- `scripts/build-flutter-registry.mjs` は `buildPanel` を見つけたら `VariantEntry` の `panel` に渡す。
- 実行基盤は、端末の枠を描き、窓に端末と操作盤（幅 320）を並べる余裕があるときだけ、枠の右に操作盤を描く。`bare=1` と `compare` では描かない。
- 操作盤と variant の状態の受け渡しは variant の責務にする。実行基盤は操作盤を置く場所だけを持つ。

## 却下した案

- 端末の中に札やメニューを重ねる: 実装は variant の中で閉じるが、試作の UI と確かめるための UI が混ざり、状態バーの位置も塞ぐ。
- 実行基盤が URL の query を書き換えて読み込み直す汎用のメニュー: variant ごとの行き先を実行基盤が知る仕組みが要り、読み込み直しで数秒待つ。
- 実行基盤に variant と共有する状態の型を置く: 受け渡しは速いが、実行基盤の責務が「列挙して描く」から広がり、experiments が実行基盤に依存する。

## 影響

- `docs/experiment.md` に `buildPanel` の置き方を足した。
- 最初の利用は `baseball-journey-app` の `diamond` で、操作盤から配色、データ、行き先を選ぶ。
- 窓が狭いと操作盤は出ない。
