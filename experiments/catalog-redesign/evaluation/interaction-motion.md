# interaction / motion レビュー: Catalog の visual direction

- 観点: interaction / motion
- 対象: precision-keyboard、quiet-hierarchy、playful-chroma
- 入力: README、variants/、docs/evaluation/axes.md、crafting-motion
- 担当した軸: discoverability、interaction clarity、motion appropriateness

## 判定

| 軸                     | precision-keyboard                                     | quiet-hierarchy                      | playful-chroma                               |
| ---------------------- | ------------------------------------------------------ | ------------------------------------ | -------------------------------------------- |
| discoverability        | 良い: キー短絡が次操作を示す                           | 許容: リンクは見える。短絡は無い     | 許容: カードは押せる。ホバーが手がかり       |
| interaction clarity    | 良い: 選択、⌘K、Escape、status が対応する              | 許容: 通常のボタン遷移               | 許容: ホバー移動はポインタ前提               |
| motion appropriateness | 許容: 120ms の背景と影。頻度は高いが一瞬。reduced 対応 | 良い: 動かさない。透明度のホバーのみ | 許容: ホバー scale。完了コピーは稀な操作向け |

## 観察

### precision-keyboard

- 一覧の切替は 1 日に数十回を超える想定なので、位置移動はほぼ無い。
- 送信トグルは稀なので status 文言を出す。目的はフィードバックである。

### quiet-hierarchy

- 画面切替に transform を使わない。目的が置けないため動かさない。
- ホバーは透明度だけである。

### playful-chroma

- ホバーは `translateY(-2px) scale(1.02)`。`hover: hover` かつ `pointer: fine` で囲んだ。
- reduced motion では transform を止める。

## 論点

- 公開面でコマンドパレットのフォーカストラップを必須にするか。
