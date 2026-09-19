# implementation レビュー: Catalog の visual direction

- 観点: implementation
- 対象: precision-keyboard、quiet-hierarchy、playful-chroma
- 入力: README、variants/、docs/evaluation/axes.md
- 担当した軸: implementation cost

## 判定

| 軸                  | precision-keyboard                         | quiet-hierarchy           | playful-chroma           |
| ------------------- | ------------------------------------------ | ------------------------- | ------------------------ |
| implementation cost | 許容: パレットとキー処理がある。依存は無し | 良い: 画面状態と CSS だけ | 許容: グリッドと role 色 |

## 観察

### precision-keyboard

- `window` の keydown で ⌘K を取る。追加ライブラリは無い。
- 公開面へ移すと、既存ヘッダーの配色切替との共存が必要になる。

### quiet-hierarchy

- 状態は `screen` と `activeId` だけである。
- LINE Seed JP を指定しており、Catalog の現行書体と揃えやすい。

### playful-chroma

- グラデーション背景は Catalog ホストの「固有色を持たない」と衝突する。
- 比較軸として局所 CSS に閉じている。token 化はしていない。

## 論点

- 採用後にホスト色を token へ上げるか、variant の局所色で止めるか。
