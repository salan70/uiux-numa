---
title: Color
summary: 色を役割名で管理し、役割の意味を配色をまたいで保ち、計算と見本で視認性と調和を確かめる。
status: draft
created: 2026-09-20
updated: 2026-09-25
---

## 目的

配色の意図を崩さず、UI の役割と状態を明瞭に伝える。
無彩色中心か有彩色の面かはプロダクトの作風として選び、本稿は作風によらない条件を定める。
コントラストの閾値と、色だけで意味を伝えない規則は accessibility が正本とする。

## コア

### 色は役割で引く

すべての色を役割名のトークンで引き、値を直接書かない。

### 役割の意味は配色をまたいで動かさない

役割名が指す意味を先に定義し、配色ごとに変えるのは割り当てる色だけにする。

### 階層は明度差で作る

面や段の違いは色相や彩度ではなく明度の差で示す。

### 比は計算し、調和は見本で確かめる

コントラスト比は計算で確かめ、調和と階層は色だけの見本と実画面の両方で確かめる。

## Tips

### 色は直接の値ではなく役割名で引く

意図と根拠: hex 値の直書きはテーマ切替で破綻する。

- 適用: foundation
- コア: 色は役割で引く
- 良い例: `--color-accent` や `--ed-surface` のような CSS 変数で指定する。
- 悪い例: スタイルシートに `#165e83` を直接書く。
- 例外: パレットの元データを定義する定義体。
- 実験: [catalog-editorial/rationale/topic-first.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/rationale/topic-first.md)

### 余った色をそのまま残さない

意図と根拠: 使われない色がパレットに残ると、次の選択が揺れる。

- 適用: foundation
- コア: 色は役割で引く
- 良い例: 役割に割り当てた色だけを定義する。
- 悪い例: 生成ツールが作った濃淡スケールを全件保持する。
- 例外: 画面に出さない参照用の定義体。配色の元にした伝統色の一覧など。
- 実験: [color-schemes](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/color-schemes/README.md)

### 意味色は成功、警告、エラー、情報の 4 つを既定にし、配色をまたいで意味を変えない

意図と根拠: 4 つは通知に使う既定の分類であり上限ではない。足すときは役割を定義し、色以外の語と形でも区別する。

- 適用: foundation
- コア: 役割の意味は配色をまたいで動かさない
- 良い例: 全配色でエラーに赤系、成功に緑系を割り当て、accent は主たる操作にだけ使う。
- 悪い例: 状態ごとに 9 色を割り当てる。ある配色だけ accent を装飾に使い、エラーを紫に変える。
- 例外: データの可視化。系列の区別に別の体系を使う。OS 標準の意味色に委ねる場合。
- 実験: [color-schemes](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/color-schemes/README.md)

### 画面に組むより先に色だけの見本で判断する

意図と根拠: 画面に当ててからでは造形と色の影響が混ざる。

- 適用: foundation
- コア: 比は計算し、調和は見本で確かめる
- 良い例: パレットカードや色帯を並べ、相性と明度差を先に確認する。
- 悪い例: 完成した画面にいきなり色を当てて全体の可否を議論する。
- 例外: 微小な文字サイズにおける個別の視認性確認。
- 実験: [catalog-editorial/README.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/README.md)

### 無彩色を中心にする作風では、有彩色を操作と状態に限る

意図と根拠: 作風の選択であり、有彩色の面が視認性を落とすのではない。

- 適用: module
- コア: 色は役割で引く
- 良い例: 背景を無彩色にし、ボタンにだけアクセント色を使う。
- 悪い例: カードの面やヘッダー全体を有彩色で塗りつぶす。
- 例外: 強い情緒表現を意図する告知の面。
- 実験: [catalog-editorial/rationale/topic-first.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/records/catalog-editorial/rationale/topic-first.md)

### 見本帳は固有のブランド色を持たない

意図と根拠: 見本帳自身の色は、展示する配色の見え方を歪める。

- 適用: module
- コア: 色は役割で引く
- 良い例: Catalog の面の色を正本の配色定義から導く。
- 悪い例: Catalog 固有のアクセント色をヘッダーに残す。
- 例外: 成果物の表示と独立したシステム管理バー。
- 実験: [docs/decisions/2026-09-19-catalog-host.md](https://github.com/salan70/uiux-numa/blob/5215a3c631edbd49f90202cbee9bde9ef500f030/docs/decisions/2026-09-19-catalog-host.md)
