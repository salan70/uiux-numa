---
title: デザイン 4 原則
summary: 近接、整列、反復、対比を使い、要素の主従と関係を視覚的に伝える。
status: draft
axes:
  - visual hierarchy
  - consistency
  - information architecture
created: 2026-09-20
updated: 2026-09-20
---

## 目的

視覚要素の主従、所属、まとまりを直感的に伝える。
装飾ではなく、情報の構造を視覚化するために適用する。

## 適用範囲

画面全体のレイアウト、部品の配置、文字の組版、配色の適用に用いる。
文言の作成や情報構造そのものの決定は対象外とする。

## 規則

### 関連する要素を近づけ、無関係な要素を離す

意図と根拠: 位置が近い要素どうしは、自然とひとつのまとまりに見える。
余白の広狭で情報の階層差を伝える。

- 良い例: ラベルと入力欄を近づけ、項目間はそれ以上の余白を空ける。
- 悪い例: ラベルと入力欄の余白が、前後の項目間と同じ広さである。
- 例外: 表形式のセルなど、境界線で所属が明確に区切られる場合。
- 図: proximity
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [ノンデザイナーズ・デザインブック](https://www.peachpit.com/store/non-designers-design-book-9780133966152)

### すべての要素を意識的な線に沿わせて揃える

意図と根拠: 要素間に見えない接続線を通し、画面に秩序を与える。
端を揃えることで、視線の迷いをなくす。

- 良い例: 見出し、本文、入力欄の左端を 1 本のグリッド線に揃える。
- 悪い例: 見出しや本文の左端がバラバラで、視線が左右に揺れる。
- 例外: 強調のために意図して突出させるバッジや装飾。
- 図: alignment
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [ノンデザイナーズ・デザインブック](https://www.peachpit.com/store/non-designers-design-book-9780133966152)

### 視覚的な特徴を一貫して繰り返す

意図と根拠: 色、形、角丸、余白、部品の造形を一貫して繰り返す。
画面全体の統一感を生み、操作の予測を助ける。

- 良い例: 線幅、角丸、山形矢印アイコンの造形をすべての部品で統一する。
- 悪い例: 角丸や線の太さが部品ごとに異なり、OS 既定の矢印が混ざる。
- 例外: 画面内で唯一の破壊的操作を警告する場合。
- 図: repetition
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [ノンデザイナーズ・デザインブック](https://www.peachpit.com/store/non-designers-design-book-9780133966152)

### 異なるものははっきりと違わせる

意図と根拠: 役割や重要度が異なる要素は、中途半端ではなく明確に差をつける。
見分けがつかない差異は、不揃いな印象を与える。

- 良い例: 説明に縦罫を引いて文字色を落とし、見本は素のまま立たせる。
- 悪い例: 見本と説明が同じ文字サイズと色で並び、どちらが見本か読めない。
- 例外: 意図的に均一な視認性を保つべきデータ一覧表。
- 図: contrast
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)
- 出典: [ノンデザイナーズ・デザインブック](https://www.peachpit.com/store/non-designers-design-book-9780133966152)

### 4 原則は個別に使わず同時に効かせる

意図と根拠: 近接、整列、反復、対比のどれかひとつだけでは画面は成立しない。
4 原則が互いを支え合って初めて秩序が生まれる。

- 良い例: 近接と整列で骨格を作り、反復と対比で要素を立たせる。
- 悪い例: コントラストだけを強めて整列を崩し、視線を混乱させる。
- 例外: 単一の大きな見本標本など、要素が 1 つしかない画面。
- 実験: [catalog-editorial/rationale/issue-feature.md](../../experiments/catalog-editorial/rationale/issue-feature.md)
- 出典: [ノンデザイナーズ・デザインブック](https://www.peachpit.com/store/non-designers-design-book-9780133966152)

### 4 原則で決まらない意味と文脈を先に確かめる

意図と根拠: 4 原則は要素の配置を整える規則であり、主役を決める規則ではない。
何を主役に置くべきかは、利用者の目的と文脈で決まる。

- 良い例: 利用者の探し方を先に決め、その構造を 4 原則で視覚化する。
- 悪い例: 意味のない構造を 4 原則で綺麗に整え、利用者の目的と乖離させる。
- 例外: 造形の方向性だけを比較検証するための初期モックアップ。
- 実験: [catalog-editorial/rationale/topic-first.md](../../experiments/catalog-editorial/rationale/topic-first.md)

## 確認項目

- [ ] ラベルと入力欄は、項目間の余白よりも近づけているか。
- [ ] 画面内の各要素は、いずれかの基準線に沿って整列しているか。
- [ ] 角丸、線幅、余白の階層が一貫して繰り返されているか。
- [ ] 役割の異なる要素間に、一目で分かる対比があるか。

## 出典

- [Robin Williams: The Non-Designer's Design Book](https://www.peachpit.com/store/non-designers-design-book-9780133966152): 近接、整列、反復、対比の 4 原則と、それらを同時に効かせる考え方。「4 原則で決まらない意味と文脈を先に確かめる」は本書の主張ではなく、本リポジトリの見解である

## 判断

- 判断者: 未定
- 判断日: 未定
- 理由: draft のため未定
