# designer レビュー: Catalog の visual direction

- 観点: designer
- 対象: precision-keyboard、quiet-hierarchy、playful-chroma
- 入力: README、variants/、docs/evaluation/axes.md
- 担当した軸: visual hierarchy、brand fit

## 判定

| 軸               | precision-keyboard                           | quiet-hierarchy                  | playful-chroma                         |
| ---------------- | -------------------------------------------- | -------------------------------- | -------------------------------------- |
| visual hierarchy | 許容: 選択行とバーが先。詳細で specimen が主 | 良い: トップの live が単独の主役 | 許容: 3 カードが同時に強い             |
| brand fit        | 許容: 精密さは出る。暗い面はホスト方針と張る | 良い: 静かな殻が成果物を前に出す | 許容: 色の人格は明確。表層の虹ではない |

## 観察

### precision-keyboard

- 13px の行リストが画面の大半を占める（`variants/precision-keyboard/variant.css` の `.pk-rows`）。
- 詳細の `.pk-live` は枠付きで、metadata の `dl` より上にある。

### quiet-hierarchy

- トップは `SPECIMENS[0]` の live だけを大きく描く（`quiet-hierarchy/index.tsx`）。
- 見出し 2rem、紙面の白、リンクは下へ送る。

### playful-chroma

- role ごとに影色を変える（`.pc-cards li[data-role]`）。
- コピーは「触ってから、名前を覚える。」で、説明文より操作を先に置く。

## 論点

- トップで 1 標本を大きくするか、横断探索を先にするか。
