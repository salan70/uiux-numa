# 日本語プロダクト UI の Typography foundation を決める

- 状態: Accepted
- 日付: 2026-09-19
- 参照: [日本語プロダクト UI の Typography](../../experiments/product-ui-typography/README.md)
- 更新: 行長の上限（`40rem` / `40ic`）の使用規則に例外を足した。[行長の上限の ADR](2026-09-21-measure-cap-follows-the-column.md) を参照する。

## 背景

各 Experiment は `system-ui` と個別の文字サイズを使っていた。
同じ役割の値と意図を他のプロジェクトへ移す手段がなかった。

Typography token を増やしすぎると、利用側が役割を選べなくなる。
初回は一般的な日本語プロダクト UI に必要な値だけを定義する。

## 決定

- LINE Seed JP v20260828 の Regular と Bold を同梱する。
- ウェイトは 400 と 700 だけを使い、合成ウェイトを無効にする。
- canonical source は DTCG 2025.10 形式の JSON にする。
- family primitive は 1 個にする。
- size primitive は 4 個にする。
- weight primitive は 2 個にする。
- line-height primitive は 3 個にする。
- primitive の合計は 10 個である。
- semantic token は title、heading、body の 3 個を含む。
- ui、control、caption の 3 個も含む。
- semantic token の合計は 6 個である。
- CSS custom properties は canonical JSON から生成する。
- 新しい primitive は、複数の semantic token が参照するときだけ追加する。
- 新しい semantic token は、既存 token で表せない場合だけ検討する。追加には 2 個以上の利用例を必要とする。
- 行長と折返しは使用規則にする。DTCG の dimension は `ic` を扱えない。したがって token にはしない。

## 理由

LINE Seed JP は既存プロジェクトで使っており、和文と欧文の印象を揃えられる。
400 と 700 で通常と強調を表現できるため、ExtraBold の配信は不要である。

6 role は設定画面の見出し、本文、操作、補足を重複なく表現できる。
display、overline、body-small などは、初回の共通用途がない。

DTCG JSON はプラットフォームに依存しない。
typography composite と alias も表現できる。
生成 CSS を正本にすると値と説明が分かれるため、JSON を正本にする。

## 却下した案

- system-ui: OS ごとに字面が変わり、表示を再現できない。
- 500 / 600: 対応する font file を配布せず、合成または近似の結果になる。
- 800: title だけのために token と font file が増える。
- Thin: 小さい日本語 UI で使う共通用途がない。
- CSS だけを正本にする: composite とクロスプラットフォームの型を保持できない。
- JSON と CSS の手動併記: 値がずれる経路が増える。
- Style Dictionary: 初回の出力は CSS だけで、依存追加に見合う変換処理がない。
- runtime CDN: オフラインで描画できず、取得先の変更にも影響される。
- component token: 共通 role より細かい。初回の用途には必要ない。

## 影響

Web では `tokens/typography/index.css` を読み込む。
利用側は semantic custom property を参照する。
教材とスライドは family と weight だけを共有し、固有の尺度を維持する。

token の追加時は利用例と却下案を記録する。
値が異なるだけでは追加理由にならない。
