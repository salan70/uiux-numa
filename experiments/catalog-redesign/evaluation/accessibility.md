# accessibility レビュー: Catalog の visual direction

- 観点: accessibility
- 対象: precision-keyboard、quiet-hierarchy、playful-chroma
- 入力: README、variants/、docs/evaluation/axes.md
- 担当した軸: accessibility

## 判定

| 軸            | precision-keyboard                                                   | quiet-hierarchy                    | playful-chroma                                 |
| ------------- | -------------------------------------------------------------------- | ---------------------------------- | ---------------------------------------------- |
| accessibility | 許容: キー操作と見出し付きダイアログがある。フォーカストラップは無い | 許容: タブで完了できる。検索は無い | 許容: タブで完了できる。色だけに意味を置かない |

## 観察

### precision-keyboard

- パレットは `role="dialog"` と `aria-modal`。Escape で閉じる。
- フォーカスをパレット内に閉じ込めていない。
- `:focus-visible` はアクセント色の輪である。

### quiet-hierarchy

- コントラストは薄い灰地にほぼ黒。
- live の完了は `role="status"`。

### playful-chroma

- チップは文字もある。role はメタ行でも繰り返す。
- ホバー移動はキーボードでは起きない。

## 論点

- パレットを残すならフォーカストラップと初期フォーカスの返却が要る。
